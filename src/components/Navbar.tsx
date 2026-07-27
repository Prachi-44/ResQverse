import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, languages } from '../context/LanguageContext';
import { 
  Shield, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  Users, 
  History, 
  User, 
  LogOut
} from 'lucide-react';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const { currentUser, logout, isMock } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = currentUser 
    ? [
        { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { path: '/family-dashboard', label: t('familyFeed'), icon: Users },
        { path: '/history', label: t('sosHistory'), icon: History },
        { path: '/profile', label: t('profile'), icon: User },
      ]
    : [];

  return (
    <nav className="glass-panel sticky top-0 z-40 w-full border-b backdrop-blur-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Project Name */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-sky-600 dark:text-sky-500 group-hover:scale-110 transition-transform duration-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wider text-slate-800 dark:text-white leading-tight">
                ResQ<span className="text-sky-600 dark:text-sky-400 text-glow">Verse</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold -mt-0.5">
                Guardian Mesh
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    active 
                      ? 'text-sky-600 dark:text-sky-500 bg-sky-500/10' 
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Demo Mode Badge */}
            {isMock && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                {t('demoMode')}
              </span>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl glass-panel border-0 text-slate-600 dark:text-slate-300 hover:text-sky-500 dark:hover:text-sky-500 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="glass-panel text-slate-800 dark:text-slate-200 text-xs font-bold px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 cursor-pointer focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 font-sans">
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Profile Avatar / Log In buttons */}
            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-700/30">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <img
                    src={currentUser.profilePhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.name)}`}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-sky-500/30 group-hover:border-sky-500 transition-colors"
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-sky-500 transition-colors">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {currentUser.bloodGroup || 'Blood Type N/A'}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl hover:bg-sky-500/10 text-slate-400 hover:text-sky-500 transition-all active:scale-95"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="glass" size="sm">{t('logIn')}</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">{t('register')}</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-3 md:hidden">
            {isMock && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                DEMO
              </span>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Language Selector */}
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="glass-panel text-slate-800 dark:text-slate-200 text-[10px] font-bold px-1.5 py-1 rounded-lg border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 cursor-pointer focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 font-sans">
                  {lang.code.toUpperCase()}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-b py-3 px-4 flex flex-col gap-3 animate-slide-in">
          {currentUser ? (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700/20">
                <img
                  src={currentUser.profilePhoto || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.name)}`}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full border border-sky-500/30"
                />
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {currentUser.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      active 
                        ? 'text-sky-500 bg-sky-500/10' 
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-sky-500 hover:bg-sky-500/10 text-left w-full mt-2 pt-3 border-t border-slate-700/20"
              >
                <LogOut className="w-5 h-5" />
                {t('signOut')}
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="glass" fullWidth>{t('logIn')}</Button>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)}>
                <Button variant="primary" fullWidth>{t('register')}</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
