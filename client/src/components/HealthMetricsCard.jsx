import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const WeightBmiCharts = ({ weights, heights }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (weights.length === 0 || heights.length === 0) return;
    
    const last7Indexes = weights.length >= 7 ? weights.length - 7 : 0;
    const selectedWeights = weights.slice(last7Indexes);
    const selectedHeights = heights.slice(last7Indexes);
    
    const bmiData = selectedWeights.map((weight, index) => {
      const height = selectedHeights[index] || selectedHeights[selectedHeights.length - 1];
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return { bmi: Number(bmi.toFixed(1)) };
    });

    const newData = selectedWeights.map((weight, index) => ({
      weight,
      bmi: bmiData[index].bmi,
      index: index + 1,
    }));

    setChartData(newData);
  }, [weights, heights]);

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-6 p-6 w-full "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full md:w-1/2 bg-white shadow-md rounded-2xl p-4  ">
        <h2 className="text-lg font-semibold mb-3">Weight Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" label={{ value: "Your Last 7 Weights", position: "insideBottom", dy: 10 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={3} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-1/2 bg-white shadow-md rounded-2xl p-4">
        <h2 className="text-lg font-semibold mb-3">BMI Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" label={{ value: "Your Last 7 BMIs", position: "insideBottom", dy: 10 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="bmi" stroke="#82ca9d" strokeWidth={3} animationDuration={1000} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default WeightBmiCharts;
