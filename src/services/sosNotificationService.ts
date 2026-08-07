// SOS Notification Service for ResQVerse
// Handles multi-guardian SMS dispatch, push notifications, voice recording, and emergency alerts.

import { mockDb, type UserProfile, type EmergencyRecord, type VoiceMessage } from './mockDb';

// ============================================================
// VOICE RECORDING
// ============================================================

let mediaRecorder: MediaRecorder | null = null;
let audioChunks: Blob[] = [];
let recordingStartTime = 0;

/**
 * Start recording voice from the microphone.
 * Returns a Promise that resolves when recording has started.
 */
export async function startVoiceRecording(): Promise<void> {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    console.warn('[SOS Service] Already recording voice.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { 
        echoCancellation: true, 
        noiseSuppression: true,
        sampleRate: 44100 
      } 
    });

    // Determine supported MIME type
    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

    mediaRecorder = new MediaRecorder(stream, { mimeType });
    audioChunks = [];
    recordingStartTime = Date.now();

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start(250); // Collect data every 250ms
    console.log(`[SOS Service] Voice recording started (${mimeType})`);
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      throw new Error('Microphone access denied. Please grant microphone permission.');
    }
    throw new Error(`Failed to start voice recording: ${err.message}`);
  }
}

/**
 * Stop voice recording and return the audio as a Blob.
 */
export function stopVoiceRecording(): Promise<{ blob: Blob; durationMs: number; mimeType: string }> {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      reject(new Error('No active voice recording to stop.'));
      return;
    }

    const mimeType = mediaRecorder.mimeType;
    const durationMs = Date.now() - recordingStartTime;

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: mimeType });
      audioChunks = [];

      // Stop all tracks on the stream to release microphone
      if (mediaRecorder?.stream) {
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
      mediaRecorder = null;

      console.log(`[SOS Service] Voice recording stopped: ${blob.size} bytes, ${durationMs}ms`);
      resolve({ blob, durationMs, mimeType });
    };

    mediaRecorder.onerror = (event: any) => {
      reject(new Error(`Recording error: ${event.error?.message || 'Unknown error'}`));
    };

    mediaRecorder.stop();
  });
}

/**
 * Check if currently recording.
 */
export function isVoiceRecording(): boolean {
  return mediaRecorder !== null && mediaRecorder.state === 'recording';
}

/**
 * Convert Blob to base64 data URL for localStorage storage.
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ============================================================
// MULTI-GUARDIAN SMS DISPATCH
// ============================================================

interface SMSDispatchResult {
  guardianName: string;
  guardianPhone: string;
  status: 'sent' | 'failed';
  error?: string;
}

/**
 * Generate SMS links for ALL guardians and open them.
 * On mobile devices, this creates sms: links. On desktop, it logs the intent.
 * Returns per-guardian dispatch results.
 */
export function sendSOSTextToAllGuardians(
  contacts: UserProfile['contacts'],
  emergency: EmergencyRecord,
  userName: string
): SMSDispatchResult[] {
  const results: SMSDispatchResult[] = [];
  
  const messageBody = `🚨 RESQVERSE EMERGENCY SOS 🚨\n\nGuardian: ${userName}\nDistress: ${emergency.category || 'General'}\nStatus: ACTIVE EMERGENCY\nLocation: ${emergency.googleMapsLink}\nCoordinates: ${emergency.latitude.toFixed(6)}, ${emergency.longitude.toFixed(6)}\nTime: ${new Date(emergency.timestamp).toLocaleString()}\n\nPlease respond immediately!`;
  
  for (const contact of contacts) {
    if (!contact.phone || contact.phone.trim() === '') {
      console.warn(`[SOS Service] Skipping guardian "${contact.name}" — no phone number`);
      results.push({
        guardianName: contact.name,
        guardianPhone: contact.phone || 'N/A',
        status: 'failed',
        error: 'No phone number configured'
      });

      // Log notification failure
      mockDb.logSOSNotification({
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        emergencyId: emergency.emergencyId,
        guardianName: contact.name,
        guardianPhone: contact.phone || 'N/A',
        type: 'sms',
        status: 'failed',
        timestamp: Date.now(),
        errorMessage: 'No phone number configured'
      });
      continue;
    }

    try {
      const encodedBody = encodeURIComponent(messageBody);
      const smsLink = `sms:${contact.phone}?body=${encodedBody}`;
      
      // Open SMS link (works on mobile/devices with SMS client)
      window.open(smsLink, '_blank');
      
      console.log(`[SOS Service] SMS dispatched to ${contact.name} (${contact.phone})`);
      results.push({
        guardianName: contact.name,
        guardianPhone: contact.phone,
        status: 'sent',
      });

      // Log successful notification
      mockDb.logSOSNotification({
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        emergencyId: emergency.emergencyId,
        guardianName: contact.name,
        guardianPhone: contact.phone,
        type: 'sms',
        status: 'sent',
        timestamp: Date.now()
      });
    } catch (err: any) {
      console.error(`[SOS Service] SMS dispatch failed for ${contact.name}:`, err);
      results.push({
        guardianName: contact.name,
        guardianPhone: contact.phone,
        status: 'failed',
        error: err.message
      });

      mockDb.logSOSNotification({
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        emergencyId: emergency.emergencyId,
        guardianName: contact.name,
        guardianPhone: contact.phone,
        type: 'sms',
        status: 'failed',
        timestamp: Date.now(),
        errorMessage: err.message
      });
    }
  }

  return results;
}

