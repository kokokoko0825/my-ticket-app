import { createGlobalTheme, createThemeContract } from "@vanilla-extract/css";

export const vars = createThemeContract({
  color: {
    background: "",
    text: "",
    lightText: "",
    highlight: "",
    headerBottom: "",
    footerBg: "",
    btnBg: "",
    bgLine: "",
    bgMask: "",
  },
  typography: {
    fontFamily: {
      roboto: "",
    },
  },
});

createGlobalTheme(":root", vars, {
  color: {
    background: "#FFFFFF",
    text: "#000000",
    lightText: "#F8F9FA",
    highlight: "#8467D7",
    headerBottom: "#EEE9F9",
    footerBg: "#9BA2A8",
    btnBg: "#C4CED4",
    bgLine: "#8467D7",
    bgMask: "#FFFFFF",
  },
  typography: {
    fontFamily: {
      roboto: "Irish Grover",
    },
  },
});