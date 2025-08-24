import React from 'react';
import { card, cardHover, cardOverlay, cardHeader, cardContent, cardHeaderTypes } from '~/styles/ui/card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  // レスポンシブ対応のためのprops
  mobileStyle?: React.CSSProperties;
  tabletStyle?: React.CSSProperties;
  desktopStyle?: React.CSSProperties;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  type?: 'primary' | 'secondary' | 'success';
  // レスポンシブ対応のためのprops
  mobileStyle?: React.CSSProperties;
  tabletStyle?: React.CSSProperties;
  desktopStyle?: React.CSSProperties;
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  // レスポンシブ対応のためのprops
  mobileStyle?: React.CSSProperties;
  tabletStyle?: React.CSSProperties;
  desktopStyle?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style = {},
  hover = false,
  mobileStyle = {},
  tabletStyle = {},
  desktopStyle = {},
}) => {
  // レスポンシブスタイルを統合
  const responsiveStyle = {
    ...style,
    ...desktopStyle,
    '@media (max-width: 1024px)': tabletStyle,
    '@media (max-width: 768px)': mobileStyle,
  };

  return (
    <div
      className={`${hover ? cardHover : card} ${className}`}
      style={responsiveStyle}
      role={hover ? "button" : undefined}
      tabIndex={hover ? 0 : undefined}
    >
      {hover && <div className={cardOverlay} />}
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  style = {},
  type = 'primary',
  mobileStyle = {},
  tabletStyle = {},
  desktopStyle = {},
}) => {
  // レスポンシブスタイルを統合
  const responsiveStyle = {
    ...style,
    ...desktopStyle,
    '@media (max-width: 1024px)': tabletStyle,
    '@media (max-width: 768px)': mobileStyle,
  };

  return (
    <div className={`${cardHeader} ${cardHeaderTypes[type]} ${className}`} style={responsiveStyle}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  style = {},
  mobileStyle = {},
  tabletStyle = {},
  desktopStyle = {},
}) => {
  // レスポンシブスタイルを統合
  const responsiveStyle = {
    ...style,
    ...desktopStyle,
    '@media (max-width: 1024px)': tabletStyle,
    '@media (max-width: 768px)': mobileStyle,
  };

  return (
    <div className={`${cardContent} ${className}`} style={responsiveStyle}>
      {children}
    </div>
  );
};
