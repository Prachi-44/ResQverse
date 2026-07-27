import React, { useEffect, useState } from 'react';
import { WifiOff, MessageSquare, Radio } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="w-full bg-red-600/90 text-white backdrop-blur-md px-4 py-2 border-b border-red-500/50 flex flex-col md:flex-row items-center justify-between gap-3 text-sm z-50 sticky top-0 transition-all duration-300">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-pulse text-red-100" />
        <span className="font-semibold text-red-50">Offline Mode Active: No internet detected.</span>
      </div>
      
      {/* Future Scope Integrations */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <span className="text-red-200">ResQVerse Backup Protocols:</span>
        <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full border border-white/10" title="Future Scope - SMS Integration">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>SMS Backup (Ready)</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full border border-white/10" title="Future Scope - Bluetooth Mesh Node Relay">
          <Radio className="w-3.5 h-3.5" />
          <span>Bluetooth Relay (Scanning)</span>
        </div>
        <span className="text-[10px] text-red-300 italic">(Future Scope - Simulated Offline Backup)</span>
      </div>
    </div>
  );
};
