// Mock Database & Authentication System for ResQVerse
// Backed by localStorage to persist user profiles, active emergencies, and emergency history.

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  contacts: { name: string; phone: string; relation: string }[];
  profilePhoto?: string;
  passwordHash?: string; // SHA-256 hash of password
}

export interface EmergencyRecord {
  emergencyId: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  googleMapsLink: string;
  timestamp: number;
  status: 'Emergency' | 'Safe';
  category?: string;
  voiceMessageId?: string; // Reference to stored voice message
}

export interface VoiceMessage {
  id: string;
  emergencyId: string;
  userId: string;
  audioDataUrl: string; // base64 data URL of the audio
  mimeType: string;
  durationMs: number;
  timestamp: number;
  sizeBytes: number;
}

export interface SOSNotification {
  id: string;
  emergencyId: string;
  guardianName: string;
  guardianPhone: string;
  type: 'sms' | 'push' | 'voice';
  status: 'sent' | 'failed' | 'pending';
  timestamp: number;
  errorMessage?: string;
}

type AuthCallback = (user: UserProfile | null) => void;
type EmergencyCallback = (emergencies: EmergencyRecord[]) => void;

// Simple SHA-256 hash using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

class MockDatabase {
  private usersKey = 'resqverse_users';
  private currentSessionKey = 'resqverse_session';
  private emergenciesKey = 'resqverse_emergencies';
  private voiceMessagesKey = 'resqverse_voice_messages';
  private sosNotificationsKey = 'resqverse_sos_notifications';

  private authListeners: AuthCallback[] = [];
  private emergencyListeners: EmergencyCallback[] = [];

