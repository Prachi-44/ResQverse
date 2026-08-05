import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isMockEnabled, auth } from '../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Mail, Lock, LogIn, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      showToast('Welcome back to ResQVerse. Node active.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Please verify credentials.');
      showToast('Authentication failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showToast('Please type your email address first.', 'warning');
      setError('Email required to trigger password recovery.');
      return;
    }

    try {
      if (isMockEnabled) {
        showToast(`[DEMO MODE] Password reset email simulation triggered for: ${email}`, 'info', 6000);
      } else {
        await sendPasswordResetEmail(auth, email);
        showToast('Password reset link sent to your email.', 'success');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error triggering reset email.', 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 guardian-mesh-bg text-slate-800 dark:text-white transition-colors duration-300">
      <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-sky-500/10 border border-sky-500/20 mb-3">
            <LogIn className="w-8 h-8 text-sky-600 dark:text-sky-400 text-glow" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            Access Guardian Node
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect your device to the local emergency relay network.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/30 text-red-200 text-xs font-semibold text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="email"
            type="email"
            label="Node Email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            icon={<Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
            required
          />

          <Input
            id="password"
            type="password"
            label="Node Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            icon={<Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
            required
          />

          {isMockEnabled && (
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-700 dark:text-yellow-500 text-[11px] leading-relaxed text-left">
              <strong>Demo Mode:</strong> Use the email and password you registered with. Your account data is stored locally in this browser.
            </div>
          )}

          {/* Action links */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Reset Passcode
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="mt-2"
          >
            Authenticate Node
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            New to Guardian Mesh?{' '}
            <Link to="/register" className="text-sky-600 dark:text-sky-400 font-bold underline transition-colors">
              Create a Node Profile
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
};
