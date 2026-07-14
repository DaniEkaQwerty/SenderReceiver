# Sender / Receiver App

Web sederhana: dashboard -> pilih Sender atau Receiver -> Sender nulis teks -> Receiver otomatis dapet teksnya (polling tiap 2 detik).

## Cara deploy ke Vercel

1. **Push ke GitHub**
   - Buat repo baru di GitHub, push folder project ini ke situ.

2. **Import ke Vercel**
   - Buka https://vercel.com/new
   - Pilih repo yang baru kamu push
   - Klik Deploy (framework Next.js akan otomatis kedeteksi)

3. **Tambah database Vercel KV (WAJIB, biar data tersimpan beneran antar device)**
   - Setelah project ke-deploy, buka project itu di dashboard Vercel
   - Masuk tab **Storage** -> **Create Database** -> pilih **KV** (gratis di tier Hobby)
   - Setelah dibuat, klik **Connect Project**, pilih project ini
   - Vercel otomatis nambahin environment variable `KV_REST_API_URL` dan `KV_REST_API_TOKEN` ke project kamu
   - Buka tab **Deployments**, klik **Redeploy** di deployment terakhir supaya env variable baru itu kepakai

4. **Selesai**
   - Buka URL project kamu (misal `https://nama-project.vercel.app`) dari 2 device berbeda
   - Satu device pilih Sender, satu lagi pilih Receiver
   - Kirim teks dari Sender, Receiver bakal otomatis nampilin dalam 2 detik

## Fitur

- **Sender** — kotak teks besar buat kirim teks/angka, tombol reset buat hapus semua pesan (termasuk history)
- **Receiver** — nampilin pesan terbaru + list **History** semua pesan yang pernah masuk (di bawahnya), auto-refresh tiap 2 detik, tombol reset juga tersedia di sini
- Reset berlaku global — pesan yang dihapus dari Sender atau Receiver, dua-duanya sama-sama ke-reset (karena satu channel bersama)

## Fitur baru

- **Reset pesan** — tombol di Sender maupun Receiver buat hapus pesan yang lagi tampil di Receiver (tidak menghapus history).
- **Hapus semua (history)** — tombol di panel History buat menghapus seluruh riwayat pesan.
- **History** — daftar pesan yang pernah masuk (maksimal 30 terakhir), muncul di bawah panel Receiver, urut dari yang terbaru.

## Catatan

- Tanpa Vercel KV terhubung, app tetap bisa jalan pakai fallback memory sementara, TAPI datanya bisa hilang/tidak sinkron antar server serverless yang berbeda — jadi untuk pemakaian sungguhan, **KV wajib disambungkan**.
- Kalau mau coba dulu di lokal komputer kamu sebelum deploy:
  ```
  npm install
  npm run dev
  ```
  lalu buka `http://localhost:3000` (tanpa KV, dia otomatis pakai fallback memory, cukup buat testing UI aja).
- Sekarang cuma ada 1 "kotak surat" bersama (semua Sender kirim ke tempat yang sama, semua Receiver baca dari tempat yang sama). Kalau nanti butuh banyak channel/pasangan berbeda (misal per kode ruangan), API-nya tinggal dikembangin dikit (`/api/message?room=xxx`), tinggal bilang aja ke saya.
