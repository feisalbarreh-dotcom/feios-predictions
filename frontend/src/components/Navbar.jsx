import React from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

function Navbar() {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-green-600 dark:text-green-400">
          🔥 FEIOS Predictions
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
            Home
          </Link>
          <Link to="/predictions" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
            Predictions
          </Link>
          <Link to="/premium" className="text-yellow-500 font-bold hover:text-yellow-400">
            Premium
          </Link>
          <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400">
            Dashboard
          </Link>
          <DarkModeToggle />
          <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
