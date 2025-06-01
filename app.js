// Konfigurasi Aplikasi
const CONFIG = {
  WEB_APP_URL: "https://script.google.com/macros/s/AKfycbx_BZ5MQOIuPLPaPY0OZ5A9rE3xOGeeSzBb-r8-cig0e52d0E5m6VWghG-KDV5XrwOL/exec"
};

// Format angka dengan separator
function formatNumber(num) {
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
}

// Format tanggal ke dd-mm-yy
function formatDate(dateInput) {
  if (!dateInput) return '';
  
  let date;
  
  // Jika sudah format string pendek, return as is
  if (typeof dateInput === 'string' && dateInput.match(/^\d{2}-\d{2}-\d{2}$/)) {
    return dateInput;
  }
  
  // Jika string tanggal panjang (dari GMT)
  if (typeof dateInput === 'string') {
    date = new Date(dateInput);
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return dateInput; // Return as is jika tidak bisa diproses
  }
  
  // Cek jika date valid
  if (isNaN(date.getTime())) {
    return dateInput; // Return original jika tidak valid
  }
  
  // Format ke dd-mm-yy
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2); // Ambil 2 digit terakhir
  
  return `${day}-${month}-${year}`;
}

// Render data ke tabel - DIPERBAIKI untuk format response API yang baru
function renderTable(data) {
  const table = document.getElementById('dataTable');
  
  if (!data || data.length === 0) {
    table.innerHTML = '<p>Tidak ada data untuk ditampilkan</p>';
    return;
  }

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
      ${data.map(row => {
        // PERBAIKAN: Sekarang row adalah object, bukan array
        console.log('Processing row:', row); // Debug setiap row
        
        return `
          <tr>
            <td>${row.BATCH || row.batch || ''}</td>
            <td>${formatDate(row.TANGGAL || row.tanggal || '')}</td>
            <td>${formatNumber(row.IPL || row.ipl || 0)}</td>
            <td>${formatNumber(row['KAS RT'] || row.rt || 0)}</td>
            <td>${formatNumber(row.TAKZIAH || row.takziah || 0)}</td>
            <td>${formatNumber(row['LAIN-LAIN'] || row.lainnya || 0)}</td>
            <td>${formatNumber(row['KAS GANG'] || row.kas_gang || 0)}</td>
            <td>${formatNumber(row.DENDA || row.denda || 0)}</td>
            <td class="total">${formatNumber(
              (row.IPL || row.ipl || 0) + 
              (row['KAS RT'] || row.kas_rt || 0) + 
              (row.TAKZIAH || row.takziah || 0) + 
              (row['LAIN-LAIN'] || row.lain_lain || 0) + 
              (row['KAS GANG'] || row.kas_gang || 0) + 
              (row.DENDA || row.denda || 0)
            )}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;
}

// Load data dari Google Apps Script - DIPERBAIKI
async function loadData() {
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  
  try {
    loadingElement.textContent = "Memuat data...";
    loadingElement.style.display = 'block';
    errorElement.textContent = "";
    errorElement.style.display = 'none';

    // PERBAIKAN: Tambahkan endpoint=data dan timestamp
    const url = `${CONFIG.WEB_APP_URL}?endpoint=data&t=${Date.now()}`;
    console.log("Fetching from:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // PERBAIKAN: Cek content-type dengan lebih toleran
    const contentType = response.headers.get('content-type') || '';
    console.log("Content-Type:", contentType);
    
    const responseText = await response.text();
    console.log("Raw response:", responseText.substring(0, 500)); // Log partial response
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      throw new Error(`Response bukan JSON valid: ${responseText.substring(0, 200)}...`);
    }
    
    console.log("Parsed data:", data);
    
    // PERBAIKAN: Handle response format dari API yang baru
    if (data.status === 'error') {
      throw new Error(data.error.message || 'API mengembalikan error');
    }
    
    if (data.status === 'success') {
      const tableData = data.data || [];
      console.log("Table data:", tableData);
      
      if (tableData.length === 0) {
        throw new Error('Tidak ada data dari spreadsheet');
      }
      
      loadingElement.style.display = 'none';
      renderTable(tableData);
      
      // Show metadata if available
      if (data.metadata) {
        console.log("Metadata:", data.metadata);
      }
      
    } else {
      throw new Error('Format response tidak dikenali');
    }
    
  } catch (error) {
    console.error("Error details:", error);
    loadingElement.style.display = 'none';
    errorElement.textContent = `Gagal memuat data: ${error.message}`;
    errorElement.style.display = 'block';
  }
}

// Test function untuk debugging
async function testAPI() {
  try {
    const testUrl = `${CONFIG.WEB_APP_URL}?endpoint=test&t=${Date.now()}`;
    console.log("Testing API:", testUrl);
    
    const response = await fetch(testUrl);
    const data = await response.json();
    
    console.log("Test API response:", data);
    
    if (data.status === 'success') {
      console.log("✅ API berfungsi normal");
    } else {
      console.log("❌ API error:", data);
    }
  } catch (error) {
    console.error("❌ Test API gagal:", error);
  }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  // Toggle sidebar di mobile (jika ada)
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-open');
    });
  }
  
  // Test API terlebih dahulu
  testAPI();
  
  // Load data awal
  setTimeout(() => {
    loadData();
  }, 1000); // Delay 1 detik untuk memastikan test selesai
});
