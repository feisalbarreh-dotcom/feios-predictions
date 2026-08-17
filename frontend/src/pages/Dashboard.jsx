import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [performance, setPerformance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_bets: 0,
    total_wins: 0,
    total_profit: 0,
    overall_win_rate: 0
  });

  useEffect(() => {
    fetchPerformance();
    fetchHistory();
  }, []);

  const fetchPerformance = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/performance/real');
      const data = await response.json();
      if (data.success) {
        setPerformance(data.performance);
        setStats({
          total_bets: data.total_bets || 0,
          total_wins: data.total_wins || 0,
          total_profit: data.total_profit || 0,
          overall_win_rate: data.overall_win_rate || 0
        });
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/history?days=30');
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  const hasData = stats.total_bets > 0;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">📊 Performance Dashboard</h1>
      
      {!hasData ? (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Data Yet</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Results will appear here after matches are completed and settled.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Start placing predictions and check back after matches finish.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Bets</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total_bets}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.overall_win_rate}%</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
              <p className={`text-2xl font-bold ${stats.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.total_profit >= 0 ? '+' : ''}{stats.total_profit} KES
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Days</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">30</p>
            </div>
          </div>

          {/* Performance by Confidence */}
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Performance by Confidence</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {performance && Object.entries(performance).map(([level, data]) => (
              <div key={level} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700 dark:text-gray-300">{level}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    level === 'HIGH' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {data.win_rate}%
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Bets: {data.total} | Wins: {data.wins}</p>
                  <p className={data.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    Profit: {data.profit >= 0 ? '+' : ''}{data.profit} KES
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* History */}
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">Recent History</h2>
      {history.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Match</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Best Bet</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Confidence</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Result</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Profit</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{item.date}</td>
                  <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{item.match}</td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200">{item.best_bet}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.confidence === 'HIGH' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      item.confidence === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {item.confidence}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {item.result === 'Pending' ? (
                      <span className="text-yellow-500">⏳ Pending</span>
                    ) : item.won ? (
                      <span className="text-green-600">✅ Won</span>
                    ) : (
                      <span className="text-red-600">❌ Lost</span>
                    )}
                  </td>
                  <td className={`px-4 py-2 text-sm font-medium ${item.profit > 0 ? 'text-green-600' : item.profit < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    {item.profit > 0 ? '+' : ''}{item.profit} KES
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No history yet. Predictions will appear here after matches are settled.</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
