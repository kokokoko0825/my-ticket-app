import { style, styleVariants } from '@vanilla-extract/css';

const baseContainer = style({
  width: '100%',
  margin: '0 auto',
  padding: '0 1rem',
  boxSizing: 'border-box',
  
  '@media': {
    '(max-width: 37.4375rem)': {
      padding: '0 0.75rem',
    },
    '(min-width: 37.5rem) and (max-width: 59.9375rem)': {
      padding: '0 1.5rem',
    },
    '(min-width: 60rem)': {
      padding: '0 2rem',
    },
  },
});

export const containerSizes = styleVariants({
  xs: [baseContainer, {
    maxWidth: '30rem', // 480px
  }],
  sm: [baseContainer, {
    maxWidth: '37.5rem', // 600px
  }],
  md: [baseContainer, {
    maxWidth: '60rem', // 960px
  }],
  lg: [baseContainer, {
    maxWidth: '75rem', // 1200px
  }],
  xl: [baseContainer, {
    maxWidth: '87.5rem', // 1400px
  }],
});
