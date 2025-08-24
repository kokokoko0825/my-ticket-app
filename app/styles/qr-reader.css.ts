import { style, keyframes, globalStyle } from '@vanilla-extract/css';

export const cameraContainer = style({
  maxWidth: '37.5rem',
  margin: '0 auto',
  padding: '0 1rem',
  
  '@media': {
    '(min-width: 37.5rem)': {
      padding: '0 1.5rem',
    },
  },
});

export const cameraCard = style({
  background: 'white',
  borderRadius: '0.75rem',
  boxShadow: '0 0.25rem 1rem rgba(0,0,0,0.1)',
  overflow: 'hidden',
  marginBottom: '1rem',
  
  '@media': {
    '(min-width: 37.5rem)': {
      marginBottom: '1.5rem',
    },
  },
});

export const qrReaderContainer = style({
  minHeight: '17.5rem',
  width: '100%',
  background: '#f8f9fa',
  borderRadius: '0.75rem',
  overflow: 'hidden',
  position: 'relative',
  
  '@media': {
    '(min-width: 37.5rem)': {
      minHeight: '25rem',
      borderRadius: '1rem',
    },
  },
});

// QRコードライブラリ用のグローバルスタイル
globalStyle('#qr-reader-container video', {
  width: '100% !important',
  height: 'auto !important',
  maxWidth: '100% !important',
  borderRadius: 'inherit',
  objectFit: 'cover',
});

globalStyle('#qr-reader-container canvas', {
  borderRadius: 'inherit',
});

globalStyle('#qr-reader-container > div', {
  borderRadius: 'inherit !important',
});

globalStyle('#qr-reader-container button', {
  background: 'linear-gradient(135deg, #1976d2, #1565c0) !important',
  border: 'none !important',
  borderRadius: '0.75rem !important',
  color: 'white !important',
  fontWeight: '600 !important',
  padding: '0.75rem 1.25rem !important',
  margin: '0.5rem 0.25rem !important',
  transition: 'all 0.2s ease !important',
  minHeight: '2.75rem !important',
});

globalStyle('#qr-reader-container button:hover', {
  transform: 'translateY(-0.0625rem) !important',
  boxShadow: '0 0.25rem 0.75rem rgba(25, 118, 210, 0.3) !important',
});



export const cameraControls = style({
  padding: '1rem',
  textAlign: 'center',
  
  '@media': {
    '(min-width: 37.5rem)': {
      padding: '1.5rem',
    },
  },
});

export const errorCard = style({
  background: '#ffebee',
  border: '0.0625rem solid #ef5350',
  borderRadius: '0.5rem',
  padding: '1rem',
  marginBottom: '1.5rem',
  color: '#c62828',
});

const scanningAnimation = keyframes({
  '0%': { left: '-100%' },
  '100%': { left: '100%' },
});

export const scanningIndicator = style({
  textAlign: 'center',
  padding: '1rem 1.25rem',
  background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)',
  borderRadius: '1rem',
  marginBottom: '1rem',
  color: '#1b5e20',
  fontWeight: 600,
  boxShadow: '0 0.125rem 0.5rem rgba(76, 175, 80, 0.15)',
  position: 'relative',
  overflow: 'hidden',
  
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      animation: `${scanningAnimation} 2s infinite`,
    },
  },
  
  '@media': {
    '(min-width: 37.5rem)': {
      borderRadius: '0.75rem',
      padding: '1.125rem 1.5rem',
    },
  },
});

const slideIn = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(-3.125rem) scale(0.9)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0) scale(1)',
  },
});

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '1rem',
  
  '@media': {
    '(min-width: 37.5rem)': {
      padding: '1.5rem',
    },
  },
});

export const overlayContent = style({
  background: 'white',
  borderRadius: '1rem',
  boxShadow: '0 0.625rem 1.875rem rgba(0,0,0,0.3)',
  maxWidth: '31.25rem',
  width: '100%',
  maxHeight: '80vh',
  overflowY: 'auto',
  position: 'relative',
  animation: `${slideIn} 0.3s ease-out`,
});

export const overlayHeader = style({
  padding: '1rem 1rem 0.75rem 1rem',
  borderBottom: '0.0625rem solid #e0e0e0',
  position: 'relative',
  
  '@media': {
    '(min-width: 37.5rem)': {
      padding: '1.5rem 1.5rem 1rem 1.5rem',
    },
  },
});

export const overlayBody = style({
  padding: '1rem',
  
  '@media': {
    '(min-width: 37.5rem)': {
      padding: '1.5rem',
    },
  },
});
