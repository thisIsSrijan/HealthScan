import React from 'react';

const BmiIndicator = ({ bmi, bmiStatus }) => (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
      <div className="flex justify-between mb-1">
        <span className="text-sm text-gray-600 dark:text-gray-400">BMI</span>
        <span className={`text-sm font-medium ${bmiStatus.color}`}>{bmiStatus.category}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-red-500 dark:from-green-500 dark:to-red-600"
          style={{ width: `${(bmi / 40) * 100}%` }}
        />
      </div>
      <div className="mt-1 text-center font-semibold text-gray-800 dark:text-gray-100">
        {bmi?.toFixed(1)}
      </div>
    </div>
  );

export default BmiIndicator;