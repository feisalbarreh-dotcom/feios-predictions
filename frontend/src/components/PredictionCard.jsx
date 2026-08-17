import React from 'react';

function PredictionCard({ prediction, free }) {
  const { home_team, away_team, date, time, best_bet, odds, probability, confidence } = prediction;

  const getConfidenceColor = (conf) => {
    if (conf === 'HIGH') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (conf === 'MEDIUM') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-gray-800 dark:text-white">{home_team}</span>
          <span className="text-gray-400 dark:text-gray-500">vs</span>
          <span className="font-bold text-gray-800 dark:text-white">{away_team}</span>
        </div>
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          {date} • {time}
        </div>
        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 rounded p-2 mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-300">Best Bet:</span>
          <span className="font-bold text-green-600 dark:text-green-400">{best_bet}</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">Odds: {odds}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Probability: <span className="font-bold">{probability}%</span>
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getConfidenceColor(confidence)}`}>
            {confidence}
          </span>
        </div>
        <div className="mt-2 text-center">
          {free ? (
            <span className="text-xs text-green-600 dark:text-green-400">🔓 Free Access</span>
          ) : (
            <span className="text-xs text-yellow-600 dark:text-yellow-400">🔒 Premium - KES 100</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PredictionCard;
