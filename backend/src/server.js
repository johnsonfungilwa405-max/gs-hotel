const express = require('express');
const cors = require('cors');
require('dotenv').config();

const roomsRoutes = require('./routes/rooms');
const ordersRoutes = require('./routes/orders');
const customersRoutes = require('./routes/customers');
const servicesRoutes = require('./routes/services');
const feedbackRoutes = require('./routes/feedback');
const newsRoutes = require('./routes/news');
const adminRoutes = require('./routes/admin');
const controllerRoutes = require('./routes/controller');
const visitsRoutes = require('./routes/visits');
const authRoutes = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Allow the three separately-deployed frontends to call this shared backend.
// Set ALLOWED_ORIGINS as a comma-separated list in Render env vars, e.g.
// https://gs-hotel-user.onrender.com,https://gs-hotel-admin.onrender.com,https://gs-hotel-controller.onrender.com
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'GS Hotel API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/rooms', roomsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', requireAuth(['admin', 'controller']), adminRoutes);
app.use('/api/controller', requireAuth(['controller']), controllerRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`GS Hotel backend running on port ${PORT}`);
});
