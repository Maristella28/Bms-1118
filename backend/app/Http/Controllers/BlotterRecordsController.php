<?php

namespace App\Http\Controllers;

use App\Models\BlotterRecord;
use App\Models\User;
use App\Models\Resident;
use App\Services\NoShowService;
use App\Services\ActivityLogService;
use App\Notifications\WalkInAppointmentScheduledNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class BlotterRecordsController extends Controller
{
    // List all blotter records with resident info
    public function index()
    {
        $records = BlotterRecord::with('resident')->orderBy('created_at', 'desc')->get();
        return response()->json(['records' => $records]);
    }

    // Show a single blotter record by ID
    public function show($id)
    {
        $record = BlotterRecord::with('resident')->findOrFail($id);
        return response()->json(['record' => $record]);
    }

    // Store a new blotter record (for NewComplaint.jsx)
    public function store(Request $request)
    {
        try {
            \Log::info('BlotterRecordsController@store called', [
                'request_data' => $request->all(),
                'has_file' => $request->hasFile('supporting_documents')
            ]);

            $validated = $request->validate([
                'resident_id' => 'required|exists:residents,id',
                'complainant_name' => 'required|string|max:255',
                'respondent_name' => 'required|string|max:255',
                'complaint_type' => 'required|string|max:255',
                'complaint_details' => 'required|string',
                'incident_date' => 'required|date',
                'incident_time' => 'required',
                'incident_location' => 'required|string|max:255',
                'witnesses' => 'nullable|string|max:255',
                'supporting_documents' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:2048',
                'preferred_action' => 'nullable|string|max:255',
                'contact_number' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'remarks' => 'nullable|string',
                'status' => 'nullable|string|in:Ongoing,Pending,Scheduled,Completed,Cancelled,No Show',
                'appointment_date' => 'nullable|date|after_or_equal:today',
                'appointment_time' => 'nullable|string',
            ]);

            \Log::info('Validation passed', ['validated_data' => $validated]);

            // Generate unique case number: BR-YYYYMMDD-XXXX
            $date = now()->format('Ymd');
            $countToday = \App\Models\BlotterRecord::whereDate('created_at', now()->toDateString())->count() + 1;
            $caseNumber = 'BR-' . $date . '-' . str_pad($countToday, 4, '0', STR_PAD_LEFT);
            $validated['case_number'] = $caseNumber;

            if ($request->hasFile('supporting_documents')) {
                $validated['supporting_documents'] = $request->file('supporting_documents')->store('blotter_documents', 'public');
            }

            \Log::info('Creating blotter record', ['validated_data' => $validated]);

            $record = BlotterRecord::create($validated);

            // Log blotter record creation
            $user = Auth::user();
            if ($user) {
                $userRole = $user->role;
                $description = $userRole === 'admin'
                    ? "Admin {$user->name} created blotter record: {$record->case_number} - {$record->complaint_type}"
                    : ($userRole === 'staff'
                        ? "Staff {$user->name} created blotter record: {$record->case_number} - {$record->complaint_type}"
                        : "Blotter record created: {$record->case_number} - {$record->complaint_type}");
                
                ActivityLogService::logCreated($record, $request);
            }

            \Log::info('Blotter record created successfully', ['record_id' => $record->id]);

            // Send notifications if this is a walk-in appointment (status is Scheduled and has appointment date/time)
            if ($record->status === 'Scheduled' && $record->appointment_date && $record->appointment_time) {
                try {
                    // Try to find user by email or resident_id
                    $user = null;
                    
                    // First, try to find by email
                    if ($record->email) {
                        $user = User::where('email', $record->email)->first();
                    }
                    
                    // If not found by email and resident_id exists, try to find by resident_id
                    if (!$user && $record->resident_id) {
                        $resident = Resident::find($record->resident_id);
                        if ($resident && $resident->user_id) {
                            $user = User::find($resident->user_id);
                        }
                    }
                    
                    // If user found, send notification (email + database/notification bell)
                    if ($user) {
                        try {
                            $user->notify(new WalkInAppointmentScheduledNotification($record));
                            \Log::info('Walk-in appointment notification sent', [
                                'user_id' => $user->id,
                                'email' => $user->email,
                                'record_id' => $record->id,
                                'case_number' => $record->case_number
                            ]);
                        } catch (\Exception $notifyException) {
                            \Log::warning('Failed to send walk-in appointment notification', [
                                'error' => $notifyException->getMessage(),
                                'user_id' => $user->id,
                                'record_id' => $record->id
                            ]);
                            // Continue even if notification fails
                        }
                    } else {
                        \Log::info('User not found for walk-in appointment notification', [
                            'email' => $record->email,
                            'resident_id' => $record->resident_id,
                            'record_id' => $record->id
                        ]);
                    }
                } catch (\Exception $notificationError) {
                    \Log::warning('Error sending walk-in appointment notification', [
                        'error' => $notificationError->getMessage(),
                        'record_id' => $record->id
                    ]);
                    // Continue even if notification fails - record is still created
                }
            }

            return response()->json([
                'message' => 'Blotter complaint submitted successfully.',
                'data' => $record,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed in BlotterRecordsController@store', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in BlotterRecordsController@store', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Failed to submit blotter complaint',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Update an existing blotter record
    public function update(Request $request, $id)
    {
        try {
            \Log::info('BlotterRecordsController@update called', [
                'record_id' => $id,
                'request_data' => $request->all()
            ]);

            $record = BlotterRecord::findOrFail($id);

            $validated = $request->validate([
                'status' => 'nullable|string|in:Ongoing,Pending,Scheduled,Completed,Cancelled,No Show',
                'solved_at' => 'nullable',
                'complainant_name' => 'nullable|string|max:255',
                'respondent_name' => 'nullable|string|max:255',
                'complaint_type' => 'nullable|string|max:255',
                'complaint_details' => 'nullable|string',
                'incident_date' => 'nullable|date',
                'incident_time' => 'nullable',
                'incident_location' => 'nullable|string|max:255',
                'witnesses' => 'nullable|string|max:255',
                'preferred_action' => 'nullable|string|max:255',
                'contact_number' => 'nullable|string|max:255',
                'email' => 'nullable|email|max:255',
                'remarks' => 'nullable|string',
            ]);

            \Log::info('Validation passed for update', ['validated_data' => $validated]);

            try {
                $oldValues = $record->getOriginal();
                $record->update($validated);
                
                // Log blotter record update
                $user = Auth::user();
                if ($user) {
                    ActivityLogService::logUpdated($record, $oldValues, $request);
                }
                
                \Log::info('Record updated successfully', ['record_id' => $record->id, 'updated_data' => $validated]);
            } catch (\Exception $updateException) {
                \Log::error('Error updating record', [
                    'error' => $updateException->getMessage(),
                    'record_id' => $record->id,
                    'validated_data' => $validated
                ]);
                throw $updateException;
            }

            \Log::info('Blotter record updated successfully', ['record_id' => $record->id]);

            return response()->json([
                'message' => 'Blotter record updated successfully.',
                'data' => $record->fresh(['resident']),
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed in BlotterRecordsController@update', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in BlotterRecordsController@update', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Failed to update blotter record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Send notification to respondent about barangay appearance
    public function sendNotification(Request $request)
    {
        try {
            \Log::info('BlotterRecordsController@sendNotification called', [
                'request_data' => $request->all()
            ]);

            $validated = $request->validate([
                'case_id' => 'required|exists:blotter_records,id',
                'respondent_name' => 'required|string|max:255',
                'respondent_contact' => 'nullable|string|max:255',
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|string',
                'case_number' => 'required|string',
                'custom_message' => 'nullable|string',
            ]);

            $record = BlotterRecord::findOrFail($validated['case_id']);

            // Prepare the notification data
            $notificationData = [
                'respondent_name' => $validated['respondent_name'],
                'case_number' => $validated['case_number'],
                'complaint_type' => $record->complaint_type,
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $validated['appointment_time'],
                'complainant_name' => $record->complainant_name,
                'custom_message' => $validated['custom_message'],
                'barangay_hall_address' => 'Barangay Hall, [Your Barangay Name]',
                'contact_number' => '[Your Barangay Contact Number]',
            ];

            // Send email notification (if email is available)
            if ($record->email) {
                try {
                    Mail::send('emails.barangay-notice', $notificationData, function ($message) use ($record, $validated) {
                        $message->to($record->email)
                                ->subject('Barangay Notice - Case ' . $validated['case_number']);
                    });
                    \Log::info('Email notification sent successfully', [
                        'case_id' => $validated['case_id'],
                        'email' => $record->email
                    ]);
                } catch (\Exception $emailException) {
                    \Log::warning('Failed to send email notification', [
                        'error' => $emailException->getMessage(),
                        'case_id' => $validated['case_id'],
                        'email' => $record->email
                    ]);
                }
            }

            // Send SMS notification (if contact number is available)
            if (isset($validated['respondent_contact']) && $validated['respondent_contact']) {
                try {
                    // Here you would integrate with an SMS service like Twilio, Nexmo, etc.
                    // For now, we'll just log the SMS content
                    $smsMessage = "BARANGAY NOTICE: You are required to appear at the Barangay Hall on " . 
                                 $validated['appointment_date'] . " at " . $validated['appointment_time'] . 
                                 " regarding Case " . $validated['case_number'] . ". Please bring valid ID.";
                    
                    \Log::info('SMS notification prepared', [
                        'case_id' => $validated['case_id'],
                        'contact' => $validated['respondent_contact'],
                        'message' => $smsMessage
                    ]);
                } catch (\Exception $smsException) {
                    \Log::warning('Failed to send SMS notification', [
                        'error' => $smsException->getMessage(),
                        'case_id' => $validated['case_id'],
                        'contact' => $validated['respondent_contact']
                    ]);
                }
            }

            // Convert 12-hour time format to 24-hour format for MySQL
            $time24Hour = date('H:i:s', strtotime($validated['appointment_time']));

            // Update the record with appointment information
            $record->update([
                'status' => 'Scheduled',
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $time24Hour,
                'notification_sent_at' => now(),
            ]);

            \Log::info('Barangay notice sent successfully', [
                'case_id' => $validated['case_id'],
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $validated['appointment_time']
            ]);

            return response()->json([
                'message' => 'Barangay notice sent successfully.',
                'data' => [
                    'case_id' => $validated['case_id'],
                    'case_number' => $validated['case_number'],
                    'appointment_date' => $validated['appointment_date'],
                    'appointment_time' => $validated['appointment_time'], // Return original 12-hour format
                    'appointment_time_24h' => $time24Hour, // Also return 24-hour format
                    'respondent_name' => $validated['respondent_name'],
                    'notification_sent_at' => now()->toISOString(),
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed in BlotterRecordsController@sendNotification', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error in BlotterRecordsController@sendNotification', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Failed to send barangay notice',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark complainant as no-show
     */
    public function markComplainantNoShow(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'reason' => 'nullable|string|max:500',
            ]);

            $record = BlotterRecord::with('resident')->findOrFail($id);
            
            if (!$record->resident) {
                return response()->json([
                    'message' => 'No resident associated with this complaint'
                ], 400);
            }

            $noShowService = new NoShowService();
            $noShowService->markComplainantNoShow($record, $validated['reason'] ?? null);

            return response()->json([
                'message' => 'Complainant marked as no-show successfully',
                'penalty_info' => $noShowService->getPenaltyInfo($record->resident)
            ]);

        } catch (\Exception $e) {
            \Log::error('Error marking complainant as no-show', [
                'error' => $e->getMessage(),
                'record_id' => $id
            ]);

            return response()->json([
                'message' => 'Failed to mark complainant as no-show',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark respondent as no-show
     */
    public function markRespondentNoShow(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'reason' => 'nullable|string|max:500',
            ]);

            $record = BlotterRecord::findOrFail($id);
            
            $noShowService = new NoShowService();
            $noShowService->markRespondentNoShow($record, $validated['reason'] ?? null);

            return response()->json([
                'message' => 'Respondent marked as no-show successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error marking respondent as no-show', [
                'error' => $e->getMessage(),
                'record_id' => $id
            ]);

            return response()->json([
                'message' => 'Failed to mark respondent as no-show',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit appeal for no-show
     */
    public function submitAppeal(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:complainant,respondent',
                'reason' => 'required|string|max:1000',
            ]);

            $record = BlotterRecord::findOrFail($id);
            
            $noShowService = new NoShowService();
            $noShowService->submitAppeal($record, $validated['type'], $validated['reason']);

            return response()->json([
                'message' => 'Appeal submitted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error submitting appeal', [
                'error' => $e->getMessage(),
                'record_id' => $id
            ]);

            return response()->json([
                'message' => 'Failed to submit appeal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Review appeal (admin only)
     */
    public function reviewAppeal(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'type' => 'required|in:complainant,respondent',
                'status' => 'required|in:approved,rejected',
                'admin_notes' => 'nullable|string|max:1000',
            ]);

            $record = BlotterRecord::findOrFail($id);
            
            $noShowService = new NoShowService();
            $noShowService->reviewAppeal($record, $validated['type'], $validated['status'], $validated['admin_notes'] ?? null);

            return response()->json([
                'message' => 'Appeal reviewed successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error reviewing appeal', [
                'error' => $e->getMessage(),
                'record_id' => $id
            ]);

            return response()->json([
                'message' => 'Failed to review appeal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get penalty information for resident
     */
    public function getPenaltyInfo($residentId)
    {
        try {
            $resident = \App\Models\Resident::findOrFail($residentId);
            $noShowService = new NoShowService();
            
            return response()->json([
                'penalty_info' => $noShowService->getPenaltyInfo($resident)
            ]);

        } catch (\Exception $e) {
            \Log::error('Error getting penalty info', [
                'error' => $e->getMessage(),
                'resident_id' => $residentId
            ]);

            return response()->json([
                'message' => 'Failed to get penalty information',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 