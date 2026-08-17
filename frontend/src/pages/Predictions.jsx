import React, { useState, useEffect } from 'react';
import PredictionCard from '../components/PredictionCard';

function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/predictions?days=7');
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

  const filteredPredictions = predictions.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'high') return p.confidence === 'HIGH';
    if (filter === 'medium') return p.confidence === 'MEDIUM';
    if (filter === 'low') return p.confidence === 'LOW';
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading predictions...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">All Predictions</h1>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded-lg ${filter === 'high' ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          HIGH
        </button>
        <button 
          onClick={() => setFilter('medium')}
          className={`px-4 py-2 rounded-lg ${filter === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          MEDIUM
        </button>
        <button 
          onClick={() => setFilter('low')}
          className={`px-4 py-2 rounded-lg ${filter === 'low' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
        >
          LOW
        </button>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPredictions.map((prediction) => (
          <PredictionCard key={prediction.id} prediction={prediction} free={prediction.confidence === 'LOW'} />
        ))}
      </div>
      {filteredPredictions.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No predictions found.</p>
      )}
    </div>
  );
}

export default Predictions;
