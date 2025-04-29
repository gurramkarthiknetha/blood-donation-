import { BrowserRouter } from 'react-router-dom'
import AdminRoutes from './routes/AdminRoutes'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import { ClerkProvider } from './context/ClerkProvider'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#d32f2f',
    },
    secondary: {
      main: '#f50057',
    },
  },
})

function App() {
  return (
    <ClerkProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <AdminRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  )
}

export default App
