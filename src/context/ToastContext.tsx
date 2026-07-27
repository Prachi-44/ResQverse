import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
      {children}
      
      {/* Toast Render Portal Container */}
      <div className="fixed bottom-5 right-5 left-5 md:left-auto z-50 flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => {
          let Icon = Info;
          let borderClass = 'border-blue-500/30';
          let bgClass = 'bg-blue-950/80 text-blue-200';
          if (toast.type === 'success') {
            Icon = CheckCircle2;
            borderClass = 'border-green-500/30';
            bgClass = 'bg-green-950/80 text-green-200';
          } else if (toast.type === 'error') {
            Icon = XCircle;
            borderClass = 'border-red-500/30';
            bgClass = 'bg-red-950/85 text-red-200';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderClass = 'border-yellow-500/30';
            bgClass = 'bg-yellow-950/80 text-yellow-200';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg transition-all duration-300 animate-slide-in ${bgClass} ${borderClass}`}
              role="alert"
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium pr-2">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors duration-150"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
