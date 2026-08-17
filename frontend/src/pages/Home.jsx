import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PredictionCard from '../components/PredictionCard';

function Home() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    fetchPredictions();
    fetchPerformance();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/predictions?days=3');
      const data = await response.json();
      if (data.success) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/performance');
      const data = await response.json();
      if (data.success) {
        setPerformance(data.performance);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading predictions...</div>
      </div>
    );
  }

  const freePredictions = predictions.filter(p => p.confidence === 'LOW');
  const premiumPredictions = predictions.filter(p => p.confidence === 'MEDIUM' || p.confidence === 'HIGH');

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
          🔥 FEIOS PREDICTIONS
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          AI-Powered Football Predictions
        </p>
        {performance && (
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <span className="text-green-600 dark:text-green-400">
              📊 Win Rate: 65%
            </span>
            <span className="text-green-600 dark:text-green-400">
              💰 Profit: +45,000 KES
            </span>
          </div>
        )}
      </div>

      {/* Free Predictions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded mr-2">FREE</span>
          Low Confidence Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {freePredictions.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} free={true} />
          ))}
        </div>
        {freePredictions.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No free predictions available today.</p>
        )}
      </section>

      {/* Premium Predictions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded mr-2">PREMIUM</span>
          Medium & High Confidence Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {premiumPredictions.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction} free={false} />
          ))}
        </div>
        {premiumPredictions.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No premium predictions available today.</p>
        )}
      </section>

      {/* CTA for Premium */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">🚀 Unlock Premium Predictions</h2>
        <p className="mb-4">Get access to MEDIUM and HIGH confidence bets for just KES 100</p>
        <Link to="/premium" className="bg-white text-green-700 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
          Unlock Now
        </Link>
      </div>
    </div>
  );
}

export default Home;
