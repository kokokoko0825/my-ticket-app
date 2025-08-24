import { style, styleVariants } from '@vanilla-extract/css';

export const card = style({
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  
  // モバイル対応
  '@media': {
    'screen and (max-width: 768px)': {
      borderRadius: '12px',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
    },
    'screen and (max-width: 480px)': {
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    },
  },
});

export const cardHover = style([card, {
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  selectors: {
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    },
  },
  
  // タッチデバイスではホバー効果を無効化
  '@media': {
    '(hover: none)': {
      selectors: {
        '&:hover': {
          transform: 'none',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
  },
}]);

export const cardOverlay = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(255, 255, 255, 0.1)',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  pointerEvents: 'none',
});

export const cardHeaderTypes = styleVariants({
  primary: {
    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
  },
  secondary: {
    background: 'linear-gradient(135deg, #dc004e, #ff5983)',
  },
  success: {
    background: 'linear-gradient(135deg, #388e3c, #66bb6a)',
  },
});

export const cardHeader = style({
  color: 'white',
  padding: '18px 20px',
  overflow: 'hidden',
  
  // レスポンシブ対応
  '@media': {
    'screen and (max-width: 768px)': {
      padding: '16px 18px',
    },
    'screen and (max-width: 480px)': {
      padding: '14px 16px',
    },
  },
});

export const cardContent = style({
  padding: '1.25rem 1.5rem 1.5rem 1.5rem',
  boxSizing: 'border-box',
  overflow: 'hidden',
  flexGrow: 1,
  alignItems: 'stretch',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  
  // レスポンシブ対応
  '@media': {
    'screen and (max-width: 768px)': {
      padding: '1rem 1.25rem 1.25rem 1.25rem',
    },
    'screen and (max-width: 480px)': {
      padding: '0.875rem 1rem 1rem 1rem',
    },
  },
});
