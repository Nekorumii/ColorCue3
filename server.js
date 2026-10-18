const express = require('express'), fs = require('fs'), path = require('path');
const app = express(), PORT = process.env.PORT || 3000;
const DB = path.join(process.env.DATA_DIR || __dirname, 'data', 'scans.json');
app.disable('x-powered-by');app.set('trust proxy',1);
app.use(express.json({ limit: '10kb' }));
app.use((q, r, n) => { r.set({ 'Permissions-Policy': 'camera=(self)', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' }); n(); });
// Kamera HTML5 butuh HTTPS: arahkan http -> https saat di balik proxy hosting
app.use((q, r, n) => process.env.NODE_ENV === 'production' && q.headers['x-forwarded-proto'] === 'http' ? r.redirect(301, 'https://' + q.headers.host + q.url) : n());

const load = () => { try { return JSON.parse(fs.readFileSync(DB, 'utf8')); } catch { return []; } };
const save = a => { fs.mkdirSync(path.dirname(DB), { recursive: true }); fs.writeFileSync(DB + '.tmp', JSON.stringify(a)); fs.renameSync(DB + '.tmp', DB); };
const dev = v => /^[\w-]{8,40}$/.test(String(v || '')) ? String(v) : null;

const hits=new Map();setInterval(()=>hits.clear(),60000).unref();
app.use('/api',(q,r,n)=>{const c=(hits.get(q.ip)||0)+1;hits.set(q.ip,c);c>120?r.status(429).json({error:'Terlalu banyak permintaan, coba sebentar lagi'}):n()});
app.get('/api/health', (q, r) => r.json({ ok: true, app: 'ColorCue', time: new Date().toISOString() }));
app.get('/api/scans', (q, r) => { const d = dev(q.query.device); if (!d) return r.status(400).json({ error: 'device tidak valid' }); r.json(load().filter(s => s.device === d).slice(-20).reverse()); });
app.post('/api/scans', (q, r) => {
  const { device, mode, color, detail } = q.body || {};
  if (!dev(device) || !['buah', 'kabel', 'diagram'].includes(mode) || typeof color !== 'string' || !color) return r.status(400).json({ error: 'Data tidak valid' });
  const a = load(); a.push({ id: Date.now(), device, mode, color: color.slice(0, 40), detail: String(detail || '').slice(0, 200), at: new Date().toISOString() });
  try { save(a.slice(-500)); r.status(201).json({ ok: true }); } catch { r.status(500).json({ error: 'Gagal menyimpan' }); }
});
app.delete('/api/scans', (q, r) => { const d = dev(q.query.device); if (!d) return r.status(400).json({ error: 'device tidak valid' }); try { save(load().filter(s => s.device !== d)); r.json({ ok: true }); } catch { r.status(500).json({ error: 'Gagal menghapus' }); } });

app.use('/api',(q,r)=>r.status(404).json({error:'Endpoint tidak ditemukan'}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
app.use((e, q, r, n) => r.status(400).json({ error: 'Permintaan tidak valid' }));
app.listen(PORT, () => console.log('ColorCue berjalan di http://localhost:' + PORT));
