import React from 'react';
import { input } from '~/styles/ui/input.css';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  inputMode?: 'text' | 'email' | 'numeric' | 'tel' | 'search' | 'url';
  autoComplete?: string;
  'aria-label'?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
  style = {},
  inputMode = 'text',
  autoComplete = 'off',
  'aria-label': ariaLabel,
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${input} ${className}`}
      style={style}
      inputMode={inputMode}
      autoComplete={autoComplete}
      aria-label={ariaLabel}
    />
  );
};
