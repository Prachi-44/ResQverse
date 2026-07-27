import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/Button';
import { 
  ShieldCheck, 
  MapPin, 
  Copy, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const SOSSuccess: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeEmergency, markSafe, fetchUserHistory, userHistory } = useEmergency();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch history to sync
  useEffect(() => {
    fetchUserHistory();
  }, [currentUser]);

  // Fallback to latest record if activeEmergency is resolved
  const record = activeEmergency || userHistory[0] || null;

  const handleCopyTelemetry = () => {
    if (!record) return;
    const details = `[ResQVerse Emergency SOS]
Guardian: ${currentUser?.name}
Location: ${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}
Google Maps: ${record.googleMapsLink}
Timestamp: ${new Date(record.timestamp).toLocaleString()}`;
    
    navigator.clipboard.writeText(details);
    setCopied(true);
    showToast('Emergency telemetry copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResolve = async () => {
    if (!record) return;
    setLoading(true);
    try {
      await markSafe(record.emergencyId);
      showToast('Emergency status resolved. Guardian mesh set to safe.', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast('Failed to resolve emergency.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!record) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-8 flex items-center justify-center guardian-mesh-bg text-white">
        <div className="glass-panel p-8 rounded-3xl text-center max-w-sm">
          <p className="text-slate-500 text-xs font-semibold mb-4">No active emergency telemetry detected.</p>
          <Link to="/dashboard">
            <Button variant="primary" fullWidth>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 guardian-mesh-bg text-slate-800 dark:text-white transition-colors duration-300 flex items-center justify-center">
      <div className="w-full max-w-xl glass-panel p-6 sm:p-8 rounded-3xl border-sky-500/20 text-center space-y-8 animate-float">
        
        {/* Pulsing Success Indicator */}
        <div className="relative inline-flex mb-2">
          <div className="absolute inset-0 rounded-full bg-sky-500/20 border-2 border-sky-500 animate-ping"></div>
          <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 border border-sky-500/30 flex items-center justify-center relative z-10">
            <ShieldAlert className="w-10 h-10 text-sky-600 dark:text-sky-400 animate-pulse text-glow" />
          </div>
        </div>

        {/* Header Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-glow text-sky-600 dark:text-sky-400">
            {t('alertSent')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            {t('alertSentDesc')}
          </p>
        </div>

        {/* Telemetry Grid */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-250 dark:border-slate-800/80 text-left space-y-4">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block border-b border-slate-200 dark:border-slate-800 pb-2">
            {t('activeTelemetry')}
          </span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold">{t('guardianName')}</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{record.userName}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold">{t('timestamp')}</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {new Date(record.timestamp).toLocaleDateString()} at {new Date(record.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold">{t('gpsCoordinates')}</p>
              <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold">{t('nodeStatus')}</p>
              <span className={`inline-flex font-black uppercase text-[10px] px-2 py-0.5 rounded mt-1 bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 animate-pulse`}>
                {record.status === 'Emergency' ? t('activeEmergency') : t('statusSafe')}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase font-bold">{t('distressType')}</p>
              <p className="font-bold text-sky-600 dark:text-sky-400 mt-0.5 uppercase">{t((record.category || 'General distress').toLowerCase())}</p>
            </div>
          </div>
        </div>

        {/* Action Button Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="primary" 
            fullWidth
            onClick={() => window.open(record.googleMapsLink, '_blank', 'noopener,noreferrer')}
            className="flex-1"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {t('mapsLink')}
          </Button>
          
          <Button 
            variant="glass" 
            onClick={handleCopyTelemetry}
            className="flex-1 border-slate-300 dark:border-slate-700 hover:border-sky-500/30"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? t('copyTelemetryDone') : t('copyTelemetry')}
          </Button>
        </div>

        {/* Resolution Control */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-left">
            <AlertTriangle className="w-5 h-5 text-yellow-500 animate-pulse" />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-xs leading-tight">
              {t('resolvedNotice')}
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            {record.status === 'Emergency' && (
              <Button variant="success" onClick={handleResolve} isLoading={loading} className="flex-1 sm:flex-initial">
                <ShieldCheck className="w-4.5 h-4.5 mr-1.5" />
                {t('safeButton')}
              </Button>
            )}
            <Link to="/dashboard" className="flex-1 sm:flex-initial">
              <Button variant="glass" fullWidth>
                {t('dashboard')}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
