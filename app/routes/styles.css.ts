import { style } from "@vanilla-extract/css"; 
import { vars } from "app/styles/theme.css";

export const window = style({
    display: "flex",
    width: "auto",
    height: "auto",
    flexDirection: "column",
    padding: "50px, 0"
});

export const windowTitle = style({
    color: "#FFFFFF",
    fontSize: "24px",
    '@media': {
        'screen and (max-width: 767px)': {
            fontSize: "120px",
        },
        'screen and (max-width: 1020px) and (min-width: 768px)': {
        }
    },
});

export const button = style({
    display: "flex",
    background: "#007bff",
    border: "none",
    padding: "5px",
    borderRadius: "10px",
    '@media': {
        'screen and (max-width: 767px)': {
            fontSize: "120px",
        }
    }
});

export const inputContainer = style({
    display: "flex",
    justifySelf: "stretch",
    flexDirection: "row",
    justifyContent:"start",
});

export const input = style({
    width: "300px",
    color: "#FFFFFF",
    '@media': {
        'screen and (max-width: 767px)': {
            width: "50%",
            fontSize: "120px",
        }
    }
    
});

export const ticket = style({
    width: "300px",
    height: "181.319px",
    flexDirection: "column",
    background: vars.color.bgMask,
});

export const text1 = style({
    display: "flex",
    fontSize: "11px",
    fontFamily: vars.typography.fontFamily.roboto,
    color: "#FFFFFF",
    '@media': {
        'screen and (max-width: 767px)': {
            fontSize: "50px",
        }
    }
});

export const text = style({
    display: "flex",
    color: vars.color.text,
    fontSize: "11px",
    fontFamily: vars.typography.fontFamily.roboto,
});

export const title = style({
    color: vars.color.text,
    textAlign: "center",
    paddingTop: "10px",
    fontFamily: vars.typography.fontFamily.roboto,
    fontSize: "36px",
    fontStyle: "normal",
})

export const placeContainer = style({
    display: "flex",
    justifyContent: "right",
    alignItems: "center",
    width: "100%",
    paddingRight: "11px",
});

export const otherContainer = style({
    display: "flex",
    width: "100%",
    flexDirection: "row",
    paddingRight:"10px",
    justifyContent: "space-between",
    alignItems: "center",
});

export const textContainer = style({
    display: "flex",
    width: "50%",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "start",
    paddingLeft: "5px",
});

export const backContainer = style({
    display: "flex",
    flexDirection: "column",
    padding: "20px 10px 10px 10px",
});

export const locationTextContainer = style({
    display: "flex",
    padding: "10px",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
});

export const header1 = style({
    '@media': {
        'screen and (max-width: 767px)': {
            fontSize: "50px",
            color: "#FFFFFF",
        }
    }
});