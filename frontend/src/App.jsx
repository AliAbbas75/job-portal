import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { StaffAuthProvider } from './context/StaffAuthProvider';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StaffAuthProvider>
          <AppRoutes />
        </StaffAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
