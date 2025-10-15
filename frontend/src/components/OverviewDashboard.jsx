import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  GitMerge,
  Activity,
  PieChart,
  BarChart3,
} from 'lucide-react';

const MetricCard = ({ icon: Icon, title, value, subtitle, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={`metric-card card-hover relative overflow-hidden`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 rounded-full -mr-16 -mt-16`}></div>
    <div className="relative">
      <div className="flex items-start justify-between mb-3">
        <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  </motion.div>
);

const OverviewDashboard = ({ data }) => {
  const metrics = [
    {
      icon: Target,
      title: 'Overlap Percentage',
      value: `${data.overlap_percentage}%`,
      subtitle: 'Of total unique stocks',
      color: 'bg-blue-500',
      delay: 0,
    },
    {
      icon: Activity,
      title: 'Common Stocks',
      value: data.common_stocks_count,
      subtitle: `${data.fund1_unique_count} + ${data.fund2_unique_count} unique`,
      color: 'bg-green-500',
      delay: 0.1,
    },
    {
      icon: BarChart3,
      title: 'Weighted Overlap',
      value: `${data.weighted_overlap}%`,
      subtitle: 'Based on portfolio weights',
      color: 'bg-purple-500',
      delay: 0.2,
    },
    {
      icon: TrendingUp,
      title: 'Diversification Score',
      value: `${data.diversification_score}%`,
      subtitle: 'Higher is more diversified',
      color: 'bg-amber-500',
      delay: 0.3,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Portfolio Overlap Analysis
        </h2>
        <p className="text-gray-600">
          Comparing <span className="font-semibold text-blue-600">{data.fund1_name}</span>
          {' vs '}
          <span className="font-semibold text-indigo-600">{data.fund2_name}</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default OverviewDashboard;
