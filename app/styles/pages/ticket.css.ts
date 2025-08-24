import { style, keyframes } from '@vanilla-extract/css';

export const ticketPageContainer = style({
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '1.5rem',
});

export const ticketContainer = style({
  background: 'white',
  borderRadius: '1rem',
  boxShadow: '0 0.5rem 2rem rgba(0,0,0,0.1)',
  padding: '2.5rem',
  maxWidth: '31.25rem',
  width: '100%',
  textAlign: 'center',
});

export const statusIcon = style({
  fontSize: '5rem',
  marginBottom: '1.5rem',
  display: 'block',
});

export const statusTitle = style({
  fontSize: '1.75rem',
  fontWeight: 600,
  margin: '0 0 1rem 0',
  color: '#333',
});

export const statusMessage = style({
  fontSize: '1rem',
  color: '#666',
  lineHeight: 1.6,
  marginBottom: '2rem',
});

export const ticketInfo = style({
  background: '#f8f9fa',
  borderRadius: '0.75rem',
  padding: '1.25rem',
  marginBottom: '1.5rem',
  borderLeft: '0.25rem solid #1976d2',
});

export const ticketInfoRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
  
  selectors: {
    '&:last-child': {
      marginBottom: 0,
    },
  },
});

export const ticketInfoLabel = style({
  fontWeight: 600,
  color: '#333',
  fontSize: '0.875rem',
});

export const ticketInfoValue = style({
  color: '#666',
  fontSize: '0.875rem',
});

export const actionButtons = style({
  display: 'flex',
  gap: '0.75rem',
  justifyContent: 'center',
});

export const btn = style({
  padding: '0.75rem 1.5rem',
  borderRadius: '0.5rem',
  border: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s',
  textDecoration: 'none',
  display: 'inline-block',
});

export const btnPrimary = style([btn, {
  background: '#1976d2',
  color: 'white',
  
  selectors: {
    '&:hover': {
      background: '#1565c0',
    },
  },
}]);

export const btnSecondary = style([btn, {
  background: '#f5f5f5',
  color: '#333',
  border: '0.125rem solid #e0e0e0',
  
  selectors: {
    '&:hover': {
      background: '#e0e0e0',
    },
  },
}]);

export const countdownText = style({
  fontSize: '0.875rem',
  color: '#666',
  marginTop: '1rem',
});

export const debugToggleBtn = style({
  background: '#ff9800',
  color: 'white',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  margin: '1rem 0',
  transition: 'all 0.2s',
  
  selectors: {
    '&:hover': {
      background: '#f57c00',
    },
  },
});

export const debugInfoPanel = style({
  background: '#f8f9fa',
  border: '0.125rem solid #e0e0e0',
  borderRadius: '0.5rem',
  padding: '1rem',
  marginTop: '1rem',
  fontFamily: "'Courier New', monospace",
  fontSize: '0.75rem',
  lineHeight: 1.4,
  maxHeight: '18.75rem',
  overflowY: 'auto',
  whiteSpace: 'pre-line',
  textAlign: 'left',
});

export const copyDebugBtn = style({
  background: '#666',
  color: 'white',
  border: 'none',
  padding: '0.375rem 0.75rem',
  borderRadius: '0.25rem',
  cursor: 'pointer',
  fontSize: '0.75rem',
  marginTop: '0.5rem',
});

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const loadingSpinner = style({
  width: '2.5rem',
  height: '2.5rem',
  border: '0.25rem solid #e0e0e0',
  borderTop: '0.25rem solid #1976d2',
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
  margin: '0 auto 1.5rem',
});

const successPulse = keyframes({
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.05)' },
  '100%': { transform: 'scale(1)' },
});

export const successAnimation = style({
  animation: `${successPulse} 2s ease-in-out`,
});

// 新形式チケットページ用のスタイル
export const ticketDetailContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  textAlign: 'left',
});

export const ticketDetailItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.75rem',
  background: 'rgba(255,255,255,0.7)',
  borderRadius: '0.75rem',
});

export const ticketDetailIcon = style({
  fontSize: '1rem',
});

export const ticketDetailText = style({
  fontSize: '0.875rem',
  fontWeight: 600,
  color: '#1976d2',
});

export const ticketDetailBandText = style([ticketDetailText, {
  color: '#757575',
}]);

export const ticketMessage = style({
  color: '#666',
  marginBottom: '1.25rem',
  lineHeight: 1.6,
  fontSize: '0.875rem',
});
