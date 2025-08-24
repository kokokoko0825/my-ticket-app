import React from 'react';
import { formRowDirections, formRowAlignments } from '~/styles/forms/form-row.css';

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  direction?: 'column' | 'row';
  gap?: string;
  alignItems?: 'stretch' | 'center' | 'end' | 'start';
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  className = '',
  style = {},
  direction = 'column',
  gap = '12px',
  alignItems = 'stretch',
}) => {
  return (
    <div 
      className={`${formRowDirections[direction]} ${formRowAlignments[alignItems]} ${className}`} 
      style={{ gap, ...style }}
    >
      {children}
    </div>
  );
};
