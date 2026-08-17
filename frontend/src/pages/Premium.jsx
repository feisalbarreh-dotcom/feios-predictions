import React, { useState, useEffect } from 'react';
import PredictionCard from '../components/PredictionCard';

function Premium() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [phone, setPhone] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const premium = localStorage.getItem('isPremium') === 'true';
    setIsAuthenticated(!!token);
    setUnlocked(premium);
    fetchPremiumPredictions();
  }, []);

  const fetchPremiumPredictions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/predictions/premium');
      const data = await response.json();
      if (data.success) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error('Error fetching premium predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!phone || phone.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }
    
    setPaymentStatus('processing');
    try {
      const response = await fetch('http://localhost:8000/api/payments/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: 100 })
      });
      const data = await response.json();
      if (data.success) {
        setPaymentStatus('confirmed');
        localStorage.setItem('isPremium', 'true');
        setUnlocked(true);
        alert('Payment confirmed! Premium predictions unlocked for 24 hours.');
        fetchPremiumPredictions();
      }
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Payment failed. Please try again.');
      setPaymentStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading premium predictions...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">⭐ Premium Predictions</h1>
      
      {!unlocked ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Unlock Premium Predictions</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get access to MEDIUM and HIGH confidence bets for just <strong className="text-green-600">KES 100</strong>
          </p>
          
          {!isAuthenticated ? (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                Please <a href="/login" className="underline font-bold">Login</a> or <a href="/register" className="underline font-bold">Register</a> to unlock premium predictions.
              </p>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="Phone number (e.g., 0712345678)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-green-500"
                  disabled={paymentStatus === 'processing'}
                />
                <button
                  onClick={handlePayment}
                  disabled={paymentStatus === 'processing'}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {paymentStatus === 'processing' ? 'Processing...' : 'Pay KES 100 via M-PESA'}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  You will receive a prompt on your phone to complete payment.
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-4 mb-6 text-center border border-green-500">
          <span className="text-green-600 dark:text-green-400 font-bold text-lg">✅ Premium Unlocked!</span>
          <p className="text-gray-600 dark:text-gray-400 text-sm">You have access to all predictions for 24 hours.</p>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
        {unlocked ? 'Premium Picks (Unlocked)' : '🔒 Premium Picks (Locked)'}
      </h2>
      
      {predictions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.map((prediction) => (
            <PredictionCard 
              key={prediction.id} 
              prediction={prediction} 
              free={unlocked} 
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No premium predictions available today.</p>
      )}
    </div>
  );
}

export default Premium;
