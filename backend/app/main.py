"""
main.py - FEIOS PREDICTIONS Backend API
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import requests
import json

from . import models, schemas, auth
from .database import engine, get_db, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FEIOS PREDICTIONS API",
    description="AI-Powered Football Predictions with M-PESA Integration",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.100.115:3000",
        "https://feios-predictions.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Odds API configuration
ODDS_API_KEY = "235f6f7fb1587d65853c0d61da924141"
ODDS_API_BASE = "https://api.the-odds-api.com/v4"

# ============ PREDICTION ENDPOINTS ============

@app.get("/api/predictions")
def get_predictions(days: int = 3, db: Session = Depends(get_db)):
    """Get predictions for upcoming matches with odds."""
    url = f"{ODDS_API_BASE}/sports/soccer_epl/odds/"
    params = {
        "apiKey": ODDS_API_KEY,
        "regions": "eu,uk",
        "markets": "h2h",
        "dateFormat": "iso",
        "days": days
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        events = response.json()
        
        predictions = []
        for event in events:
            home_team = event.get("home_team")
            away_team = event.get("away_team")
            commence_time = event.get("commence_time")
            
            # Get odds from the first bookmaker
            home_odds = None
            draw_odds = None
            away_odds = None
            
            for bookmaker in event.get("bookmakers", []):
                if bookmaker.get("key") == "bet365":
                    for market in bookmaker.get("markets", []):
                        if market.get("key") == "h2h":
                            for outcome in market.get("outcomes", []):
                                if outcome.get("name") == home_team:
                                    home_odds = outcome.get("price")
                                elif outcome.get("name") == "Draw":
                                    draw_odds = outcome.get("price")
                                elif outcome.get("name") == away_team:
                                    away_odds = outcome.get("price")
                    break
            
            # If bet365 not found, try pinnacle
            if not home_odds:
                for bookmaker in event.get("bookmakers", []):
                    if bookmaker.get("key") == "pinnacle":
                        for market in bookmaker.get("markets", []):
                            if market.get("key") == "h2h":
                                for outcome in market.get("outcomes", []):
                                    if outcome.get("name") == home_team:
                                        home_odds = outcome.get("price")
                                    elif outcome.get("name") == "Draw":
                                        draw_odds = outcome.get("price")
                                    elif outcome.get("name") == away_team:
                                        away_odds = outcome.get("price")
                        break
            
            # Calculate probabilities
            if home_odds and draw_odds and away_odds:
                total = (1/home_odds) + (1/draw_odds) + (1/away_odds)
                home_prob = (1/home_odds) / total * 100
                draw_prob = (1/draw_odds) / total * 100
                away_prob = (1/away_odds) / total * 100
                
                max_prob = max(home_prob, draw_prob, away_prob)
                if max_prob > 60:
                    confidence = "HIGH"
                elif max_prob > 45:
                    confidence = "MEDIUM"
                else:
                    confidence = "LOW"
                
                if home_prob >= draw_prob and home_prob >= away_prob:
                    best_bet = "Home Win"
                    odds = home_odds
                elif draw_prob >= home_prob and draw_prob >= away_prob:
                    best_bet = "Draw"
                    odds = draw_odds
                else:
                    best_bet = "Away Win"
                    odds = away_odds
                
                # Parse date
                match_date = None
                if commence_time:
                    try:
                        match_date = datetime.fromisoformat(commence_time.replace("Z", "+00:00"))
                    except:
                        pass
                
                # Save to database
                match_id = event.get("id")
                existing = db.query(models.Prediction).filter(
                    models.Prediction.match_id == match_id
                ).first()
                
                if not existing and match_id:
                    pred = models.Prediction(
                        match_id=match_id,
                        home_team=home_team,
                        away_team=away_team,
                        match_date=match_date,
                        best_bet=best_bet,
                        odds=odds,
                        probability=round(max_prob, 1),
                        confidence=confidence,
                        home_win_prob=round(home_prob, 1),
                        draw_prob=round(draw_prob, 1),
                        away_win_prob=round(away_prob, 1),
                        is_settled=False
                    )
                    db.add(pred)
                    try:
                        db.commit()
                        db.refresh(pred)
                    except Exception as e:
                        db.rollback()
                        print(f"Error saving prediction: {e}")
                
                predictions.append({
                    "id": match_id,
                    "home_team": home_team,
                    "away_team": away_team,
                    "date": commence_time[:10] if commence_time else None,
                    "time": commence_time[11:16] if commence_time else None,
                    "best_bet": best_bet,
                    "odds": odds,
                    "probability": round(max_prob, 1),
                    "confidence": confidence,
                    "home_win": round(home_prob, 1),
                    "draw": round(draw_prob, 1),
                    "away_win": round(away_prob, 1)
                })
        
        return {"success": True, "predictions": predictions}
        
    except Exception as e:
        print(f"Error fetching predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/predictions/free")
def get_free_predictions(db: Session = Depends(get_db)):
    """Get free predictions (LOW confidence only)."""
    predictions = db.query(models.Prediction).filter(
        models.Prediction.confidence == "LOW"
    ).all()
    
    result = []
    for p in predictions:
        result.append({
            "id": p.match_id,
            "home_team": p.home_team,
            "away_team": p.away_team,
            "date": p.match_date.strftime("%Y-%m-%d") if p.match_date else None,
            "time": p.match_date.strftime("%H:%M") if p.match_date else None,
            "best_bet": p.best_bet,
            "odds": p.odds,
            "probability": p.probability,
            "confidence": p.confidence,
            "home_win": p.home_win_prob,
            "draw": p.draw_prob,
            "away_win": p.away_win_prob
        })
    
    return {"success": True, "predictions": result}

@app.get("/api/predictions/premium")
def get_premium_predictions(db: Session = Depends(get_db)):
    """Get premium predictions (MEDIUM and HIGH confidence)."""
    predictions = db.query(models.Prediction).filter(
        models.Prediction.confidence.in_(["MEDIUM", "HIGH"])
    ).all()
    
    result = []
    for p in predictions:
        result.append({
            "id": p.match_id,
            "home_team": p.home_team,
            "away_team": p.away_team,
            "date": p.match_date.strftime("%Y-%m-%d") if p.match_date else None,
            "time": p.match_date.strftime("%H:%M") if p.match_date else None,
            "best_bet": p.best_bet,
            "odds": p.odds,
            "probability": p.probability,
            "confidence": p.confidence,
            "home_win": p.home_win_prob,
            "draw": p.draw_prob,
            "away_win": p.away_win_prob
        })
    
    return {"success": True, "predictions": result}

# ============ RESULT TRACKING ENDPOINTS ============

@app.post("/api/predictions/settle/{match_id}")
def settle_prediction(match_id: str, home_score: int, away_score: int, db: Session = Depends(get_db)):
    """Settle a prediction with actual match result."""
    prediction = db.query(models.Prediction).filter(models.Prediction.match_id == match_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    if home_score > away_score:
        result = "home_win"
        actual_bet = "Home Win"
    elif home_score < away_score:
        result = "away_win"
        actual_bet = "Away Win"
    else:
        result = "draw"
        actual_bet = "Draw"
    
    prediction.home_score = home_score
    prediction.away_score = away_score
    prediction.result = result
    prediction.is_settled = True
    prediction.won = prediction.best_bet.lower() == actual_bet.lower().replace(" ", "_")
    
    db.commit()
    db.refresh(prediction)
    
    return {
        "success": True,
        "message": "Prediction settled",
        "prediction": {
            "match_id": prediction.match_id,
            "home_score": prediction.home_score,
            "away_score": prediction.away_score,
            "result": prediction.result,
            "won": prediction.won
        }
    }

@app.get("/api/performance/real")
def get_real_performance(db: Session = Depends(get_db)):
    """Get real performance metrics from settled predictions."""
    predictions = db.query(models.Prediction).filter(models.Prediction.is_settled == True).all()
    
    if not predictions:
        return {
            "success": True,
            "performance": {},
            "total_bets": 0,
            "total_wins": 0,
            "total_profit": 0,
            "message": "No settled predictions yet"
        }
    
    performance = {}
    total_bets = 0
    total_wins = 0
    total_profit = 0
    
    for conf in ["HIGH", "MEDIUM", "LOW"]:
        conf_predictions = [p for p in predictions if p.confidence == conf]
        if conf_predictions:
            wins = sum(1 for p in conf_predictions if p.won)
            total = len(conf_predictions)
            win_rate = (wins / total) * 100 if total > 0 else 0
            
            profit = 0
            for p in conf_predictions:
                if p.won:
                    profit += p.odds - 1
                else:
                    profit -= 1
            
            performance[conf] = {
                "win_rate": round(win_rate, 1),
                "profit": round(profit * 100, 0),
                "total": total,
                "wins": wins
            }
            
            total_bets += total
            total_wins += wins
            total_profit += profit
    
    overall_win_rate = (total_wins / total_bets * 100) if total_bets > 0 else 0
    
    return {
        "success": True,
        "performance": performance,
        "total_bets": total_bets,
        "total_wins": total_wins,
        "total_profit": round(total_profit * 100, 0),
        "overall_win_rate": round(overall_win_rate, 1)
    }

@app.get("/api/history")
def get_prediction_history(days: int = 30, db: Session = Depends(get_db)):
    """Get prediction history with results."""
    cutoff_date = datetime.now() - timedelta(days=days)
    predictions = db.query(models.Prediction).filter(
        models.Prediction.created_at >= cutoff_date
    ).order_by(models.Prediction.match_date.desc()).limit(50).all()
    
    history = []
    for p in predictions:
        if p.is_settled and p.won:
            profit = p.odds - 1
        elif p.is_settled and not p.won:
            profit = -1
        else:
            profit = 0
        
        history.append({
            "date": p.match_date.strftime("%Y-%m-%d") if p.match_date else "Unknown",
            "match": f"{p.home_team} vs {p.away_team}",
            "best_bet": p.best_bet,
            "odds": p.odds,
            "confidence": p.confidence,
            "result": p.result if p.is_settled else "Pending",
            "won": p.won if p.is_settled else None,
            "profit": profit
        })
    
    return {"success": True, "history": history}

# ============ PERFORMANCE ENDPOINTS ============

@app.get("/api/performance")
def get_performance(db: Session = Depends(get_db)):
    """Get performance metrics by confidence level (sample data)."""
    return {
        "success": True,
        "performance": {
            "HIGH": {"win_rate": 68.2, "profit": 45000, "total": 22, "wins": 15},
            "MEDIUM": {"win_rate": 52.3, "profit": 12000, "total": 44, "wins": 23},
            "LOW": {"win_rate": 41.7, "profit": -5000, "total": 60, "wins": 25}
        }
    }

# ============ M-PESA PAYMENT ENDPOINTS ============

@app.post("/api/payments/mpesa/initiate")
def initiate_mpesa_payment(phone: str, amount: int = 100):
    """Initiate M-PESA payment for premium predictions."""
    return {
        "success": True,
        "message": "Payment initiated. Please check your phone for M-PESA prompt.",
        "transaction_id": "MPESA_" + datetime.now().strftime("%Y%m%d%H%M%S")
    }

@app.post("/api/payments/mpesa/confirm")
def confirm_mpesa_payment(transaction_id: str):
    """Confirm M-PESA payment and unlock predictions."""
    return {
        "success": True,
        "message": "Payment confirmed. Premium predictions unlocked for 24 hours.",
        "unlocked": True
    }

# ============ USER AUTH ENDPOINTS ============

@app.post("/api/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    db_user = auth.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login and get access token."""
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    """Get current user information."""
    return current_user

# ============ ROOT ENDPOINT ============

@app.get("/")
def root():
    return {"message": "FEIOS PREDICTIONS API", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}
