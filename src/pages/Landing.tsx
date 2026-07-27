import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Shield, 
  MapPin, 
  Users, 
  FileText, 
  Volume2, 
  Radio, 
  Building2,
  ChevronRight,
  Activity,
  Network,
  Globe
} from 'lucide-react';
import { Button } from '../components/Button';

export const Landing: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between guardian-mesh-bg text-slate-800 dark:text-white transition-colors duration-300 relative overflow-hidden font-sans w-full">
      
      {/* Background Glowing Network Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-[0.12] z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Left Cluster Connections */}
          <line x1="5%" y1="15%" x2="18%" y2="35%" className="stroke-sky-500/15 dark:stroke-sky-500/5" strokeWidth="1.5" />
          <line x1="18%" y1="35%" x2="10%" y2="55%" className="stroke-sky-500/15 dark:stroke-sky-500/5" strokeWidth="1.5" />
          <line x1="10%" y1="55%" x2="22%" y2="75%" className="stroke-sky-500/15 dark:stroke-sky-500/5" strokeWidth="1.5" />
          <line x1="5%" y1="15%" x2="10%" y2="55%" className="stroke-sky-500/15 dark:stroke-sky-500/5" strokeWidth="1.5" strokeDasharray="4 4" />
          
          {/* Right Cluster Connections */}
          <line x1="92%" y1="18%" x2="80%" y2="38%" className="stroke-sky-500/15 dark:stroke-sky-500/5" strokeWidth="1.5" />
          <line x1="80%" y1="38%" x2="88%" y2="58%" className="stroke-sky-500/15 dark:stroke-sky-500/5" strokeWidth="1.5" />
          <line x1="88%" y1="58%" x2="78%" y2="78%" className="stroke-sky-500/15 dark:stroke-sky-500/5" strokeWidth="1.5" />
          <line x1="92%" y1="18%" x2="88%" y2="58%" className="stroke-sky-500/15 dark:stroke-sky-500/5" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Left Cluster Nodes */}
          <circle cx="5%" cy="15%" r="5" className="fill-sky-500/40 dark:fill-sky-500/20 animate-pulse" />
          <circle cx="18%" cy="35%" r="7" className="fill-blue-500/40 dark:fill-blue-500/20" />
          <circle cx="10%" cy="55%" r="5" className="fill-sky-500/40 dark:fill-sky-500/20" />
          <circle cx="22%" cy="75%" r="8" className="fill-blue-600/40 dark:fill-blue-600/20 animate-pulse" />

          {/* Right Cluster Nodes */}
          <circle cx="92%" cy="18%" r="6" className="fill-sky-500/40 dark:fill-sky-500/20 animate-pulse" />
          <circle cx="80%" cy="38%" r="8" className="fill-blue-500/40 dark:fill-blue-500/20" />
          <circle cx="88%" cy="58%" r="5" className="fill-indigo-500/40 dark:fill-indigo-500/20 animate-pulse" />
          <circle cx="78%" cy="78%" r="7" className="fill-sky-400/40 dark:fill-sky-400/20" />
        </svg>
      </div>

      {/* Floating Ambient Light Rings */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-sky-400/10 dark:bg-sky-500/5 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-[20%] right-[5%] w-96 h-96 rounded-full bg-blue-400/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none z-0"></div>

      {/* Main Container Wrapper */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 flex-1 flex flex-col items-center justify-center">
        
        {/* Dynamic Glowing Pill Badge */}
        <div className="mb-6 inline-flex items-center gap-2 bg-sky-500/10 dark:bg-sky-500/5 px-4.5 py-2 rounded-full border border-sky-500/20 shadow-[0_2px_12px_rgba(14,165,233,0.06)] animate-pulse-slow">
          <Activity className="w-4 h-4 text-sky-500" />
          <span className="text-xs font-black uppercase tracking-widest text-sky-700 dark:text-sky-300">
            {t('systemOnline')}
          </span>
        </div>

        {/* Massive Headline and Brand Logo */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none mb-4">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 dark:from-white dark:via-sky-200 dark:to-slate-200 bg-clip-text text-transparent">ResQ</span>
            <span className="bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 bg-clip-text text-transparent text-glow">Verse</span>
          </h1>
          
          <p className="text-sm sm:text-lg font-black uppercase tracking-widest text-sky-600/80 dark:text-sky-400/80 mb-6 font-sans">
            The Next Generation Emergency Network
          </p>

          <p className="text-3xl sm:text-5xl font-black leading-tight text-slate-850 dark:text-slate-100 max-w-3xl mx-auto font-sans">
            {t('tagline')}
          </p>
          
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mt-6 leading-relaxed font-sans font-medium">
            A resilient communication framework linking emergency telemetry, real-time GPS relays, and automated distress signals offline.
          </p>
        </div>

        {/* Hero Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mb-20">
          {currentUser ? (
            <Link to="/dashboard" className="w-full">
              <Button variant="primary" size="lg" fullWidth className="group py-4 rounded-2xl shadow-lg shadow-sky-500/20 text-base">
                {t('accessDashboard')}
                <ChevronRight className="w-5 h-5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="flex-1">
                <Button variant="glass" size="lg" fullWidth className="py-4 rounded-2xl border-white/50 dark:border-white/10 text-base">
                  {t('logIn')}
                </Button>
              </Link>
              <Link to="/register" className="flex-1">
                <Button variant="primary" size="lg" fullWidth className="py-4 rounded-2xl shadow-lg shadow-sky-500/20 text-base">
                  {t('register')}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Features Section */}
        <div className="w-full mt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Network className="w-5 h-5 text-sky-500 animate-pulse" />
              {t('systemFeatures')}
            </h2>
            <span className="text-xs text-sky-655 dark:text-sky-400 font-extrabold uppercase tracking-wider hidden sm:inline">Active Telemetry Suite</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="glass-panel p-6.5 rounded-3xl text-left border-white/50 dark:border-white/5 hover:border-sky-500/50 hover:bg-white/60 dark:hover:bg-slate-900/40 transition-all duration-300 ease-out group hover:-translate-y-2 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-5 border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                <Shield className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white mb-2.5 font-sans text-lg sm:text-xl">{t('sosTitle')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                {t('sosDesc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6.5 rounded-3xl text-left border-white/50 dark:border-white/5 hover:border-sky-500/50 hover:bg-white/60 dark:hover:bg-slate-900/40 transition-all duration-300 ease-out group hover:-translate-y-2 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-5 border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                <MapPin className="w-5 h-5 text-sky-600 dark:text-sky-400 animate-pulse-slow" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white mb-2.5 font-sans text-lg sm:text-xl">{t('gpsTitle')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                {t('gpsDesc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6.5 rounded-3xl text-left border-white/50 dark:border-white/5 hover:border-sky-500/50 hover:bg-white/60 dark:hover:bg-slate-900/40 transition-all duration-300 ease-out group hover:-translate-y-2 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-5 border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white mb-2.5 font-sans text-lg sm:text-xl">{t('familyTitle')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                {t('familyDesc')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-6.5 rounded-3xl text-left border-white/50 dark:border-white/5 hover:border-sky-500/50 hover:bg-white/60 dark:hover:bg-slate-900/40 transition-all duration-300 ease-out group hover:-translate-y-2 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-5 border border-sky-500/20 group-hover:bg-sky-500/20 transition-colors">
                <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white mb-2.5 font-sans text-lg sm:text-xl">{t('historyTitle')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                {t('historyDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Future Scope Section */}
        <div className="w-full mt-20">
          <div className="pt-8">
            
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5">
                <Globe className="w-4 h-4 text-sky-500 animate-pulse" />
                {t('futureTitle')}
              </h2>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Next-Generation Sentinel Developments
              </p>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                {t('futureDesc')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              
              {/* Future 1 */}
              <div className="glass-panel p-6.5 rounded-3xl text-center hover:bg-white/50 dark:hover:bg-slate-900/30 transition-all duration-300 ease-out border-slate-200 dark:border-slate-800/80 hover:-translate-y-2 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer">
                <div className="mx-auto w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center mb-4.5 border border-sky-500/20">
                  <Radio className="w-4.5 h-4.5 text-sky-600 dark:text-sky-400" />
                </div>
                <h3 className="font-extrabold text-base mb-2 text-sky-600 dark:text-sky-400">{t('bluetoothTitle')}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {t('bluetoothDesc')}
                </p>
              </div>

              {/* Future 2 */}
              <div className="glass-panel p-6.5 rounded-3xl text-center hover:bg-white/50 dark:hover:bg-slate-900/30 transition-all duration-300 ease-out border-slate-200 dark:border-slate-800/80 hover:-translate-y-2 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer">
                <div className="mx-auto w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4.5 border border-purple-500/20">
                  <Volume2 className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400 animate-pulse-slow" />
                </div>
                <h3 className="font-extrabold text-base mb-2 text-purple-600 dark:text-purple-400">{t('aiVoiceTitle')}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {t('aiVoiceDesc')}
                </p>
              </div>

              {/* Future 3 */}
              <div className="glass-panel p-6.5 rounded-3xl text-center hover:bg-white/50 dark:hover:bg-slate-900/30 transition-all duration-300 ease-out border-slate-200 dark:border-slate-800/80 hover:-translate-y-2 hover:border-sky-500/40 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer">
                <div className="mx-auto w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-4.5 border border-green-500/20">
                  <Building2 className="w-4.5 h-4.5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-extrabold text-base mb-2 text-green-600 dark:text-green-400">{t('policeTitle')}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
                  {t('policeDesc')}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-200 dark:border-slate-805 py-8 text-center text-xs text-slate-400 dark:text-slate-400 bg-white/30 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-medium">© {new Date().getFullYear()} ResQVerse Inc. Guardian Mesh Emergency Protocol. All rights reserved.</p>
          <div className="flex gap-4 font-semibold">
            <span className="hover:text-sky-500 cursor-pointer transition-colors">{t('termsOfService')}</span>
            <span>•</span>
            <span className="hover:text-sky-500 cursor-pointer transition-colors">{t('privacyFramework')}</span>
            <span>•</span>
            <span className="hover:text-sky-500 cursor-pointer transition-colors">{t('developerNodeApi')}</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
