# Dokumentasi Teknis: Weather Dashboard

**Mata Kuliah:** Praktikum Pemrograman Web  
**Modul:** 6.4 (AJAX dan Web Service)  
**Status:** Tugas Akhir

## 1. Deskripsi Proyek
Weather Dashboard adalah perangkat lunak berbasis web yang dikembangkan untuk menyajikan informasi meteorologi secara *real-time*. Sistem ini mengimplementasikan komunikasi data asinkron (*asynchronous data communication*) menggunakan protokol HTTP untuk mengambil data dari OpenWeatherMap API. Pengembangan antarmuka pengguna difokuskan pada penyajian data yang terstruktur melalui layout *grid* dan manipulasi *Document Object Model* (DOM) secara dinamis.

## 2. Arsitektur Teknologi
Pengembangan sistem menggunakan teknologi standar web sebagai berikut:

* **HTML5:** Struktur semantik dokumen.
* **CSS3:** Penataan tata letak (*layouting*) menggunakan Flexbox dan CSS Grid, serta implementasi variabel CSS untuk manajemen tema.
* **JavaScript (ES6+):** Logika pemrograman sisi klien.
    * Penggunaan **Fetch API** dengan sintaks `async/await` untuk permintaan data HTTP.
    * Manipulasi DOM untuk pembaruan antarmuka tanpa *reload* halaman.
* **OpenWeatherMap API:** Penyedia layanan data cuaca (Endpoint: `/weather` dan `/forecast`).

## 3. Instalasi dan Konfigurasi

Ikuti langkah-langkah berikut untuk menjalankan aplikasi pada lingkungan lokal:

1.  **Persiapan Berkas:**
    Unduh atau salin seluruh direktori proyek ke dalam penyimpanan lokal komputer.

2.  **Konfigurasi API Key:**
    Buka berkas `script.js` dan pastikan konstanta `API_KEY` telah diinisialisasi dengan kredensial yang valid.
    ```javascript
    const API_KEY = '10cfd092f533bce4a4cba799d80cd149';
    ```

3.  **Eksekusi:**
    Buka berkas `index.html` menggunakan peramban web (*web browser*) modern (Google Chrome, Mozilla Firefox, atau Microsoft Edge). Koneksi internet diperlukan untuk memuat pustaka eksternal (Font Awesome, Google Fonts) dan mengambil data API.

## 4. Struktur Direktori
* `index.html`: Dokumen utama antarmuka pengguna.
* `style.css`: Lembar gaya untuk definisi visual dan tema.
* `script.js`: Berkas logika untuk penanganan API, *event listener*, dan fungsi sistem.

## 5. Tampilan UI

| **Light Mode (Pastel)** | **Dark Mode (Night)** |
| :---: | :---: |
| <img width="100%" src="https://github.com/user-attachments/assets/25e33e68-6c2c-4365-9a28-d09e31116fd5" /> | <img width="100%" src="https://github.com/user-attachments/assets/3b64bd24-f018-4d1c-8baf-03458ac0244d" /> |
 
