import React, { useState, useEffect } from 'react';
import AddDisasterEmergencyRecord from './modules/Disaster&Emergency/AddDisasterEmergencyRecord';
import axios from '../../utils/axiosConfig';
import EmergencyHotlinesTable from './modules/Disaster&Emergency/EmergencyHotlinesTable';
import { ExclamationTriangleIcon, PhoneIcon, PlusIcon, TableCellsIcon, DocumentTextIcon, MagnifyingGlassIcon, FunnelIcon, CheckCircleIcon, ClockIcon, XMarkIcon, ArrowPathIcon, ChartBarIcon, UserIcon, CalendarIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DisasterEmergency = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    type: '',
    date: '',
    location: '',
    description: '',
    actions_taken: '',
    casualties: '',
    reported_by: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHotlinesTable, setShowHotlinesTable] = useState(() => {
    // Try to get from localStorage, default to false
    const saved = localStorage.getItem('showHotlinesTable');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [showRecords, setShowRecords] = useState(() => {
    // Try to get from localStorage, default to true
    const saved = localStorage.getItem('showRecords');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [showAddHotlineModal, setShowAddHotlineModal] = useState(false);
  const [hotlinesCount, setHotlinesCount] = useState(0);
  const [hotlineForm, setHotlineForm] = useState({
    type: '',
    hotline: '',
    description: '',
    status: 'Active',
    contact_person: '',
    email: '',
    procedure: '',
  });
  const [hotlineLoading, setHotlineLoading] = useState(false);
  const [hotlineError, setHotlineError] = useState('');
  const [hotlineRefreshKey, setHotlineRefreshKey] = useState(0);

  // Analytics and search state
  const [search, setSearch] = useState("");
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Analytics period selection
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 means no month selected
  const currentYear = new Date().getFullYear();

  const fetchRecords = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/disaster-emergencies');
      setRecords(res.data);
      setFilteredRecords(res.data);
      setChartData(generateChartData(res.data, selectedPeriod, selectedYear, selectedMonth));
      setLastRefresh(new Date());

      if (showRefreshIndicator) {
        setToastMessage({
          type: 'success',
          message: '🔄 Data refreshed successfully',
          duration: 2000
        });
      }
    } catch (err) {
      setError('Failed to fetch records');
      if (showRefreshIndicator) {
        setToastMessage({
          type: 'error',
          message: '❌ Failed to refresh data',
          duration: 4000
        });
      }
    } finally {
      setLoading(false);
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  };

  const fetchHotlinesCount = async () => {
    try {
      const res = await axios.get('/emergency-hotlines');
      setHotlinesCount(res.data.length);
    } catch {}
  };

  const handleHotlineChange = (e) => {
    setHotlineForm({ ...hotlineForm, [e.target.name]: e.target.value });
  };

  const handleHotlineSubmit = async (e) => {
    e.preventDefault();
    setHotlineLoading(true);
    setHotlineError('');
    try {
      const payload = {
        ...hotlineForm,
        procedure: hotlineForm.procedure.split('\n').map((s) => s.trim()).filter(Boolean),
        last_updated: new Date().toISOString().split('T')[0],
      };
      const response = await axios.post('/admin/emergency-hotlines', payload);
      
      // Show success message
      setToastMessage({
        type: 'success',
        message: '✅ Emergency hotline saved successfully!',
        duration: 3000
      });
      
      setShowAddHotlineModal(false);
      setHotlineForm({
        type: '',
        hotline: '',
        description: '',
        status: 'Active',
        contact_person: '',
        email: '',
        procedure: '',
      });
      fetchHotlinesCount();
      // Trigger refresh of the hotlines table
      setHotlineRefreshKey(prev => prev + 1);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save hotline. Please try again.';
      setHotlineError(errorMessage);
      setToastMessage({
        type: 'error',
        message: `❌ ${errorMessage}`,
        duration: 4000
      });
    } finally {
      setHotlineLoading(false);
    }
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRecords();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchRecords(true);
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    setToastMessage({
      type: 'success',
      message: `Auto-refresh ${!autoRefresh ? 'enabled' : 'disabled'}`,
      duration: 2000
    });
  };

  // Filter records on search
  useEffect(() => {
    setFilteredRecords(
      records.filter((record) => {
        const searchLower = search.toLowerCase();
        return (
          record.type?.toLowerCase().includes(searchLower) ||
          record.location?.toLowerCase().includes(searchLower) ||
          record.description?.toLowerCase().includes(searchLower) ||
          record.reported_by?.toLowerCase().includes(searchLower)
        );
      })
    );
  }, [search, records]);

  // Update chart data when records, period, year, or month changes
  useEffect(() => {
    setChartData(generateChartData(records, selectedPeriod, selectedYear, selectedMonth));
  }, [records, selectedPeriod, selectedYear, selectedMonth]);

  // Generate chart data for disaster/emergency records based on period, year, and month
  const generateChartData = (records, period = 'all', year = currentYear, month = 0) => {
    const now = new Date();
    let data = [];

    if (period === 'month') {
      if (!year || month === 0) {
        // If no specific year/month, use current month
        const today = new Date();
        year = today.getFullYear();
        month = today.getMonth() + 1;
      }
      // Daily data for selected month and year
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0);
      const dailyData = {};
      records.forEach(record => {
        if (record.date) {
          const date = new Date(record.date);
          if (date >= monthStart && date <= monthEnd) {
            const dayKey = date.toISOString().split('T')[0];
            dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
          }
        }
      });
      // Fill all days of the month
      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const date = new Date(year, month - 1, day);
        const key = date.toISOString().split('T')[0];
        data.push({
          name: date.getDate().toString(),
          incidents: dailyData[key] || 0
        });
      }
    } else if (period === 'year') {
      if (!year) {
        year = currentYear;
      }
      if (month > 0) {
        // Daily data for selected month in the year
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        const dailyData = {};
        records.forEach(record => {
          if (record.date) {
            const date = new Date(record.date);
            if (date >= monthStart && date <= monthEnd) {
              const dayKey = date.toISOString().split('T')[0];
              dailyData[dayKey] = (dailyData[dayKey] || 0) + 1;
            }
          }
        });
        // Fill all days of the month
        for (let day = 1; day <= monthEnd.getDate(); day++) {
          const date = new Date(year, month - 1, day);
          const key = date.toISOString().split('T')[0];
          data.push({
            name: date.getDate().toString(),
            incidents: dailyData[key] || 0
          });
        }
      } else {
        // Monthly data for selected year
        const yearlyData = {};
        records.forEach(record => {
          if (record.date) {
            const date = new Date(record.date);
            if (date.getFullYear() === year) {
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
              yearlyData[monthKey] = (yearlyData[monthKey] || 0) + 1;
            }
          }
        });
        // Fill all months of the year
        for (let m = 0; m < 12; m++) {
          const date = new Date(year, m, 1);
          const key = `${year}-${String(m + 1).padStart(2, '0')}`;
          data.push({
            name: date.toLocaleDateString('en-US', { month: 'short' }),
            incidents: yearlyData[key] || 0
          });
        }
      }
    } else {
      // Last 12 months
      const monthlyData = {};
      records.forEach(record => {
        if (record.date) {
          const date = new Date(record.date);
          const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
        }
      });

      // Get last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        data.push({
          name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          incidents: monthlyData[key] || 0
        });
      }
    }
    return data;
  };

  // Get most common disaster type based on period, year, and month
  const getMostCommonDisasterType = (records, period = 'all', year = currentYear, month = 0) => {
    const now = new Date();
    let filtered = records;
    if (period === 'month' && month > 0) {
      filtered = records.filter(record => {
        if (!record.date) return false;
        const date = new Date(record.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    } else if (period === 'year') {
      if (month > 0) {
        filtered = records.filter(record => {
          if (!record.date) return false;
          const date = new Date(record.date);
          return date.getMonth() + 1 === month && date.getFullYear() === year;
        });
      } else {
        filtered = records.filter(record => {
          if (!record.date) return false;
          const date = new Date(record.date);
          return date.getFullYear() === year;
        });
      }
    }
    // else all

    const counts = {};
    filtered.forEach(record => {
      if (record.type) {
        counts[record.type] = (counts[record.type] || 0) + 1;
      }
    });

    let max = 0;
    let most = '';
    for (const [type, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        most = type;
      }
    }
    return { type: most, count: max };
  };

  // Auto-hide toast messages
  React.useEffect(() => {
    if (toastMessage && toastMessage.duration > 0) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, toastMessage.duration);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    fetchRecords();
    fetchHotlinesCount();
  }, []);

  const handleEdit = (record) => {
    setEditId(record.id);
    setEditForm({ ...record });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.put(`/disaster-emergencies/${editId}`, editForm);
      setShowEditModal(false);
      setEditId(null);
      fetchRecords();
    } catch (err) {
      setError('Failed to update record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setLoading(true);
    setError('');
    try {
      await axios.delete(`/disaster-emergencies/${id}`);
      fetchRecords();
    } catch (err) {
      setError('Failed to delete record');
    } finally {
      setLoading(false);
    }
  };

  // Toast Notification Component
  const ToastNotification = ({ message, type, onClose }) => (
    <div className={`fixed top-24 right-6 z-50 max-w-md rounded-xl shadow-2xl border-2 p-4 transition-all duration-500 transform ${
      message ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${
      type === 'success'
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800'
        : type === 'loading'
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
          {type === 'loading' && <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />}
          {type === 'error' && <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{message}</div>
        </div>
        {type !== 'loading' && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <ToastNotification
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <main className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen ml-0 lg:ml-64 pt-20 lg:pt-36 px-4 pb-16 font-sans">
        <div className="w-full max-w-[98%] mx-auto space-y-8 px-2 lg:px-4">
        {/* Enhanced Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
            <ExclamationTriangleIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
            Disaster & Emergency Management
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-4">
            Comprehensive management system for barangay disaster and emergency records, hotlines, and response procedures with real-time tracking.
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 px-4">
            <button className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium border border-green-200 hover:shadow-md transition-all duration-300 flex items-center gap-1 sm:gap-2">
              <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Help Guide</span>
              <span className="sm:hidden">Help</span>
            </button>
            <button className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium border border-blue-200 hover:shadow-md transition-all duration-300 flex items-center gap-1 sm:gap-2">
              <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Quick Start</span>
              <span className="sm:hidden">Start</span>
            </button>
            <button className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium border border-purple-200 hover:shadow-md transition-all duration-300 flex items-center gap-1 sm:gap-2">
              <ExclamationTriangleIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              FAQ
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <ExclamationTriangleIcon className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-green-600 group-hover:text-emerald-600 transition">{records.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-3xl font-bold text-green-600 group-hover:text-emerald-600 transition">{getMostCommonDisasterType(records, 'month', new Date().getFullYear(), new Date().getMonth() + 1).count}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
            <div>
              <p className="text-sm font-medium text-gray-600">Emergency Hotlines</p>
              <p className="text-3xl font-bold text-green-600 group-hover:text-emerald-600 transition">{hotlinesCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-yellow-100">
              <PhoneIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Casualties</p>
              <p className="text-3xl font-bold text-green-600 group-hover:text-emerald-600 transition">{records.reduce((sum, rec) => sum + (parseInt(rec.casualties) || 0), 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
              <UserIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="w-full flex flex-col gap-6 mb-8">

          {/* Analytics Charts */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5" />
                Disaster & Emergency Trends
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => {
                    setSelectedPeriod(e.target.value);
                    if (e.target.value !== 'month') setSelectedMonth(0);
                    setSelectedYear('');
                  }}
                  className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl text-sm font-medium bg-white shadow-sm"
                >
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>
                {(selectedPeriod === 'month' || selectedPeriod === 'year') && (
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedMonth(0);
                    }}
                    className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl text-sm font-medium bg-white shadow-sm"
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 16 }, (_, i) => currentYear - 10 + i).map(year => (
                      <option key={year} value={year.toString()}>{year}</option>
                    ))}
                  </select>
                )}
                {(selectedPeriod === 'month' || selectedPeriod === 'year') && selectedYear && (
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-4 py-2 border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-xl text-sm font-medium bg-white shadow-sm"
                  >
                    <option value={0}>All Months</option>
                    {[
                      { value: 1, name: 'January' },
                      { value: 2, name: 'February' },
                      { value: 3, name: 'March' },
                      { value: 4, name: 'April' },
                      { value: 5, name: 'May' },
                      { value: 6, name: 'June' },
                      { value: 7, name: 'July' },
                      { value: 8, name: 'August' },
                      { value: 9, name: 'September' },
                      { value: 10, name: 'October' },
                      { value: 11, name: 'November' },
                      { value: 12, name: 'December' }
                    ].map(m => (
                      <option key={m.value} value={m.value}>{m.name}</option>
                    ))}
                  </select>
                )}
                {(selectedPeriod === 'month' || selectedPeriod === 'year') && !selectedYear && (
                  <select
                    disabled
                    className="px-4 py-2 border-2 border-gray-300 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium cursor-not-allowed"
                  >
                    <option>Select a year first</option>
                  </select>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {selectedPeriod === 'month' ? `Daily incidents in ${selectedMonth ? `${selectedMonth}/${selectedYear}` : 'current month'}` :
               selectedPeriod === 'year' ? `Monthly incidents in ${selectedYear || currentYear}` :
               'Incidents over the last 12 months'}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={selectedPeriod === 'month' || (selectedPeriod === 'year' && selectedMonth > 0) ? "name" : "name"} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="incidents" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Most Common {selectedPeriod === 'month' ? `(Month ${selectedMonth} ${selectedYear})` : selectedPeriod === 'year' ? `(${selectedYear})` : '(All Time)'}
                </h4>
                <p className="text-lg font-bold text-green-900">{getMostCommonDisasterType(records, selectedPeriod, selectedYear, selectedMonth).type || 'N/A'}</p>
                <p className="text-sm text-green-700">{getMostCommonDisasterType(records, selectedPeriod, selectedYear, selectedMonth).count} incidents</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Most Common Overall
                </h4>
                <p className="text-lg font-bold text-blue-900">{getMostCommonDisasterType(records, 'all').type || 'N/A'}</p>
                <p className="text-sm text-blue-700">{getMostCommonDisasterType(records, 'all').count} incidents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Controls */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex gap-3">
              <button
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={() => setShowAddHotlineModal(true)}
              >
                <PhoneIcon className="w-6 h-6" />
                Add Emergency Hotline
              </button>
              <button
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  const newState = !showHotlinesTable;
                  setShowHotlinesTable(newState);
                  localStorage.setItem('showHotlinesTable', JSON.stringify(newState));
                }}
              >
                <TableCellsIcon className="w-6 h-6" />
                {showHotlinesTable ? 'Hide' : 'View'} Emergency Hotlines
              </button>
              <AddDisasterEmergencyRecord 
                onSuccess={fetchRecords} 
                onShowToast={(message, type) => setToastMessage({ type, message, duration: type === 'success' ? 3000 : 4000 })} 
              />
              <button
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  const newState = !showRecords;
                  setShowRecords(newState);
                  localStorage.setItem('showRecords', JSON.stringify(newState));
                }}
              >
                <DocumentTextIcon className="w-6 h-6" />
                {showRecords ? 'Hide' : 'View'} Disaster and Emergency Records
              </button>
            </div>

            <div className="flex gap-4 items-center w-full max-w-3xl">
              {/* Auto-refresh controls */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border">
                <button
                  onClick={toggleAutoRefresh}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                    autoRefresh
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ArrowPathIcon className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                  Auto
                </button>
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-200 disabled:opacity-50"
                >
                  <ArrowPathIcon className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <span className="text-xs text-gray-500">
                  {lastRefresh.toLocaleTimeString()}
                </span>
              </div>
              <div className="relative flex-grow">
                <input
                  type="text"
                  className="w-full pl-14 pr-6 py-4 border-2 border-gray-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 rounded-2xl text-base shadow-lg transition-all duration-300"
                  placeholder="Search by type, location, description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-4 text-gray-400" />
              </div>
              <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-4 rounded-2xl text-base font-semibold shadow-lg transition-all duration-300">
                <FunnelIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Emergency Hotline Modal */}
        {showAddHotlineModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <PhoneIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Add Emergency Hotline</h2>
                      <p className="text-green-100 text-sm mt-1">Create a new emergency hotline record</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddHotlineModal(false);
                      setHotlineForm({
                        type: '',
                        hotline: '',
                        description: '',
                        status: 'Active',
                        contact_person: '',
                        email: '',
                        procedure: '',
                      });
                      setHotlineError('');
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleHotlineSubmit} className="p-8 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                {hotlineError && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    {hotlineError}
                  </div>
                )}

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-emerald-600" />
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={hotlineForm.type}
                    onChange={handleHotlineChange}
                    required
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200 bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="Fire">Fire</option>
                    <option value="Flood">Flood</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Police">Police</option>
                    <option value="Ambulance">Ambulance</option>
                    <option value="Rescue">Rescue</option>
                    <option value="Earthquake">Earthquake</option>
                    <option value="Typhoon">Typhoon</option>
                    <option value="Disaster Response">Disaster Response</option>
                    <option value="Emergency Management">Emergency Management</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Hotline Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-emerald-600" />
                    Hotline Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="hotline"
                    value={hotlineForm.hotline}
                    onChange={handleHotlineChange}
                    required
                    placeholder="Enter hotline number (e.g., 0912-345-6789)"
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-emerald-600" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="description"
                    value={hotlineForm.description}
                    onChange={handleHotlineChange}
                    required
                    placeholder="Enter description of the hotline service"
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={hotlineForm.status}
                    onChange={handleHotlineChange}
                    required
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Optional Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      Contact Person <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      name="contact_person"
                      value={hotlineForm.contact_person}
                      onChange={handleHotlineChange}
                      placeholder="Enter contact person name"
                      className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={hotlineForm.email}
                      onChange={handleHotlineChange}
                      placeholder="Enter email address"
                      className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Procedure */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                    Procedure <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    name="procedure"
                    value={hotlineForm.procedure}
                    onChange={handleHotlineChange}
                    placeholder="Enter step-by-step procedure (one step per line)"
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200 resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Each line will be treated as a separate step in the procedure
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddHotlineModal(false);
                      setHotlineForm({
                        type: '',
                        hotline: '',
                        description: '',
                        status: 'Active',
                        contact_person: '',
                        email: '',
                        procedure: '',
                      });
                      setHotlineError('');
                    }}
                    className="flex-1 px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={hotlineLoading}
                    className="flex-1 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {hotlineLoading ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        Save Hotline
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Emergency Hotlines Table */}
        {showHotlinesTable && (
          <div className="animate-fade-in">
            <EmergencyHotlinesTable key={hotlineRefreshKey} />
          </div>
        )}
        
        {/* Card-style section for Disaster/Emergency Records */}
        {showRecords && (
        <div className="bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden w-full">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 px-8 py-6">
            <h3 className="text-white font-bold text-xl flex items-center gap-3">
              <DocumentTextIcon className="w-6 h-6" />
              Disaster and Emergency Records ({filteredRecords.length})
            </h3>
          </div>
          <div className="overflow-x-auto w-full p-8">
            {error && <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-8 py-6 rounded-2xl mb-6 flex items-center shadow-lg animate-bounce">{error}</div>}
            <table className="w-full text-sm min-w-full">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-emerald-700 min-w-[150px]">Type</th>
                  <th className="px-6 py-4 text-left font-bold text-emerald-700 hidden sm:table-cell min-w-[120px]">Date</th>
                  <th className="px-6 py-4 text-left font-bold text-emerald-700 min-w-[180px]">Location</th>
                  <th className="px-6 py-4 text-left font-bold text-emerald-700 hidden md:table-cell min-w-[250px]">Description</th>
                  <th className="px-6 py-4 text-left font-bold text-emerald-700 hidden lg:table-cell min-w-[250px]">Actions Taken</th>
                  <th className="px-6 py-4 text-left font-bold text-emerald-700 hidden lg:table-cell min-w-[120px]">Casualties</th>
                  <th className="px-6 py-4 text-left font-bold text-emerald-700 hidden md:table-cell min-w-[150px]">Reported By</th>
                  <th className="px-6 py-4 text-center font-bold text-emerald-700 min-w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                          <ExclamationTriangleIcon className="w-10 h-10 text-emerald-400" />
                        </div>
                        <p className="text-emerald-600 font-semibold text-lg">No disaster or emergency records found</p>
                        <p className="text-emerald-400 text-sm">Try adjusting your search criteria or click the button above to add a new record</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec, idx) => (
                    <tr key={rec.id} className={`transition-all duration-300 group ${idx % 2 === 0 ? 'bg-white' : 'bg-green-50'} hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50`}>
                      <td className="px-6 py-4 font-bold text-emerald-900 group-hover:text-emerald-600 transition-colors duration-300">{rec.type}</td>
                      <td className="px-6 py-4 hidden sm:table-cell">{rec.date}</td>
                      <td className="px-6 py-4">{rec.location}</td>
                      <td className="px-6 py-4 max-w-md truncate hidden md:table-cell" title={rec.description}>{rec.description}</td>
                      <td className="px-6 py-4 max-w-md truncate hidden lg:table-cell" title={rec.actions_taken}>{rec.actions_taken}</td>
                      <td className="px-6 py-4 hidden lg:table-cell">{rec.casualties}</td>
                      <td className="px-6 py-4 hidden md:table-cell">{rec.reported_by}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-center flex-wrap">
                          <button onClick={() => handleEdit(rec)} className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1 transition-all duration-300 transform hover:scale-105" title="Edit Record">
                            <span className="hidden sm:inline">Edit</span>
                            <span className="sm:hidden">✏️</span>
                          </button>
                          <button onClick={() => handleDelete(rec.id)} className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1 transition-all duration-300 transform hover:scale-105" title="Delete Record">
                            <span className="hidden sm:inline">Delete</span>
                            <span className="sm:hidden">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <PencilIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Edit Disaster/Emergency Record</h2>
                      <p className="text-green-100 text-sm mt-1">Update the record information</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleEditSubmit} className="p-8 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    {error}
                  </div>
                )}

                {/* Disaster Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-emerald-600" />
                    Disaster Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                    required
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200 bg-white"
                  >
                    <option value="">Select Type</option>
                    <option value="Fire">Fire</option>
                    <option value="Flood">Flood</option>
                    <option value="Earthquake">Earthquake</option>
                    <option value="Typhoon">Typhoon</option>
                    <option value="Medical Emergency">Medical Emergency</option>
                    <option value="Accident">Accident</option>
                    <option value="Natural Disaster">Natural Disaster</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-600" />
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    required
                    type="date"
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200 bg-white"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="location"
                    value={editForm.location}
                    onChange={handleEditChange}
                    required
                    placeholder="Enter location"
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <DocumentTextIcon className="w-4 h-4 text-emerald-600" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    required
                    placeholder="Enter detailed description of the incident"
                    rows={4}
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200 resize-none"
                  />
                </div>

                {/* Actions Taken */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    Actions Taken
                  </label>
                  <textarea
                    name="actions_taken"
                    value={editForm.actions_taken}
                    onChange={handleEditChange}
                    placeholder="Describe the actions taken in response to this incident"
                    rows={4}
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200 resize-none"
                  />
                </div>

                {/* Optional Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Casualties */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      Casualties <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      name="casualties"
                      value={editForm.casualties}
                      onChange={handleEditChange}
                      placeholder="Enter number of casualties"
                      type="number"
                      min="0"
                      className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
                    />
                  </div>

                  {/* Reported By */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      Reported By <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <input
                      name="reported_by"
                      value={editForm.reported_by}
                      onChange={handleEditChange}
                      placeholder="Enter reporter's name"
                      className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl hover:from-emerald-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
    </>
  );
};

export default DisasterEmergency;