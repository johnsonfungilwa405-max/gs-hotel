import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Rooms from './pages/Rooms';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Feedback from './pages/Feedback';
import News from './pages/News';
import Account from './pages/Account';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Overview />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/news" element={<News />} />
        <Route path="/account" element={<Account />} />
      </Route>
    </Routes>
  );
}
