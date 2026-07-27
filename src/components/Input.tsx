import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`w-full glass-input px-4 py-3 text-sm rounded-xl focus:ring-1 focus:ring-sky-500/50 ${
            icon ? 'pl-10' : ''
          } ${
            error 
              ? 'border-red-500/50 focus:border-red-500' 
              : 'border-slate-300 dark:border-slate-700/50 focus:border-sky-500/50'
          } ${className}`}
          {...props}
        />
      </div>
      
      {error && (
        <span className="text-xs text-red-500 font-medium mt-0.5 select-none">
          {error}
        </span>
      )}
    </div>
  );
};