// ============================================================
// EMERGENCY PUSH NOTIFICATION WITH VIBRATION
// ============================================================

/**
 * Request notification permission from the browser.
 * Returns the permission state.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('[SOS Service] Notification API not supported in this browser.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    console.log(`[SOS Service] Notification permission: ${permission}`);
    return permission;
  }

  return Notification.permission;
}

/**
 * Trigger emergency vibration pattern on the device.
 * Uses the Vibration API (supported on most Android browsers and some desktop browsers).
 */
export function triggerEmergencyVibration(): boolean {
  if (!('vibrate' in navigator)) {
    console.warn('[SOS Service] Vibration API not supported on this device/browser.');
    return false;
  }

  try {
    // Emergency SOS vibration pattern: long-short-long-short-long (urgent pulse)
    // [vibrate, pause, vibrate, pause, vibrate, pause, vibrate, pause, vibrate]
    const emergencyPattern = [
      500, 200, 500, 200, 500, 200, // Three long pulses
      100, 100, 100, 100, 100, 100, // Rapid short pulses
      500, 200, 500, 200, 500       // Three more long pulses
    ];
    navigator.vibrate(emergencyPattern);
    console.log('[SOS Service] Emergency vibration pattern triggered.');
    return true;
  } catch (err) {
    console.warn('[SOS Service] Vibration failed:', err);
    return false;
  }
}

/**
 * Send emergency push notifications to all guardians.
 * In a real production app, this would use FCM/APNs. 
 * In this PWA, we use the Notification API + Vibration API for the current device,
 * and log the intended notifications for each guardian.
 */
export async function sendEmergencyPushToAllGuardians(
  contacts: UserProfile['contacts'],
  emergency: EmergencyRecord,
  userName: string
): Promise<{ notified: number; failed: number; vibrated: boolean; permissionDenied: boolean }> {
  let notified = 0;
  let failed = 0;
  let permissionDenied = false;

  // Request notification permission
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.warn('[SOS Service] Notification permission not granted. Logging notifications only.');
    permissionDenied = true;
  }

  // Trigger vibration on the current device (for demo)
  const vibrated = triggerEmergencyVibration();

  // Fire a local notification (for the current device — simulating what guardians would receive)
  if (permission === 'granted') {
    try {
      const notification = new Notification('🚨 RESQVERSE EMERGENCY SOS', {
        body: `${userName} has triggered an emergency SOS!\nCategory: ${emergency.category || 'General'}\nLocation: ${emergency.latitude.toFixed(4)}, ${emergency.longitude.toFixed(4)}\n\nTap to view details.`,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `sos-${emergency.emergencyId}`,
        requireInteraction: true,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = '/sos-success';
        notification.close();
      };
    } catch (err) {
      console.warn('[SOS Service] Notification creation failed:', err);
    }
  }

  // Log push notification for each guardian
  for (const contact of contacts) {
    try {
      // In a production app, this would send to the guardian's push token via FCM/APNs.
      // Here we log the notification intent for each guardian.
      mockDb.logSOSNotification({
        id: 'notif_' + Math.random().toString(36).substr(2, 9),
        emergencyId: emergency.emergencyId,
        guardianName: contact.name,
        guardianPhone: contact.phone,
        type: 'push',
        status: permission === 'granted' ? 'sent' : 'failed',
        timestamp: Date.now(),
        errorMessage: permission !== 'granted' ? 'Notification permission denied' : undefined
      });

      if (permission === 'granted') {
        notified++;
      } else {
        failed++;
      }
    } catch (err: any) {
      console.error(`[SOS Service] Push notification logging failed for ${contact.name}:`, err);
      failed++;
    }
  }

  console.log(`[SOS Service] Push notifications: ${notified} notified, ${failed} failed, vibrated=${vibrated}`);
  return { notified, failed, vibrated, permissionDenied };
}

