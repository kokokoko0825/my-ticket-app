import React from 'react';
import { formGroup } from '~/styles/forms/form-group.css';

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  className = '',
  style = {},
}) => {
  return (
    <div className={`${formGroup} ${className}`} style={style}>
      {children}
    </div>
  );
};
