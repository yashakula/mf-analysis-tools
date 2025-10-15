import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

const StockTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'min_weight', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Sort data
  const sortedStocks = [...data.common_stocks].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  // Filter data
  const filteredStocks = sortedStocks.filter((stock) =>
    stock.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Limit display
  const displayedStocks = showAll ? filteredStocks : filteredStocks.slice(0, 20);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc',
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'desc' ? (
      <ChevronDown className="w-4 h-4 ml-1 inline" />
    ) : (
      <ChevronUp className="w-4 h-4 ml-1 inline" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="card"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-2xl font-bold text-gray-800">
          Common Stocks Detailed View
        </h3>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th
                onClick={() => handleSort('company_name')}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-blue-100 transition-colors"
              >
                Company <SortIcon columnKey="company_name" />
              </th>
              <th
                onClick={() => handleSort('sector')}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-blue-100 transition-colors"
              >
                Sector <SortIcon columnKey="sector" />
              </th>
              <th
                onClick={() => handleSort('fund1_weight')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-blue-100 transition-colors"
              >
                Fund 1 Weight <SortIcon columnKey="fund1_weight" />
              </th>
              <th
                onClick={() => handleSort('fund2_weight')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-blue-100 transition-colors"
              >
                Fund 2 Weight <SortIcon columnKey="fund2_weight" />
              </th>
              <th
                onClick={() => handleSort('min_weight')}
                className="px-4 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-blue-100 transition-colors"
              >
                Min Weight <SortIcon columnKey="min_weight" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {displayedStocks.map((stock, index) => (
              <motion.tr
                key={stock.company_name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-blue-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {stock.company_name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {stock.sector}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold">
                  {stock.fund1_weight.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-sm text-right text-indigo-600 font-semibold">
                  {stock.fund2_weight.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-sm text-right text-purple-600 font-bold">
                  {stock.min_weight.toFixed(2)}%
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More/Less Button */}
      {filteredStocks.length > 20 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-secondary"
          >
            {showAll ? 'Show Less' : `Show All ${filteredStocks.length} Stocks`}
          </button>
        </div>
      )}

      {/* Results Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Showing {displayedStocks.length} of {filteredStocks.length} stocks
        {searchTerm && ` matching "${searchTerm}"`}
      </div>
    </motion.div>
  );
};

export default StockTable;
