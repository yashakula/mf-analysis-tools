import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const OverlapBarChart = ({ data }) => {
  // Get top 10 overlapping stocks
  const topStocks = data.common_stocks.slice(0, 10);

  const chartData = topStocks.map((stock) => ({
    name: stock.company_name.split(' ').slice(0, 2).join(' '), // Truncate name
    fund1: stock.fund1_weight,
    fund2: stock.fund2_weight,
    fullName: stock.company_name,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">{payload[0].payload.fullName}</p>
          <p className="text-blue-600 text-sm">
            {data.fund1_name}: {payload[0].value.toFixed(2)}%
          </p>
          <p className="text-indigo-600 text-sm">
            {data.fund2_name}: {payload[1].value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Top 10 Overlapping Stocks
      </h3>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            label={{ value: 'Portfolio Weight (%)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => (value === 'fund1' ? data.fund1_name : data.fund2_name)}
          />
          <Bar dataKey="fund1" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          <Bar dataKey="fund2" fill="#6366f1" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Showing top 10 out of {data.common_stocks_count} common stocks
        </p>
      </div>
    </motion.div>
  );
};

export default OverlapBarChart;
