import React from 'react';
import { pageContainer } from '~/styles/layout/page-container.css';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  background?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  style = {},
  background = '#f8f9fa',
}) => {
  return (
    <div 
      className={`${pageContainer} ${className}`} 
      style={{ backgroundColor: background, ...style }}
    >
      {children}
    </div>
  );
};
