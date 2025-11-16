import React, { useState } from 'react';
import axios from '../../../../utils/axiosConfig';
import { 
  ExclamationTriangleIcon,
  XMarkIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  UserIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

const AddDisasterEmergencyRecord = ({ onSuccess, onShowToast }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: '',
    date: '',
    location: '',
    description: '',
    actions_taken: '',
    casualties: '',
    reported_by: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customType, setCustomType] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/disaster-emergencies', form);
      
      // Show success message
      if (onShowToast) {
        onShowToast('✅ Disaster and Emergency record saved successfully!', 'success');
      }
      
      setShowForm(false);
      setForm({
        type: '',
        date: '',
        location: '',
        description: '',
        actions_taken: '',
        casualties: '',
        reported_by: '',
      });
      setCustomType('');
      if (onSuccess) onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to add record. Please check all required fields and try again.';
      setError(errorMessage);
      
      // Show error toast if available
      if (onShowToast) {
        onShowToast(`❌ ${errorMessage}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-base font-semibold transition-all duration-300 transform hover:scale-105"
        onClick={() => setShowForm(true)}
      >
        <ExclamationTriangleIcon className="w-6 h-6" />
        Add Disaster and Emergency records
      </button>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Add Disaster/Emergency Record</h2>
                    <p className="text-orange-100 text-sm mt-1">Create a new disaster or emergency record</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm({
                      type: '',
                      date: '',
                      location: '',
                      description: '',
                      actions_taken: '',
                      casualties: '',
                      reported_by: '',
                    });
                    setCustomType('');
                    setError('');
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  {error}
                </div>
              )}

              {/* Disaster Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                  Disaster Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={e => {
                    handleChange(e);
                    if (e.target.value !== 'Other') setCustomType('');
                  }}
                  required
                  className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 rounded-xl px-4 py-3 text-base transition-all duration-200 bg-white"
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
                {form.type === 'Other' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Enter custom disaster type"
                      value={customType}
                      onChange={e => {
                        setCustomType(e.target.value);
                        setForm({ ...form, type: e.target.value });
                      }}
                      className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-red-600" />
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  type="date"
                  className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 rounded-xl px-4 py-3 text-base transition-all duration-200 bg-white"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter location"
                  className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-red-600" />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  placeholder="Enter detailed description of the incident"
                  rows={4}
                  className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 rounded-xl px-4 py-3 text-base transition-all duration-200 resize-none"
                />
              </div>

              {/* Actions Taken */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-red-600" />
                  Actions Taken
                </label>
                <textarea
                  name="actions_taken"
                  value={form.actions_taken}
                  onChange={handleChange}
                  placeholder="Describe the actions taken in response to this incident"
                  rows={4}
                  className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 rounded-xl px-4 py-3 text-base transition-all duration-200 resize-none"
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
                    value={form.casualties}
                    onChange={handleChange}
                    placeholder="Enter number of casualties"
                    type="number"
                    min="0"
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
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
                    value={form.reported_by}
                    onChange={handleChange}
                    placeholder="Enter reporter's name"
                    className="w-full border-2 border-gray-200 focus:ring-4 focus:ring-red-100 focus:border-red-500 rounded-xl px-4 py-3 text-base transition-all duration-200"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setForm({
                      type: '',
                      date: '',
                      location: '',
                      description: '',
                      actions_taken: '',
                      casualties: '',
                      reported_by: '',
                    });
                    setCustomType('');
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-xl hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Save Record
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddDisasterEmergencyRecord; 