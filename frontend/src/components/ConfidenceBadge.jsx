import React from 'react';

function ConfidenceBadge({ confidence }) {
  const styles = {
    HIGH: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    LOW: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${styles[confidence] || styles.LOW}`}>
      {confidence}
    </span>
  );
}

export default ConfidenceBadge;
