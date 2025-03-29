import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Weight } from 'lucide-react';
// import { fadeInUp } from '../utils/motion';
import MetricChart from './MetricChart';

const HealthMetricsCard = () => (
  <motion.div className="card col-span-1 md:col-span-3" variants={fadeInUp}>
    <div className="p-6">
      <h2 className="text-xl font-semibold flex items-center mb-6 text-gray-800 dark:text-gray-100">
        <Activity className="mr-2 text-emerald-500 dark:text-emerald-400" size={20} />
        Health Metrics
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricChart 
          title="Weight History" 
          icon={<Weight size={18} className="text-emerald-500 dark:text-emerald-400 mr-2" />} 
          timeRange="Last 6 months" 
          chartRef={weightChartRef} 
        />
        <MetricChart 
          title="BMI Trend" 
          icon={<Activity size={18} className="text-teal-500 dark:text-teal-400 mr-2" />} 
          timeRange="Last 6 months" 
          chartRef={bmiChartRef} 
        />
      </div>
    </div>
  </motion.div>
);

export default HealthMetricsCard;