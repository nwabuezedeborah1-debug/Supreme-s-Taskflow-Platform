import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'yellow';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[#4169e1] hover:bg-[#2952e3] active:bg-[#1a3fc4] text-white border border-[#4169e1]/50',
  secondary: 'bg-[#1a1a24] hover:bg-[#2a2a38] active:bg-[#3a3a48] text-gray-200 border border-[#2a2a38]',
  ghost:     'bg-transparent hover:bg-[#1a1a24] active:bg-[#2a2a38] text-gray-400 hover:text-gray-200 border border-transparent',
  danger:    'bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 text-red-400 border border-red-500/30',
  yellow:    'bg-[#f5c518] hover:bg-[#e5b608] active:bg-[#d4a707] text-black border border-[#f5c518]/50 font-semibold',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 text-xs rounded-lg min-h-[36px]',
  md: 'px-4 py-2.5 text-sm rounded-xl min-h-[40px]',
  lg: 'px-6 py-3 text-base rounded-xl min-h-[48px]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}) => {
  const hasChildren = React.Children.count(children) > 0;

  return (
    <button
      type={type}
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-colors duration-150 cursor-pointer
        outline-none focus-visible:ring-2 focus-visible:ring-[#4169e1]/60
        disabled:opacity-50 disabled:cursor-not-allowed
        ${hasChildren && icon ? 'gap-2' : ''}
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="flex shrink-0 items-center">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
