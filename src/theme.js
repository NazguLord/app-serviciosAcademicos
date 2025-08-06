//theme.js
import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// color design tokens export

export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#141414",
        },
        primary: {
          100: "#d0d1d5",
          200: "#a1a4ab",
          300: "#727681",
          400: "#1F2A40",
          500: "#141b2d",
          600: "#101624",
          700: "#0c101b",
          800: "#080b12",
          900: "#040509",
        },
        greenAccent: {
          100: "#dbf5ee",
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#25D366",
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
        blueAccent: {
          100: "#e1e2fe",
          200: "#c3c6fd",
          300: "#a4a9fc",
          400: "#868dfb",
          500: "#6870fa",
          600: "#535ac8",
          700: "#3e4396",
          800: "#2a2d64",
          900: "#151632",
        },
        indigoAccent: {
          100: "#ccdbf2",
          200: "#99b7e5",
          300: "#6694d8",
          400: "#3370cb",
          500: "#004cbe",
          600: "#003d98",
          700: "#002e72",
          800: "#001e4c",
          900: "#000f26",
        },
        orange: {
          100: "#fff2e5",
          200: "#ffe5cc",
          300: "#ffd8b2",
          400: "#ffcc99",
          500: "#ffbf7f",
          600: "#ffb266",
          700: "#ffa64c",
          800: "#ff9932",
          900: "#ff8000",
        },
        softWhiteAccent: {
          100: "#fafafa",
          200: "#f7f7f7",
          300: "#f5f6fa",
          400: "#f0f0f0",
          500: "#eeeeee",
          600: "#e6e6e6",
          700: "#e0e0e0",
          800: "#d9d9d9",
          900: "#d3d3d3",
        },
        yellowAccent: {
          100: "#fbf6cd",
          200: "#f7ec9b",
          300: "#f4e36a",
          400: "#f0d938",
          500: "#ecd006",
          600: "#bda605",
          700: "#8e7d04",
          800: "#5e5302",
          900: "#2f2a01"
},
      CatoAccent: {
        100: "#a9e0ff",
        200: "#75c9ff",
        300: "#409fff",
        400: "#1574ff",
        500: "#002a80",
        600: "#0060ff",
        700: "##0055e2",
        800: "#005eff",
        900: "#012980",
      },
      }
    : {
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#e0e0e0",
        },
        primary: {
          100: "#040509",
          200: "#080b12",
          300: "#0c101b",
          400: "#f2f0f0", // manually changed
          500: "#141b2d",
          600: "#1F2A40",
          700: "#727681",
          800: "#a1a4ab",
          900: "#d0d1d5",
        },
        greenAccent: {
          100: "#0f2922",
          200: "#1e5245",
          300: "#2e7c67",
          400: "#3da58a",
          500: "#25D366",
          600: "#70d8bd",
          700: "#94e2cd",
          800: "#b7ebde",
          900: "#dbf5ee",
        },
        redAccent: {
          100: "#2c100f",
          200: "#58201e",
          300: "#832f2c",
          400: "#af3f3b",
          500: "#db4f4a",
          600: "#e2726e",
          700: "#e99592",
          800: "#f1b9b7",
          900: "#f8dcdb",
        },
        blueAccent: {
          100: "#151632",
          200: "#2a2d64",
          300: "#3e4396",
          400: "#535ac8",
          500: "#6870fa",
          600: "#868dfb",
          700: "#a4a9fc",
          800: "#c3c6fd",
          900: "#e1e2fe",
        },
        indigoAccent: {
          100: "#000f26",
          200: "#001e4c",
          300: "#002e72",
          400: "#003d98",
          500: "#004cbe",
          600: "#3370cb",
          700: "#6694d8",
          800: "#99b7e5",
          900: "#ccdbf2",
        },
        orange: {
          100: "#ff8000",
          200: "#ff9932",
          300: "#ffa64c",
          400: "#ffb266",
          500: "#ffbf7f",
          600: "#ffa64c",
          700: "#ffd8b2",
          800: "#ffe5cc",
          900: "#fff2e5",
        },
        softWhiteAccent: {
          100: "#d3d3d3",
          200: "#d9d9d9",
          300: "#e0e0e0",
          400: "#e6e6e6",
          500: "#eeeeee",
          600: "#f0f0f0",
          700: "#f5f6fa",
          800: "#f7f7f7",
          900: "#fafafa",
        },
        yellowAccent: {
          100: "#2f2a01",
          200: "#5e5302",
          300: "#8e7d04",
          400: "#bda605",
          500: "#ecd006",
          600: "#f0d938",
          700: "#f4e36a",
          800: "#f7ec9b",
          900: "#fbf6cd",
        },
        CatoAccent: {
          100: "#012980",
          200: "#005eff",
          300: "#0055e2",
          400: "#0060ff",
          500: "#002a80",
          600: "#1574ff",
          700: "#409fff",
          800: "#75c9ff",
          900: "#a9e0ff",
        },
      }),
});

// mui theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            // palette values for dark mode
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            tertiary: {
              main: colors.redAccent[500],
            },
            quaternary: {
              main: colors.orange[900],
            },
            quinary: {
              main: colors.indigoAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[500],
            },
          }
        : {
            // palette values for light mode
            primary: {
              main: colors.primary[100],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            tertiary: {
              main: colors.redAccent[200],
            },
            quaternary: {
              main: colors.orange[100],
            },
            quinary: {
              main: colors.indigoAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.softWhiteAccent[500],
            },
          }),
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
    components: {
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: mode === "dark" ? colors.grey[100] : colors.grey[500],
            "&.Mui-focused": {
              color: mode === "dark" ? colors.grey[300] : colors.grey[700],
            },
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            color: mode === "dark" ? colors.grey[100] : colors.grey[100],
            "&.Mui-focused": {
              color: mode === "dark" ? colors.grey[300] : colors.grey[700],
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: mode === "dark" ? colors.primary[100] : colors.grey[700],
            "&.Mui-selected": {
              color:
                mode === "dark" ? colors.greenAccent[400] : colors.primary[600],
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor:
              mode === "dark" ? colors.greenAccent[400] : colors.primary[600],
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: mode === "dark" ? colors.greenAccent[400] : colors.grey[700],
            "&.Mui-checked": {
              color:
                mode === "dark" ? colors.greenAccent[400] : colors.primary[600],
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor:
                mode === "dark" ? colors.grey[300] : colors.grey[700],
            },
          },
        },
      },
    },
  };
};

// context for color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("light");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};