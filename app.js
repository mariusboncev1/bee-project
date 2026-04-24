require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const { Server } = require('socket.io');

const { sequelize } = require('./src/models');
const { attachUser } = require('./src/middleware/auth');
const { requireAuth } = require('./src/middleware/auth');

// Routes
const authRoutes       = require('./src/routes/auth');
const usersRoutes      = require('./src/routes/users');
const apiariesRoutes   = require('./src/routes/apiaries');
const hivesRoutes      = require('./src/routes/hives');
const inspectionsRoutes = require('./src/routes/inspections');
const logsRoutes       = require('./src/routes/logs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Store io on app for use in routes
app.set('io', io);

// ── View engine ──────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// ── Middleware ───────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'apinote_dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
}));

app.use(attachUser);

// ── SSR Pages ────────────────────────────────────────────────
app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.redirect('/login');
});

// Dashboard - SSR: render apiaries list server-side
app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const { Apiary, Hive, Inspection, Log } = require('./src/models');
    const apiaries = await Apiary.findAll({
      where: { userId: req.session.userId },
      include: [{ association: 'hives', attributes: ['id', 'number', 'status'] }],
    });
    const logs = await Log.findAll({
      where: { userId: req.session.userId },
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    const hiveCount = await Hive.count({
      include: [{ association: 'apiary', where: { userId: req.session.userId }, attributes: [] }],
    });
    const inspectionCount = await Inspection.count({
      include: [{ association: 'hive', include: [{ association: 'apiary', where: { userId: req.session.userId }, attributes: [] }], attributes: [] }],
    });
    res.render('dashboard', {
      title: 'Dashboard - ApiNote',
      apiaries,
      logs,
      stats: { apiaries: apiaries.length, hives: hiveCount, inspections: inspectionCount },
    });
  } catch (err) {
    console.error(err);
    res.render('dashboard', { title: 'Dashboard - ApiNote', apiaries: [], logs: [], stats: { apiaries: 0, hives: 0, inspections: 0 }, error: err.message });
  }
});

// Apiaries page
app.get('/apiaries', requireAuth, async (req, res) => {
  try {
    const { Apiary } = require('./src/models');
    const apiaries = await Apiary.findAll({ where: { userId: req.session.userId }, include: ['hives'] });
    res.render('apiaries', { title: 'My Apiaries - ApiNote', apiaries });
  } catch (err) {
    res.render('apiaries', { title: 'My Apiaries - ApiNote', apiaries: [], error: err.message });
  }
});

// Hives page
app.get('/apiaries/:id/hives', requireAuth, async (req, res) => {
  try {
    const { Apiary, Hive } = require('./src/models');
    const apiary = await Apiary.findByPk(req.params.id, { include: ['hives'] });
    if (!apiary) return res.redirect('/apiaries');
    res.render('hives', { title: `Hives - ${apiary.name}`, apiary, hives: apiary.hives || [] });
  } catch (err) {
    res.redirect('/apiaries');
  }
});

// Inspections page
app.get('/hives/:id/inspections', requireAuth, async (req, res) => {
  try {
    const { Hive, Inspection } = require('./src/models');
    const hive = await Hive.findByPk(req.params.id, { include: ['inspections', 'apiary'] });
    if (!hive) return res.redirect('/apiaries');
    res.render('inspections', { title: `Inspections - Hive #${hive.number}`, hive, inspections: hive.inspections || [] });
  } catch (err) {
    res.redirect('/apiaries');
  }
});

// Profile page
app.get('/profile', requireAuth, async (req, res) => {
  try {
    const { User, UserProfile } = require('./src/models');
    const user = await User.findByPk(req.session.userId, { include: ['profile'], attributes: { exclude: ['password'] } });
    res.render('profile', { title: 'My Profile - ApiNote', profileUser: user });
  } catch (err) {
    res.render('profile', { title: 'My Profile - ApiNote', profileUser: null, error: err.message });
  }
});

// ── API Routes ───────────────────────────────────────────────
app.use('/api/users',       usersRoutes);
app.use('/api/apiaries',    apiariesRoutes);
app.use('/api/hives',       hivesRoutes);
app.use('/api/inspections', inspectionsRoutes);
app.use('/api/logs',        logsRoutes);
app.use('/',                authRoutes);

// ── WebSocket ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.emit('welcome', { message: 'Connected to ApiNote real-time server' });
  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

// ── Sync DB & Start ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced');
    server.listen(PORT, () => console.log(`🐝 ApiNote running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ DB sync failed:', err.message);
    // Start anyway so SSR pages are accessible
    server.listen(PORT, () => console.log(`⚠️  ApiNote running (no DB) on http://localhost:${PORT}`));
  });

module.exports = app;
