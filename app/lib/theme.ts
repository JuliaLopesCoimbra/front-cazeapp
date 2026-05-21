import { createTheme } from '@mui/material/styles';

export const cazeTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#009440',          // Verde Brasil — acentos, bordas, tabs ativas
      dark: '#007132',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFCB00',          // Amarelo Brasil — destaques, CTAs
      dark: '#D4A800',
      contrastText: '#000000',
    },
    error: {
      main: '#E52554',
    },
    background: {
      default: '#282828',       // Fundo base de todas as telas
      paper: '#363636',         // Surface de cards e componentes elevados
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9E9E9E',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter), Inter, Arial, sans-serif',
    h1: { fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 800, fontSize: '1.75rem', lineHeight: 1.2 },
    h2: { fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 700, fontSize: '1.375rem', lineHeight: 1.3 },
    h3: { fontFamily: 'var(--font-inter), Inter, sans-serif', fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    h4: { fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 800, fontSize: '2rem', lineHeight: 1.1 },
    body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6 },
    button: { fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 700, textTransform: 'none' },
    caption: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.5, fontFamily: 'var(--font-inter), Inter, sans-serif' },
  },
  shape: { borderRadius: 15 },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#009440',
          color: '#FFFFFF',
          '&:hover': { backgroundColor: '#007132' },
          '&:disabled': { backgroundColor: '#9E9E9E', color: '#1A1A1A' },
        },
        outlinedSecondary: {
          borderColor: '#FFCB00',
          color: '#FFCB00',
          '&:hover': { borderColor: '#D4A800', color: '#D4A800' },
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: '#363636',
          height: '60px',
          borderTop: '1px solid rgba(0, 148, 64, 0.3)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: '#9E9E9E',
          '&.Mui-selected': { color: '#009440' },
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
