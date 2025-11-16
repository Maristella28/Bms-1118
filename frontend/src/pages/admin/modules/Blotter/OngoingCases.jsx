import React, { useState, useEffect } from 'react';
import Navbar from "../../../../components/Navbar";
import Sidebar from "../../../../components/Sidebar";
import axios from "../../../../utils/axiosConfig";
import ActionsDropdown from "./components/ActionsDropdown";
import {
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  EyeIcon,
  XMarkIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon as AlertIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  BellIcon,
  UserMinusIcon,
  ExclamationCircleIcon,
  CheckIcon,
  XCircleIcon,
  InformationCircleIcon,
  EllipsisVerticalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';

const StatCard = ({ label, value, icon, iconBg, color, onClick, isActive }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group cursor-pointer ${
      isActive ? 'ring-2 ring-orange-500 bg-orange-50' : ''
    }`}
  >
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{label}</p>
      <p className={`text-lg sm:text-2xl lg:text-3xl font-bold group-hover:scale-105 transition ${color}`}>{value}</p>
    </div>
    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-4">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-6 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </td>
    <td className="px-4 py-4">
      <div className="h-6 bg-gray-200 rounded w-18"></div>
    </td>
    <td className="px-4 py-4">
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-8"></div>
      </div>
    </td>
  </tr>
);

const badge = (text, color, icon = null, size = 'sm') => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium shadow-sm border ${color} ${sizeClasses[size]}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate">{text}</span>
    </span>
  );
};

const StatusBadge = ({ status, type = 'default' }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Scheduled':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <CheckCircleIcon className="w-3.5 h-3.5" />
        };
      case 'Pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <ClockIcon className="w-3.5 h-3.5" />
        };
      case 'Ongoing':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <ArrowPathIcon className="w-3.5 h-3.5" />
        };
      case 'Completed':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckIcon className="w-3.5 h-3.5" />
        };
      case 'Cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircleIcon className="w-3.5 h-3.5" />
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <ClockIcon className="w-3.5 h-3.5" />
        };
    }
  };

  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${config.color}`}>
      {config.icon}
      <span>{status}</span>
    </span>
  );
};

