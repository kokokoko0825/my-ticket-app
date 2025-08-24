import React from 'react';
import { containerSizes } from '~/styles/ui/container.css';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  style?: React.CSSProperties;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = 'lg',
  style = {},
  className = '',
}) => {
  return (
    <div className={`${containerSizes[maxWidth]} ${className}`} style={style}>
      {children}
    </div>
  );
};
