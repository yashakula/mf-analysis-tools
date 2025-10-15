import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316', '#f59e0b',
];

const SectorComparison = ({ fund1, fund2 }) => {
  // Prepare data for pie charts
  const fund1Data = Object.entries(fund1.sector_allocation)
    .map(([sector, weight]) => ({
      name: sector,
      value: parseFloat(weight.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 sectors

  const fund2Data = Object.entries(fund2.sector_allocation)
    .map(([sector, weight]) => ({
      name: sector,
      value: parseFloat(weight.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show label if less than 5%

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Sector Allocation Comparison
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fund 1 Pie Chart */}
        <div>
          <h4 className="text-lg font-semibold text-center text-blue-600 mb-4">
            {fund1.name}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fund1Data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {fund1Data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Fund 2 Pie Chart */}
        <div>
          <h4 className="text-lg font-semibold text-center text-indigo-600 mb-4">
            {fund2.name}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fund2Data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {fund2Data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {[...new Set([...fund1Data.map(d => d.name), ...fund2Data.map(d => d.name)])]
          .slice(0, 8)
          .map((sector, index) => (
            <div key={sector} className="flex items-center">
              <div
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-xs text-gray-700">{sector}</span>
            </div>
          ))}
      </div>
    </motion.div>
  );
};

export default SectorComparison;