const NoShowBadge = ({ type, count = 0 }) => {
  const config = {
    complainant: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <UserMinusIcon className="w-3.5 h-3.5" />,
      text: 'Complainant No-Show'
    },
    respondent: {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <ExclamationCircleIcon className="w-3.5 h-3.5" />,
      text: 'Respondent No-Show'
    }
  };

  const { color, icon, text } = config[type] || config.complainant;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border ${color}`}>
      {icon}
      <span>{text}</span>
      {count > 0 && <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs font-bold ml-1">{count}</span>}
    </span>
  );
};

const getComplaintTypeColor = (type) => {
  switch (type) {
    case 'Physical Injury':
      return 'bg-red-100 text-red-800';
    case 'Verbal Abuse':
      return 'bg-orange-100 text-orange-800';
    case 'Property Damage':
      return 'bg-yellow-100 text-yellow-800';
    case 'Theft':
      return 'bg-purple-100 text-purple-800';
    case 'Noise Complaint':
      return 'bg-blue-100 text-blue-800';
    case 'Other':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getComplaintTypeIcon = (type) => {
  switch (type) {
    case 'Physical Injury':
      return <AlertIcon className="w-3 h-3" />;
    case 'Verbal Abuse':
      return <ChatBubbleLeftRightIcon className="w-3 h-3" />;
    case 'Property Damage':
      return <ShieldExclamationIcon className="w-3 h-3" />;
    case 'Theft':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    case 'Noise Complaint':
      return <DocumentTextIcon className="w-3 h-3" />;
    case 'Other':
      return <DocumentTextIcon className="w-3 h-3" />;
    default:
      return <DocumentTextIcon className="w-3 h-3" />;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Ongoing':
      return 'bg-orange-100 text-orange-800';
    case 'Scheduled':
      return 'bg-green-100 text-green-800';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Completed':
      return 'bg-blue-100 text-blue-800';
    case 'No Show':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'Ongoing':
      return <ClockIcon className="w-3 h-3" />;
    case 'Scheduled':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'Pending':
      return <ClockIcon className="w-3 h-3" />;
    case 'Cancelled':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    case 'Completed':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'No Show':
      return <XMarkIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

const OngoingCases = () => {
  const [blotterRecords, setBlotterRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState({});
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // No-show management state
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [noShowData, setNoShowData] = useState({});
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealData, setAppealData] = useState({});
  const [penaltyInfo, setPenaltyInfo] = useState({});

  // Enhanced UI state
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    status: '',
    priority: '',
    dateFrom: '',
    dateTo: ''
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Bulk actions state
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    caseNumber: true,
    complainant: true,
    respondent: true,
    type: true,
    priority: true,
    date: true,
    status: true,
    actions: true
  });
  
  // User preferences state
  const [userPreferences, setUserPreferences] = useState({
    itemsPerPage: 10,
    sortField: '',
    sortDirection: 'asc',
    viewMode: 'table',
    activeFilter: 'all'
  });

  // Custom navigation function with error handling
  const handleNavigation = (path) => {
    console.log('Attempting to navigate to:', path);
    console.log('Current location:', window.location.pathname);
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback: try window.location as last resort
      console.log('Using fallback navigation with window.location');
      window.location.href = path;
    }
  };

  useEffect(() => {
    // Load user preferences first
    loadUserPreferences();
    
    // Fetch blotter records from API endpoint
    setLoading(true);
    axios.get("/blotter-records")
      .then(res => {
        const records = res.data.records || [];
        // Filter for ongoing cases (Ongoing, Pending and Scheduled statuses)
        const ongoingRecords = records.filter(record => 
          record.status === 'Ongoing' || record.status === 'Pending' || record.status === 'Scheduled'
        );
        setBlotterRecords(ongoingRecords);
        setFilteredRecords(ongoingRecords);
      })
      .finally(() => setLoading(false));
  }, []);

  // Save preferences when they change
  useEffect(() => {
    if (userPreferences.itemsPerPage !== undefined) {
      saveUserPreferences();
    }
  }, [itemsPerPage, sortField, sortDirection, viewMode, activeFilter]);

  useEffect(() => {
    setFilteredRecords(
      blotterRecords.filter((record) => {
        const matchesSearch =
          (record.complainant_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.respondent_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.complaint_type || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.resident && `${record.resident.first_name} ${record.resident.last_name}`.toLowerCase().includes(search.toLowerCase()));
        return matchesSearch;
      })
    );
  }, [search, blotterRecords]);

  const handleShowDetails = (record) => {
    setDetailsData(record);
    setShowDetailsModal(true);
  };

  const handleEdit = (record) => {
    setEditData(record);
    setShowModal(true);
  };

  const handleSendNotification = (record) => {
    setNotificationData({
      ...record,
      appointment_date: '',
      appointment_time: '',
      message: ''
    });
    setShowNotificationModal(true);
  };

  const handleSave = () => {
    // Handle save logic here
    setShowModal(false);
    setEditData({});
  };

  const handleSolved = async (record) => {
    try {
      const response = await axios.put(`/blotter-records/${record.id}`, {
        status: 'Completed',
        solved_at: new Date().toISOString()
      });
      
      if (response.status === 200) {
        // Update the record in the local state
        setBlotterRecords(prevRecords => 
          prevRecords.map(r => 
            r.id === record.id ? { ...r, status: 'Completed', solved_at: new Date().toISOString() } : r
          )
        );
        
        // Update filtered records as well
        setFilteredRecords(prevRecords => 
          prevRecords.map(r => 
            r.id === record.id ? { ...r, status: 'Completed', solved_at: new Date().toISOString() } : r
          )
        );
        
        // Show success message
        showToast('Case marked as solved successfully!', 'success');
      }
    } catch (error) {
      console.error('Error marking case as solved:', error);
      showToast('Error marking case as solved. Please try again.', 'error');
    }
  };

  // No-show management functions
  const handleMarkNoShow = (record, type) => {
    setNoShowData({
      ...record,
      type: type, // 'complainant' or 'respondent'
      reason: ''
    });
    setShowNoShowModal(true);
  };

  const handleSubmitNoShow = async () => {
    try {
      const endpoint = noShowData.type === 'complainant' 
        ? `/blotter-records/${noShowData.id}/mark-complainant-noshow`
        : `/blotter-records/${noShowData.id}/mark-respondent-noshow`;

      const response = await axios.post(endpoint, {
        reason: noShowData.reason
      });

      if (response.status === 200) {
        // Update the record in local state
        const updatedRecord = {
          ...noShowData,
          [`${noShowData.type}_no_show`]: true,
          [`${noShowData.type}_no_show_at`]: new Date().toISOString(),
          [`${noShowData.type}_no_show_reason`]: noShowData.reason
        };

        setBlotterRecords(prevRecords => 
          prevRecords.map(r => r.id === noShowData.id ? updatedRecord : r)
        );
        
        setFilteredRecords(prevRecords => 
          prevRecords.map(r => r.id === noShowData.id ? updatedRecord : r)
        );

        // If complainant, update penalty info
        if (noShowData.type === 'complainant' && response.data.penalty_info) {
          setPenaltyInfo(response.data.penalty_info);
        }

        showToast(`${noShowData.type === 'complainant' ? 'Complainant' : 'Respondent'} marked as no-show successfully!`, 'success');
        setShowNoShowModal(false);
        setNoShowData({});
      }
    } catch (error) {
      console.error('Error marking as no-show:', error);
      showToast('Error marking as no-show. Please try again.', 'error');
    }
  };

  const handleSubmitAppeal = (record, type) => {
    setAppealData({
      ...record,
      type: type,
      reason: ''
    });
    setShowAppealModal(true);
  };

  const handleProcessAppeal = async () => {
    try {
      const response = await axios.post(`/blotter-records/${appealData.id}/submit-appeal`, {
        type: appealData.type,
        reason: appealData.reason
      });

      if (response.status === 200) {
        // Update the record in local state
        const updatedRecord = {
          ...appealData,
          [`${appealData.type}_appeal_submitted`]: true,
          [`${appealData.type}_appeal_reason`]: appealData.reason,
          [`${appealData.type}_appeal_status`]: 'pending'
        };

        setBlotterRecords(prevRecords => 
          prevRecords.map(r => r.id === appealData.id ? updatedRecord : r)
        );
        
        setFilteredRecords(prevRecords => 
          prevRecords.map(r => r.id === appealData.id ? updatedRecord : r)
        );

        showToast('Appeal submitted successfully!', 'success');
        setShowAppealModal(false);
        setAppealData({});
      }
    } catch (error) {
      console.error('Error submitting appeal:', error);
      showToast('Error submitting appeal. Please try again.', 'error');
    }
  };

  const getPenaltyStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'restricted': return 'text-orange-600 bg-orange-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'permanently_restricted': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPenaltyStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'warning': return 'Warning';
      case 'restricted': return 'Restricted';
      case 'suspended': return 'Suspended';
      case 'permanently_restricted': return 'Permanently Restricted';
      default: return 'Unknown';
    }
  };

  // Enhanced utility functions
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedRecords = (records) => {
    if (!sortField) return records;
    
    return [...records].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'incident_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getPaginatedRecords = (records) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return records.slice(startIndex, endIndex);
  };

  const getTotalPages = (records) => {
    return Math.ceil(records.length / itemsPerPage);
  };

  const handleFilterChange = (filterType) => {
    setActiveFilter(filterType);
    setCurrentPage(1);
  };

  const getFilteredRecords = () => {
    let filtered = blotterRecords;

    // Apply active filter
    if (activeFilter !== 'all') {
      switch (activeFilter) {
        case 'pending':
          filtered = filtered.filter(record => record.status === 'Pending');
          break;
        case 'scheduled':
          filtered = filtered.filter(record => record.status === 'Scheduled');
          break;
        case 'high-priority':
          filtered = filtered.filter(record => 
            getPriorityLevel(record.complaint_type).level === 'High'
          );
          break;
        default:
          break;
      }
    }

    // Apply advanced filters
    if (advancedFilters.status) {
      filtered = filtered.filter(record => record.status === advancedFilters.status);
    }
    if (advancedFilters.priority) {
      filtered = filtered.filter(record => 
        getPriorityLevel(record.complaint_type).level === advancedFilters.priority
      );
    }
    if (advancedFilters.dateFrom) {
      filtered = filtered.filter(record => 
        new Date(record.incident_date) >= new Date(advancedFilters.dateFrom)
      );
    }
    if (advancedFilters.dateTo) {
      filtered = filtered.filter(record => 
        new Date(record.incident_date) <= new Date(advancedFilters.dateTo)
      );
    }

    // Apply search
    if (search) {
      filtered = filtered.filter((record) => {
        const matchesSearch =
          (record.complainant_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.respondent_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.complaint_type || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.resident && `${record.resident.first_name} ${record.resident.last_name}`.toLowerCase().includes(search.toLowerCase()));
        return matchesSearch;
      });
    }

    return filtered;
  };

  // Enhanced utility functions
  const loadUserPreferences = () => {
    const saved = localStorage.getItem('ongoingCasesPreferences');
    if (saved) {
      const preferences = JSON.parse(saved);
      setUserPreferences(preferences);
      setItemsPerPage(preferences.itemsPerPage || 10);
      setSortField(preferences.sortField || '');
      setSortDirection(preferences.sortDirection || 'asc');
      setViewMode(preferences.viewMode || 'table');
      setActiveFilter(preferences.activeFilter || 'all');
    }
  };

  const saveUserPreferences = () => {
    const preferences = {
      itemsPerPage,
      sortField,
      sortDirection,
      viewMode,
      activeFilter
    };
    localStorage.setItem('ongoingCasesPreferences', JSON.stringify(preferences));
    setUserPreferences(preferences);
  };

  const handleSelectRecord = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    const filteredRecords = getFilteredRecords();
    const paginatedRecords = getPaginatedRecords(getSortedRecords(filteredRecords));
    
    if (selectedRecords.length === paginatedRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(paginatedRecords.map(record => record.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedRecords.length === 0) {
      showToast('Please select at least one record', 'error');
      return;
    }

    try {
      switch (action) {
        case 'mark-solved':
          await Promise.all(selectedRecords.map(id => 
            axios.put(`/blotter-records/${id}`, {
              status: 'Completed',
              solved_at: new Date().toISOString()
            })
          ));
          showToast(`${selectedRecords.length} cases marked as solved`, 'success');
          break;
        case 'export':
          exportToCSV(selectedRecords);
          break;
        case 'send-reminder':
          showToast('Reminder functionality coming soon', 'success');
          break;
      }
      
      setSelectedRecords([]);
      setShowBulkActions(false);
      
      // Refresh data
      const res = await axios.get("/blotter-records");
      const records = res.data.records || [];
      const ongoingRecords = records.filter(record => 
        record.status === 'Ongoing' || record.status === 'Pending' || record.status === 'Scheduled'
      );
      setBlotterRecords(ongoingRecords);
    } catch (error) {
      console.error('Bulk action error:', error);
      showToast('Error performing bulk action', 'error');
    }
  };

  const exportToCSV = (recordIds = null) => {
    const recordsToExport = recordIds 
      ? blotterRecords.filter(record => recordIds.includes(record.id))
      : getFilteredRecords();

    const headers = ['Case Number', 'Complainant', 'Respondent', 'Type', 'Priority', 'Status', 'Date', 'Incident Location'];
    const csvContent = [
      headers.join(','),
      ...recordsToExport.map(record => [
        record.case_number || `#${record.id}`,
        record.complainant_name || 'N/A',
        record.respondent_name || 'N/A',
        record.complaint_type || 'N/A',
        getPriorityLevel(record.complaint_type).level,
        record.status || 'N/A',
        formatDate(record.incident_date),
        record.incident_location || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ongoing-cases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast(`Exported ${recordsToExport.length} cases to CSV`, 'success');
  };

  const clearAllFilters = () => {
    setActiveFilter('all');
    setSearch('');
    setAdvancedFilters({ status: '', priority: '', dateFrom: '', dateTo: '' });
    setCurrentPage(1);
    showToast('All filters cleared', 'success');
  };

  const hasActiveFilters = () => {
    return activeFilter !== 'all' || 
           search || 
           advancedFilters.status || 
           advancedFilters.priority || 
           advancedFilters.dateFrom || 
           advancedFilters.dateTo;
  };
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusCount = (status) => {
    return blotterRecords.filter(record => record.status === status).length;
  };

  const getPriorityLevel = (complaintType) => {
    switch (complaintType) {
      case 'Physical Injury':
        return { level: 'High', color: 'text-red-600 bg-red-100' };
      case 'Theft':
        return { level: 'High', color: 'text-red-600 bg-red-100' };
      case 'Property Damage':
        return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
      case 'Verbal Abuse':
        return { level: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
      case 'Noise Complaint':
        return { level: 'Low', color: 'text-blue-600 bg-blue-100' };
      default:
        return { level: 'Low', color: 'text-gray-600 bg-gray-100' };
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-orange-50 to-red-50 min-h-screen ml-0 lg:ml-64 pt-20 lg:pt-36 px-8 pb-16 font-sans">
        <div className="w-full max-w-[95%] xl:max-w-[1800px] mx-auto space-y-8">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => handleNavigation('/admin/blotterRecords')}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Records
              </button>
            </div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-xl mb-4">
              <ClockIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent tracking-tight">
              Ongoing Cases
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Track and manage all active blotter complaints that require immediate attention and follow-up.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
            <StatCard
              label="Total Ongoing"
              value={blotterRecords.length}
              icon={<ClockIcon className="w-6 h-6 text-orange-600" />}
              iconBg="bg-orange-100"
              color="text-orange-600"
                  onClick={() => handleFilterChange('all')}
                  isActive={activeFilter === 'all'}
            />
            <StatCard
              label="Pending Review"
              value={getStatusCount('Pending')}
              icon={<ClockIcon className="w-6 h-6 text-yellow-600" />}
              iconBg="bg-yellow-100"
              color="text-yellow-600"
                  onClick={() => handleFilterChange('pending')}
                  isActive={activeFilter === 'pending'}
            />
            <StatCard
              label="Scheduled"
              value={getStatusCount('Scheduled')}
              icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
              color="text-green-600"
                  onClick={() => handleFilterChange('scheduled')}
                  isActive={activeFilter === 'scheduled'}
            />
            <StatCard
              label="High Priority"
              value={blotterRecords.filter(record => 
                getPriorityLevel(record.complaint_type).level === 'High'
              ).length}
              icon={<AlertIcon className="w-6 h-6 text-red-600" />}
              iconBg="bg-red-100"
              color="text-red-600"
                  onClick={() => handleFilterChange('high-priority')}
                  isActive={activeFilter === 'high-priority'}
            />
              </>
            )}
          </div>

          {/* Enhanced Search Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleNavigation('/admin/modules/Blotter/NewComplaint')}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <ShieldExclamationIcon className="w-5 h-5" />
                  New Complaint
                </button>
                <button
                  onClick={() => handleNavigation('/admin/modules/Blotter/BlotterRequest')}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <ShieldExclamationIcon className="w-5 h-5" />
                  View All Blotter Requests
                </button>
                <button
                  onClick={() => {
                    if (getFilteredRecords().length === 0) {
                      showToast('No ongoing cases available to send notices for.', 'error');
                      return;
                    }
                    setShowNotificationModal(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <BellIcon className="w-5 h-5" />
                  Send Barangay Notice
                </button>
                
                {/* Export Button */}
                <button
                  onClick={() => exportToCSV()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  Export CSV
                </button>
                
                {/* Clear Filters Button */}
                {hasActiveFilters() && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="flex gap-2 items-center w-full max-w-2xl">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search ongoing cases..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                </div>
                
                {/* Advanced Filters Button */}
                <div className="relative">
                  <button 
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 flex items-center justify-center ${
                      showAdvancedFilters 
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white' 
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white'
                    }`}
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                </button>
                  
                  {/* Advanced Filters Dropdown */}
                  {showAdvancedFilters && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                      <div className="p-4 space-y-4">
                        <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Advanced Filters</h4>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select 
                            value={advancedFilters.status}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, status: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Ongoing">Ongoing</option>
                          </select>
              </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                          <select 
                            value={advancedFilters.priority}
                            onChange={(e) => setAdvancedFilters({...advancedFilters, priority: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          >
                            <option value="">All Priorities</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                            <input 
                              type="date" 
                              value={advancedFilters.dateFrom}
                              onChange={(e) => setAdvancedFilters({...advancedFilters, dateFrom: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                            <input 
                              type="date" 
                              value={advancedFilters.dateTo}
                              onChange={(e) => setAdvancedFilters({...advancedFilters, dateTo: e.target.value})}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
            </div>
          </div>
                        
                        <div className="flex gap-2 pt-2 border-t border-gray-200">
                          <button 
                            onClick={() => setAdvancedFilters({status: '', priority: '', dateFrom: '', dateTo: ''})}
                            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Clear
                          </button>
                          <button 
                            onClick={() => setShowAdvancedFilters(false)}
                            className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Column Selector */}
                <div className="relative">
                  <button 
                    onClick={() => setShowColumnSelector(!showColumnSelector)}
                    className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 flex items-center justify-center"
                    title="Select Columns"
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  </button>
                  
                  {showColumnSelector && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Select Columns</h4>
                        <div className="space-y-2">
                          {Object.entries(visibleColumns).map(([key, visible]) => (
                            <label key={key} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={visible}
                                onChange={(e) => setVisibleColumns(prev => ({...prev, [key]: e.target.checked}))}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* View Mode Toggle */}
                <button 
                  onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 flex items-center justify-center"
                  title={`Switch to ${viewMode === 'table' ? 'Card' : 'Table'} View`}
                >
                  {viewMode === 'table' ? (
                    <div className="grid grid-cols-2 gap-1 w-4 h-4">
                      <div className="bg-white rounded-sm"></div>
                      <div className="bg-white rounded-sm"></div>
                      <div className="bg-white rounded-sm"></div>
                      <div className="bg-white rounded-sm"></div>
                    </div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-white rounded"></div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedRecords.length > 0 && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg border border-orange-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <CheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {selectedRecords.length} case{selectedRecords.length > 1 ? 's' : ''} selected
                    </h3>
                    <p className="text-orange-100 text-sm">Choose an action to perform on selected cases</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkAction('mark-solved')}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Mark as Solved
                  </button>
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    Export Selected
                  </button>
                  <button
                    onClick={() => handleBulkAction('send-reminder')}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <BellIcon className="w-4 h-4" />
                    Send Reminder
                  </button>
                  <button
                    onClick={() => setSelectedRecords([])}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Ongoing Cases Table
              </h3>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                          Case #
                    </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                          Complainant Name
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap bg-gray-50">
                        <div className="flex items-center gap-2">
                          <UserMinusIcon className="w-4 h-4 text-red-600" />
                          <span className="text-red-700">No-Show</span>
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                          Respondent Name
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap bg-gray-50">
                        <div className="flex items-center gap-2">
                          <UserMinusIcon className="w-4 h-4 text-red-600" />
                          <span className="text-red-700">No-Show</span>
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <AlertIcon className="w-4 h-4 text-gray-600" />
                          Type
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-600" />
                          Priority
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-600" />
                          Date
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-gray-600" />
                          Status
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <EllipsisVerticalIcon className="w-4 h-4 text-gray-600" />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Array.from({ length: 5 }, (_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </tbody>
                </table>
              ) : viewMode === 'cards' ? (
                // Card View for Mobile/Responsive
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {getPaginatedRecords(getSortedRecords(getFilteredRecords())).map((record, index) => (
                    <div key={record.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <div className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-3 py-1 rounded-lg text-xs font-bold">
                          {record.case_number || `#${record.id}`}
                        </div>
                        {badge(record.status || 'Pending', getStatusColor(record.status), getStatusIcon(record.status))}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{record.complainant_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{record.respondent_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{formatDate(record.incident_date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        {badge(getPriorityLevel(record.complaint_type).level, getPriorityLevel(record.complaint_type).color)}
                        <button
                          onClick={() => handleShowDetails(record)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1 transition-all duration-300"
                        >
                          <EyeIcon className="w-3 h-3" />
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <tr>
                      {visibleColumns.caseNumber && (
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRecords.length > 0 && selectedRecords.length === getPaginatedRecords(getSortedRecords(getFilteredRecords())).length}
                              onChange={handleSelectAll}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm">Select All</span>
                          </div>
                        </th>
                      )}
                      <th 
                        className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('case_number')}
                      >
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                          Case #
                          {sortField === 'case_number' && (
                            sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                        onClick={() => handleSort('complainant_name')}
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                          Complainant Name
                          {sortField === 'complainant_name' && (
                            sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap bg-gray-50">
                        <div className="flex items-center gap-2">
                          <UserMinusIcon className="w-4 h-4 text-red-600" />
                          <span className="text-red-700">No-Show</span>
                        </div>
                      </th>
                      <th 
                        className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                        onClick={() => handleSort('respondent_name')}
                      >
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                          Respondent Name
                          {sortField === 'respondent_name' && (
                            sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 whitespace-nowrap bg-gray-50">
                        <div className="flex items-center gap-2">
                          <UserMinusIcon className="w-4 h-4 text-red-600" />
                          <span className="text-red-700">No-Show</span>
                        </div>
                      </th>
                      <th 
                        className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('complaint_type')}
                      >
                        <div className="flex items-center gap-2">
                          <AlertIcon className="w-4 h-4 text-gray-600" />
                          Type
                          {sortField === 'complaint_type' && (
                            sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-600" />
                          Priority
                        </div>
                      </th>
                      <th 
                        className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort('incident_date')}
                      >
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-600" />
                          Date
                          {sortField === 'incident_date' && (
                            sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-4 py-4 text-left font-bold text-gray-900 border-r border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-gray-600" />
                          Status
                          {sortField === 'status' && (
                            sortDirection === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <EllipsisVerticalIcon className="w-4 h-4 text-gray-600" />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {getPaginatedRecords(getSortedRecords(getFilteredRecords())).length === 0 ? (
                      <tr>
                        <td colSpan="11" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-6 animate-fade-in-up">
                            <div className="relative">
                              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                                <ClockIcon className="w-12 h-12 text-gray-400" />
                              </div>
                              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                                <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="text-center max-w-md">
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {hasActiveFilters() ? 'No Cases Match Your Filters' : 'No Ongoing Cases Found'}
                              </h3>
                              <p className="text-gray-600 mb-6">
                                {hasActiveFilters() 
                                  ? "Try adjusting your search criteria or filters to find the cases you're looking for."
                                  : "There are no ongoing cases at the moment. All cases have been resolved or are pending review."
                                }
                              </p>
                              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                    Clear All Filters
                                </button>
                              )}
                                <button
                                  onClick={() => handleNavigation('/admin/modules/Blotter/NewComplaint')}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                >
                                  <ShieldExclamationIcon className="w-4 h-4" />
                                  Create New Case
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      getPaginatedRecords(getSortedRecords(getFilteredRecords())).map((record, index) => (
                        <tr
                          key={record.id}
                          className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 group border-b border-gray-100 hover:border-orange-200 hover:shadow-sm animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedRecords.includes(record.id)}
                              onChange={() => handleSelectRecord(record.id)}
                              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm group-hover:shadow-md transition-all duration-300">
                              {record.case_number || `#${record.id}`}
                            </div>
                          </td>
                          <td className="px-4 py-4 border-r border-gray-200">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="font-medium text-gray-900 group-hover:text-orange-800 transition-colors duration-300">
                                {record.complainant_name || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-r border-gray-200 whitespace-nowrap bg-gray-50">
                            {/* Complainant No-Show */}
                            {record.complainant_no_show ? (
                              <NoShowBadge type="complainant" />
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4 border-r border-gray-200">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="font-medium text-gray-900 group-hover:text-orange-800 transition-colors duration-300">
                                {record.respondent_name || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-r border-gray-200 whitespace-nowrap bg-gray-50">
                            {/* Respondent No-Show */}
                            {record.respondent_no_show ? (
                              <NoShowBadge type="respondent" />
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="transform group-hover:scale-105 transition-transform duration-300">
                              {badge(record.complaint_type || 'Other', getComplaintTypeColor(record.complaint_type), getComplaintTypeIcon(record.complaint_type))}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="transform group-hover:scale-105 transition-transform duration-300">
                              {badge(getPriorityLevel(record.complaint_type).level, getPriorityLevel(record.complaint_type).color)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                                {formatDate(record.incident_date)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 border-r border-gray-200 whitespace-nowrap">
                            <StatusBadge status={record.status || 'Pending'} />
                            {(record.complainant_appeal_submitted || record.respondent_appeal_submitted) ? (
                              <div className="flex flex-col gap-1 mt-1.5">
                                {record.complainant_appeal_submitted ? (
                                  <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                                    <DocumentTextIcon className="w-3.5 h-3.5" />
                                    <span className="truncate">Complainant Appeal: {record.complainant_appeal_status || 'Pending'}</span>
                                  </div>
                                ) : null}
                                {record.respondent_appeal_submitted ? (
                                  <div className="flex items-center gap-1.5 text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                                    <DocumentTextIcon className="w-3.5 h-3.5" />
                                    <span className="truncate">Respondent Appeal: {record.respondent_appeal_status || 'Pending'}</span>
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <ActionsDropdown
                                record={record}
                                onViewDetails={handleShowDetails}
                                onEditCase={handleEdit}
                                onMarkSolved={handleSolved}
                                onMarkNoShow={handleMarkNoShow}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination Controls */}
            {!loading && getFilteredRecords().length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, getFilteredRecords().length)} of {getFilteredRecords().length} results
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Items per page:</label>
                      <select 
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, getTotalPages(getFilteredRecords())) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-orange-500 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(getTotalPages(getFilteredRecords()), currentPage + 1))}
                      disabled={currentPage === getTotalPages(getFilteredRecords())}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">                           
            <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-2xl border border-blue-200 w-full max-w-6xl max-h-[95vh] overflow-y-auto relative animate-scale-in">                                 
              {/* Enhanced Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl p-6 sticky top-0 z-10 shadow-md">              
                <div className="flex justify-between items-center">        
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-full p-2">
                      <PencilIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-lg">                                
                        Edit Case Details
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">Case #{editData.case_number || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-white">
                      <div className="text-sm text-blue-100">Last Updated</div>
                      <div className="text-xs">{editData.updated_at ? new Date(editData.updated_at).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-white hover:text-blue-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-2 hover:bg-white/10"                                                  
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-8 bg-gradient-to-br from-white/90 to-blue-50/50">                               
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">    
                  
                  {/* Left Column - Case Information */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Basic Information Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 space-y-6">                                                                    
                      <h3 className="text-xl font-bold text-blue-700 flex items-center gap-3 border-b border-blue-100 pb-3">                                                        
                        <ShieldExclamationIcon className="w-6 h-6" /> 
                        Case Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-blue-700 mb-2">Case Number</label>                                                
                          <input
                            type="text"
                            value={editData.case_number || ''}
                            className="w-full border border-blue-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-600 cursor-not-allowed font-mono"                       
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-blue-700 mb-2">Complaint Type</label>                                             
                          <select
                            value={editData.complaint_type || ''}
                            onChange={(e) => setEditData({...editData, complaint_type: e.target.value})}
                            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg"
                          >
                            <option value="">Select Type</option>
                            <option value="Dispute">Dispute</option>
                            <option value="Noise Complaint">Noise Complaint</option>
                            <option value="Property Damage">Property Damage</option>
                            <option value="Theft">Theft</option>
                            <option value="Assault">Assault</option>
                            <option value="Trespassing">Trespassing</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-blue-700 mb-2">Priority Level</label>                                             
                          <select
                            value={editData.priority || ''}
                            onChange={(e) => setEditData({...editData, priority: e.target.value})}
                            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg"
                          >
                            <option value="">Select Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-blue-700 mb-2">Current Status</label>                                             
                          <select
                            value={editData.status || ''}
                            onChange={(e) => setEditData({...editData, status: e.target.value})}
                            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg"
                          >
                            <option value="">Select Status</option>        
                            <option value="Pending">Pending</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Scheduled">Scheduled</option>       
                            <option value="Completed">Completed</option>       
                            <option value="Cancelled">Cancelled</option>       
                            <option value="No Show">No Show</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Case Description Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 space-y-6">                                                                    
                      <h3 className="text-xl font-bold text-blue-700 flex items-center gap-3 border-b border-blue-100 pb-3">                                                        
                        <DocumentTextIcon className="w-6 h-6" /> 
                        Case Description & Notes
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Case Description</label>
                        <textarea
                          value={editData.description || ''}
                          onChange={(e) => setEditData({...editData, description: e.target.value})}
                          rows={4}
                          className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg resize-none"
                          placeholder="Enter detailed case description..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Additional Notes</label>
                        <textarea
                          value={editData.notes || ''}
                          onChange={(e) => setEditData({...editData, notes: e.target.value})}
                          rows={3}
                          className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg resize-none"
                          placeholder="Add any additional notes or updates..."
                        />
                      </div>
                    </div>

                    {/* Resolution Details Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 space-y-6">                                                                    
                      <h3 className="text-xl font-bold text-blue-700 flex items-center gap-3 border-b border-blue-100 pb-3">                                                        
                        <CheckCircleIcon className="w-6 h-6" /> 
                        Resolution Details
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-blue-700 mb-2">Resolution Type</label>
                          <select
                            value={editData.resolution_type || ''}
                            onChange={(e) => setEditData({...editData, resolution_type: e.target.value})}
                            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg"
                          >
                            <option value="">Select Resolution</option>
                            <option value="Mediation">Mediation</option>
                            <option value="Settlement">Settlement</option>
                            <option value="Warning Issued">Warning Issued</option>
                            <option value="Fine Imposed">Fine Imposed</option>
                            <option value="Referred to Court">Referred to Court</option>
                            <option value="Dismissed">Dismissed</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-blue-700 mb-2">Resolution Date</label>
                          <input
                            type="date"
                            value={editData.resolution_date || ''}
                            onChange={(e) => setEditData({...editData, resolution_date: e.target.value})}
                            className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-blue-700 mb-2">Resolution Notes</label>
                        <textarea
                          value={editData.resolution_notes || ''}
                          onChange={(e) => setEditData({...editData, resolution_notes: e.target.value})}
                          rows={3}
                          className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-blue-900 hover:shadow-md focus:shadow-lg resize-none"
                          placeholder="Describe how the case was resolved..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Sidebar */}
                  <div className="space-y-6">
                    
                    {/* Case Timeline Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">                                                                    
                      <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4 border-b border-blue-100 pb-3">                                                        
                        <ClockIcon className="w-5 h-5" /> 
                        Case Timeline
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-blue-700">Case Created</div>
                            <div className="text-xs text-blue-500">{editData.created_at ? new Date(editData.created_at).toLocaleDateString() : 'N/A'}</div>
                          </div>
                        </div>
                        
                        {editData.status === 'Scheduled' && editData.appointment_date && (
                          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-orange-700">Appointment Scheduled</div>
                              <div className="text-xs text-orange-500">{new Date(editData.appointment_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                        )}
                        
                        {editData.status === 'Completed' && editData.resolution_date && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-green-700">Case Resolved</div>
                              <div className="text-xs text-green-500">{new Date(editData.resolution_date).toLocaleDateString()}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">                                                                    
                      <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4 border-b border-blue-100 pb-3">                                                        
                        <AdjustmentsHorizontalIcon className="w-5 h-5" /> 
                        Quick Actions
                      </h3>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            setEditData({...editData, status: 'Scheduled'});
                          }}
                          className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 border border-orange-200"
                        >
                          <div className="text-sm font-medium text-orange-700">Schedule Appointment</div>
                          <div className="text-xs text-orange-500">Set up meeting with parties</div>
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditData({...editData, status: 'Completed', resolution_type: 'Mediation'});
                          }}
                          className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 border border-green-200"
                        >
                          <div className="text-sm font-medium text-green-700">Mark as Resolved</div>
                          <div className="text-xs text-green-500">Close the case</div>
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditData({...editData, status: 'Cancelled'});
                          }}
                          className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 border border-red-200"
                        >
                          <div className="text-sm font-medium text-red-700">Cancel Case</div>
                          <div className="text-xs text-red-500">Dismiss the complaint</div>
                        </button>
                      </div>
                    </div>

                    {/* Case Statistics Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">                                                                    
                      <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4 border-b border-blue-100 pb-3">                                                        
                        <ChartBarIcon className="w-5 h-5" /> 
                        Case Statistics
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Days Open</span>
                          <span className="text-sm font-semibold text-blue-700">
                            {editData.created_at ? Math.ceil((new Date() - new Date(editData.created_at)) / (1000 * 60 * 60 * 24)) : 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Priority</span>
                          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                            editData.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                            editData.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                            editData.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {editData.priority || 'Not Set'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                            editData.status === 'Completed' ? 'bg-green-100 text-green-700' :
                            editData.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                            editData.status === 'Scheduled' ? 'bg-orange-100 text-orange-700' :
                            editData.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {editData.status || 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="mt-8 flex justify-between items-center pt-6 border-t border-blue-100 sticky bottom-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-10 rounded-b-3xl">                                                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setEditData({});
                        setShowModal(false);
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"      
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <div className="text-sm text-gray-500">
                      Changes will be saved automatically
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        try {
                          setLoading(true);
                          await axios.put(`/api/blotter-records/${editData.id}`, editData);
                          showToast('Case updated successfully!', 'success');
                          setShowModal(false);
                          setEditData({});
                          // Refresh list
                          const res = await axios.get("/blotter-records");     
                          const records = res.data.records || [];
                          const ongoingRecords = records.filter(record =>      
                            record.status === 'Ongoing' || record.status === 'Pending' || record.status === 'Scheduled'                                        
                          );
                          setBlotterRecords(ongoingRecords);
                          setFilteredRecords(ongoingRecords);
                        } catch (error) {
                          showToast('Failed to update case. Please try again.', 'error');
                          console.error('Error updating case:', error);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"                                                   
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> 
                          Updating...
                        </span>                                                  
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5" /> 
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-2xl border border-blue-200 w-full max-w-4xl max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Sticky Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <EyeIcon className="w-7 h-7" />
                    Case Details
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white hover:text-blue-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-8 bg-gradient-to-br from-white/80 to-blue-50/80 rounded-b-3xl animate-fadeIn">
                {/* Case Overview Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                  <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <ShieldExclamationIcon className="w-5 h-5" />
                    Case Overview
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div><span className="font-medium text-gray-700">Case Number:</span> <span className="text-gray-900 font-mono">{detailsData.case_number || `#${detailsData.id}`}</span></div>
                    <div><span className="font-medium text-gray-700">Status:</span> <span className="text-gray-900">{detailsData.status || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-700">Priority:</span> <span className="text-gray-900">{getPriorityLevel(detailsData.complaint_type).level}</span></div>
                    <div><span className="font-medium text-gray-700">Complaint Type:</span> <span className="text-gray-900">{detailsData.complaint_type || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-700">Incident Date:</span> <span className="text-gray-900">{formatDate(detailsData.incident_date)}</span></div>
                    <div><span className="font-medium text-gray-700">Created:</span> <span className="text-gray-900">{formatDate(detailsData.created_at)}</span></div>
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Complainant Information */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4">
                      <UserIcon className="w-5 h-5" /> Complainant Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Name</label>
                        <p className="text-gray-900 font-medium">{detailsData.complainant_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Email</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                          {detailsData.complainant_email || 
                           detailsData.resident?.email || 
                           detailsData.email || 
                           'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Contact Number</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-gray-500" />
                          {detailsData.complainant_contact_number || 
                           detailsData.complainant_contact || 
                           detailsData.resident?.contact_number || 
                           detailsData.resident?.mobile_number || 
                           detailsData.contact_number || 
                           'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Address</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4 text-gray-500" />
                          {detailsData.complainant_address || 
                           detailsData.resident?.current_address || 
                           detailsData.resident?.full_address || 
                           detailsData.incident_location || 
                           'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Respondent Information */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4">
                      <UserIcon className="w-5 h-5" /> Respondent Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Name</label>
                        <p className="text-gray-900 font-medium">{detailsData.respondent_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Email</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <EnvelopeIcon className="w-4 h-4 text-gray-500" />
                          {detailsData.respondent_email || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Contact Number</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4 text-gray-500" />
                          {detailsData.respondent_contact_number || detailsData.respondent_contact || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-1">Address</label>
                        <p className="text-gray-900 flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4 text-gray-500" />
                          {detailsData.respondent_address || 'Not provided'}
                        </p>
                      </div>
                      {!detailsData.respondent_email && !detailsData.respondent_contact_number && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Respondent contact information was not collected during complaint submission. 
                            Consider updating the complaint form to include respondent details for better case management.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4">
                    <DocumentTextIcon className="w-5 h-5" /> Complaint Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">Description</label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 leading-relaxed">{detailsData.complaint_details || 'No details provided'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">Remarks</label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 leading-relaxed">{detailsData.remarks || 'No remarks'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-blue-100 sticky bottom-0 bg-gradient-to-r from-blue-50 to-indigo-50 z-10 rounded-b-3xl">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEdit(detailsData);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit Case
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Barangay Notice Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-purple-50 to-indigo-50 rounded-3xl shadow-2xl border border-purple-200 w-full max-w-2xl max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Sticky Modal Header with Stepper */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <BellIcon className="w-7 h-7" />
                    Send Barangay Notice
                  </h2>
                  <button
                    onClick={() => setShowNotificationModal(false)}
                    className="text-white hover:text-purple-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                {/* Stepper - Enhanced Purple Theme */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <CalendarIcon className="w-6 h-6 text-white bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-1 shadow-lg ring-2 ring-purple-400 transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-purple-100 mt-1">Schedule</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-purple-200 to-indigo-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <BellIcon className="w-6 h-6 text-white bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-purple-100 mt-1">Notify</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-purple-200 to-indigo-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CheckCircleIcon className="w-6 h-6 text-white bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-purple-100 mt-1">Send</span>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10 bg-gradient-to-br from-white/80 to-purple-50/80 rounded-b-3xl animate-fadeIn">
                {/* Case Selection */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <ShieldExclamationIcon className="w-5 h-5" />
                    Select Case to Send Notice
                  </h4>
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">Choose Case</label>
                    <select
                      value={notificationData.id || ''}
                      onChange={(e) => {
                        const selectedCase = filteredRecords.find(record => record.id === parseInt(e.target.value));
                        if (selectedCase) {
                          setNotificationData({
                            ...selectedCase,
                            appointment_date: '',
                            appointment_time: '',
                            message: ''
                          });
                        }
                      }}
                      className="w-full border border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-purple-900 hover:shadow-md focus:shadow-lg"
                    >
                      <option value="">Select a case...</option>
                      {filteredRecords.map((record) => (
                        <option key={record.id} value={record.id}>
                          {record.case_number || `#${record.id}`} - {record.complainant_name} vs {record.respondent_name} ({record.complaint_type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Case Information Card */}
                {notificationData.id && (
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 shadow-sm transition-all duration-300 hover:shadow-md">
                    <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                      <ShieldExclamationIcon className="w-5 h-5" />
                      Case Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium text-gray-700">Case Number:</span> <span className="text-gray-900 font-mono">{notificationData.case_number || `#${notificationData.id}`}</span></div>
                      <div><span className="font-medium text-gray-700">Complaint Type:</span> <span className="text-gray-900">{notificationData.complaint_type || 'N/A'}</span></div>
                      <div><span className="font-medium text-gray-700">Complainant:</span> <span className="text-gray-900">{notificationData.complainant_name || 'N/A'}</span></div>
                      <div><span className="font-medium text-gray-700">Respondent:</span> <span className="text-gray-900">{notificationData.respondent_name || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Appointment Details Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-purple-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-purple-700 flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-5 h-5" /> Barangay Appearance Schedule
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Appearance Date</label>
                      <input
                        type="date"
                        value={notificationData.appointment_date || ''}
                        onChange={(e) => setNotificationData({...notificationData, appointment_date: e.target.value})}
                        className="w-full border border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-purple-300 text-purple-900 hover:shadow-md focus:shadow-lg"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Appearance Time</label>
                      <select
                        value={notificationData.appointment_time || ''}
                        onChange={(e) => setNotificationData({...notificationData, appointment_time: e.target.value})}
                        className="w-full border border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-purple-900 hover:shadow-md focus:shadow-lg"
                      >
                        <option value="">Select Time</option>
                        <option value="08:00 AM">08:00 AM</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="01:00 PM">01:00 PM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {/* Notification Message Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-purple-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-purple-700 flex items-center gap-2 mb-2">
                      <BellIcon className="w-5 h-5" /> Notification Message
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-purple-700 mb-1">Custom Message</label>
                      <textarea
                        value={notificationData.message || ''}
                        onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                        className="w-full border border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-purple-300 text-purple-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter custom message for the respondent..."
                        rows="4"
                      />
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-sm text-purple-800">
                        <strong>Default Message:</strong> "You are hereby notified to appear at the Barangay Hall on [DATE] at [TIME] regarding Case {notificationData.case_number || `#${notificationData.id}`}. Please bring valid identification and any relevant documents."
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-purple-100 sticky bottom-0 bg-gradient-to-r from-purple-50 to-indigo-50 z-10 rounded-b-3xl animate-fadeIn">
                  <button
                    onClick={() => setShowNotificationModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await axios.post('/blotter-records/send-notification', {
                          case_id: notificationData.id,
                          respondent_name: notificationData.respondent_name,
                          respondent_contact: notificationData.respondent_contact_number || notificationData.respondent_contact,
                          appointment_date: notificationData.appointment_date,
                          appointment_time: notificationData.appointment_time,
                          case_number: notificationData.case_number,
                          custom_message: notificationData.message
                        });
                        
                        if (response.status === 200) {
                          alert('Barangay notice sent successfully!');
                          setShowNotificationModal(false);
                          setNotificationData({});
                        }
                      } catch (error) {
                        console.error('Error sending notification:', error);
                        alert('Error sending notification. Please try again.');
                      }
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    disabled={!notificationData.id || !notificationData.appointment_date || !notificationData.appointment_time}
                  >
                    <BellIcon className="w-5 h-5" />
                    Send Notice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No-Show Management Modal */}
        {showNoShowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-red-50 to-pink-50 rounded-3xl shadow-2xl border border-red-200 w-full max-w-lg max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-t-3xl p-6 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <UserMinusIcon className="w-7 h-7" />
                    Mark as No-Show
                  </h2>
                  <button
                    onClick={() => setShowNoShowModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Case Information */}
                <div className="bg-white/80 rounded-2xl p-4 border border-red-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-red-600" />
                    Case Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-gray-700">Case Number:</span> {noShowData.case_number}</p>
                    <p><span className="font-semibold text-gray-700">Complainant:</span> {noShowData.complainant_name}</p>
                    <p><span className="font-semibold text-gray-700">Respondent:</span> {noShowData.respondent_name}</p>
                    <p><span className="font-semibold text-gray-700">Type:</span> {noShowData.complaint_type}</p>
                    {noShowData.appointment_date && (
                      <p><span className="font-semibold text-gray-700">Scheduled:</span> {formatDate(noShowData.appointment_date)} at {noShowData.appointment_time}</p>
                    )}
                  </div>
                </div>

                {/* No-Show Type */}
                <div className="bg-white/80 rounded-2xl p-4 border border-red-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                    No-Show Type
                  </h3>
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                    <UserMinusIcon className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">
                      {noShowData.type === 'complainant' ? 'Complainant' : 'Respondent'} No-Show
                    </span>
                  </div>
                </div>

                {/* Reason Input */}
                <div className="bg-white/80 rounded-2xl p-4 border border-red-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-red-600" />
                    Reason (Optional)
                  </h3>
                  <textarea
                    value={noShowData.reason || ''}
                    onChange={(e) => setNoShowData({...noShowData, reason: e.target.value})}
                    placeholder="Enter reason for no-show (optional)..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    rows={3}
                  />
                </div>

                {/* Penalty Preview */}
                {noShowData.type === 'complainant' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <InformationCircleIcon className="w-4 h-4" />
                      Penalty Preview
                    </h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p><strong>Current Status:</strong> Active</p>
                      <p><strong>After No-Show:</strong> Warning (1st offense)</p>
                      <p><strong>Penalty Duration:</strong> 7 days</p>
                      <p><strong>Restrictions:</strong> Can still submit complaints and applications</p>
                    </div>
                  </div>
                )}

                {/* Warning Message */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Warning:</p>
                      <p>Marking as no-show will apply penalties according to the progressive penalty system. This action cannot be undone easily.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowNoShowModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitNoShow}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    <UserMinusIcon className="w-5 h-5" />
                    Mark as No-Show
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appeal Submission Modal */}
        {showAppealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-2xl border border-blue-200 w-full max-w-lg max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-3xl p-6 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <DocumentTextIcon className="w-7 h-7" />
                    Submit Appeal
                  </h2>
                  <button
                    onClick={() => setShowAppealModal(false)}
                    className="text-white hover:text-blue-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Case Information */}
                <div className="bg-white/80 rounded-2xl p-4 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    Case Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-gray-700">Case Number:</span> {appealData.case_number}</p>
                    <p><span className="font-semibold text-gray-700">Complainant:</span> {appealData.complainant_name}</p>
                    <p><span className="font-semibold text-gray-700">Respondent:</span> {appealData.respondent_name}</p>
                    <p><span className="font-semibold text-gray-700">Type:</span> {appealData.complaint_type}</p>
                  </div>
                </div>

                {/* Appeal Type */}
                <div className="bg-white/80 rounded-2xl p-4 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                    Appeal Type
                  </h3>
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      {appealData.type === 'complainant' ? 'Complainant' : 'Respondent'} Appeal
                    </span>
                  </div>
                </div>

                {/* Appeal Reason */}
                <div className="bg-white/80 rounded-2xl p-4 border border-blue-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                    Appeal Reason *
                  </h3>
                  <textarea
                    value={appealData.reason || ''}
                    onChange={(e) => setAppealData({...appealData, reason: e.target.value})}
                    placeholder="Please explain why you were unable to attend the scheduled appointment..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={4}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">Please provide a detailed explanation for your absence.</p>
                </div>

                {/* Information Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Appeal Process:</p>
                      <p>Your appeal will be reviewed by the barangay administration. You will be notified of the decision via email.</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAppealModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessAppeal}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-60"
                    disabled={!appealData.reason?.trim()}
                  >
                    <DocumentTextIcon className="w-5 h-5" />
                    Submit Appeal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 ${
            toast.type === 'success' ? 'border-green-500' : 'border-red-500'
          } animate-slide-in-right`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {toast.type === 'success' ? (
                    <CheckIcon className="w-3 h-3 text-green-600" />
                  ) : (
                    <XCircleIcon className="w-3 h-3 text-red-600" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${
                    toast.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {toast.message}
                  </p>
                </div>
                <button
                  onClick={() => setToast({ show: false, message: '', type: 'success' })}
                  className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default OngoingCases;
