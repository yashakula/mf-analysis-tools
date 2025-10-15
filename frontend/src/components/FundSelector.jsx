import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RefreshCw, Loader2 } from 'lucide-react';

const FundSelector = ({
  funds,
  selectedFund1,
  selectedFund2,
  onSelectFund1,
  onSelectFund2,
  onCompare,
  onReset,
  loading,
}) => {
  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Funds to Compare</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Fund 1 Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fund 1
          </label>
          <select
            value={selectedFund1 || ''}
            onChange={(e) => onSelectFund1(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            disabled={loading}
          >
            <option value="">Select a fund...</option>
            {funds.map((fund) => (
              <option
                key={fund.id}
                value={fund.id}
                disabled={fund.id === selectedFund2}
              >
                {fund.name}
              </option>
            ))}
          </select>
        </div>

        {/* Fund 2 Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Fund 2
          </label>
          <select
            value={selectedFund2 || ''}
            onChange={(e) => onSelectFund2(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            disabled={loading}
          >
            <option value="">Select a fund...</option>
            {funds.map((fund) => (
              <option
                key={fund.id}
                value={fund.id}
                disabled={fund.id === selectedFund1}
              >
                {fund.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCompare}
          disabled={!selectedFund1 || !selectedFund2 || loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Compare Funds
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
          disabled={loading}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Reset
        </motion.button>
      </div>
    </div>
  );
};

export default FundSelector;
