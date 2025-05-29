// Konfigurasi Aplikasi
const CONFIG = {
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbxAZW5fooRGMLfx8r8UDqBZUm6fRoY9B7hFBH6Jm8YZsBQtJ070Rc3_9TPCWgKxSF2r/exec"
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
  try {
    const response = await fetch(CONFIG.WEB_APP_URL);
    const data = await response.json();
    
    if (data.error) throw new Error(data.error);
    
    document.getElementById('loading').style.display = 'none';
    renderTable(data.data || data);
    
  } catch (error) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').textContent = `Error: ${error.message}`;
    console.error('Gagal memuat data:', error);
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