import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Overview from './pages/Overview';
import Approvals from './pages/Approvals';
import RoomStatus from './pages/RoomStatus';
import Reports from './pages/Reports';
import ManageAdmins from './pages/ManageAdmins';
import Account from './pages/Account';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/setup" element={<Setup />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Overview />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/rooms" element={<RoomStatus />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admins" element={<ManageAdmins />} />
        <Route path="/account" element={<Account />} />
      </Route>
    </Routes>
  );
}
