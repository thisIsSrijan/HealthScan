import React from 'react';

const InfoBox = ({ label, value }) => (
    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  );
export default InfoBox;