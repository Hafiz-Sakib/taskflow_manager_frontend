import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Today from './pages/Today.jsx';
import Boards from './pages/Boards.jsx';
import BoardDetail from './pages/BoardDetail.jsx';
import CalendarPage from './pages/Calendar.jsx';
import Statistics from './pages/Statistics.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Spinner from './components/Spinner.jsx';
import { useAuth } from './context/AuthContext.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner className="h-screen" />;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/today" element={<Today />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/boards/:id" element={<BoardDetail />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/statistics" element={<Statistics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
