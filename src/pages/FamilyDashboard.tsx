import React, { useState } from 'react';
import { useEmergency } from '../context/EmergencyContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/Button';
import { 
  ShieldCheck, 
  MapPin, 
  Copy, 
  Search,
  Calendar,
  Navigation
} from 'lucide-react';

export const FamilyDashboard: React.FC = () => {
  const { emergencies, loadingEmergencies } = useEmergency();
  const { showToast } = useToast();
  const { t } = useLanguage();
  
  const [filter, setFilter] = useState<'all' | 'emergency' | 'safe'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopyLocation = (name: string, lat: number, lng: number, link: string) => {
    const text = `ResQVerse Dispatch Telemetry:
Guardian Node: ${name}
Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}
Link: ${link}`;
    
    navigator.clipboard.writeText(text);
    showToast(`Telemetry coordinates for ${name} copied.`, 'success');
  };

  const filteredEmergencies = emergencies.filter(item => {
    // Status Filter
    if (filter === 'emergency' && item.status !== 'Emergency') return false;
    if (filter === 'safe' && item.status !== 'Safe') return false;
    
    // Search Query (Search User Name)
    if (searchQuery && !item.userName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 guardian-mesh-bg text-slate-800 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-slide-in">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {t('feedTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('feedDesc')}
            </p>
          </div>

          {/* Real-time Indicator */}
          <div className="inline-flex items-center gap-2 bg-sky-500/10 px-3.5 py-1.5 rounded-full border border-sky-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 anonymous-ping animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
              {t('liveListener')}
            </span>
          </div>
        </div>

        {/* Controls Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search bar */}
          <div className="md:col-span-2 relative flex items-center">
            <div className="absolute left-3 text-slate-400 dark:text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-10 pr-4 py-3 rounded-2xl text-sm font-sans"
            />
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center justify-between gap-1.5 p-1 bg-white/50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 text-center py-2 px-1 rounded-xl text-xs font-semibold select-none transition-all cursor-pointer ${
                filter === 'all' 
                  ? 'bg-sky-600 text-white shadow' 
                  : 'text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {t('filterAll')}
            </button>
            <button
              onClick={() => setFilter('emergency')}
              className={`flex-1 text-center py-2 px-1 rounded-xl text-xs font-semibold select-none transition-all flex items-center justify-center gap-1 cursor-pointer ${
                filter === 'emergency' 
                  ? 'bg-red-600 text-white shadow' 
                  : 'text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-450'
              }`}
            >
              {t('filterActive')}
            </button>
            <button
              onClick={() => setFilter('safe')}
              className={`flex-1 text-center py-2 px-1 rounded-xl text-xs font-semibold select-none transition-all flex items-center justify-center gap-1 cursor-pointer ${
                filter === 'safe' 
                  ? 'bg-green-600 text-white shadow' 
                  : 'text-slate-500 hover:text-green-500 dark:text-slate-400 dark:hover:text-green-450'
              }`}
            >
              {t('filterSafe')}
            </button>
          </div>

        </div>

        {/* Content Grid */}
        {loadingEmergencies ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Syncing database feed...</p>
          </div>
        ) : filteredEmergencies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {filteredEmergencies.map((item) => {
              const dateStr = new Date(item.timestamp).toLocaleDateString();
              const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isEmergency = item.status === 'Emergency';

              return (
                <div 
                  key={item.emergencyId} 
                  className={`glass-panel p-6 rounded-3xl text-left transition-all duration-300 relative ${
                    isEmergency 
                      ? 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10 shadow-[0_4px_20px_rgba(239,68,68,0.06)]' 
                      : 'hover:border-sky-550/20 dark:hover:border-slate-600/30'
                  }`}
                >
                  {/* Status glow border */}
                  {isEmergency && (
                    <div className="absolute inset-0 rounded-3xl border border-red-500/25 animate-pulse pointer-events-none"></div>
                  )}

                  {/* Header info */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(item.userName)}`}
                          alt={item.userName}
                          className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700/50"
                        />
                        {isEmergency && (
                          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-sans">
                          {item.userName}
                          {item.category && (
                            <span className="text-[9px] font-black uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 px-1.5 py-0.2 rounded font-sans">
                              {t(item.category.toLowerCase())}
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-405 font-sans">Node ID: {item.userId.substring(0, 10)}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex font-black uppercase text-[9px] px-2 py-0.5 rounded border font-sans ${
                      isEmergency 
                        ? 'bg-red-500/10 text-red-550 dark:text-red-500 border-red-500/20 animate-pulse' 
                        : 'bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20'
                    }`}>
                      {isEmergency ? t('activeEmergency') : t('statusSafe')}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-xs mb-5 font-sans">
                    {/* Date / Time */}
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{t('dateAndTime')}</span>
                      </div>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{dateStr} at {timeStr}</span>
                    </div>

                    {/* Coordinates */}
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{t('gpsCoordinates')}</span>
                      </div>
                      <span className="text-slate-800 dark:text-slate-200 font-mono">{item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}</span>
                    </div>
                  </div>

                  {/* Card Action Controls */}
                  <div className="flex gap-2">
                    <Button 
                      variant={isEmergency ? 'danger' : 'primary'} 
                      size="sm" 
                      fullWidth
                      onClick={() => window.open(item.googleMapsLink, '_blank', 'noopener,noreferrer')}
                      className="flex-1"
                    >
                      <Navigation className="w-3.5 h-3.5 mr-1" />
                      {t('mapsTelemetry')}
                    </Button>
                    
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => handleCopyLocation(item.userName, item.latitude, item.longitude, item.googleMapsLink)}
                      className="border-slate-300 dark:border-slate-700/50 hover:border-sky-500"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                </div>
              );
            })}

          </div>
        ) : (
          <div className="glass-panel p-16 text-center rounded-3xl border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">{t('noReports')}</p>
            <p className="text-xs text-slate-500 mt-1">Filters: Status ({filter}), Search ("{searchQuery}")</p>
          </div>
        )}

      </div>
    </div>
  );
};
