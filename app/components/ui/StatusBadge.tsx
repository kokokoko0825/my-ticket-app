import React from 'react';
import { statusTypes } from '~/styles/ui/status-badge.css';

interface StatusBadgeProps {
  status: '未' | '済';
  className?: string;
  style?: React.CSSProperties;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  style = {},
}) => {
  const getStatusText = (): string => {
    return status === '済' ? '✓ 入場済み' : '⏳ 未入場';
  };

  const statusType = status === '済' ? 'completed' : 'pending';

  return (
    <span
      className={`${statusTypes[statusType]} ${className}`}
      style={style}
    >
      {getStatusText()}
    </span>
  );
};
