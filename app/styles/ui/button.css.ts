import { style, styleVariants } from '@vanilla-extract/css';

const baseButton = style({
  border: 'none',
  cursor: 'pointer',
  fontWeight: '700',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  touchAction: 'manipulation',
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  
  selectors: {
    '&:disabled': {
      background: '#e0e0e0',
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
      color: '#9e9e9e',
    },
    '&:not(:disabled):hover': {
      transform: 'translateY(-2px)',
    },
    '&:not(:disabled):active': {
      transform: 'translateY(0)',
    },
  },
});

export const buttonSizes = styleVariants({
  sm: [baseButton, {
    borderRadius: '8px',
    fontSize: '14px',
    padding: '12px 20px',
    minHeight: '40px',
  }],
  md: [baseButton, {
    borderRadius: '16px',
    fontSize: '16px',
    padding: '16px 24px',
    minHeight: '52px',
  }],
  lg: [baseButton, {
    borderRadius: '20px',
    fontSize: '17px',
    padding: '20px 32px',
    minHeight: '60px',
  }],
});

export const buttonTypes = styleVariants({
  primary: {
    background: 'linear-gradient(135deg, #1976d2, #1565c0)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
    
    selectors: {
      '&:not(:disabled):hover': {
        boxShadow: '0 6px 16px rgba(25, 118, 210, 0.35)',
      },
      '&:not(:disabled):active': {
        boxShadow: '0 0.125rem 0.5rem rgba(25, 118, 210, 0.2)',
      },
    },
  },
  secondary: {
    background: 'linear-gradient(135deg, #dc004e, #b8003d)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(220, 0, 78, 0.25)',
    
    selectors: {
      '&:not(:disabled):hover': {
        boxShadow: '0 6px 16px rgba(220, 0, 78, 0.35)',
      },
      '&:not(:disabled):active': {
        boxShadow: '0 0.125rem 0.5rem rgba(220, 0, 78, 0.2)',
      },
    },
  },
  danger: {
    background: 'linear-gradient(135deg, #d32f2f, #c62828)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.25)',
    
    selectors: {
      '&:not(:disabled):hover': {
        boxShadow: '0 6px 16px rgba(211, 47, 47, 0.35)',
      },
      '&:not(:disabled):active': {
        boxShadow: '0 0.125rem 0.5rem rgba(211, 47, 47, 0.2)',
      },
    },
  },
  success: {
    background: 'linear-gradient(135deg, #388e3c, #66bb6a)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(56, 142, 60, 0.25)',
    
    selectors: {
      '&:not(:disabled):hover': {
        boxShadow: '0 6px 16px rgba(56, 142, 60, 0.35)',
      },
      '&:not(:disabled):active': {
        boxShadow: '0 0.125rem 0.5rem rgba(56, 142, 60, 0.2)',
      },
    },
  },
});
