import { createTheme } from '@mui/material/styles';

export const cazeTheme = createTheme({
  palette: {
    primary: {
      main: '#F5C900',
      dark: '#D4A800',
      contrastText: '#000000',
    },
    secondary: {
      main: '#0055B8',
      dark: '#003E8A',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E63946',
    },
    background: {
      default: '#000000',
      paper: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9E9E9E',
    },
  },
  typography: {
    fontFamily: '"Roboto", Arial, sans-serif',
    h1: { fontFamily: '"Montserrat", Arial, sans-serif', fontWeight: 900, fontSize: '1.75rem', lineHeight: 1.2 },
    h2: { fontFamily: '"Montserrat", Arial, sans-serif', fontWeight: 700, fontSize: '1.375rem', lineHeight: 1.3 },
    h3: { fontFamily: '"Poppins", Arial, sans-serif', fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6 },
    button: { fontFamily: '"Montserrat", Arial, sans-serif', fontWeight: 700, textTransform: 'none' },
    caption: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.5 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#F5C900',
          color: '#000000',
          '&:hover': { backgroundColor: '#D4A800' },
          '&:disabled': { backgroundColor: '#9E9E9E', color: '#1A1A1A' },
        },
        outlinedSecondary: {
          borderColor: '#0055B8',
          color: '#0055B8',
          '&:hover': { borderColor: '#003E8A', color: '#003E8A' },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: { backgroundColor: '#000000', height: '60px' },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#9E9E9E',
          '&.Mui-selected': { color: '#F5C900' },
          minWidth: 0,
          padding: '6px 0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: '999px' },
      },
    },
  },
});
