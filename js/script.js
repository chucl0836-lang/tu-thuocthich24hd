// ==================================================
// NHÀ THUỐC THÍCH 24 GIỜ - SCRIPT CHÍNH
// ==================================================

document.addEventListener('DOMContentLoaded', () => {
  let allMedicines = [];
  let currentFilter = 'all';
  let searchTerm = '';

  const productsGrid = document.getElementById('products-grid');
  const searchInput = document.getElementById('product-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const expiryAlert = document.getElementById('expiry-alert');
  const alertCountSpan = document.querySelector('.alert-count');

  // ---------- Tải dữ liệu từ config.json ----------
  async function loadMedicines() {
    try {
      const response = await fetch('./config.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      allMedicines = data;
      hideLoadingScreen();
      renderProducts();
      updateExpiryAlert();
    } catch (error) {
      console.error('Lỗi tải config.json:', error);
      if (productsGrid) {
        productsGrid.innerHTML = `
          <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">
            <div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div>
            <strong>Không thể tải dữ liệu thuốc.</strong><br>
            Vui lòng kiểm tra file <code style="background:#eee;padding:2px 6px;border-radius:8px;">config.json</code>.
          </div>
        `;
      }
      hideLoadingScreen();
    }
  }

  function hideLoadingScreen() {
    const loading = document.getElementById('loading-screen');
    if (loading) {
      loading.style.opacity = '0';
      setTimeout(() => loading.style.display = 'none', 500);
    }
  }

  function renderProducts() {
    if (!productsGrid) return;
    let filtered = [...allMedicines];

    if (currentFilter !== 'all') {
      if (currentFilter === 'expiring') {
        filtered = filtered.filter(m => m.status === 'expiring');
      } else {
        filtered = filtered.filter(m => m.category === currentFilter);
      }
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(term) ||
        (m.brand && m.brand.toLowerCase().includes(term)) ||
        (m.category && m.category.toLowerCase().includes(term))
      );
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">
          🔍 Không tìm thấy thuốc nào phù hợp
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(item => `
      <div class="product-card" data-id="${item.id}">
        <div class="product-img">
          ${item.image
            ? `<img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.parentElement.innerHTML='<div style=font-size:3rem>${item.icon || '💊'}</div>';">`
            : `<div style="font-size:3rem">${item.icon || '💊'}</div>`}
        </div>
        <div class="product-info">
          <div class="product-name">${item.name}</div>
          <div class="product-category">${item.category}</div>
          <div class="product-desc">${item.description || 'Không có mô tả'}</div>
          <div class="product-meta">
            <span>📦 ${item.quantity} ${item.unit}</span>
            <span class="product-status ${item.status === 'expiring' ? 'expiring' : ''}">
              ${item.status === 'expiring' ? '⚠️ Sắp hết hạn' : '✅ Còn tốt'}
            </span>
          </div>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        const medicine = allMedicines.find(m => m.id === id);
        if (medicine) showModal(medicine);
      });
    });
  }

  function showModal(med) {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    document.getElementById('modalName').innerText = med.name;
    document.getElementById('modalDesc').innerText = med.description || 'Không có mô tả.';
    document.getElementById('modalDosage').innerText = med.dosage || 'Theo hướng dẫn của bác sĩ.';
    document.getElementById('modalWarning').innerText = med.warning || '';
    const modalImg = document.getElementById('modalImg');
    if (med.image) {
      modalImg.src = med.image;
      modalImg.onerror = () => { modalImg.style.display = 'none'; };
      modalImg.style.display = 'block';
    } else {
      modalImg.style.display = 'none';
    }
    modal.style.display = 'flex';
  }

  window.closeModal = function () {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
  };

  document.getElementById('productModal')?.addEventListener('click', function (e) {
    if (e.target === this) window.closeModal();
  });

  function updateExpiryAlert() {
    const count = allMedicines.filter(m => m.status === 'expiring').length;
    if (expiryAlert) {
      if (count > 0) {
        if (alertCountSpan) alertCountSpan.innerText = count;
        expiryAlert.style.display = 'flex';
      } else {
        expiryAlert.style.display = 'none';
      }
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      renderProducts();
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });

  const darkToggle = document.querySelector('.dark-toggle');
  if (darkToggle) {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
      darkToggle.innerText = '☀️';
    }
    darkToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      darkToggle.innerText = isDark ? '☀️' : '🌙';
    });
  }

  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('active'));
  }

  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    window.addEventListener('scroll', () => {
      backBtn.style.opacity = window.scrollY > 300 ? '1' : '0';
    });
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  loadMedicines();
});