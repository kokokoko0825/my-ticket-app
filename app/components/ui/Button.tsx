import React from 'react';
import { buttonSizes, buttonTypes } from '~/styles/ui/button.css';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  title?: string;
  'aria-label'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'primary',
  size = 'md',
  disabled = false,
  style = {},
  className = '',
  title,
  'aria-label': ariaLabel,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`${buttonSizes[size]} ${buttonTypes[type]} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};
