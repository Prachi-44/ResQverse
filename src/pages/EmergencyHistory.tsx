import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/Button';
import { 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Copy, 
  Clock,
  History,
  Navigation
} from 'lucide-react';

export const EmergencyHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const { userHistory, fetchUserHistory, loadingEmergencies } = useEmergency();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync history
  useEffect(() => {
    fetchUserHistory();
  }, [currentUser]);

  const handleCopyHistoryLocation = (id: string, lat: number, lng: number, link: string) => {
    const text = `ResQVerse Incident Log:
ID: ${id}
Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
Link: ${link}`;

    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Incident telemetry details copied.', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 guardian-mesh-bg text-slate-800 dark:text-white transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6 animate-slide-in">
        
        {/* Header Block */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 text-left">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <History className="w-7 h-7 text-sky-500" />
            {t('logsTitle')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            {t('logsDesc')}
          </p>
        </div>

        {/* Content list */}
        {loadingEmergencies ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Loading Incident Feed...</p>
          </div>
        ) : userHistory && userHistory.length > 0 ? (
          <div className="space-y-4">
            {userHistory.map((record) => {
              const dateStr = new Date(record.timestamp).toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              });
              const timeStr = new Date(record.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', minute: '2-digit', second: '2-digit' 
              });
              const isEmergency = record.status === 'Emergency';

              return (
                <div 
                  key={record.emergencyId}
                  className={`glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left transition-all duration-300 ${
                    isEmergency 
                      ? 'border-red-500/30 bg-red-500/5 shadow-[0_2px_15px_rgba(239,68,68,0.06)]' 
                      : 'hover:border-slate-350 dark:hover:border-slate-700/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Status icon badge */}
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                      isEmergency 
                        ? 'bg-red-500/10 text-red-550 dark:text-red-500 border-red-500/20 animate-pulse' 
                        : 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'
                    }`}>
                      {isEmergency ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      {/* Date / Time */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{dateStr}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 animate-pulse-slow" />
                          {timeStr}
                        </span>
                        {record.category && (
                          <>
                            <span className="text-[10px] text-slate-400 dark:text-slate-400">•</span>
                            <span className="text-[9px] font-black uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 px-1.5 py-0.2 rounded font-sans">
                              {t(record.category.toLowerCase())}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Coordinates */}
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs font-mono">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{t('gpsCoordinates')}: <strong className="text-slate-800 dark:text-slate-300">{record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}</strong></span>
                      </div>

                      {/* ID */}
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">{t('telemetryId')}: {record.emergencyId}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border md:block hidden font-sans ${
                      isEmergency 
                        ? 'bg-red-500/10 text-red-550 dark:text-red-500 border-red-500/20 animate-pulse' 
                        : 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'
                    }`}>
                      {isEmergency ? t('activeEmergency') : t('statusSafe')}
                    </span>

                    <Button 
                      variant="primary" 
                      size="sm" 
                      fullWidth
                      onClick={() => window.open(record.googleMapsLink, '_blank', 'noopener,noreferrer')}
                      className="flex-1 md:flex-initial"
                    >
                      <Navigation className="w-4 h-4 mr-1.5" />
                      {t('mapsLink')}
                    </Button>
                    
                    <Button 
                      variant="glass" 
                      size="sm"
                      onClick={() => handleCopyHistoryLocation(record.emergencyId, record.latitude, record.longitude, record.googleMapsLink)}
                      className="border-slate-300 dark:border-slate-800/80 hover:border-sky-500/30 w-10 h-9 flex items-center justify-center"
                    >
                      {copiedId === record.emergencyId ? (
                        <span className="text-[10px] text-green-600 dark:text-green-405 font-black">✓</span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-16 text-center rounded-3xl border-slate-200 dark:border-slate-800 animate-slide-in">
            <History className="w-12 h-12 text-slate-400 dark:text-slate-550 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">{t('emptyLogs')}</p>
          </div>
        )}

      </div>
    </div>
  );
};
