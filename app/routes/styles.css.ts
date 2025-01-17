import { style } from "@vanilla-extract/css"; 
import { vars } from "app/styles/theme.css";

export const window = style({
    display: "flex",
    width: "100%",
    height: "100%",
    flexDirection: "column",
});

export const windowTitle = style({
    color: "#FFFFFF",
    fontSize: "24px",
});

export const button = style({
    display: "flex",
    background: "#007bff",
    border: "none",
    padding: "5px",
    borderRadius: "10px",
});

export const inputContainer = style({
    display: "flex",
    flexDirection: "row",
    justifyContent:"start",
});

export const input = style({
    width: "300px",
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