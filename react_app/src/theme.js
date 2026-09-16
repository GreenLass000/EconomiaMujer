// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#097F8E',
    },
    secondary: {
      main: '#ED7D14',
    },
    black: {
      main: '#000000',
    },
    white: {
      main: '#FFFFFF',
    },
    grey_light: {
        main: '#F5F5F5',
    },
    grey: {
        main: '#BDBDBD',
    },
    grey_dark: {
        main: '#616161',
    },
    red: {
        main: '#FF0000',
    },
  },
});

export default theme;
