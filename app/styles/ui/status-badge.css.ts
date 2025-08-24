import { style, styleVariants } from '@vanilla-extract/css';

export const statusBadge = style({
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '700',
  color: 'white',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  minHeight: '32px',
  alignSelf: 'flex-start',
  
  '@media': {
    '(max-width: 37.4375rem)': {
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '11px',
      minHeight: '28px',
      gap: '3px',
    },
    '(min-width: 37.5rem) and (max-width: 59.9375rem)': {
      padding: '7px 14px',
      borderRadius: '18px',
      fontSize: '12px',
      minHeight: '30px',
      gap: '4px',
      alignSelf: 'center',
    },
    '(min-width: 60rem)': {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '13px',
      minHeight: '32px',
      gap: '4px',
      alignSelf: 'center',
    },
  },
});

export const statusTypes = styleVariants({
  pending: [statusBadge, {
    background: '#ff9800',
  }],
  completed: [statusBadge, {
    background: '#4caf50',
  }],
});
