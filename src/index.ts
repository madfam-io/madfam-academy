import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'MADFAM Academy API',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'MADFAM Academy API is running',
    features: {
      courses: 'available',
      enrollment: 'available', 
      certificates: 'available',
      multiTenant: 'available'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MADFAM Academy API',
    documentation: '/api/docs',
    health: '/health'
  });
});

// Start server (only if not in Vercel environment)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`MADFAM Academy Platform running on port ${port}`);
  });
}

// Export for Vercel
export default app;