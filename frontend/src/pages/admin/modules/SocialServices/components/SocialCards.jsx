import React from 'react';
import { HeartIcon, TrashIcon, PencilIcon, EyeIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const SocialCards = ({ 
  programs, 
  getBeneficiariesByProgram, 
  formatCurrency, 
  formatDate, 
  formatDateRange,
  handleDeleteProgram, 
  handleEditProgramClick,
  getEffectiveProgramStatus,
  areAllBeneficiariesPaid
}) => {
  const navigate = useNavigate();
  
  // Debug logging
  console.log('SocialCards received programs:', programs);
  console.log('Sample program in SocialCards:', programs[0]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 w-full max-w-full overflow-hidden">
      {programs.map((program, index) => {
        // Get effective status (considers if all beneficiaries are paid)
        const effectiveStatus = getEffectiveProgramStatus ? getEffectiveProgramStatus(program) : program.status;
        const isComplete = effectiveStatus === 'complete' && areAllBeneficiariesPaid && areAllBeneficiariesPaid(program.id);
        const displayStatus = isComplete ? 'Complete' : (effectiveStatus ? effectiveStatus.charAt(0).toUpperCase() + effectiveStatus.slice(1) : 'Draft');
        
        return (
        <div
          key={program.id}
          className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/90 animate-fade-in-up overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => navigate(`/admin/social-services/program/${program.id}`)}
        >
          {/* Glassmorphism Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl"></div>
          
          {/* Subtle Border Glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          {/* Header Section */}
          <div className="relative z-10 flex items-start justify-between mb-6">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              {/* Program Icon with Enhanced Design */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
                  <HeartIcon className="w-7 h-7 text-white drop-shadow-sm" />
                </div>
                {/* Status Indicator Ring */}
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${
                  effectiveStatus === 'active' 
                    ? 'bg-green-500 animate-pulse' 
                    : effectiveStatus === 'ongoing'
                    ? 'bg-blue-500'
                    : effectiveStatus === 'complete' || isComplete
                    ? 'bg-emerald-500'
                    : 'bg-gray-400'
                }`}></div>
              </div>
              
              {/* Program Info */}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300 leading-tight mb-2 line-clamp-2">
                  {program.name}
                </h2>
                
                {/* Enhanced Status Tag */}
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-300 ${
                  effectiveStatus === 'active' 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-green-100/50 group-hover:shadow-green-200/50' 
                    : effectiveStatus === 'ongoing'
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 shadow-blue-100/50'
                    : effectiveStatus === 'complete' || isComplete
                    ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200 shadow-emerald-100/50'
                    : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200 shadow-gray-100/50'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    effectiveStatus === 'active' 
                      ? 'bg-green-500 animate-pulse' 
                      : effectiveStatus === 'ongoing'
                      ? 'bg-blue-500'
                      : effectiveStatus === 'complete' || isComplete
                      ? 'bg-emerald-500'
                      : 'bg-gray-400'
                  }`}></div>
                  {displayStatus}
                </div>
              </div>
            </div>
            
            {/* Beneficiaries Count with Enhanced Design */}
            <div className="text-right flex-shrink-0 ml-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-4 py-2 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="text-xl font-bold">{getBeneficiariesByProgram(program.id).length}</div>
                <div className="text-xs font-medium text-green-100">Beneficiaries</div>
              </div>
            </div>
          </div>
          
          {/* Description Section */}
          <div className="relative z-10 mb-6">
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 text-sm leading-relaxed line-clamp-2">
              {program.description}
            </p>
          </div>
          
          {/* Enhanced Details Section */}
          <div className="relative z-10 space-y-4 mb-6">
            {/* Duration with Tooltip Effect */}
            <div className="group/detail flex items-center justify-between p-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors duration-300">
              <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-600 font-medium text-sm">Duration</span>
              </div>
              <span className="text-gray-900 font-semibold text-sm group-hover/detail:text-blue-700 transition-colors duration-300 text-right min-w-0 flex-shrink-0 ml-2">
                {formatDateRange(program.start_date, program.end_date)}
              </span>
            </div>
            
            {/* Budget with Tooltip Effect */}
            <div className="group/detail flex items-center justify-between p-3 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors duration-300">
              <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <ChartBarIcon className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-600 font-medium text-sm">Budget</span>
              </div>
              <span className="text-green-600 font-bold text-sm group-hover/detail:text-green-700 transition-colors duration-300 text-right min-w-0 flex-shrink-0 ml-2">
                {formatCurrency(program.amount)}
              </span>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="relative z-10 space-y-3">
            {/* Primary Action - View Details */}
            <button
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-2xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/30 group/btn"
              onClick={e => { e.stopPropagation(); navigate(`/admin/social-services/program/${program.id}`); }}
            >
              <div className="flex items-center justify-center gap-2">
                <EyeIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
                <span>View Details</span>
              </div>
            </button>
            
            {/* Secondary Actions */}
            <div className="flex gap-3">
              <button
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-orange-500/30 group/btn"
                onClick={e => { e.stopPropagation(); handleEditProgramClick(program); }}
              >
                <div className="flex items-center justify-center gap-2">
                  <PencilIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
                  <span>Edit</span>
                </div>
              </button>
              
              <button
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-red-500/30 group/btn"
                onClick={e => { e.stopPropagation(); handleDeleteProgram(program.id); }}
              >
                <div className="flex items-center justify-center gap-2">
                  <TrashIcon className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" />
                  <span>Delete</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
};

export default SocialCards;
