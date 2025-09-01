import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
app.use(morgan('dev'));
app.use(express.json());

const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['*'];
app.use(cors({ origin: corsOrigins, credentials: false }));

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// Optional DB
let pool = null;
if (DATABASE_URL) {
  pool = new Pool({ connectionString: DATABASE_URL });

  // Log des erreurs asynchrones du pool
  pool.on?.('error', (err) => console.error('PG pool error:', err));

  pool
    .query(`
      -- Photos
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        uri TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        date_iso TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Profil (profil unique id=1)
      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY DEFAULT 1,
        name TEXT NOT NULL,
        email TEXT,
        bio TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      INSERT INTO profile (id, name)
      VALUES (1, 'Voyageur·euse')
      ON CONFLICT (id) DO NOTHING;
    `)
    .catch((err) => console.error('DB init error:', err));
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/photos', async (_req, res) => {
  if (!pool) return res.json([]);
  const { rows } = await pool.query('SELECT * FROM photos ORDER BY date_iso DESC LIMIT 200');
  res.json(rows);
});

app.post('/photos', async (req, res) => {
  const { uri, latitude, longitude, dateISO } = req.body || {};
  if (!uri || typeof latitude !== 'number' || typeof longitude !== 'number' || !dateISO) {
    return res.status(400).json({ error: 'Bad payload' });
  }
  if (!pool) return res.status(200).json({ id: -1, uri, latitude, longitude, date_iso: dateISO });
  const { rows } = await pool.query(
    'INSERT INTO photos (uri, latitude, longitude, date_iso) VALUES ($1,$2,$3,$4) RETURNING *',
    [uri, latitude, longitude, dateISO]
  );
  res.status(201).json(rows[0]);
});

/* --------- PROFILE --------- */

// GET /profile
app.get('/profile', async (_req, res) => {
  if (!pool) return res.json({ name: 'Voyageur·euse' });
  try {
    const { rows } = await pool.query('SELECT name, email, bio FROM profile WHERE id = 1');
    res.json(rows[0] || { name: 'Voyageur·euse' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'DB error' });
  }
});

// POST /profile (upsert)
app.post('/profile', async (req, res) => {
  const { name, email, bio } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Bad payload (name required)' });
  }
  if (!pool) return res.json({ name, email, bio });
  try {
    const { rows } = await pool.query(
      `INSERT INTO profile (id, name, email, bio, updated_at)
       VALUES (1, $1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         email = EXCLUDED.email,
         bio = EXCLUDED.bio,
         updated_at = NOW()
       RETURNING name, email, bio`,
      [name, email ?? null, bio ?? null]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'DB upsert error' });
  }
});

/* --------------------------- */

app.listen(PORT, '0.0.0.0', () => {
  console.log('API running on', PORT);
});
