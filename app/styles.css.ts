import { style } from "@vanilla-extract/css"; 


export const container = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    height: "100%",
});

export const button = style({
    display: "flex",
    background: "#007bff",
    border: "none",
    padding: "5px",
    borderRadius: "10px",
});