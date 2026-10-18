# ColorCue — Every Color Has a Clue

Asisten visual untuk pengguna buta warna: kamera HP membaca warna lalu menampilkan **nama, kode HEX, label, dan pola** (plus suara opsional).

## Jalankan di komputer
```bash
npm install
npm start          # http://localhost:3000
```
Kamera hanya bisa dipakai lewat **HTTPS** atau `localhost`.

## Coba di HP sebelum deploy
Jalankan salah satu (butuh internet), lalu buka tautan HTTPS yang muncul di HP:
```bash
npx cloudflared tunnel --url http://localhost:3000
# atau: npx localtunnel --port 3000
```

## Deploy (gratis, HTTPS otomatis)
**Render:** push folder ini ke GitHub → New Web Service → pilih repo (`render.yaml` sudah disiapkan).
**Railway:** New Project → Deploy from GitHub → otomatis memakai `npm start`.
Riwayat disimpan di `data/scans.json`. Di paket gratis file ini bisa hilang saat server restart; set `DATA_DIR` ke disk persisten bila perlu.
> Vercel/Netlify hanya cocok untuk frontend (`public/`): kamera, pola, dan nama warna tetap jalan, tetapi fitur Riwayat memerlukan server Node.

## Pasang seperti aplikasi
Android/Chrome: Profil → **Pasang aplikasi**. iPhone/Safari: Bagikan → **Tambah ke Layar Utama**.

## Struktur
```
server.js            backend Express (API riwayat + file statis)
public/index.html    seluruh frontend (intro, login, kamera, pustaka warna)
public/sw.js         service worker (PWA)
public/manifest.webmanifest, icon*.png, icon.svg
```

## API
| Metode | Rute | Fungsi |
|---|---|---|
| GET | `/api/health` | cek server |
| GET | `/api/scans?device=ID` | 20 riwayat terakhir |
| POST | `/api/scans` | simpan `{device, mode, color, detail}` |
| DELETE | `/api/scans?device=ID` | hapus riwayat perangkat |

## Catatan
- Nama warna dibuat dengan aturan (keluarga warna + terang + kepekatan) untuk seluruh 16.777.216 warna RGB; kode HEX membedakan tiap warna.
- Ambang warna kamera (HSV) perlu dikalibrasi pada pencahayaan nyata. Tidak untuk keselamatan listrik atau diagnosis medis.
