import React, { useState, useEffect, useMemo } from 'react';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "../../utils/axiosConfig";
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
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
  ShieldExclamationIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';
import NewComplaint from "./modules/Blotter/NewComplaint";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatCard = ({ label, value, icon, iconBg }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 flex justify-between items-center group">
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{label}</p>
      <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 group-hover:text-emerald-600 transition">{value}</p>
    </div>
    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      {icon}
    </div>
  </div>
);

const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon && icon}
    {text}
  </span>
);

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

const BlotterRecords = () => {
  const [blotterRecords, setBlotterRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({});
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInData, setWalkInData] = useState({
    complainant_name: '',
    respondent_name: '',
    complaint_type: '',
    complaint_details: '',
    incident_date: '',
    incident_time: '',
    incident_location: '',
    contact_number: '',
    email: '',
    appointment_date: '',
    appointment_time: '',
    remarks: '',
    resident_id: null,
  });
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [residentSearch, setResidentSearch] = useState('');
  const [residentSearchResults, setResidentSearchResults] = useState([]);
  const [showResidentDropdown, setShowResidentDropdown] = useState(false);
  const [isSearchingResidents, setIsSearchingResidents] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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

  // Analytics state
  const [chartData, setChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [selectedChartType, setSelectedChartType] = useState('complaints');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [analyticsYear, setAnalyticsYear] = useState('');
  const [analyticsMonth, setAnalyticsMonth] = useState('');

  useEffect(() => {
    // Fetch blotter records from new API endpoint
    setLoading(true);
    axios.get("/blotter-records")
      .then(res => {
        const records = res.data.records || [];
        // Filter for solved cases only (Completed and Cancelled statuses)
        const solvedRecords = records.filter(record => 
          record.status === 'Completed' || record.status === 'Cancelled'
        );
        setBlotterRecords(solvedRecords);
        setFilteredRecords(solvedRecords);
        setChartData(generateChartData(solvedRecords));
        setPieChartData(generatePieChartData(solvedRecords));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFilteredRecords(
      blotterRecords.filter((record) => {
        const matchesSearch =
          (record.complainant_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.respondent_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.complaint_type || "").toLowerCase().includes(search.toLowerCase()) ||
          (record.resident && `${record.resident.first_name} ${record.resident.last_name}`.toLowerCase().includes(search.toLowerCase()));
        
        let matchesDate = true;
        if (selectedYear && record.incident_date) {
          const date = new Date(record.incident_date);
          if (isNaN(date.getTime()) || date.getFullYear() !== parseInt(selectedYear)) {
            matchesDate = false;
          }
        }
        if (selectedMonth && record.incident_date && matchesDate) {
          const date = new Date(record.incident_date);
          if (date.getMonth() + 1 !== parseInt(selectedMonth)) {
            matchesDate = false;
          }
        }

        let matchesStatus = true;
        if (selectedStatus) {
          // Filter by specific solved case status
          matchesStatus = record.status === selectedStatus;
        }

        return matchesSearch && matchesDate && matchesStatus;
      })
    );
  }, [search, selectedYear, selectedMonth, selectedStatus, blotterRecords]);

  const availableYears = useMemo(() => {
    const dataYears = new Set();
    blotterRecords.forEach((record) => {
      if (record.incident_date) {
        const date = new Date(record.incident_date);
        if (!isNaN(date.getTime())) {
          dataYears.add(date.getFullYear());
        }
      }
    });
    const currentYear = new Date().getFullYear();
    const minYear = 2020;
    const allYears = new Set(dataYears);
    for (let y = minYear; y <= currentYear + 1; y++) {
      allYears.add(y);
    }
    return Array.from(allYears).sort((a, b) => b - a);
  }, [blotterRecords]);

  const availableMonths = useMemo(() => {
    if (!selectedYear) return [];
    return [1,2,3,4,5,6,7,8,9,10,11,12];
  }, [selectedYear]);

  const analyticsAvailableYears = useMemo(() => {
    const dataYears = new Set();
    blotterRecords.forEach((record) => {
      if (record.created_at) {
        const date = new Date(record.created_at);
        if (!isNaN(date.getTime())) {
          dataYears.add(date.getFullYear());
        }
      }
    });
    const currentYear = new Date().getFullYear();
    const minYear = 2020;
    const allYears = new Set(dataYears);
    for (let y = minYear; y <= currentYear + 1; y++) {
      allYears.add(y);
    }
    return Array.from(allYears).sort((a, b) => b - a);
  }, [blotterRecords]);

  const analyticsAvailableMonths = useMemo(() => {
    if (!analyticsYear) return [];
    return [1,2,3,4,5,6,7,8,9,10,11,12];
  }, [analyticsYear]);

  const filteredAnalyticsRecords = useMemo(() => {
    return blotterRecords.filter((record) => {
      if (!record.created_at) return false;
      const date = new Date(record.created_at);
      if (isNaN(date.getTime())) return false;
      if (analyticsYear && date.getFullYear() !== parseInt(analyticsYear)) return false;
      if (analyticsMonth && date.getMonth() + 1 !== parseInt(analyticsMonth)) return false;
      return true;
    });
  }, [analyticsYear, analyticsMonth, blotterRecords]);

  useEffect(() => {
    setChartData(generateChartData(blotterRecords, analyticsYear, analyticsMonth));
    setPieChartData(generatePieChartData(filteredAnalyticsRecords));
  }, [analyticsYear, analyticsMonth, blotterRecords]);

  // Close resident dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.resident-search-container')) {
        setShowResidentDropdown(false);
      }
    };

    if (showResidentDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showResidentDropdown]);

  const handleShowDetails = (record) => {
    setDetailsData(record);
    setShowDetailsModal(true);
  };

  const handleEdit = (record) => {
    setEditData(record);
    setShowModal(true);
  };

  const handleSchedule = (record) => {
    setScheduleData(record);
    setShowScheduleModal(true);
  };

  const handleSave = () => {
    // Handle save logic here
    setShowModal(false);
    setEditData({});
  };

  const handleScheduleSave = () => {
    // Handle schedule save logic here
    setShowScheduleModal(false);
    setScheduleData({});
  };

  const handleWalkInSchedule = () => {
    // Reset form data
    setWalkInData({
      complainant_name: '',
      respondent_name: '',
      complaint_type: '',
      complaint_details: '',
      incident_date: new Date().toISOString().split('T')[0],
      incident_time: '',
      incident_location: '',
      contact_number: '',
      email: '',
      appointment_date: '',
      appointment_time: '',
      remarks: '',
      resident_id: null,
    });
    setResidentSearch('');
    setResidentSearchResults([]);
    setShowResidentDropdown(false);
    setShowWalkInModal(true);
  };

  // Search residents function
  const handleResidentSearch = async (searchValue) => {
    setResidentSearch(searchValue);
    
    if (!searchValue || searchValue.trim().length < 2) {
      setResidentSearchResults([]);
      setShowResidentDropdown(false);
      return;
    }

    try {
      setIsSearchingResidents(true);
      const response = await axios.get(`/api/admin/residents/search?search=${encodeURIComponent(searchValue)}`);
      setResidentSearchResults(response.data || []);
      setShowResidentDropdown(true);
    } catch (error) {
      console.error('Error searching residents:', error);
      setResidentSearchResults([]);
    } finally {
      setIsSearchingResidents(false);
    }
  };

  // Handle resident selection
  const handleResidentSelect = (resident) => {
    const fullName = `${resident.first_name || ''} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name || ''}${resident.name_suffix && resident.name_suffix.toLowerCase() !== 'none' ? ' ' + resident.name_suffix : ''}`.trim();
    
    setWalkInData({
      ...walkInData,
      complainant_name: fullName,
      contact_number: resident.mobile_number || resident.contact_number || resident.phone || '',
      email: resident.email || '',
      resident_id: resident.id || null,
    });
    setResidentSearch(fullName);
    setShowResidentDropdown(false);
    setResidentSearchResults([]);
  };

  const handleWalkInSubmit = async () => {
    try {
      setWalkInLoading(true);
      
      // Validate required fields
      if (!walkInData.complainant_name || 
          !walkInData.appointment_date || !walkInData.appointment_time ||
          !walkInData.contact_number || !walkInData.email) {
        alert('Please fill in all required fields');
        setWalkInLoading(false);
        return;
      }

      // Create blotter record with walk-in data
      const formData = {
        complainant_name: walkInData.complainant_name,
        respondent_name: 'Walk-in Appointment', // Default respondent name
        complaint_type: 'Other', // Default complaint type
        complaint_details: walkInData.remarks || 'Walk-in appointment scheduled',
        incident_date: new Date().toISOString().split('T')[0], // Use today's date as default
        incident_time: '12:00',
        incident_location: 'Barangay Hall',
        contact_number: walkInData.contact_number,
        email: walkInData.email,
        remarks: walkInData.remarks || 'Walk-in appointment scheduled',
        resident_id: walkInData.resident_id || 1, // Default resident_id if not provided
        status: 'Scheduled', // Set status as Scheduled for walk-in appointments
        appointment_date: walkInData.appointment_date,
        appointment_time: walkInData.appointment_time,
      };

      // Create the blotter record with appointment details
      const response = await axios.post('/blotter-records', formData);
      
      if (response.data) {
        alert('Walk-in appointment scheduled successfully! Email and notification sent to the resident.');
        setShowWalkInModal(false);
        setWalkInData({
          complainant_name: '',
          respondent_name: '',
          complaint_type: '',
          complaint_details: '',
          incident_date: new Date().toISOString().split('T')[0],
          incident_time: '',
          incident_location: '',
          contact_number: '',
          email: '',
          appointment_date: '',
          appointment_time: '',
          remarks: '',
          resident_id: null,
        });
        
        // Refresh the records list
        setLoading(true);
        const res = await axios.get("/blotter-records");
        const records = res.data.records || [];
        const solvedRecords = records.filter(record => 
          record.status === 'Completed' || record.status === 'Cancelled'
        );
        setBlotterRecords(solvedRecords);
        setFilteredRecords(solvedRecords);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error scheduling walk-in appointment:', error);
      alert(error.response?.data?.message || error.response?.data?.errors || 'Failed to schedule walk-in appointment. Please try again.');
    } finally {
      setWalkInLoading(false);
    }
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

  const getSolvedCount = () => {
    // Since BlotterRecords now only shows solved cases, return total count
    return blotterRecords.length;
  };

  const getOngoingCount = () => {
    // Since BlotterRecords now only shows solved cases, return 0
    return 0;
  };

  // Generate chart data for monthly blotter records
  const generateChartData = (records, year = null, month = null) => {
    const monthlyData = {};
    let filteredRecords = records;
    if (year) {
      filteredRecords = records.filter(record => {
        if (!record.created_at) return false;
        const date = new Date(record.created_at);
        if (isNaN(date.getTime())) return false;
        if (date.getFullYear() !== parseInt(year)) return false;
        if (month && date.getMonth() + 1 !== parseInt(month)) return false;
        return true;
      });
    }
    filteredRecords.forEach(record => {
      if (record.created_at) {
        const date = new Date(record.created_at);
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        const key = `${y}-${String(m).padStart(2, '0')}`;
        monthlyData[key] = (monthlyData[key] || 0) + 1;
      }
    });

    let data = [];
    if (!year) {
      // Last 12 months
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          complaints: monthlyData[key] || 0
        });
      }
    } else if (month) {
      // Single month
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const key = `${year}-${String(month).padStart(2, '0')}`;
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        complaints: monthlyData[key] || 0
      });
    } else {
      // Full year
      for (let m = 1; m <= 12; m++) {
        const date = new Date(parseInt(year), m - 1, 1);
        const key = `${year}-${String(m).padStart(2, '0')}`;
        data.push({
          month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          complaints: monthlyData[key] || 0
        });
      }
    }
    return data;
  };

  // Generate pie chart data for complaint types
  const generatePieChartData = (records) => {
    const typeCounts = {};
    records.forEach(record => {
      const type = record.complaint_type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
    return Object.entries(typeCounts).map(([type, count], index) => ({
      name: type,
      value: count,
      color: colors[index % colors.length]
    }));
  };

  // Get most common complaint type
  const getMostCommonComplaintType = (records) => {
    const typeCounts = {};
    records.forEach(record => {
      const type = record.complaint_type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    let max = 0;
    let most = '';
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > max) {
        max = count;
        most = type;
      }
    }
    return { type: most, count: max };
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen ml-0 lg:ml-64 pt-20 lg:pt-36 px-4 pb-16 font-sans">
        <div className="w-full max-w-[98%] mx-auto space-y-8 px-2 lg:px-4">
          {/* Enhanced Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <ShieldExclamationIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Blotter Records & Appointments
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Comprehensive management system for barangay blotter complaints and appointment scheduling with real-time tracking.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Total Solved Cases"
              value={blotterRecords.length}
              icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="Completed Cases"
              value={getStatusCount('Completed')}
              icon={<CheckCircleIcon className="w-6 h-6 text-blue-600" />}
              iconBg="bg-blue-100"
            />
            <StatCard
              label="Cancelled Cases"
              value={getStatusCount('Cancelled')}
              icon={<XMarkIcon className="w-6 h-6 text-red-600" />}
              iconBg="bg-red-100"
            />
            <StatCard
              label="No Show Cases"
              value={getStatusCount('No Show')}
              icon={<ExclamationTriangleIcon className="w-6 h-6 text-gray-600" />}
              iconBg="bg-gray-100"
            />
          </div>

          {/* Enhanced Analytics Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8 w-full">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">Blotter Analytics</span>
              {(() => {
                if (analyticsYear) {
                  if (analyticsMonth) {
                    const monthDate = new Date(parseInt(analyticsYear), parseInt(analyticsMonth) - 1, 1);
                    return ` (${monthDate.toLocaleDateString('en-US', { month: 'long' })} ${analyticsYear})`;
                  } else {
                    return ` (${analyticsYear})`;
                  }
                } else {
                  return ' (Last 12 Months)';
                }
              })()}
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center">
              <select
                value={analyticsYear}
                onChange={(e) => {
                  setAnalyticsYear(e.target.value);
                  setAnalyticsMonth('');
                }}
                className="px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm w-full sm:w-auto"
              >
                <option value="">All Years</option>
                {analyticsAvailableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {analyticsYear && (
                <select
                  value={analyticsMonth}
                  onChange={(e) => setAnalyticsMonth(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm w-full sm:w-auto"
                >
                  <option value="">All Months</option>
                  {analyticsAvailableMonths.map((month) => (
                    <option key={month} value={month}>
                      {new Date(parseInt(analyticsYear), month - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="complaints" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <ShieldExclamationIcon className="w-4 h-4" />
                  Most Common Complaint in Selected Period
                </h4>
                <p className="text-lg font-bold text-red-900">{getMostCommonComplaintType(filteredAnalyticsRecords).type || 'N/A'}</p>
                <p className="text-sm text-red-700">{getMostCommonComplaintType(filteredAnalyticsRecords).count} cases</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                  <AlertIcon className="w-4 h-4" />
                  Most Common Complaint Overall
                </h4>
                <p className="text-lg font-bold text-orange-900">{getMostCommonComplaintType(blotterRecords).type || 'N/A'}</p>
                <p className="text-sm text-orange-700">{getMostCommonComplaintType(blotterRecords).count} cases</p>
              </div>
            </div>
          </div>

          {/* Complaint Types Pie Chart */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5" />
              Complaint Types Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Enhanced Search and Add Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 w-full">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex gap-3">
                <button
                  onClick={() => handleNavigation('/admin/modules/Blotter/OngoingCases')}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <ShieldExclamationIcon className="w-5 h-5" />
                  Ongoing Cases
                </button>
                <button 
                  onClick={handleWalkInSchedule}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <CalendarIcon className="w-5 h-5" />
                  Schedule Appointments (Walk-in)
                </button>
                <button
                  onClick={() => handleNavigation('/admin/modules/Blotter/NewComplaint')}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <PlusIcon className="w-5 h-5" />
                  New Complaint
                </button>
                <button
                  onClick={() => handleNavigation('/admin/modules/Blotter/BlotterRequest')}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  <ShieldExclamationIcon className="w-5 h-5" />
                  View All Blotter Requests
                </button>
              </div>

              <div className="flex gap-2 items-center w-full max-w-md">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent rounded-xl text-sm shadow-sm transition-all duration-300"
                    placeholder="Search by name, ID, or complaint type..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="">All Solved Cases</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No Show">No Show</option>
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedMonth('');
                    }}
                    className="px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                  >
                    <option value="">Year</option>
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {selectedYear && (
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white shadow-sm"
                    >
                      <option value="">Month</option>
                      {availableMonths.map((month) => (
                        <option key={month} value={month}>
                          {new Date(parseInt(selectedYear), month - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 flex items-center justify-center">
                  <FunnelIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSearch('');
                    setSelectedYear('');
                    setSelectedMonth('');
                    setSelectedStatus('');
                  }}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl w-full">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <ShieldExclamationIcon className="w-5 h-5" />
                Blotter Records
              </h3>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm w-full">
              {loading ? (
                <div className="p-16 text-center">
                  <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-orange-400 rounded-full animate-spin animation-delay-300"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 font-semibold text-lg">Loading Blotter Records</p>
                      <p className="text-gray-500 text-sm mt-1">Fetching complaint data...</p>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce animation-delay-300"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce animation-delay-500"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <table className="w-full text-sm min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-r border-gray-200 hidden sm:table-cell min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                          ID
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-r border-gray-200 min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <ShieldExclamationIcon className="w-4 h-4 text-gray-600" />
                          <span className="hidden sm:inline">Case Number</span>
                          <span className="sm:hidden">Case</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-r border-gray-200 min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                          <span className="hidden md:inline">Complainant</span>
                          <span className="md:hidden">Complainant</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-r border-gray-200 hidden md:table-cell min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                          Respondent
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-r border-gray-200 hidden lg:table-cell min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <AlertIcon className="w-4 h-4 text-gray-600" />
                          Complaint Type
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-r border-gray-200 hidden md:table-cell min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-600" />
                          Incident Date
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-r border-gray-200 hidden lg:table-cell min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-600" />
                          Resident Name
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-r border-gray-200 hidden lg:table-cell min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-gray-600" />
                          Solved At
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <ArrowPathIcon className="w-4 h-4 text-gray-600" />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-6 animate-fade-in-up">
                            <div className="relative">
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                                <ShieldExclamationIcon className="w-10 h-10 text-gray-400" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <ExclamationTriangleIcon className="w-3 h-3 text-white" />
                              </div>
                            </div>
                            <div className="text-center max-w-md">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">No Blotter Records Found</h3>
                              <p className="text-gray-600 mb-4">
                                {search
                                  ? "No records match your current search criteria."
                                  : "There are no blotter records in the system yet."
                                }
                              </p>
                              {search && (
                                <button
                                  onClick={() => setSearch('')}
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                                >
                                  <ArrowPathIcon className="w-4 h-4" />
                                  Clear Search
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((record, index) => (
                        <tr
                          key={record.id}
                          className="hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-300 group border-b border-gray-100 hover:border-red-200 hover:shadow-sm animate-fade-in-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <div className="bg-gradient-to-r from-red-100 to-orange-100 text-red-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm group-hover:shadow-md transition-all duration-300">
                              {record.id}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                              {record.case_number}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="font-medium text-gray-900 group-hover:text-red-800 transition-colors duration-300">
                                {record.complainant_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="font-medium text-gray-900 group-hover:text-red-800 transition-colors duration-300">
                                {record.respondent_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className="transform group-hover:scale-105 transition-transform duration-300">
                              {badge(record.complaint_type, getComplaintTypeColor(record.complaint_type), getComplaintTypeIcon(record.complaint_type))}
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                                {record.incident_date}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="font-medium text-gray-900 group-hover:text-red-800 transition-colors duration-300">
                                {record.resident ? `${record.resident.first_name} ${record.resident.last_name}` : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-300" />
                              <span className="font-medium text-gray-900 group-hover:text-green-800 transition-colors duration-300">
                                {record.solved_at ? formatDate(record.solved_at) : 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleShowDetails(record)}
                                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 hover:shadow-lg"
                              >
                                <EyeIcon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">View</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-red-50 to-orange-50 rounded-3xl shadow-2xl border border-red-200 w-full max-w-2xl max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Sticky Modal Header with Stepper */}
              <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <PencilIcon className="w-7 h-7" />
                    Edit Blotter Record
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-white hover:text-red-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-red-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                {/* Stepper - Enhanced Red Theme */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <ShieldExclamationIcon className="w-6 h-6 text-white bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-1 shadow-lg ring-2 ring-red-400 transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-red-100 mt-1">Complaint</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-red-200 to-orange-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CalendarIcon className="w-6 h-6 text-white bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-red-100 mt-1">Details</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-red-200 to-orange-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CheckCircleIcon className="w-6 h-6 text-white bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-red-100 mt-1">Status</span>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10 bg-gradient-to-br from-white/80 to-red-50/80 rounded-b-3xl animate-fadeIn">
                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Complaint Information Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-red-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
                      <ShieldExclamationIcon className="w-5 h-5" /> Complaint Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Complaint Type</label>
                      <select
                        value={editData.complaint_type || ''}
                        onChange={(e) => setEditData({...editData, complaint_type: e.target.value})}
                        className="w-full border border-red-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-red-300 text-red-900 hover:shadow-md focus:shadow-lg"
                      >
                        <option value="">Select Complaint Type</option>
                        <option value="Physical Injury">Physical Injury</option>
                        <option value="Verbal Abuse">Verbal Abuse</option>
                        <option value="Property Damage">Property Damage</option>
                        <option value="Theft">Theft</option>
                        <option value="Noise Complaint">Noise Complaint</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Status</label>
                      <select
                        value={editData.status || ''}
                        onChange={(e) => setEditData({...editData, status: e.target.value})}
                        className="w-full border border-red-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-red-900 hover:shadow-md focus:shadow-lg"
                      >
                        <option value="">Select Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="No Show">No Show</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Information Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-red-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-red-700 flex items-center gap-2 mb-2">
                      <DocumentTextIcon className="w-5 h-5" /> Additional Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Complaint Details</label>
                      <textarea
                        value={editData.complaint_details || ''}
                        onChange={(e) => setEditData({...editData, complaint_details: e.target.value})}
                        className="w-full border border-red-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-red-300 text-red-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter complaint details"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-1">Remarks</label>
                      <input
                        type="text"
                        value={editData.remarks || ''}
                        onChange={(e) => setEditData({...editData, remarks: e.target.value})}
                        className="w-full border border-red-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-red-300 text-red-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter remarks"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-red-100 sticky bottom-0 bg-gradient-to-r from-red-50 to-orange-50 z-10 rounded-b-3xl animate-fadeIn">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-red-100 to-orange-100 hover:from-red-200 hover:to-orange-200 text-red-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await axios.put(`/admin/blotter-requests/${editData.id}`, editData);
                      setShowModal(false);
                      setEditData({});
                      // Refresh list
                      setLoading(true);
                      const res = await axios.get("/admin/blotter-requests");
                      setBlotterRecords(res.data);
                      setFilteredRecords(res.data);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Saving...</span>
                    ) : (
                      <><CheckCircleIcon className="w-5 h-5" /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Appointment Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-orange-50 to-red-50 rounded-3xl shadow-2xl border border-orange-200 w-full max-w-2xl max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Sticky Modal Header with Stepper */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <CalendarIcon className="w-7 h-7" />
                    Schedule Appointment
                  </h2>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="text-white hover:text-orange-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                {/* Stepper - Enhanced Orange Theme */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex flex-col items-center">
                    <CalendarIcon className="w-6 h-6 text-white bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-1 shadow-lg ring-2 ring-orange-400 transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-orange-100 mt-1">Date</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-orange-200 to-red-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <ClockIcon className="w-6 h-6 text-white bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-orange-100 mt-1">Time</span>
                  </div>
                  <div className="w-8 h-1 bg-gradient-to-r from-orange-200 to-red-300 rounded-full shadow-sm transition-all duration-300" />
                  <div className="flex flex-col items-center">
                    <CheckCircleIcon className="w-6 h-6 text-white bg-gradient-to-br from-orange-500 to-red-600 rounded-full p-1 shadow-lg transition-all duration-300 hover:scale-110" />
                    <span className="text-xs font-semibold text-orange-100 mt-1">Confirm</span>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10 bg-gradient-to-br from-white/80 to-orange-50/80 rounded-b-3xl animate-fadeIn">
                {/* Resident Information Card */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200 shadow-sm transition-all duration-300 hover:shadow-md">
                  <h4 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5" />
                    Resident Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{scheduleData.resident?.name || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-700">Complaint:</span> <span className="text-gray-900">{scheduleData.complaint_type || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-700">Preferred Time:</span> <span className="text-gray-900">{scheduleData.preferred_time || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-700">Case Number:</span> <span className="text-gray-900">{scheduleData.case_number || 'N/A'}</span></div>
                  </div>
                </div>

                {/* Section Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Appointment Details Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-orange-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-orange-700 flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-5 h-5" /> Appointment Details
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Appointment Date</label>
                      <input
                        type="date"
                        value={scheduleData.appointment_date || ''}
                        onChange={(e) => setScheduleData({...scheduleData, appointment_date: e.target.value})}
                        className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-orange-300 text-orange-900 hover:shadow-md focus:shadow-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Appointment Time</label>
                      <select
                        value={scheduleData.appointment_time || ''}
                        onChange={(e) => setScheduleData({...scheduleData, appointment_time: e.target.value})}
                        className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-orange-900 hover:shadow-md focus:shadow-lg"
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

                  {/* Additional Notes Section */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-orange-100 p-6 space-y-4 animate-fadeIn transition-all duration-300 hover:shadow-xl">
                    <h3 className="text-lg font-bold text-orange-700 flex items-center gap-2 mb-2">
                      <DocumentTextIcon className="w-5 h-5" /> Additional Notes
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Additional Notes</label>
                      <textarea
                        value={scheduleData.remarks || ''}
                        onChange={(e) => setScheduleData({...scheduleData, remarks: e.target.value})}
                        className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm placeholder-orange-300 text-orange-900 hover:shadow-md focus:shadow-lg"
                        placeholder="Enter any additional notes for the appointment"
                        rows="4"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-orange-100 sticky bottom-0 bg-gradient-to-r from-orange-50 to-red-50 z-10 rounded-b-3xl animate-fadeIn">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 text-orange-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await axios.put(`/admin/blotter-requests/${scheduleData.id}`, scheduleData);
                      setShowScheduleModal(false);
                      setScheduleData({});
                      // Refresh list
                      setLoading(true);
                      const res = await axios.get("/admin/blotter-requests");
                      setBlotterRecords(res.data);
                      setFilteredRecords(res.data);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Scheduling...</span>
                    ) : (
                      <><CheckCircleIcon className="w-5 h-5" /> Schedule Appointment</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Details Modal */}
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl shadow-2xl border border-green-200 w-full max-w-4xl max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Sticky Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <EyeIcon className="w-7 h-7" />
                    Blotter Record Details
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white hover:text-green-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-8 bg-gradient-to-br from-white/80 to-green-50/80 rounded-b-3xl animate-fadeIn">
                {/* Case Overview Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm">
                  <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <ShieldExclamationIcon className="w-5 h-5" />
                    Case Overview
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div><span className="font-medium text-gray-700">Case Number:</span> <span className="text-gray-900 font-mono">{detailsData.case_number || `#${detailsData.id}`}</span></div>
                    <div><span className="font-medium text-gray-700">Status:</span> <span className="text-gray-900">{detailsData.status || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-700">Complaint Type:</span> <span className="text-gray-900">{detailsData.complaint_type || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-700">Incident Date:</span> <span className="text-gray-900">{formatDate(detailsData.incident_date)}</span></div>
                    <div><span className="font-medium text-gray-700">Created:</span> <span className="text-gray-900">{formatDate(detailsData.created_at)}</span></div>
                    <div><span className="font-medium text-gray-700">Updated:</span> <span className="text-gray-900">{formatDate(detailsData.updated_at)}</span></div>
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Complainant Information */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
                      <UserIcon className="w-5 h-5" /> Complainant Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Name</label>
                        <p className="text-gray-900 font-medium">{detailsData.complainant_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Contact</label>
                        <p className="text-gray-900">{detailsData.complainant_contact || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Address</label>
                        <p className="text-gray-900">{detailsData.complainant_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Respondent Information */}
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
                      <UserIcon className="w-5 h-5" /> Respondent Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Name</label>
                        <p className="text-gray-900 font-medium">{detailsData.respondent_name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Contact</label>
                        <p className="text-gray-900">{detailsData.respondent_contact || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-1">Address</label>
                        <p className="text-gray-900">{detailsData.respondent_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complaint Details */}
                <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
                    <DocumentTextIcon className="w-5 h-5" /> Complaint Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">Description</label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 leading-relaxed">{detailsData.complaint_details || 'No details provided'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">Remarks</label>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-900 leading-relaxed">{detailsData.remarks || 'No remarks'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resident Information (if available) */}
                {detailsData.resident && (
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-6 space-y-4">
                    <h3 className="text-lg font-bold text-green-700 flex items-center gap-2 mb-4">
                      <UserIcon className="w-5 h-5" /> Associated Resident
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{detailsData.resident.first_name} {detailsData.resident.last_name}</span></div>
                      <div><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-900">{detailsData.resident.email || 'N/A'}</span></div>
                      <div><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-900">{detailsData.resident.phone || 'N/A'}</span></div>
                      <div><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-900">{detailsData.resident.address || 'N/A'}</span></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-green-100 sticky bottom-0 bg-gradient-to-r from-green-50 to-emerald-50 z-10 rounded-b-3xl">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-opacity-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEdit(detailsData);
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Walk-in Appointment Modal */}
        {showWalkInModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in">
            <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl border border-blue-200 w-full max-w-3xl max-h-[95vh] overflow-y-auto relative animate-scale-in">
              {/* Sticky Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-3xl p-8 sticky top-0 z-10 flex flex-col gap-2 shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-extrabold text-white flex items-center gap-3 tracking-tight drop-shadow-lg">
                    <CalendarIcon className="w-7 h-7" />
                    Schedule Walk-in Appointment
                  </h2>
                  <button
                    onClick={() => setShowWalkInModal(false)}
                    className="text-white hover:text-blue-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-full p-1"
                  >
                    <XMarkIcon className="w-7 h-7" />
                  </button>
                </div>
                <p className="text-blue-100 text-sm mt-2">Fill in the details below to schedule an appointment for a walk-in resident</p>
              </div>

              <div className="p-10 space-y-6 bg-gradient-to-br from-white/80 to-blue-50/80 rounded-b-3xl animate-fadeIn">
                {/* Complainant Information */}
                <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4">
                    <UserIcon className="w-5 h-5" /> Complainant Information
                  </h3>
                  
                  {/* Resident Search Bar */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-blue-700 mb-2">Search Resident (Optional)</label>
                    <div className="relative resident-search-container">
                      <input
                        type="text"
                        value={residentSearch}
                        onChange={(e) => handleResidentSearch(e.target.value)}
                        onFocus={() => {
                          if (residentSearchResults.length > 0) {
                            setShowResidentDropdown(true);
                          }
                        }}
                        className="w-full border border-blue-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-gray-900"
                        placeholder="Search by name or resident ID to auto-fill..."
                      />
                      <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                      {isSearchingResidents && (
                        <div className="absolute right-3 top-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                      
                      {/* Dropdown Results */}
                      {showResidentDropdown && residentSearchResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-blue-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                          {residentSearchResults.map((resident) => {
                            const fullName = `${resident.first_name || ''} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name || ''}${resident.name_suffix && resident.name_suffix.toLowerCase() !== 'none' ? ' ' + resident.name_suffix : ''}`.trim();
                            return (
                              <button
                                key={resident.id}
                                type="button"
                                onClick={() => handleResidentSelect(resident)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                              >
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-blue-800">
                                      {resident.first_name?.[0]?.toUpperCase() || resident.last_name?.[0]?.toUpperCase() || '?'}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{fullName}</p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {resident.resident_id || resident.residents_id || 'N/A'} • {resident.email || resident.mobile_number || 'No contact'}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Type at least 2 characters to search for existing residents</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Complainant Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={walkInData.complainant_name}
                        onChange={(e) => setWalkInData({...walkInData, complainant_name: e.target.value})}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-gray-900"
                        placeholder="Enter complainant name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        value={walkInData.contact_number}
                        onChange={(e) => setWalkInData({...walkInData, contact_number: e.target.value})}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-gray-900"
                        placeholder="Enter contact number"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={walkInData.email}
                        onChange={(e) => setWalkInData({...walkInData, email: e.target.value})}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-gray-900"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg border border-blue-200 p-6 space-y-4">
                  <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2 mb-4">
                    <CalendarIcon className="w-5 h-5" /> Appointment Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Appointment Date <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        value={walkInData.appointment_date}
                        onChange={(e) => setWalkInData({...walkInData, appointment_date: e.target.value})}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-gray-900"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">Appointment Time <span className="text-red-500">*</span></label>
                      <select
                        value={walkInData.appointment_time}
                        onChange={(e) => setWalkInData({...walkInData, appointment_time: e.target.value})}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-gray-900"
                        required
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
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-blue-700 mb-1">Remarks</label>
                      <textarea
                        value={walkInData.remarks}
                        onChange={(e) => setWalkInData({...walkInData, remarks: e.target.value})}
                        className="w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm text-gray-900"
                        placeholder="Enter any additional remarks"
                        rows="3"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-blue-100 sticky bottom-0 bg-gradient-to-r from-blue-50 to-purple-50 z-10 rounded-b-3xl">
                  <button
                    onClick={() => setShowWalkInModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 text-blue-700 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWalkInSubmit}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    disabled={walkInLoading}
                  >
                    {walkInLoading ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Scheduling...</span>
                    ) : (
                      <><CheckCircleIcon className="w-5 h-5" /> Schedule Appointment</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Complaint Modal */}
      </main>
    </>
  );
};

export default BlotterRecords;
