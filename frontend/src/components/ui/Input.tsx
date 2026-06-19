import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>
        )}
        <input
          id={inputId}
          className={`
            w-full bg-[#0a0a0f] border ${error ? 'border-red-500' : 'border-[#2a2a38]'}
            text-gray-200 placeholder-gray-600 rounded-xl px-3 py-2.5 text-sm
            focus:outline-none focus:ring-2 focus:ring-[#4169e1]/50 focus:border-[#4169e1]
            transition-colors ${icon ? 'pl-10' : ''} ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', id, ...props }) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full bg-[#0a0a0f] border ${error ? 'border-red-500' : 'border-[#2a2a38]'}
          text-gray-200 rounded-xl px-3 py-2.5 text-sm
          focus:outline-none focus:ring-2 focus:ring-[#4169e1]/50 focus:border-[#4169e1]
          transition-colors cursor-pointer ${className}
        `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#111118]">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', id, ...props }) => {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          w-full bg-[#0a0a0f] border ${error ? 'border-red-500' : 'border-[#2a2a38]'}
          text-gray-200 placeholder-gray-600 rounded-xl px-3 py-2.5 text-sm
          focus:outline-none focus:ring-2 focus:ring-[#4169e1]/50 focus:border-[#4169e1]
          transition-colors resize-none ${className}
        `}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};
