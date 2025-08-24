import { style, styleVariants } from '@vanilla-extract/css';

const baseFormRow = style({
  display: 'flex',
});

export const formRowDirections = styleVariants({
  column: [baseFormRow, {
    flexDirection: 'column',
  }],
  row: [baseFormRow, {
    flexDirection: 'row',
    
    '@media': {
      '(min-width: 600px)': {
        alignItems: 'end',
        gap: '16px',
      },
    },
  }],
});

export const formRowAlignments = styleVariants({
  stretch: {
    alignItems: 'stretch',
  },
  center: {
    alignItems: 'center',
  },
  start: {
    alignItems: 'flex-start',
  },
  end: {
    alignItems: 'flex-end',
  },
});
