import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-sky-600 hover:bg-sky-700 text-white shadow-[0_4px_12px_rgba(14,165,233,0.25)] border border-sky-500/10 hover:shadow-[0_6px_16px_rgba(14,165,233,0.35)]",
    secondary: "bg-slate-200 hover:bg-slate-350 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700/50",
    danger: "bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-[0_4px_12px_rgba(239,68,68,0.25)] animate-pulse-slow hover:from-red-700 hover:to-rose-800",
    success: "bg-green-600 hover:bg-green-700 text-white shadow-[0_4px_12px_rgba(34,197,94,0.25)] border border-green-500/10",
    glass: "glass-panel text-slate-800 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-white/5 border-white/40"
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base"
  };

  const widthStyle = fullWidth ? "w-full" : "";
  
  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};
