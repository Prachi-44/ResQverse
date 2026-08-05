import React, { createContext, useContext, useEffect, useState } from 'react';
import { isMockEnabled, db } from '../services/firebase';
import { mockDb, type EmergencyRecord } from '../services/mockDb';
import { useAuth } from './AuthContext';
import { executeSOSPipeline, type SOSPipelineResult } from '../services/sosNotificationService';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  getDocs,
  where 
} from 'firebase/firestore';

interface EmergencyContextType {
  emergencies: EmergencyRecord[];
  userHistory: EmergencyRecord[];
  activeEmergency: EmergencyRecord | null;
  triggerSOS: (category?: string, voiceBlob?: Blob, voiceMimeType?: string, voiceDurationMs?: number) => Promise<SOSPipelineResult>;
  markSafe: (emergencyId: string) => Promise<void>;
  fetchUserHistory: () => Promise<void>;
  loadingEmergencies: boolean;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [emergencies, setEmergencies] = useState<EmergencyRecord[]>([]);
  const [userHistory, setUserHistory] = useState<EmergencyRecord[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyRecord | null>(null);
  const [loadingEmergencies, setLoadingEmergencies] = useState(true);

  // Real-time listener for ALL emergencies (Family Dashboard)
  useEffect(() => {
    setLoadingEmergencies(true);
    if (isMockEnabled) {
      const unsubscribe = mockDb.onEmergenciesSnapshot((records) => {
        setEmergencies(records);
        setLoadingEmergencies(false);
      });
      return unsubscribe;
    } else {
      const q = query(collection(db, 'emergencies'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const records: EmergencyRecord[] = [];
        snapshot.forEach((doc) => {
          records.push({
            emergencyId: doc.id,
            ...doc.data()
          } as EmergencyRecord);
        });
        setEmergencies(records);
        setLoadingEmergencies(false);
      }, (error) => {
        console.error("Firestore subscription error:", error);
        setLoadingEmergencies(false);
      });
      return unsubscribe;
    }
  }, []);

  // Update active emergency state based on current user and lists
  useEffect(() => {
    if (currentUser) {
      const active = emergencies.find(e => e.userId === currentUser.uid && e.status === 'Emergency');
      setActiveEmergency(active || null);
    } else {
      setActiveEmergency(null);
    }
  }, [emergencies, currentUser]);

  // Fetch history for the current user
  const fetchUserHistory = async () => {
    if (!currentUser) return;
    try {
      if (isMockEnabled) {
        const history = mockDb.getUserHistory(currentUser.uid);
        setUserHistory(history);
      } else {
        const q = query(
          collection(db, 'emergencies'), 
          where('userId', '==', currentUser.uid),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const history: EmergencyRecord[] = [];
        querySnapshot.forEach((doc) => {
          history.push({
            emergencyId: doc.id,
            ...doc.data()
          } as EmergencyRecord);
        });
        setUserHistory(history);
      }
    } catch (error) {
      console.error('Error fetching user emergency history:', error);
    }
  };

  // Helper to get browser geolocation coordinates with a fallback
  const getGeoLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported by browser. Using demo coordinates.");
        resolve({ latitude: 37.7749, longitude: -122.4194 }); // Fallback to San Francisco
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Geolocation access denied or timed out. Using default demo coordinates.", error);
          // Fallback to random variation around San Francisco for visual effect
          const offsetLat = (Math.random() - 0.5) * 0.05;
          const offsetLng = (Math.random() - 0.5) * 0.05;
          resolve({ latitude: 37.7749 + offsetLat, longitude: -122.4194 + offsetLng });
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    });
  };

  // Trigger SOS handler — now executes the complete notification pipeline
  const triggerSOS = async (
    category?: string,
    voiceBlob?: Blob,
    voiceMimeType?: string,
    voiceDurationMs?: number
  ): Promise<SOSPipelineResult> => {
    if (!currentUser) throw new Error('User must be logged in to trigger SOS');

    // Get current GPS Location
    const { latitude, longitude } = await getGeoLocation();
    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const timestamp = Date.now();

    let record: EmergencyRecord;

    if (isMockEnabled) {
      record = mockDb.triggerSOS(currentUser.uid, currentUser.name, latitude, longitude, category);
    } else {
      const newEmergency = {
        userId: currentUser.uid,
        userName: currentUser.name,
        latitude,
        longitude,
        googleMapsLink,
        timestamp,
        status: 'Emergency' as const,
        category: category || 'General distress'
      };

      // Add to Firestore collection
      const docRef = await addDoc(collection(db, 'emergencies'), newEmergency);
      record = {
        emergencyId: docRef.id,
        ...newEmergency
      };
    }

    // Execute the complete SOS notification pipeline
    console.log(`[EmergencyContext] Executing SOS pipeline for ${record.emergencyId}...`);
    const pipelineResult = await executeSOSPipeline(
      record,
      currentUser,
      voiceBlob,
      voiceMimeType,
      voiceDurationMs
    );

    await fetchUserHistory();
    return pipelineResult;
  };

  // Mark user as SAFE (resolving the active emergency)
  const markSafe = async (emergencyId: string) => {
    try {
      if (isMockEnabled) {
        mockDb.resolveEmergency(emergencyId);
      } else {
        const docRef = doc(db, 'emergencies', emergencyId);
        await updateDoc(docRef, { status: 'Safe' });
      }
      await fetchUserHistory();
    } catch (error) {
      console.error('Error resolving emergency:', error);
      throw error;
    }
  };

  return (
    <EmergencyContext.Provider value={{
      emergencies,
      userHistory,
      activeEmergency,
      triggerSOS,
      markSafe,
      fetchUserHistory,
      loadingEmergencies
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
