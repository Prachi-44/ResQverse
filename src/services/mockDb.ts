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
}

type AuthCallback = (user: UserProfile | null) => void;
type EmergencyCallback = (emergencies: EmergencyRecord[]) => void;

class MockDatabase {
  private usersKey = 'resqverse_users';
  private currentSessionKey = 'resqverse_session';
  private emergenciesKey = 'resqverse_emergencies';

  private authListeners: AuthCallback[] = [];
  private emergencyListeners: EmergencyCallback[] = [];

  constructor() {
    // Initialize empty tables if not present in localStorage
    if (!localStorage.getItem(this.usersKey)) {
      localStorage.setItem(this.usersKey, JSON.stringify([]));
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

  register(email: string, name: string, phone: string, bloodGroup: string, contacts: UserProfile['contacts']): UserProfile {
    const users = this.getUsers();
    
    // Check if user already exists
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email is already registered.');
    }

    const uid = 'user_' + Math.random().toString(36).substr(2, 9);
    // Profile photo placeholder
    const profilePhoto = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
    
    const newUser: UserProfile = {
      uid,
      name,
      email,
      phone,
      bloodGroup,
      contacts,
      profilePhoto
    };

    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    
    // Store user login state (as email only for simple session lookup)
    localStorage.setItem(this.currentSessionKey, uid);
    this.notifyAuthChange(newUser);
    return newUser;
  }

  login(email: string): UserProfile {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found. Please register first.');
    }

    localStorage.setItem(this.currentSessionKey, user.uid);
    this.notifyAuthChange(user);
    return user;
  }

  logout() {
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

    const updatedUser = { ...users[index], ...updatedData };
    users[index] = updatedUser;
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    
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

  triggerSOS(userId: string, userName: string, lat: number, lng: number, category?: string): EmergencyRecord {
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
      category: category || 'General distress'
    };

    emergencies.unshift(newRecord); // Put newest first
    localStorage.setItem(this.emergenciesKey, JSON.stringify(emergencies));
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
}

export const mockDb = new MockDatabase();
