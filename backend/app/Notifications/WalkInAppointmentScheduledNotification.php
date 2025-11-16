<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class WalkInAppointmentScheduledNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $blotterRecord;

    public function __construct($blotterRecord)
    {
        $this->blotterRecord = $blotterRecord;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        $appointmentDate = $this->blotterRecord->appointment_date
            ? \Carbon\Carbon::parse($this->blotterRecord->appointment_date)
            : null;
        $appointmentTime = $this->blotterRecord->appointment_time
            ? \Carbon\Carbon::parse($this->blotterRecord->appointment_time)->format('g:i A')
            : null;
        
        $dateStr = $appointmentDate ? $appointmentDate->format('F j, Y') : 'N/A';
        $timeStr = $appointmentTime ? $appointmentTime : 'N/A';
        
        $actionUrl = config('app.frontend_url', config('app.url', 'http://localhost:5173')) . '/residents/blotter-records';
        
        return (new MailMessage)
            ->subject('📅 Walk-in Appointment Scheduled - Case ' . ($this->blotterRecord->case_number ?? '#' . $this->blotterRecord->id))
            ->greeting('Hello ' . ($this->blotterRecord->complainant_name ?? 'Resident') . '!')
            ->line('Your walk-in appointment has been successfully scheduled.')
            ->line('**Case Number:** ' . ($this->blotterRecord->case_number ?? '#' . $this->blotterRecord->id))
            ->line('**Appointment Date:** ' . $dateStr)
            ->line('**Appointment Time:** ' . $timeStr)
            ->line('**Complaint Type:** ' . ($this->blotterRecord->complaint_type ?? 'N/A'))
            ->line('Please arrive at the Barangay Hall on time for your appointment. Bring a valid ID and any supporting documents related to your case.')
            ->action('View Appointment Details', $actionUrl)
            ->line('If you have any questions or need to reschedule, please contact the barangay office.')
            ->salutation('Thank you for using our services.');
    }

    public function toArray($notifiable)
    {
        $appointmentDate = $this->blotterRecord->appointment_date
            ? \Carbon\Carbon::parse($this->blotterRecord->appointment_date)
            : null;
        $appointmentTime = $this->blotterRecord->appointment_time
            ? \Carbon\Carbon::parse($this->blotterRecord->appointment_time)->format('g:i A')
            : null;
        
        $dateStr = $appointmentDate ? $appointmentDate->format('F j, Y') : null;
        $timeStr = $appointmentTime ? $appointmentTime : null;
        
        return [
            'message' => 'Your walk-in appointment has been scheduled for ' . $dateStr . ' at ' . $timeStr,
            'blotter_record_id' => $this->blotterRecord->id,
            'case_number' => $this->blotterRecord->case_number ?? '#' . $this->blotterRecord->id,
            'status' => 'scheduled',
            'appointment_date' => $dateStr,
            'appointment_time' => $timeStr,
            'complaint_type' => $this->blotterRecord->complaint_type ?? 'N/A',
            'type' => 'walk_in_appointment_scheduled',
        ];
    }
}

