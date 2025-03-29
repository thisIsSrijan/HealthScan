import React from 'react';


const MetricChart = ({ title, icon, timeRange, chartRef }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
    <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <div className="flex items-center">
        {icon}
        <h3 className="font-medium text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      <span className="text-sm text-gray-500 dark:text-gray-400">{timeRange}</span>
    </div>
    <div className="p-4 h-64 relative">
      <div ref={chartRef} className="chart-container flex items-end justify-between"></div>
    </div>
  </div>
);

export default MetricChart;