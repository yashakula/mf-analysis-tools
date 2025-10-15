import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FundSelector from './components/FundSelector';
import FileUpload from './components/FileUpload';
import OverviewDashboard from './components/OverviewDashboard';
import VennDiagram from './components/VennDiagram';
import OverlapBarChart from './components/OverlapBarChart';
import SectorComparison from './components/SectorComparison';
import StockTable from './components/StockTable';
import { fundApi } from './services/api';
import { TrendingUp, AlertCircle } from 'lucide-react';

function App() {
  const [funds, setFunds] = useState([]);
  const [selectedFund1, setSelectedFund1] = useState(null);
  const [selectedFund2, setSelectedFund2] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load available funds on mount
  useEffect(() => {
    loadFunds();
  }, []);

  const loadFunds = async () => {
    try {
      const data = await fundApi.getAllFunds();
      setFunds(data.funds);
    } catch (err) {
      setError('Failed to load funds. Please ensure the backend server is running.');
      console.error(err);
    }
  };

  const handleCompare = async () => {
    if (!selectedFund1 || !selectedFund2) {
      setError('Please select both funds to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fundApi.compareFunds(selectedFund1, selectedFund2);
      if (data.success) {
        setComparisonData(data);
      } else {
        setError(data.error || 'Failed to compare funds');
      }
    } catch (err) {
      setError('Failed to compare funds. Please check your connection and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFund1(null);
    setSelectedFund2(null);
    setComparisonData(null);
    setError(null);
  };

  const handleUploadSuccess = () => {
    // Reload funds after successful upload
    loadFunds();
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mutual Fund Overlap Analyzer
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Compare portfolios and discover overlapping stocks between mutual funds
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start"
          >
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Fund Selector & Upload */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FundSelector
              funds={funds}
              selectedFund1={selectedFund1}
              selectedFund2={selectedFund2}
              onSelectFund1={setSelectedFund1}
              onSelectFund2={setSelectedFund2}
              onCompare={handleCompare}
              onReset={handleReset}
              loading={loading}
            />
          </motion.div>

          {/* Upload Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </motion.div>
        </div>

        {/* Results Section */}
        {comparisonData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-8"
          >
            {/* Overview Dashboard */}
            <OverviewDashboard data={comparisonData.overlap} />

            {/* Venn Diagram */}
            <VennDiagram data={comparisonData.overlap} />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Overlapping Stocks */}
              <OverlapBarChart data={comparisonData.overlap} />

              {/* Sector Comparison */}
              <SectorComparison
                fund1={comparisonData.fund1}
                fund2={comparisonData.fund2}
              />
            </div>

            {/* Detailed Stock Tables */}
            <StockTable data={comparisonData.overlap} />
          </motion.div>
        )}

        {/* Empty State */}
        {!comparisonData && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 mb-4">
              <TrendingUp className="w-24 h-24 mx-auto opacity-20" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              Select funds to get started
            </h3>
            <p className="text-gray-500">
              Choose two mutual funds above to analyze their portfolio overlap
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
