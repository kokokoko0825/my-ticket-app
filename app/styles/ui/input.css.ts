import { style } from '@vanilla-extract/css';

export const input = style({
  width: '100%',
  padding: '16px 20px',
  border: '2px solid #e1e5e9',
  borderRadius: '16px',
  fontSize: '16px', // 16px以上でズーム防止
  fontFamily: 'inherit',
  background: '#fafbfc',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
  appearance: 'none',
  lineHeight: '1.5',
  // iOS Safariのズーム防止の強化
  WebkitTextSizeAdjust: '100%',
  textSizeAdjust: '100%',
  maxWidth: '100%',
  minWidth: 0,
  zoom: 1,
  WebkitUserSelect: 'text',
  userSelect: 'text',
  
  selectors: {
    '&:focus': {
      outline: 'none',
      borderColor: '#1976d2',
      background: 'white',
      boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.1)',
      transform: 'translateY(-1px)',
    },
    '&:disabled': {
      background: '#f5f5f5',
      color: '#9e9e9e',
      cursor: 'not-allowed',
    },
  },
});
