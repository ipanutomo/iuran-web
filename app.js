// Konfigurasi Aplikasi
const CONFIG = {
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbx_BZ5MQOIuPLPaPY0OZ5A9rE3xOGeeSzBb-r8-cig0e52d0E5m6VWghG-KDV5XrwOL/exec"
};

// Format angka dengan separator
function formatNumber(num) {
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
}

// Render data ke tabel
function renderTable(data) {
  const table = document.getElementById('dataTable');
  table.innerHTML = `
    <thead>
      <tr>
        <th>BATCH</th>
        <th>TANGGAL</th>
        <th>IPL</th>
        <th>KAS RT</th>
        <th>TAKZIAH</th>
        <th>LAIN-LAIN</th>
        <th>KAS GANG</th>
        <th>DENDA</th>
        <th>TRANSAKSI</th>
      </tr>
    </thead>
    <tbody>
      ${data.map(row => `
        <tr>
          <td>${row[0] || ''}</td>
          <td>${row[1] || ''}</td>
          <td>${formatNumber(row[2])}</td>
          <td>${formatNumber(row[3])}</td>
          <td>${formatNumber(row[4])}</td>
          <td>${formatNumber(row[5])}</td>
          <td>${formatNumber(row[7])}</td>
          <td>${formatNumber(row[8])}</td>
          <td class="total">${formatNumber((row[6] || 0) + (row[7] || 0) + (row[8] || 0)}</td>
        </tr>
      `).join('')}
    </tbody>
  `;
}

// Load data dari Google Apps Script
async function loadData() {
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  
  try {
    loadingElement.textContent = "Memuat data...";
    errorElement.textContent = "";

    // Tambahkan timestamp untuk avoid cache
    const url = `${CONFIG.WEB_APP_URL}?t=${Date.now()}`;
    console.log("Fetching from:", url); // Debugging
    
    const response = await fetch(url);
    
    // Cek jika response bukan JSON
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Response bukan JSON: ${text.substring(0, 100)}...`);
    }
    
    const data = await response.json();
    console.log("Data received:", data); // Debugging
    
    if (!data || data.error) {
      throw new Error(data?.error || "Data kosong");
    }

    loadingElement.style.display = 'none';
    renderTable(data.data || data);
    
  } catch (error) {
    console.error("Error details:", error);
    loadingElement.style.display = 'none';
    errorElement.textContent = `Gagal memuat data: ${error.message}`;
    errorElement.style.display = 'block';
  }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  // Toggle sidebar di mobile
  document.querySelector('.menu-toggle').addEventListener('click', () => {
    document.body.classList.toggle('sidebar-open');
  });

  // Load data awal
  loadData();
});
