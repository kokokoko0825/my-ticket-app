import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 75,
  level = 'H',
  includeMargin = true,
  className = '',
  style = {},
}) => {
  return (
    <div className={className} style={style}>
      <QRCodeCanvas
        value={value}
        size={size}
        level={level}
        includeMargin={includeMargin}
      />
    </div>
  );
};
