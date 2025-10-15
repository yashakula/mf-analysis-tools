import React from 'react';
import { motion } from 'framer-motion';

const VennDiagram = ({ data }) => {
  const total = data.fund1_unique_count + data.fund2_unique_count + data.common_stocks_count;
  const overlapPercentage = ((data.common_stocks_count / total) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Stock Distribution
      </h3>

      <div className="flex items-center justify-center py-8">
        <div className="relative w-full max-w-2xl h-80">
          {/* Left Circle - Fund 1 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 w-64 h-64 bg-blue-500 rounded-full flex items-center justify-center"
            style={{ zIndex: 1 }}
          >
            <div className="text-white text-center ml-[-40px]">
              <p className="text-4xl font-bold">{data.fund1_unique_count}</p>
              <p className="text-sm mt-1">Unique Stocks</p>
            </div>
          </motion.div>

          {/* Right Circle - Fund 2 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 w-64 h-64 bg-indigo-500 rounded-full flex items-center justify-center"
            style={{ zIndex: 1 }}
          >
            <div className="text-white text-center mr-[-40px]">
              <p className="text-4xl font-bold">{data.fund2_unique_count}</p>
              <p className="text-sm mt-1">Unique Stocks</p>
            </div>
          </motion.div>

          {/* Overlap Label */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="bg-white rounded-xl shadow-xl p-6 border-2 border-purple-300">
              <p className="text-5xl font-bold text-purple-600 text-center">
                {data.common_stocks_count}
              </p>
              <p className="text-sm text-gray-600 text-center mt-2">Common Stocks</p>
              <p className="text-xs text-gray-500 text-center mt-1">
                {overlapPercentage}% overlap
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-8">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-500 rounded-full mr-2 opacity-70"></div>
          <span className="text-sm font-medium text-gray-700">{data.fund1_name}</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-purple-500 rounded-full mr-2"></div>
          <span className="text-sm font-medium text-gray-700">Overlap</span>
        </div>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-indigo-500 rounded-full mr-2 opacity-70"></div>
          <span className="text-sm font-medium text-gray-700">{data.fund2_name}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default VennDiagram;
