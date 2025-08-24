import { style } from '@vanilla-extract/css';

export const overlay = style({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
});

export const modal = style({
  background: 'white',
  borderRadius: '16px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
  position: 'relative',
  zIndex: 1001,
});

export const overlayBackdrop = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
});

export const header = style({
  background: '#1976d2',
  color: 'white',
  padding: '20px 24px',
  borderRadius: '16px 16px 0 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const title = style({
  fontSize: '20px',
  fontWeight: '600',
  margin: 0,
});

export const closeButton = style({
  background: 'rgba(255, 255, 255, 0.2)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  
  selectors: {
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.3)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
  },
});

export const content = style({
  padding: '24px',
});
