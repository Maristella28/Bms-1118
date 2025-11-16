    import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { PlusIcon } from '@heroicons/react/24/outline';
    import axios from '../../../../utils/axiosConfig';
    import Navbar from '../../../../components/Navbar';
    import Sidebar from '../../../../components/Sidebar';
    import { UserIcon, DocumentTextIcon, MapPinIcon, ClockIcon, ExclamationTriangleIcon, PaperClipIcon, ChatBubbleLeftRightIcon, EnvelopeIcon, PhoneIcon, XMarkIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

    const complaintTypes = [
    'Physical Injury',
    'Verbal Abuse',
    'Property Damage',
    'Theft',
    'Noise Complaint',
    'Other',
    ];

    const initialForm = {
    complainant_id: '',
    complainant_name: '',
    complainant_resident_id: '',
    complainant_contact_number: '',
    complainant_email: '',
    respondent_id: '',
    respondent_name: '',
    respondent_resident_id: '',
    respondent_contact_number: '',
    respondent_email: '',
    complaint_type: '',
    complaint_details: '',
    incident_date: '',
    incident_time: '',
    incident_location: '',
    witnesses: '',
    supporting_documents: null,
    preferred_action: '',
    contact_number: '',
    email: '',
    remarks: '',
    };

    const NewComplaint = ({ onSubmit, loading }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [residents, setResidents] = useState([]);
    const [residentLoading, setResidentLoading] = useState(false);
    const [complainantSearch, setComplainantSearch] = useState('');
    const [respondentSearch, setRespondentSearch] = useState('');
    const [showComplainantDropdown, setShowComplainantDropdown] = useState(false);
    const [showRespondentDropdown, setShowRespondentDropdown] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        setResidentLoading(true);
        axios.get('/admin/residents')
            .then(res => {
                console.log('Residents API response:', res.data);
                console.log('First resident:', res.data.residents?.[0]);
                setResidents(res.data.residents || []);
            })
            .catch(() => setResidents([]))
            .finally(() => setResidentLoading(false));
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setShowComplainantDropdown(false);
                setShowRespondentDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleComplainantSelect = (resident) => {
        const fullName = `${resident.first_name} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name}${resident.name_suffix && resident.name_suffix.toLowerCase() !== 'none' ? ' ' + resident.name_suffix : ''}`.trim();
        
        setForm(f => ({
            ...f,
            complainant_id: resident.id,
            complainant_name: fullName,
            complainant_resident_id: resident.resident_id,
            complainant_contact_number: resident.mobile_number || resident.contact_number || '',
            complainant_email: resident.email || '',
            contact_number: resident.mobile_number || resident.contact_number || '',
            email: resident.email || '',
            // Clear respondent if it's the same person
            respondent_id: f.respondent_id === resident.id ? '' : f.respondent_id,
            respondent_name: f.respondent_id === resident.id ? '' : f.respondent_name,
            respondent_resident_id: f.respondent_id === resident.id ? '' : f.respondent_resident_id,
            respondent_contact_number: f.respondent_id === resident.id ? '' : f.respondent_contact_number,
            respondent_email: f.respondent_id === resident.id ? '' : f.respondent_email,
        }));
        setComplainantSearch(fullName);
        setShowComplainantDropdown(false);
        
        // Clear respondent search if it was the same person
        if (form.respondent_id === resident.id) {
            setRespondentSearch('');
        }
    };

    const handleRespondentSelect = (resident) => {
        const fullName = `${resident.first_name} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name}${resident.name_suffix && resident.name_suffix.toLowerCase() !== 'none' ? ' ' + resident.name_suffix : ''}`.trim();
        
        setForm(f => ({
            ...f,
            respondent_id: resident.id,
            respondent_name: fullName,
            respondent_resident_id: resident.resident_id,
            respondent_contact_number: resident.mobile_number || resident.contact_number || '',
            respondent_email: resident.email || '',
            // Clear complainant if it's the same person
            complainant_id: f.complainant_id === resident.id ? '' : f.complainant_id,
            complainant_name: f.complainant_id === resident.id ? '' : f.complainant_name,
            complainant_resident_id: f.complainant_id === resident.id ? '' : f.complainant_resident_id,
            complainant_contact_number: f.complainant_id === resident.id ? '' : f.complainant_contact_number,
            complainant_email: f.complainant_id === resident.id ? '' : f.complainant_email,
            contact_number: f.complainant_id === resident.id ? '' : f.contact_number,
            email: f.complainant_id === resident.id ? '' : f.email,
        }));
        setRespondentSearch(fullName);
        setShowRespondentDropdown(false);
        
        // Clear complainant search if it was the same person
        if (form.complainant_id === resident.id) {
            setComplainantSearch('');
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.complainant_id) errs.complainant_id = 'Complainant is required';
        if (!form.complainant_name) errs.complainant_name = 'Complainant name is required';
        if (!form.respondent_name) errs.respondent_name = 'Respondent name is required';
        if (!form.complaint_type) errs.complaint_type = 'Complaint type is required';
        if (!form.complaint_details) errs.complaint_details = 'Complaint details are required';
        if (!form.incident_date) errs.incident_date = 'Incident date is required';
        if (!form.incident_time) errs.incident_time = 'Incident time is required';
        if (!form.incident_location) errs.incident_location = 'Incident location is required';
        if (!form.contact_number) errs.contact_number = 'Contact number is required';
        if (!form.email) errs.email = 'Email is required';
        
        // Check if complainant and respondent are the same person
        if (form.complainant_id && form.respondent_id && form.complainant_id === form.respondent_id) {
            errs.respondent_id = 'Complainant and respondent cannot be the same person';
        }
        
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm(f => ({ ...f, supporting_documents: file }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            setForm(f => ({ ...f, supporting_documents: file }));
        }
    };

    const removeFile = () => {
        setForm(f => ({ ...f, supporting_documents: null }));
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
        setForm({ ...form, [name]: files[0] });
        } else {
        setForm({ ...form, [name]: value });
        }
        setErrors({ ...errors, [name]: undefined });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        try {
            // Prepare form data for file upload
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });
            
            // Ensure resident_id is included for backend compatibility
            formData.append('resident_id', form.complainant_id);
            
            console.log('Submitting blotter complaint with data:', Object.fromEntries(formData));
            
            const response = await axios.post('/blotter-records', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            console.log('Blotter complaint submitted successfully:', response.data);
            alert('Blotter complaint submitted successfully!');
            setForm(initialForm);
            setErrors({});
            navigate('/admin/blotterRecords');
        } catch (error) {
            console.error('Error submitting blotter complaint:', error);
            
            if (error.response && error.response.data) {
                if (error.response.data.errors) {
                    // Handle validation errors
                    setErrors(error.response.data.errors);
                    alert('Please fix the validation errors and try again.');
                } else {
                    alert(`Error: ${error.response.data.message || 'Failed to submit complaint'}`);
                }
            } else {
                alert('Failed to submit blotter complaint. Please try again.');
            }
        }
    };

    const handleCancel = () => {
        setForm(initialForm);
        setErrors({});
        navigate('/admin/blotterRecords'); // Navigate to BlotterRecords admin page
    };

    // Filter residents by search for complainant (exclude selected respondent)
    const filteredComplainants = residents.filter(r => {
        const name = `${r.first_name} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name}${r.name_suffix && r.name_suffix.toLowerCase() !== 'none' ? ' ' + r.name_suffix : ''}`.toLowerCase();
        const searchTerm = complainantSearch.toLowerCase();
        const isNotSelectedRespondent = !form.respondent_id || r.id !== parseInt(form.respondent_id);
        
        return isNotSelectedRespondent && (
            name.includes(searchTerm) ||
            String(r.resident_id).includes(searchTerm) ||
            `${r.resident_id} - ${r.first_name} ${r.last_name}`.toLowerCase().includes(searchTerm)
        );
    });

    // Filter residents by search for respondent (exclude selected complainant)
    const filteredRespondents = residents.filter(r => {
        const name = `${r.first_name} ${r.middle_name ? r.middle_name + ' ' : ''}${r.last_name}${r.name_suffix && r.name_suffix.toLowerCase() !== 'none' ? ' ' + r.name_suffix : ''}`.toLowerCase();
        const searchTerm = respondentSearch.toLowerCase();
        const isNotSelectedComplainant = !form.complainant_id || r.id !== parseInt(form.complainant_id);
        
        return isNotSelectedComplainant && (
            name.includes(searchTerm) ||
            String(r.resident_id).includes(searchTerm) ||
            `${r.resident_id} - ${r.first_name} ${r.last_name}`.toLowerCase().includes(searchTerm)
        );
    });

    return (
        <>
            <Navbar />
            <Sidebar />
            <main className="bg-gradient-to-br from-green-50 to-white min-h-screen ml-64 pt-36 px-6 pb-16 font-sans">
                <div className="bg-white rounded-3xl shadow-2xl border border-green-100 w-full max-w-6xl p-0 relative mt-10 mx-auto overflow-hidden">
                    {/* Back Button */}
                    <div className="px-8 pt-6 pb-4">
                        <button
                            onClick={() => navigate('/admin/blotterRecords')}
                            className="flex items-center gap-3 text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold transition-all duration-300 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-green-700"
                        >
                            <ArrowLeftIcon className="w-6 h-6" />
                            <span className="text-lg">Back to Blotter Records</span>
                        </button>
                    </div>
                    {/* Modern Colored Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 rounded-t-3xl flex items-center gap-3 shadow-md">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                        <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-lg">Add New Blotter Complaint</h2>
                    </div>
                    <form className="space-y-8 px-8 py-8" onSubmit={handleSubmit} encType="multipart/form-data">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-8">
                                {/* Section: Complainant & Respondent */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out">
                                    <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
                                        <h3 className="text-xl font-bold text-green-700 flex items-center gap-3">
                                            <DocumentTextIcon className="w-6 h-6 text-green-600" /> Complainant & Respondent
                                        </h3>
                                    </div>
                                    <div className="space-y-6">
                                        {/* Complainant Dropdown */}
                                        <div className="relative dropdown-container">
                                            <label className="block text-sm font-semibold mb-3 text-gray-700">Complainant <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Enter complainant's full name or resident ID..."
                                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                    value={complainantSearch}
                                                    onChange={(e) => {
                                                        setComplainantSearch(e.target.value);
                                                        setShowComplainantDropdown(true);
                                                    }}
                                                    onFocus={() => setShowComplainantDropdown(true)}
                                                    disabled={residentLoading}
                                                />
                                                {showComplainantDropdown && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                        {filteredComplainants.length > 0 ? (
                                                            filteredComplainants.map(resident => (
                                                                <div
                                                                    key={resident.id}
                                                                    className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200 ease-in-out"
                                                                    onClick={() => handleComplainantSelect(resident)}
                                                                >
                                                                    <div className="font-medium text-gray-900">
                                                                        {resident.resident_id} - {resident.first_name} {resident.last_name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {resident.email}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-gray-500 text-center">
                                                                {complainantSearch ? 'No available residents found' : 'No residents found'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Resident ID Badge */}
                                            {form.complainant_resident_id && (
                                                <div className="mt-3">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                                        ID: {form.complainant_resident_id}
                                                    </span>
                                                </div>
                                            )}
                                            {errors.complainant_id && <p className="text-xs text-red-500 mt-2">{errors.complainant_id}</p>}
                                        </div>

                                        {/* Respondent Dropdown */}
                                        <div className="relative dropdown-container">
                                            <label className="block text-sm font-semibold mb-3 text-gray-700">Respondent <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Enter respondent's full name or resident ID..."
                                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                    value={respondentSearch}
                                                    onChange={(e) => {
                                                        setRespondentSearch(e.target.value);
                                                        setShowRespondentDropdown(true);
                                                    }}
                                                    onFocus={() => setShowRespondentDropdown(true)}
                                                    disabled={residentLoading}
                                                />
                                                {showRespondentDropdown && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                                        {filteredRespondents.length > 0 ? (
                                                            filteredRespondents.map(resident => (
                                                                <div
                                                                    key={resident.id}
                                                                    className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200 ease-in-out"
                                                                    onClick={() => handleRespondentSelect(resident)}
                                                                >
                                                                    <div className="font-medium text-gray-900">
                                                                        {resident.resident_id} - {resident.first_name} {resident.last_name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {resident.email}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="px-4 py-3 text-gray-500 text-center">
                                                                {respondentSearch ? 'No available residents found' : 'No residents found'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Resident ID Badge */}
                                            {form.respondent_resident_id && (
                                                <div className="mt-3">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                                        ID: {form.respondent_resident_id}
                                                    </span>
                                                </div>
                                            )}
                                            {errors.respondent_name && <p className="text-xs text-red-500 mt-2">{errors.respondent_name}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Incident Details */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out">
                                    <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
                                        <h3 className="text-xl font-bold text-green-700 flex items-center gap-3">
                                            <ExclamationTriangleIcon className="w-6 h-6 text-green-600" /> Incident Details
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                    <ClockIcon className="w-4 h-4 text-green-600" /> Incident Date <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        name="incident_date"
                                                        value={form.incident_date}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                    />
                                                </div>
                                                {errors.incident_date && <p className="text-xs text-red-500 mt-2">{errors.incident_date}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                    <ClockIcon className="w-4 h-4 text-green-600" /> Incident Time <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="time"
                                                        name="incident_time"
                                                        value={form.incident_time}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                    />
                                                </div>
                                                {errors.incident_time && <p className="text-xs text-red-500 mt-2">{errors.incident_time}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                <MapPinIcon className="w-4 h-4 text-green-600" /> Incident Location <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="incident_location"
                                                value={form.incident_location}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                placeholder="Enter the exact location where the incident occurred..."
                                            />
                                            {errors.incident_location && <p className="text-xs text-red-500 mt-2">{errors.incident_location}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Complainant Contact Information */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out">
                                    <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
                                        <h3 className="text-xl font-bold text-green-700 flex items-center gap-3">
                                            <PhoneIcon className="w-6 h-6 text-green-600" /> Complainant Contact Information
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                    <PhoneIcon className="w-4 h-4 text-green-600" /> Contact Number <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        name="complainant_contact_number"
                                                        value={form.complainant_contact_number}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                        placeholder="e.g., +639123456789"
                                                    />
                                                    {form.complainant_contact_number && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setForm(f => ({ ...f, complainant_contact_number: '' }))}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                    <EnvelopeIcon className="w-4 h-4 text-green-600" /> Email <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="email"
                                                        name="complainant_email"
                                                        value={form.complainant_email}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                        placeholder="e.g., john.doe@email.com"
                                                    />
                                                    {form.complainant_email && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setForm(f => ({ ...f, complainant_email: '' }))}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Respondent Contact Information */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out">
                                    <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                                        <h3 className="text-xl font-bold text-blue-700 flex items-center gap-3">
                                            <PhoneIcon className="w-6 h-6 text-blue-600" /> Respondent Contact Information
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                    <PhoneIcon className="w-4 h-4 text-blue-600" /> Contact Number <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        name="respondent_contact_number"
                                                        value={form.respondent_contact_number}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                        placeholder="e.g., +639123456789"
                                                    />
                                                    {form.respondent_contact_number && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setForm(f => ({ ...f, respondent_contact_number: '' }))}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                    <EnvelopeIcon className="w-4 h-4 text-blue-600" /> Email <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="email"
                                                        name="respondent_email"
                                                        value={form.respondent_email}
                                                        onChange={handleChange}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                        placeholder="e.g., john.doe@email.com"
                                                    />
                                                    {form.respondent_email && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setForm(f => ({ ...f, respondent_email: '' }))}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200"
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                {/* Section: Complaint Details */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out">
                                    <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
                                        <h3 className="text-xl font-bold text-green-700 flex items-center gap-3">
                                            <DocumentTextIcon className="w-6 h-6 text-green-600" /> Complaint Details
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-gray-700">Complaint Type <span className="text-red-500">*</span></label>
                                            <select
                                                name="complaint_type"
                                                value={form.complaint_type}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                            >
                                                <option value="">Select Complaint Type</option>
                                                {complaintTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {errors.complaint_type && <p className="text-xs text-red-500 mt-2">{errors.complaint_type}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-gray-700">Complaint Details <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <textarea
                                                    name="complaint_details"
                                                    value={form.complaint_details}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md resize-none"
                                                    placeholder="Describe the complaint in detail. Include what happened, when, where, and any relevant information..."
                                                    rows={4}
                                                    maxLength={1000}
                                                />
                                                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
                                                    {form.complaint_details.length}/1000 words
                                                </div>
                                            </div>
                                            {errors.complaint_details && <p className="text-xs text-red-500 mt-2">{errors.complaint_details}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Additional Info */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out">
                                    <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
                                        <h3 className="text-xl font-bold text-green-700 flex items-center gap-3">
                                            <PaperClipIcon className="w-6 h-6 text-green-600" /> Additional Information
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        {/* Witnesses */}
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-gray-700">Witnesses (comma separated)</label>
                                            <input
                                                type="text"
                                                name="witnesses"
                                                value={form.witnesses}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                placeholder="Enter witness names separated by commas (e.g., Juan Dela Cruz, Maria Santos)"
                                            />
                                        </div>

                                        {/* Supporting Documents */}
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                                                <PaperClipIcon className="w-4 h-4 text-green-600" /> Supporting Documents (optional)
                                            </label>
                                            <div 
                                                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ease-in-out ${
                                                    isDragOver 
                                                        ? 'border-green-400 bg-green-50' 
                                                        : form.supporting_documents 
                                                            ? 'border-green-300 bg-green-50' 
                                                            : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                                                }`}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                {form.supporting_documents ? (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-center gap-2 text-green-600">
                                                            <CheckCircleIcon className="w-6 h-6" />
                                                            <span className="font-semibold">File Selected</span>
                                                        </div>
                                                        <div className="text-sm text-gray-700">
                                                            <p className="font-medium">{form.supporting_documents.name}</p>
                                                            <p className="text-gray-500">
                                                                {(form.supporting_documents.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2 justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={removeFile}
                                                                className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                                                            >
                                                                Remove File
                                                            </button>
                                                            <label className="px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200 text-sm font-medium cursor-pointer">
                                                                Change File
                                                                <input
                                                                    type="file"
                                                                    name="supporting_documents"
                                                                    onChange={handleFileChange}
                                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-center gap-2 text-gray-400">
                                                            <PaperClipIcon className="w-8 h-8" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-medium text-gray-700 mb-1">
                                                                Drop files here or click to upload
                                                            </p>
                                                            <p className="text-sm text-gray-500 mb-3">
                                                                PDF, DOC, DOCX, JPG, JPEG, PNG up to 10MB
                                                            </p>
                                                            <label className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg cursor-pointer transition-colors duration-200 text-sm font-medium">
                                                                Choose File
                                                                <input
                                                                    type="file"
                                                                    name="supporting_documents"
                                                                    onChange={handleFileChange}
                                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Preferred Action/Resolution */}
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-gray-700">Preferred Action/Resolution</label>
                                            <input
                                                type="text"
                                                name="preferred_action"
                                                value={form.preferred_action}
                                                onChange={handleChange}
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                                placeholder="Enter preferred resolution method (e.g., Mediation, Settlement, Court Action)"
                                            />
                                        </div>

                                        {/* Remarks */}
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-gray-700">Remarks (optional)</label>
                                            <div className="relative">
                                                <textarea
                                                    name="remarks"
                                                    value={form.remarks}
                                                    onChange={handleChange}
                                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 ease-in-out shadow-sm hover:shadow-md resize-none"
                                                    placeholder="Enter any additional remarks or notes about this complaint..."
                                                    rows={3}
                                                    maxLength={500}
                                                />
                                                <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-1 rounded">
                                                    {form.remarks.length}/500
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-all duration-200 ease-in-out shadow-sm hover:shadow-md"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105"
                                disabled={loading}
                            >
                                {loading ? 'Submitting...' : 'Add Complaint'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
};

export default NewComplaint;
