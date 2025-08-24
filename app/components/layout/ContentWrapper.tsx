import React from 'react';
import { contentWrapper } from '~/styles/layout/content-wrapper.css';

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxWidth?: string;
}

export const ContentWrapper: React.FC<ContentWrapperProps> = ({
  children,
  className = '',
}) => {

  return (
    <div 
      className={`${contentWrapper} ${className}`} 
    >
      {children}
    </div>
  );
};
