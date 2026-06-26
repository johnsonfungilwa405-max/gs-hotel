import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Rooms from './pages/Rooms';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Feedback from './pages/Feedback';
import News from './pages/News';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/news" element={<News />} />
      </Route>
    </Routes>
  );
}
