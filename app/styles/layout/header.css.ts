import { style, styleVariants } from '@vanilla-extract/css';

export const headerTypes = styleVariants({
  primary: {
    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
  },
  secondary: {
    background: '#1976d2',
  },
  success: {
    background: 'linear-gradient(135deg, #388e3c, #2e7d32)',
  },
});

export const header = style({
  color: 'white',
  padding: '16px 20px',
  boxShadow: '0 4px 16px rgba(25, 118, 210, 0.2)',
  marginBottom: '20px',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  backdropFilter: 'blur(10px)',
  
  '@media': {
    '(max-width: 767px)': {
      padding: '12px 16px',
      marginBottom: '16px',
    },
  },
});

export const nav = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  //maxWidth: '50rem',
  margin: '0 auto',
  
  '@media': {
    '(max-width: 767px)': {
      gap: '8px',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
});

export const title = style({
  fontSize: '18px',
  fontWeight: '700',
  margin: 0,
  flex: 1,
  minWidth: 0,
  lineHeight: 1.3,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textAlign: 'center',

  '@media': {
    '(max-width: 767px)': {
      fontSize: '16px',
      textAlign: 'center',
      justifyContent: 'center',
      order: 1,
    },
  },
});

export const backButton = style({
  background: 'transparent',
  border: '2px solid white',
  color: 'white',
  padding: '6px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: '500',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  minHeight: '36px',
  touchAction: 'manipulation',
  
  '@media': {
    '(max-width: 767px)': {
      fontSize: '11px',
      padding: '8px 16px',
      minHeight: '40px',
      order: 0,
      alignSelf: 'flex-start',
    },
  },
  
  selectors: {
    '&:hover': {
      background: 'white',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  },
});

export const userActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  
  '@media': {
    '(max-width: 767px)': {
      gap: '8px',
      order: 2,
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
  },
});

export const userInfo = style({
  fontSize: '12px',
  opacity: 0.95,
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  background: 'rgba(255, 255, 255, 0.15)',
  padding: '6px 12px',
  borderRadius: '20px',
  backdropFilter: 'blur(10px)',
  
  '@media': {
    '(max-width: 767px)': {
      fontSize: '11px',
      padding: '8px 16px',
      borderRadius: '16px',
    },
  },
});

export const headerButton = style([backButton, {
  fontSize: '12px',
  padding: '6px 12px',
  
  '@media': {
    '(max-width: 767px)': {
      fontSize: '11px',
      padding: '8px 16px',
      minHeight: '40px',
    },
  },
}]);
