const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');




const cors = require('cors');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const SocketHandler = require('./utils/socketHandler');

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const alertRoutes = require('./routes/alertRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const communityRoutes = require('./routes/communityRoutes');
const enhancedReviewRoutes = require('./routes/enhancedReviewRoutes');
const productLifecycleRoutes = require('./routes/productLifecycleRoutes');
const authMiddleware = require('./middleware/authMiddleware');
//auth 
const adminRoutes = require('./routes/adminRoutes');
const authRoutes   = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');

// after app.use(express.json()):



//dotenv.config();

const app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Initialize Socket Handler
const socketHandler = new SocketHandler(io);

app.use(cors());
app.use(express.json());

// Use auth routes
app.use('/api/auth',   authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin',  adminRoutes);

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  req.socketHandler = socketHandler;
  next();
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/community', communityRoutes);
// Set socket handler for enhanced review routes
enhancedReviewRoutes.setSocketHandler(socketHandler);
app.use('/api/enhanced-reviews', enhancedReviewRoutes);
app.use('/api/product-lifecycle', productLifecycleRoutes);

// Real-time endpoints
app.get('/api/realtime/stats', (req, res) => {
  res.json(socketHandler.getConnectionStats());
});

app.post('/api/realtime/broadcast-alert', (req, res) => {
  const alert = req.body;
  socketHandler.broadcastAlert(alert);
  res.json({ success: true, message: 'Alert broadcasted' });
});

app.post('/api/realtime/trust-score-change', (req, res) => {
  const { userId, oldScore, newScore, reason } = req.body;
  socketHandler.broadcastTrustScoreChange(userId, oldScore, newScore, reason);
  res.json({ success: true, message: 'Trust score change broadcasted' });
});

// Basic route
app.get('/', (req, res) => {
  res.send('TRUSTLENS backend server with real-time capabilities is running');
});

// Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/trustlens', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Start server with Socket.IO
server.listen(PORT, () => {
  console.log(`🚀 TRUSTLENS Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready for real-time connections`);
  console.log(`📊 Dashboard: http://localhost:3000`);
  console.log(`🤖 AI-powered fraud detection: ACTIVE`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
  });
});