  constructor() {
    // Initialize empty tables if not present in localStorage
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.voiceMessagesKey)) {
      localStorage.setItem(this.voiceMessagesKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.sosNotificationsKey)) {
      localStorage.setItem(this.sosNotificationsKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.emergenciesKey)) {
      // Add a couple of initial mock active emergencies for demo styling
      const initialEmergencies: EmergencyRecord[] = [
        {
          emergencyId: 'mock-sos-1',
          userId: 'mock-user-john',
          userName: 'John Doe',
          latitude: 37.7749,
          longitude: -122.4194,
          googleMapsLink: 'https://www.google.com/maps?q=37.7749,-122.4194',
          timestamp: Date.now() - 3600000 * 2, // 2 hours ago
          status: 'Safe',
        },
        {
          emergencyId: 'mock-sos-2',
          userId: 'mock-user-sarah',
          userName: 'Sarah Jenkins',
          latitude: 40.7128,
          longitude: -74.0060,
          googleMapsLink: 'https://www.google.com/maps?q=40.7128,-74.0060',
          timestamp: Date.now() - 1800000, // 30 mins ago
          status: 'Emergency',
        }
      ];
      localStorage.setItem(this.emergenciesKey, JSON.stringify(initialEmergencies));
    }
  }

  // --- AUTH METHODS ---

  getUsers(): UserProfile[] {
    return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
  }

  async register(
    email: string,
    password: string,
    name: string,
    phone: string,
    bloodGroup: string,
    contacts: UserProfile['contacts']
  ): Promise<UserProfile> {
    const users = this.getUsers();
    
    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email is already registered.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const uid = 'user_' + Math.random().toString(36).substr(2, 9);
    const passwordHash = await hashPassword(password);
    // Profile photo placeholder
    const profilePhoto = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    
    const newUser: UserProfile = {
      uid,
      name,
      email,
      phone,
      bloodGroup,
      contacts,
      profilePhoto,
      passwordHash
    };

    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    
    // Store user login state
    localStorage.setItem(this.currentSessionKey, uid);
    console.log(`[ResQVerse DB] User registered: ${email} (uid: ${uid}) with ${contacts.length} guardians`);
    this.notifyAuthChange(newUser);
    return newUser;
  }

  async login(email: string, password: string): Promise<UserProfile> {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.warn(`[ResQVerse DB] Login failed: no user found for email ${email}`);
      throw new Error('User not found. Please register first.');
    }

    // Verify password
    if (user.passwordHash) {
      if (!password) {
        throw new Error('Password is required.');
      }
      const inputHash = await hashPassword(password);
      if (inputHash !== user.passwordHash) {
        console.warn(`[ResQVerse DB] Login failed: incorrect password for ${email}`);
        throw new Error('Incorrect password. Please try again.');
      }
    }
    // If user has no passwordHash (legacy data), allow login for backward compatibility
    // but log a warning
    if (!user.passwordHash) {
      console.warn(`[ResQVerse DB] User ${email} has no stored password hash (legacy account). Allowing login.`);
    }

    localStorage.setItem(this.currentSessionKey, user.uid);
    console.log(`[ResQVerse DB] User logged in: ${email} (uid: ${user.uid})`);
    this.notifyAuthChange(user);
    return user;
  }

  logout() {
    const currentUser = this.getCurrentUser();
    console.log(`[ResQVerse DB] User logged out: ${currentUser?.email || 'unknown'}`);
    localStorage.removeItem(this.currentSessionKey);
    this.notifyAuthChange(null);
  }

  getCurrentUser(): UserProfile | null {
    const sessionUid = localStorage.getItem(this.currentSessionKey);
    if (!sessionUid) return null;
    
    const users = this.getUsers();
    return users.find(u => u.uid === sessionUid) || null;
  }

  updateProfile(uid: string, updatedData: Partial<UserProfile>): UserProfile {
    const users = this.getUsers();
    const index = users.findIndex(u => u.uid === uid);
    
    if (index === -1) {
      throw new Error('User profile not found.');
    }

    // Don't allow overwriting passwordHash via profile update
    const { passwordHash: _, ...safeData } = updatedData;
    const updatedUser = { ...users[index], ...safeData };
    users[index] = updatedUser;
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    
    console.log(`[ResQVerse DB] Profile updated for uid: ${uid}`);
    this.notifyAuthChange(updatedUser);
    return updatedUser;
  }

  onAuthStateChanged(callback: AuthCallback): () => void {
    this.authListeners.push(callback);
    // Trigger immediately
    callback(this.getCurrentUser());
    
    // Return unsubscribe function
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  private notifyAuthChange(user: UserProfile | null) {
    this.authListeners.forEach(callback => callback(user));
  }

  // --- FIRESTORE EMERGENCY METHODS ---

  getEmergencies(): EmergencyRecord[] {
    return JSON.parse(localStorage.getItem(this.emergenciesKey) || '[]');
  }

  triggerSOS(userId: string, userName: string, lat: number, lng: number, category?: string, voiceMessageId?: string): EmergencyRecord {
    const emergencies = this.getEmergencies();
    const emergencyId = 'sos_' + Math.random().toString(36).substr(2, 9);
    
    const newRecord: EmergencyRecord = {
      emergencyId,
      userId,
      userName,
      latitude: lat,
      longitude: lng,
      googleMapsLink: `https://www.google.com/maps?q=${lat},${lng}`,
      timestamp: Date.now(),
      status: 'Emergency',
      category: category || 'General distress',
      voiceMessageId
    };

    emergencies.unshift(newRecord); // Put newest first
    localStorage.setItem(this.emergenciesKey, JSON.stringify(emergencies));
    console.log(`[ResQVerse DB] SOS triggered: ${emergencyId} by ${userName} (${category}) at ${lat},${lng}`);
    this.notifyEmergencyChange(emergencies);
    return newRecord;
  }

  resolveEmergency(emergencyId: string): EmergencyRecord {
    const emergencies = this.getEmergencies();
    const index = emergencies.findIndex(e => e.emergencyId === emergencyId);
    
    if (index === -1) {
      throw new Error('Emergency record not found.');
    }

    const updatedRecord: EmergencyRecord = {
      ...emergencies[index],
      status: 'Safe'
    };
    
    emergencies[index] = updatedRecord;
    localStorage.setItem(this.emergenciesKey, JSON.stringify(emergencies));
    console.log(`[ResQVerse DB] Emergency resolved: ${emergencyId}`);
    this.notifyEmergencyChange(emergencies);
    return updatedRecord;
  }

  getUserHistory(userId: string): EmergencyRecord[] {
    const emergencies = this.getEmergencies();
    return emergencies.filter(e => e.userId === userId);
  }

  onEmergenciesSnapshot(callback: EmergencyCallback): () => void {
    this.emergencyListeners.push(callback);
    // Trigger immediately with current dataset
    callback(this.getEmergencies());
    
    // Return unsubscribe function
    return () => {
      this.emergencyListeners = this.emergencyListeners.filter(cb => cb !== callback);
    };
  }

  private notifyEmergencyChange(emergencies: EmergencyRecord[]) {
    this.emergencyListeners.forEach(callback => callback(emergencies));
  }

  // --- VOICE MESSAGE METHODS ---

  storeVoiceMessage(voiceMessage: VoiceMessage): void {
    // Validate file size (max 5MB)
    if (voiceMessage.sizeBytes > 5 * 1024 * 1024) {
      throw new Error('Voice message exceeds maximum size of 5MB.');
    }

    const messages = this.getVoiceMessages();
    messages.push(voiceMessage);
    try {
      localStorage.setItem(this.voiceMessagesKey, JSON.stringify(messages));
      console.log(`[ResQVerse DB] Voice message stored: ${voiceMessage.id} for SOS ${voiceMessage.emergencyId} (${voiceMessage.sizeBytes} bytes)`);
    } catch (e) {
      // localStorage quota exceeded — remove oldest voice messages and retry
      console.warn('[ResQVerse DB] localStorage quota exceeded, cleaning old voice messages...');
      const trimmed = messages.slice(-5); // keep last 5
      localStorage.setItem(this.voiceMessagesKey, JSON.stringify(trimmed));
    }
  }

  getVoiceMessages(): VoiceMessage[] {
    return JSON.parse(localStorage.getItem(this.voiceMessagesKey) || '[]');
  }

  getVoiceMessageForSOS(emergencyId: string): VoiceMessage | null {
    const messages = this.getVoiceMessages();
    return messages.find(m => m.emergencyId === emergencyId) || null;
  }

  // --- SOS NOTIFICATION LOG METHODS ---

  logSOSNotification(notification: SOSNotification): void {
    const notifications = this.getSOSNotifications();
    notifications.push(notification);
    localStorage.setItem(this.sosNotificationsKey, JSON.stringify(notifications));
    console.log(`[ResQVerse DB] SOS notification logged: ${notification.type} to ${notification.guardianName} (${notification.guardianPhone}) — ${notification.status}`);
  }

  getSOSNotifications(): SOSNotification[] {
    return JSON.parse(localStorage.getItem(this.sosNotificationsKey) || '[]');
  }

  getSOSNotificationsForEmergency(emergencyId: string): SOSNotification[] {
    return this.getSOSNotifications().filter(n => n.emergencyId === emergencyId);
  }
}

export const mockDb = new MockDatabase();