// ============================================================
// COMPLETE SOS PIPELINE
// ============================================================

export interface SOSPipelineResult {
  emergency: EmergencyRecord;
  smsResults: SMSDispatchResult[];
  pushResult: { notified: number; failed: number; vibrated: boolean; permissionDenied: boolean };
  voiceMessageStored: boolean;
  voiceMessageId?: string;
}

/**
 * Execute the complete SOS notification pipeline:
 * 1. Store voice message (if provided)
 * 2. Send SMS to ALL guardians
 * 3. Send push notifications to ALL guardians
 * 4. Trigger device vibration
 * 5. Return comprehensive results
 * 
 * Each step is independent — one failure does not block others.
 */
export async function executeSOSPipeline(
  emergency: EmergencyRecord,
  user: UserProfile,
  voiceBlob?: Blob,
  voiceMimeType?: string,
  voiceDurationMs?: number
): Promise<SOSPipelineResult> {
  console.log(`[SOS Service] Executing SOS pipeline for emergency ${emergency.emergencyId}`);
  console.log(`[SOS Service] User: ${user.name}, Guardians: ${user.contacts.length}`);

  let voiceMessageStored = false;
  let voiceMessageId: string | undefined;

  // Step 1: Store voice message if provided
  if (voiceBlob && voiceBlob.size > 0) {
    try {
      const dataUrl = await blobToDataUrl(voiceBlob);
      voiceMessageId = 'voice_' + Math.random().toString(36).substr(2, 9);
      
      const voiceMessage: VoiceMessage = {
        id: voiceMessageId,
        emergencyId: emergency.emergencyId,
        userId: user.uid,
        audioDataUrl: dataUrl,
        mimeType: voiceMimeType || 'audio/webm',
        durationMs: voiceDurationMs || 0,
        timestamp: Date.now(),
        sizeBytes: voiceBlob.size
      };

      mockDb.storeVoiceMessage(voiceMessage);
      voiceMessageStored = true;
      console.log(`[SOS Service] Voice message stored: ${voiceMessageId} (${voiceBlob.size} bytes)`);

      // Log voice delivery for each guardian
      for (const contact of user.contacts) {
        mockDb.logSOSNotification({
          id: 'notif_' + Math.random().toString(36).substr(2, 9),
          emergencyId: emergency.emergencyId,
          guardianName: contact.name,
          guardianPhone: contact.phone,
          type: 'voice',
          status: 'sent',
          timestamp: Date.now()
        });
      }
    } catch (err: any) {
      console.error('[SOS Service] Voice message storage failed:', err);
      voiceMessageStored = false;
    }
  }

  // Step 2: Send SMS to ALL guardians (independent of voice)
  let smsResults: SMSDispatchResult[] = [];
  try {
    smsResults = sendSOSTextToAllGuardians(user.contacts, emergency, user.name);
  } catch (err: any) {
    console.error('[SOS Service] SMS dispatch pipeline error:', err);
  }

  // Step 3: Send push notifications to ALL guardians (independent of SMS)
  let pushResult = { notified: 0, failed: 0, vibrated: false, permissionDenied: false };
  try {
    pushResult = await sendEmergencyPushToAllGuardians(user.contacts, emergency, user.name);
  } catch (err: any) {
    console.error('[SOS Service] Push notification pipeline error:', err);
  }

  const result: SOSPipelineResult = {
    emergency,
    smsResults,
    pushResult,
    voiceMessageStored,
    voiceMessageId
  };

  console.log('[SOS Service] Pipeline complete:', {
    emergencyId: emergency.emergencyId,
    smsDispatched: smsResults.filter(r => r.status === 'sent').length,
    smsFailed: smsResults.filter(r => r.status === 'failed').length,
    pushNotified: pushResult.notified,
    pushFailed: pushResult.failed,
    vibrated: pushResult.vibrated,
    voiceStored: voiceMessageStored
  });

  return result;
}
