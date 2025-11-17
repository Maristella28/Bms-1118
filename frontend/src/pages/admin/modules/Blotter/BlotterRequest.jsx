import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../../components/Navbar';
import Sidebar from '../../../../components/Sidebar';
import { ChevronDownIcon, CheckCircleIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

// Actions Dropdown Component
const ActionsDropdown = ({ request, onApprove, onDecline, actionLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gradient-to-br from-slate-100 to-gray-200 hover:from-slate-200 hover:to-gray-300 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <ChevronDownIcon className="w-5 h-5 text-slate-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-slate-200 z-20 overflow-hidden">
            {request.status === 'pending' && (
              <>
                <button
                  onClick={() => { onApprove(request.id); setIsOpen(false); }}
                  disabled={actionLoading[request.id]}
                  className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex items-center gap-3 transition-colors border-b border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">
                    {actionLoading[request.id] ? 'Approving...' : 'Approve Request'}
                  </span>
                </button>
                
                <button
                  onClick={() => { onDecline(request.id); setIsOpen(false); }}
                  disabled={actionLoading[request.id]}
                  className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XMarkIcon className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">
                    {actionLoading[request.id] ? 'Declining...' : 'Decline Request'}
                  </span>
                </button>
              </>
            )}
            {request.status !== 'pending' && (
              <div className="w-full px-4 py-3 text-center text-sm text-gray-500">
                No actions available
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const BlotterRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [approveModal, setApproveModal] = useState({ open: false, id: null });
  const [declineModal, setDeclineModal] = useState({ open: false, id: null });
  const [declineRemarks, setDeclineRemarks] = useState('');
  const [approveDate, setApproveDate] = useState('');
  const [approveTime, setApproveTime] = useState('');
  const [timeHour, setTimeHour] = useState('');
  const [timeMinute, setTimeMinute] = useState('');
  const [timeAmPm, setTimeAmPm] = useState('AM');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  // Fetch all blotter requests for admin
  const fetchRequests = useCallback((isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
    setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    axiosInstance.get('/admin/blotter-requests')
      .then(res => {
        setRequests(res.data);
        setLastUpdate(new Date());
      })
      .catch(err => {
        if (!isBackgroundRefresh) {
        if (err.response && err.response.status === 403) {
          alert('You do not have permission to view blotter requests. Please log in as an admin.');
        } else if (err.response && err.response.status === 401) {
          alert('You are not authenticated. Please log in.');
        } else {
          alert('Failed to fetch blotter requests.');
        }
        }
      })
      .finally(() => {
        setLoading(false);
        setIsRefreshing(false);
      });
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Real-time polling effect
  useEffect(() => {
    if (!isRealTimeEnabled || approveModal.open || declineModal.open) {
      return;
    }

    // Set up polling interval (30 seconds)
    const interval = setInterval(() => {
      // Only refresh if tab is visible
      if (!document.hidden) {
        fetchRequests(true);
      }
    }, 30000); // 30 seconds

    // Cleanup interval on unmount or when dependencies change
    return () => {
      clearInterval(interval);
    };
  }, [isRealTimeEnabled, approveModal.open, declineModal.open, fetchRequests]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRealTimeEnabled) {
        // Refresh immediately when tab becomes visible
        fetchRequests(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRealTimeEnabled, fetchRequests]);

  // Update status of a blotter request (approve/decline)
  const handleAction = async (id, status, date = null, remarks = null) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      if (status === 'approved') {
        await axiosInstance.patch(`/blotter-requests/${id}`, { status, approved_date: date });
      } else if (status === 'declined') {
        // Send remarks with decline status - backend will handle email and notification
        await axiosInstance.patch(`/blotter-requests/${id}`, { 
          status, 
          decline_remarks: remarks || 'No remarks provided' 
        });
      } else {
        await axiosInstance.patch(`/blotter-requests/${id}`, { status });
      }
      fetchRequests();
    } catch (e) {
      if (e.response && e.response.status === 403) {
        alert('You do not have permission to update blotter requests. Please log in as an admin.');
      } else if (e.response && e.response.status === 401) {
        alert('You are not authenticated. Please log in.');
      } else {
        alert('Failed to update status.');
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
      setApproveModal({ open: false, id: null });
      setDeclineModal({ open: false, id: null });
      setApproveDate('');
      setApproveTime('');
      setTimeHour('');
      setTimeMinute('');
      setTimeAmPm('AM');
      setDeclineRemarks('');
    }
  };

  // Handle approve button click
  const openApproveModal = (id) => {
    setApproveModal({ open: true, id });
    setApproveDate('');
    setApproveTime('');
    setTimeHour('');
    setTimeMinute('');
    setTimeAmPm('AM');
  };

  // Handle decline button click
  const openDeclineModal = (id) => {
    setDeclineModal({ open: true, id });
    setDeclineRemarks('');
  };

  // Handle decline modal submit
  const submitDecline = () => {
    if (!declineRemarks.trim()) {
      alert('Please provide a reason for declining this request.');
      return;
    }
    handleAction(declineModal.id, 'declined', null, declineRemarks.trim());
  };

  // Handle time change and update approveTime
  useEffect(() => {
    if (timeHour && timeMinute) {
      // Format: HH:MM (24-hour format for API)
      let hour24 = parseInt(timeHour);
      if (timeAmPm === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (timeAmPm === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      const formattedTime = `${hour24.toString().padStart(2, '0')}:${timeMinute}`;
      setApproveTime(formattedTime);
    } else {
      setApproveTime('');
    }
  }, [timeHour, timeMinute, timeAmPm]);

  // Get formatted time display
  const getFormattedTime = () => {
    if (timeHour && timeMinute) {
      // Display hour without leading zero if it's a single digit (1-9)
      const displayHour = parseInt(timeHour);
      return `${displayHour}:${timeMinute} ${timeAmPm}`;
    }
    return null;
  };

  // Handle approve modal submit
  const submitApprove = () => {
    if (!approveDate) {
      alert('Please select an approved scheduled date.');
      return;
    }
    // Combine date and time for approved_date
    let approvedDateTime = approveDate;
    if (approveTime) {
      approvedDateTime += 'T' + approveTime;
    }
    handleAction(approveModal.id, 'approved', approvedDateTime);
  };

  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    declined: requests.filter(r => r.status === 'declined').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.resident?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.resident?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.resident?.residents_id?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      declined: 'bg-red-50 text-red-700 border border-red-200',
      completed: 'bg-blue-50 text-blue-700 border border-blue-200',
    };
    return styles[status] || 'bg-gray-50 text-gray-700 border border-gray-200';
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-slate-50 via-green-50/30 to-blue-50/20 min-h-screen ml-64 pt-32 px-8 pb-16 font-sans">
        <div className="max-w-[95%] xl:max-w-[1800px] mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                    Blotter Requests Management
                  </h1>
                  {/* Real-time Status Indicator */}
                  <div className="flex items-center gap-2">
                    {isRealTimeEnabled && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
                        <div className="relative">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                          <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="text-xs font-medium text-emerald-700">Live</span>
                      </div>
                    )}
                    {isRefreshing && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                        <svg className="animate-spin h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-xs font-medium text-blue-700">Refreshing...</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-gray-600 text-base">Manage and track all blotter requests from residents</p>
                  {lastUpdate && (
                    <span className="text-xs text-gray-500">
                      Last updated: {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>
            </div>
              <div className="flex items-center gap-3">
                {/* Real-time Toggle Button */}
                <button
                  onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                  className={`px-4 py-3 rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 ${
                    isRealTimeEnabled
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                  title={isRealTimeEnabled ? 'Disable real-time updates' : 'Enable real-time updates'}
                >
                  {isRealTimeEnabled ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Auto-Refresh On
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Auto-Refresh Off
                    </>
                  )}
                </button>
                {/* Manual Refresh Button */}
                <button
                  onClick={() => fetchRequests(false)}
                  disabled={loading || isRefreshing}
                  className="px-4 py-3 bg-white border-2 border-gray-300 rounded-xl shadow-lg hover:shadow-xl hover:border-green-500 flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh now"
                >
                  <svg 
                    className={`w-4 h-4 text-gray-600 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
                {/* Back to Blotter Record Button */}
            <button
              onClick={() => navigate('/admin/blotterRecords')}
                  className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:-translate-y-0.5"
            >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Back to Blotter Record
            </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-amber-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.pending}</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Approved</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.approved}</p>
                  </div>
                  <div className="bg-emerald-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Declined</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.declined}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-5 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{stats.completed}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, ticket number, or resident ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="md:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none bg-white cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Approve Modal */}
          {approveModal.open && (
            <div 
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-md transition-opacity duration-300"
              onClick={() => setApproveModal({ open: false, id: null })}
            >
              <div 
                className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Enhanced Modal Header */}
                <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 rounded-t-3xl px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Approve Blotter Request</h2>
                        <p className="text-emerald-100 text-sm mt-1">Schedule an appointment date and time</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setApproveModal({ open: false, id: null })}
                      className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                      aria-label="Close modal"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Request Information Card */}
                {approveModal.id && requests.find(r => r.id === approveModal.id) && (() => {
                  const request = requests.find(r => r.id === approveModal.id);
                  return (
                    <div className="px-8 pt-6">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Request Details</span>
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                            ID: #{request.id}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Resident:</span>
                            <p className="font-semibold text-gray-800 mt-0.5">
                              {request.resident 
                                ? [request.resident.first_name, request.resident.middle_name, request.resident.last_name].filter(Boolean).join(' ')
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Ticket #:</span>
                            <p className="font-semibold text-gray-800 mt-0.5 font-mono">
                              {request.ticket_number || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Form Fields */}
                <div className="px-8 pb-8 space-y-6">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <div className="bg-emerald-100 p-1.5 rounded-lg">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      Scheduled Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                <input
                  type="date"
                        className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-gray-700 bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg font-medium"
                  value={approveDate}
                  onChange={e => setApproveDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {approveDate && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">
                            Selected: {new Date(approveDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      )}
                      {!approveDate && (
                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Please select a date for the appointment
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Time Picker - Custom Dropdown */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <div className="bg-emerald-100 p-1.5 rounded-lg">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      Scheduled Time
                      <span className="text-xs font-normal text-gray-500">(Optional)</span>
                    </label>
                    <div className="border-2 border-gray-200 rounded-xl p-4 bg-white focus-within:ring-4 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-200 shadow-sm hover:shadow-md focus-within:shadow-lg">
                      <div className="grid grid-cols-4 gap-3 items-end">
                        {/* Hour Dropdown */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Hour</label>
                          <select
                            value={timeHour}
                            onChange={(e) => setTimeHour(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 font-medium text-center appearance-none cursor-pointer hover:border-emerald-300"
                          >
                            <option value="">--</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(hour => (
                              <option key={hour} value={hour.toString()}>
                                {hour}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Separator */}
                        <div className="flex items-center justify-center pb-6">
                          <span className="text-2xl font-bold text-gray-400">:</span>
                        </div>
                        
                        {/* Minute Dropdown */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Minute</label>
                          <select
                            value={timeMinute}
                            onChange={(e) => setTimeMinute(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 font-medium text-center appearance-none cursor-pointer hover:border-emerald-300"
                          >
                            <option value="">--</option>
                            {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                              <option key={minute} value={minute.toString().padStart(2, '0')}>
                                {minute.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* AM/PM Dropdown */}
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">Period</label>
                          <select
                            value={timeAmPm}
                            onChange={(e) => setTimeAmPm(e.target.value)}
                            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 font-medium text-center appearance-none cursor-pointer hover:border-emerald-300"
                          >
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Quick Time Buttons */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-xs font-medium text-gray-500 mr-1">Quick select:</span>
                          {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(time => {
                            const [timePart, period] = time.split(' ');
                            let [hour, minute] = timePart.split(':');
                            // Remove leading zero from hour for state (store as "1", "2", etc.)
                            const hourForState = hour.startsWith('0') ? hour.substring(1) : hour;
                            return (
                              <button
                                key={time}
                                type="button"
                                onClick={() => {
                                  setTimeHour(hourForState);
                                  setTimeMinute(minute);
                                  setTimeAmPm(period);
                                }}
                                className="px-3 py-1.5 text-xs font-medium bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-300 rounded-lg transition-all duration-200 hover:shadow-sm"
                              >
                                {time}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => {
                              setTimeHour('');
                              setTimeMinute('');
                              setTimeAmPm('AM');
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 ml-auto"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Time Confirmation Badge */}
                    {getFormattedTime() && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 transition-all duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Selected Time: {getFormattedTime()}</span>
                      </div>
                    )}
                  </div>

                  {/* Preview Section */}
                  {approveDate && (
                    <div className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-emerald-500 p-2 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Appointment Preview</h4>
                          <div className="space-y-1 text-sm text-gray-700">
                            <p className="flex items-center gap-2">
                              <span className="font-medium">Date:</span>
                              <span>{new Date(approveDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </p>
                            {getFormattedTime() ? (
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Time:</span>
                                <span>{getFormattedTime()}</span>
                              </p>
                            ) : (
                              <p className="text-gray-500 italic">Time: Not specified</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="px-8 pb-8">
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setApproveModal({ open: false, id: null })}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    Cancel
                  </button>
                  <button
                    onClick={submitApprove}
                      disabled={!approveDate || actionLoading[approveModal.id]}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:via-green-700 hover:to-emerald-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      {actionLoading[approveModal.id] ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Approving...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve Request
                        </>
                      )}
                  </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Decline Modal */}
          {declineModal.open && (
            <div 
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 backdrop-blur-md transition-opacity duration-300"
              onClick={() => setDeclineModal({ open: false, id: null })}
            >
              <div 
                className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Enhanced Modal Header */}
                <div className="bg-gradient-to-r from-red-600 via-red-600 to-red-700 rounded-t-3xl px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                        <XMarkIcon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Decline Blotter Request</h2>
                        <p className="text-red-100 text-sm mt-1">Provide a reason for declining this request</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeclineModal({ open: false, id: null })}
                      className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                      aria-label="Close modal"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Request Information Card */}
                {declineModal.id && requests.find(r => r.id === declineModal.id) && (() => {
                  const request = requests.find(r => r.id === declineModal.id);
                  return (
                    <div className="px-8 pt-6">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Request Details</span>
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            ID: #{request.id}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Resident:</span>
                            <p className="font-semibold text-gray-800 mt-0.5">
                              {request.resident 
                                ? [request.resident.first_name, request.resident.middle_name, request.resident.last_name].filter(Boolean).join(' ')
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Ticket #:</span>
                            <p className="font-semibold text-gray-800 mt-0.5 font-mono">
                              {request.ticket_number || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                
                {/* Form Fields */}
                <div className="px-8 pb-8 space-y-6">
                  {/* Remarks Textarea */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <div className="bg-red-100 p-1.5 rounded-lg">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      Reason for Declining <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={declineRemarks}
                      onChange={(e) => setDeclineRemarks(e.target.value)}
                      placeholder="Please provide a clear reason for declining this request. This will be sent to the resident via email and notification."
                      className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-gray-700 bg-white focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg font-medium min-h-[120px] resize-y"
                      required
                    />
                    <div className="flex items-start gap-2 mt-2">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-gray-600">
                        The resident will receive an email notification and a notification bell alert with this reason.
                      </p>
                    </div>
                    {!declineRemarks.trim() && (
                      <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Please provide a reason for declining this request
                      </p>
                    )}
                  </div>

                  {/* Preview Section */}
                  {declineRemarks.trim() && (
                    <div className="bg-red-50 rounded-xl p-5 border-2 border-red-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-red-500 p-2 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-2">Decline Reason Preview</h4>
                          <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-red-200">
                            <p className="whitespace-pre-wrap">{declineRemarks}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            This will be sent via email and notification bell to the resident
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="px-8 pb-8">
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setDeclineModal({ open: false, id: null });
                        setDeclineRemarks('');
                      }}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </button>
                    <button
                      onClick={submitDecline}
                      disabled={!declineRemarks.trim() || actionLoading[declineModal.id]}
                      className="px-8 py-3 bg-gradient-to-r from-red-600 via-red-600 to-red-700 hover:from-red-700 hover:via-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      {actionLoading[declineModal.id] ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Declining...
                        </>
                      ) : (
                        <>
                          <XMarkIcon className="w-5 h-5" />
                          Decline Request
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 px-8 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">Blotter Requests</h3>
                    <p className="text-white/90 text-sm mt-0.5">
                      {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} found
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-16 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-600"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading requests...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                  <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Resident ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Resident Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Scheduled Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ticket #</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Created</th>
                      <th className="px-4 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider min-w-[100px] w-[100px]">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="hidden sm:inline">Actions</span>
                        </div>
                      </th>
                  </tr>
                </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.length === 0 ? (
                    <tr>
                        <td colSpan="10" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium">No blotter requests found</p>
                            <p className="text-gray-400 text-sm mt-1">
                              {searchTerm || statusFilter !== 'all' 
                                ? 'Try adjusting your search or filter criteria' 
                                : 'No requests have been submitted yet'}
                            </p>
                          </div>
                        </td>
                    </tr>
                  ) : (
                      paginatedRequests.map(req => (
                        <tr 
                          key={req.id} 
                          className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/30 transition-all duration-200 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-green-100 text-green-800 border border-green-200">
                              #{req.id}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3">
                                {req.user?.name?.charAt(0)?.toUpperCase() || 'N'}
                              </div>
                              <div className="text-sm font-medium text-gray-900">{req.user?.name || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600 font-mono">
                              {req.resident?.residents_id || req.resident_id || 'N/A'}
                            </span>
                          </td>
                        <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                          {req.resident
                            ? [req.resident.first_name, req.resident.middle_name, req.resident.last_name].filter(Boolean).join(' ')
                            : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${getStatusBadge(req.status)}`}>
                              {req.status === 'pending' && (
                                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                              )}
                              {req.status === 'approved' && (
                                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {req.status === 'declined' && (
                                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                              {req.status === 'completed' && (
                                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {req.approved_date ? (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(req.approved_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {req.approved_date ? (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(req.approved_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {req.ticket_number ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                                {req.ticket_number}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center">
                              <ActionsDropdown
                                request={req}
                                onApprove={openApproveModal}
                                onDecline={openDeclineModal}
                                actionLoading={actionLoading}
                              />
                            </div>
                          </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && filteredRequests.length > 0 && totalPages > 1 && (
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Page Info */}
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min(endIndex, filteredRequests.length)}
                    </span>{' '}
                    of <span className="font-semibold text-gray-900">{filteredRequests.length}</span> requests
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                currentPage === pageNum
                                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return (
                            <span key={pageNum} className="px-2 text-gray-500">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default BlotterRequest; 