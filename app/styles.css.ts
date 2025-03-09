import { style } from "@vanilla-extract/css"; 


export const container = style({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#000000",
    width: "100%",
    height: "100%",
    gap: "50px"
});

export const title = style({
    color: "#FFFFFF",
    fontSize: "24px",
    '@media': {
        'screen and (max-width: 767px)': {
            fontSize: "50px",
        },
        'screen and (max-width: 1020px) and (min-width: 768px)': {
            fontSize: "50px"
        }
    },
});

export const button = style({
    display: "flex",
    background: "#007bff",
    border: "none",
    padding: "5px",
    borderRadius: "10px",
    fontSize: "30px",
});