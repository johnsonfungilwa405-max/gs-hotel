import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Approvals from './pages/Approvals';
import RoomStatus from './pages/RoomStatus';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/rooms" element={<RoomStatus />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
