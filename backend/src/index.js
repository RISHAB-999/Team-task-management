require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

// Deployment CORS Configuration
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/v1/auth',     require('./routes/authRoutes'));
app.use('/api/v1/users',    require('./routes/userRoutes'));
app.use('/api/v1/projects', require('./routes/projectRoutes'));
app.use('/api/v1/tasks',    require('./routes/taskRoutes'));
app.use('/api/v1/teams',    require('./routes/teamRoutes'));
app.use('/api/v1/search',   require('./routes/searchRoutes'));
app.get('/api/v1/health',   (_, res) => res.json({ status: 'ok', db: 'supabase' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 TaskFlow Backend Live on Port ${PORT}`));
module.exports = app;
