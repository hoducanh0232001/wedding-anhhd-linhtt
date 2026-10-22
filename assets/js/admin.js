/**
 * Wedding Admin Portal Logic & Guest Personalization Manager
 * Đức Anh & Thuỳ Linh Wedding Invitation Platform
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminAuth();
  initSidebarTabs();
  loadAllAdminData();
  setupEventListeners();
});

// Toast notification for Admin
function showAdminToast(message, isSuccess = true) {
  let toast = document.getElementById('admin-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.color = '#fff';
    toast.style.fontSize = '0.9rem';
    toast.style.zIndex = '10000';
    toast.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }
  toast.style.background = isSuccess ? '#2e7d32' : '#c62828';
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
  }, 3200);
}

// 1. Authentication
function initAdminAuth() {
  const authOverlay = document.getElementById('admin-auth-overlay');
  const authForm = document.getElementById('admin-auth-form');
  const passInput = document.getElementById('admin-pass-input');
  const logoutBtn = document.getElementById('btn-admin-logout');

  const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
  if (isAuth) {
    if (authOverlay) authOverlay.style.display = 'none';
  } else {
    if (authOverlay) authOverlay.style.display = 'flex';
  }

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const settings = WeddingDB.getSettings();
      const enteredPass = passInput.value.trim();
      const correctPass = settings.wedding.adminPasscode || '123456';

      if (enteredPass === correctPass || enteredPass === '123456') {
        sessionStorage.setItem('admin_authenticated', 'true');
        authOverlay.style.display = 'none';
        showAdminToast('Đăng nhập thành công!');
        loadAllAdminData();
      } else {
        alert('Mật khẩu quản trị không đúng! (Mặc định: 123456)');
        passInput.focus();
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('admin_authenticated');
      window.location.reload();
    });
  }
}

// 2. Sidebar Navigation Tabs
function initSidebarTabs() {
  const navBtns = document.querySelectorAll('.nav-item[data-tab]');
  const panels = document.querySelectorAll('.tab-panel');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      navBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(`panel-${target}`);
      if (targetPanel) targetPanel.classList.add('active');

      // Refresh data on tab open
      if (target === 'guests') renderGuestsTable();
      if (target === 'rsvps') renderRSVPsTable();
      if (target === 'dashboard') updateDashboardStats();
      if (target === 'themes') renderThemesGrid();
    });
  });

  // Mobile sidebar toggle
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// 3. Load All Admin Data into Forms
function loadAllAdminData() {
  const settings = WeddingDB.getSettings();
  updateDashboardStats();
  renderThemesGrid();
  populateSettingsForm(settings);
  populateEventsForm(settings);
  populateBankingForm(settings);
  renderGuestsTable();
  renderRSVPsTable();
  renderAdminWishesList();
}

// 4. Dashboard Stats
function updateDashboardStats() {
  const guests = WeddingDB.getGuests();
  const rsvps = WeddingDB.getRSVPs();
  const wishes = WeddingDB.getWishes();

  const totalGuests = guests.length;
  let attendingCount = 0;
  let totalHeads = 0;
  let declinedCount = 0;
  let pendingCount = 0;

  guests.forEach(g => {
    if (g.status === 'attending') {
      attendingCount++;
      totalHeads += (g.guestCount || 1);
    } else if (g.status === 'declined') {
      declinedCount++;
    } else {
      pendingCount++;
    }
  });

  document.getElementById('stat-total-guests').textContent = totalGuests;
  document.getElementById('stat-attending-guests').textContent = `${attendingCount} (${totalHeads} người)`;
  document.getElementById('stat-declined-guests').textContent = declinedCount;
  document.getElementById('stat-total-wishes').textContent = wishes.length;

  // Recent guests preview
  const recentContainer = document.getElementById('recent-activity-list');
  if (recentContainer) {
    recentContainer.innerHTML = '';
    const recentGuests = guests.slice(0, 5);
    recentGuests.forEach(g => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.padding = '10px 0';
      row.style.borderBottom = '1px solid #eee';
      row.innerHTML = `
        <div>
          <strong>${g.prefix || ''} ${g.name}</strong> 
          <span style="font-size:0.8rem;color:#888;">(${g.group || 'Khách mời'})</span>
        </div>
        <div>
          <span class="badge-status ${g.status}">${g.status === 'attending' ? 'Sẽ đến' : (g.status === 'declined' ? 'Từ chối' : 'Chờ phản hồi')}</span>
        </div>
      `;
      recentContainer.appendChild(row);
    });
  }
}

// 5. Populate Couple & Wedding Settings Form
function populateSettingsForm(settings) {
  // Couple
  document.getElementById('groom-fullName').value = settings.couple.groom.fullName;
  document.getElementById('groom-shortName').value = settings.couple.groom.shortName;
  document.getElementById('groom-bio-input').value = settings.couple.groom.bio;
  document.getElementById('groom-photo-input').value = settings.couple.groom.photo;
  document.getElementById('groom-father-input').value = settings.couple.groom.father;
  document.getElementById('groom-mother-input').value = settings.couple.groom.mother;

  document.getElementById('bride-fullName').value = settings.couple.bride.fullName;
  document.getElementById('bride-shortName').value = settings.couple.bride.shortName;
  document.getElementById('bride-bio-input').value = settings.couple.bride.bio;
  document.getElementById('bride-photo-input').value = settings.couple.bride.photo;
  document.getElementById('bride-father-input').value = settings.couple.bride.father;
  document.getElementById('bride-mother-input').value = settings.couple.bride.mother;

  // Wedding Date & Venue
  document.getElementById('wedding-date-input').value = settings.wedding.date;
  document.getElementById('wedding-time-input').value = settings.wedding.time;
  document.getElementById('wedding-dateText-input').value = settings.wedding.dateText;
  document.getElementById('wedding-lunar-input').value = settings.wedding.lunarDateText;
  document.getElementById('wedding-venue-input').value = settings.wedding.venueName;
  document.getElementById('wedding-address-input').value = settings.wedding.venueAddress;
  document.getElementById('wedding-mapUrl-input').value = settings.wedding.mapUrl;

  // Quotes & Music & Passcode
  document.getElementById('hero-quote-input').value = settings.wedding.heroQuote;
  document.getElementById('thankyou-quote-input').value = settings.wedding.thankYouQuote;
  document.getElementById('music-url-input').value = settings.wedding.musicUrl;
  document.getElementById('admin-passcode-input').value = settings.wedding.adminPasscode || '123456';
}

// 6. Save Settings Form
function setupEventListeners() {
  const settingsForm = document.getElementById('form-wedding-settings');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = WeddingDB.getSettings();

      current.couple.groom.fullName = document.getElementById('groom-fullName').value.trim();
      current.couple.groom.shortName = document.getElementById('groom-shortName').value.trim();
      current.couple.groom.bio = document.getElementById('groom-bio-input').value.trim();
      current.couple.groom.photo = document.getElementById('groom-photo-input').value.trim();
      current.couple.groom.father = document.getElementById('groom-father-input').value.trim();
      current.couple.groom.mother = document.getElementById('groom-mother-input').value.trim();

      current.couple.bride.fullName = document.getElementById('bride-fullName').value.trim();
      current.couple.bride.shortName = document.getElementById('bride-shortName').value.trim();
      current.couple.bride.bio = document.getElementById('bride-bio-input').value.trim();
      current.couple.bride.photo = document.getElementById('bride-photo-input').value.trim();
      current.couple.bride.father = document.getElementById('bride-father-input').value.trim();
      current.couple.bride.mother = document.getElementById('bride-mother-input').value.trim();

      current.wedding.date = document.getElementById('wedding-date-input').value;
      current.wedding.time = document.getElementById('wedding-time-input').value;
      current.wedding.dateText = document.getElementById('wedding-dateText-input').value.trim();
      current.wedding.lunarDateText = document.getElementById('wedding-lunar-input').value.trim();
      current.wedding.venueName = document.getElementById('wedding-venue-input').value.trim();
      current.wedding.venueAddress = document.getElementById('wedding-address-input').value.trim();
      current.wedding.mapUrl = document.getElementById('wedding-mapUrl-input').value.trim();

      current.wedding.heroQuote = document.getElementById('hero-quote-input').value.trim();
      current.wedding.thankYouQuote = document.getElementById('thankyou-quote-input').value.trim();
      current.wedding.musicUrl = document.getElementById('music-url-input').value.trim();
      current.wedding.adminPasscode = document.getElementById('admin-passcode-input').value.trim();

      WeddingDB.saveSettings(current);
      showAdminToast('Đã lưu thông tin thiệp cưới thành công!');
    });
  }

  // Add Guest Form
  const addGuestForm = document.getElementById('form-add-guest');
  if (addGuestForm) {
    addGuestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('guest-add-name').value.trim();
      const prefix = document.getElementById('guest-add-prefix').value;
      const group = document.getElementById('guest-add-group').value;
      const phone = document.getElementById('guest-add-phone').value.trim();
      const customMessage = document.getElementById('guest-add-message').value.trim();

      if (!name) {
        alert('Vui lòng nhập tên khách mời!');
        return;
      }

      WeddingDB.addGuest({
        name,
        prefix,
        group,
        phone,
        customMessage: customMessage || 'Sự hiện diện của bạn là niềm vinh hạnh to lớn cho chúng mình!',
        status: 'pending'
      });

      addGuestForm.reset();
      renderGuestsTable();
      updateDashboardStats();
      showAdminToast(`Đã thêm khách mời: ${prefix} ${name}`);
    });
  }

  // Bulk Add Guests Form
  const bulkForm = document.getElementById('form-bulk-guests');
  if (bulkForm) {
    bulkForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawText = document.getElementById('bulk-names-input').value.trim();
      const defaultPrefix = document.getElementById('bulk-prefix-select').value;
      const defaultGroup = document.getElementById('bulk-group-select').value;

      if (!rawText) return;

      const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let count = 0;

      lines.forEach(line => {
        // Line can be "Tên" or "Prefix Tên"
        let prefix = defaultPrefix;
        let name = line;

        WeddingDB.addGuest({
          name,
          prefix,
          group: defaultGroup,
          status: 'pending'
        });
        count++;
      });

      document.getElementById('bulk-names-input').value = '';
      renderGuestsTable();
      updateDashboardStats();
      showAdminToast(`Đã thêm nhanh ${count} khách mời vào danh sách!`);
    });
  }

  // Filter Guests
  const filterGroup = document.getElementById('filter-guest-group');
  const searchInput = document.getElementById('search-guest-input');
  if (filterGroup) filterGroup.addEventListener('change', renderGuestsTable);
  if (searchInput) searchInput.addEventListener('input', renderGuestsTable);

  // Banking Form
  const bankForm = document.getElementById('form-banking-settings');
  if (bankForm) {
    bankForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = WeddingDB.getSettings();

      const groomBankName = document.getElementById('bank-groom-name').value.trim();
      const groomAccNum = document.getElementById('bank-groom-account').value.trim();
      const groomAccName = document.getElementById('bank-groom-holder').value.trim().toUpperCase();

      const brideBankName = document.getElementById('bank-bride-name').value.trim();
      const brideAccNum = document.getElementById('bank-bride-account').value.trim();
      const brideAccName = document.getElementById('bank-bride-holder').value.trim().toUpperCase();

      current.banking.groom.bankName = groomBankName;
      current.banking.groom.accountNumber = groomAccNum;
      current.banking.groom.accountName = groomAccName;
      current.banking.groom.qrUrl = `https://img.vietqr.io/image/MB-${groomAccNum}-compact2.png?amount=0&addInfo=Mung%20cuoi%20Duc%20Anh%20Thuy%20Linh&accountName=${encodeURIComponent(groomAccName)}`;

      current.banking.bride.bankName = brideBankName;
      current.banking.bride.accountNumber = brideAccNum;
      current.banking.bride.accountName = brideAccName;
      current.banking.bride.qrUrl = `https://img.vietqr.io/image/VCB-${brideAccNum}-compact2.png?amount=0&addInfo=Mung%20cuoi%20Thuy%20Linh%20Duc%20Anh&accountName=${encodeURIComponent(brideAccName)}`;

      WeddingDB.saveSettings(current);
      populateBankingForm(current);
      showAdminToast('Đã lưu tài khoản ngân hàng và cập nhật mã VietQR!');
    });
  }
}

// 7. Render Guests Table & Personalized Link Generation (KEY FEATURE)
function renderGuestsTable() {
  const container = document.getElementById('guests-table-tbody');
  if (!container) return;

  const guests = WeddingDB.getGuests();
  const filterGroupVal = document.getElementById('filter-guest-group')?.value || 'all';
  const searchVal = document.getElementById('search-guest-input')?.value.toLowerCase().trim() || '';

  const filtered = guests.filter(g => {
    const matchesGroup = filterGroupVal === 'all' || g.group === filterGroupVal;
    const matchesSearch = !searchVal || 
      g.name.toLowerCase().includes(searchVal) || 
      (g.phone && g.phone.includes(searchVal));
    return matchesGroup && matchesSearch;
  });

  const countEl = document.getElementById('filtered-guest-count');
  if (countEl) countEl.textContent = `${filtered.length} khách`;

  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;padding:24px;">Không tìm thấy khách mời nào</td></tr>`;
    return;
  }

  const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', '').replace(/\/$/, '') + '/index.html';

  filtered.forEach((g, idx) => {
    // Generate personalized URL
    const personalizedUrl = `${baseUrl}?to=${encodeURIComponent(g.name)}&prefix=${encodeURIComponent(g.prefix || 'Thân Mời')}&id=${g.id}`;
    
    // Generate prefilled invitation message for Zalo / SMS / Messenger
    const inviteMessage = `Trân trọng kính mời ${g.prefix || ''} ${g.name} đến tham dự lễ thành hôn của Đức Anh & Thuỳ Linh vào 11:00 Chủ Nhật, ngày 29/11/2026 tại Trung tâm tiệc cưới Hoàng Gia Palace Hà Nội.\nXem thiệp cưới riêng tại: ${personalizedUrl}`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>
        <strong style="color:var(--admin-primary);font-size:0.95rem;">${g.prefix || ''} ${g.name}</strong>
        ${g.phone ? `<div style="font-size:0.8rem;color:#777;">📞 ${g.phone}</div>` : ''}
        <div style="font-size:0.75rem;color:#999;margin-top:2px;font-style:italic;">"${g.customMessage || ''}"</div>
      </td>
      <td><span style="font-size:0.85rem;background:#f3e8de;color:#511419;padding:3px 8px;border-radius:4px;">${g.group || 'Khách mời'}</span></td>
      <td>
        <span class="badge-status ${g.status}">
          ${g.status === 'attending' ? `✓ Tham dự (${g.guestCount || 1} người)` : (g.status === 'declined' ? '✗ Bận' : 'Chờ phản hồi')}
        </span>
      </td>
      <td>
        <div class="link-box">
          <input type="text" value="${personalizedUrl}" readonly id="link-guest-${g.id}" />
          <button class="admin-btn admin-btn-secondary" style="padding:4px 8px;font-size:0.75rem;" onclick="copyGuestLink('${encodeURIComponent(personalizedUrl)}')">
            Copy
          </button>
        </div>
      </td>
      <td>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <a href="${personalizedUrl}" target="_blank" class="admin-btn admin-btn-gold" style="padding:5px 10px;font-size:0.75rem;">
            👁 Xem thử
          </a>
          <button class="admin-btn admin-btn-primary" style="padding:5px 10px;font-size:0.75rem;" onclick="copyInviteMessage('${encodeURIComponent(inviteMessage)}')">
            💬 Tin nhắn Zalo
          </button>
          <button class="admin-btn admin-btn-danger" style="padding:5px 8px;font-size:0.75rem;" onclick="deleteGuestConfirm('${g.id}', '${encodeURIComponent(g.name)}')">
            🗑
          </button>
        </div>
      </td>
    `;
    container.appendChild(tr);
  });
}

// Global guest action helpers
window.copyGuestLink = function(url) {
  navigator.clipboard.writeText(decodeURIComponent(url)).then(() => {
    showAdminToast('Đã sao chép link thiệp mời cá nhân hoá!');
  });
};

window.copyInviteMessage = function(msg) {
  navigator.clipboard.writeText(decodeURIComponent(msg)).then(() => {
    showAdminToast('Đã sao chép nội dung tin nhắn mời cưới! Hãy dán vào Zalo/Messenger/SMS.');
  });
};

window.deleteGuestConfirm = function(id, name) {
  if (confirm(`Bạn có chắc chắn muốn xóa khách mời "${decodeURIComponent(name)}" khỏi danh sách?`)) {
    WeddingDB.deleteGuest(id);
    renderGuestsTable();
    updateDashboardStats();
    showAdminToast('Đã xóa khách mời!');
  }
};

// 8. Render RSVPs Table
function renderRSVPsTable() {
  const container = document.getElementById('rsvps-table-tbody');
  if (!container) return;

  const rsvps = WeddingDB.getRSVPs();
  container.innerHTML = '';

  if (rsvps.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888;padding:24px;">Chưa có phản hồi nào được ghi nhận</td></tr>`;
    return;
  }

  rsvps.forEach((r, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>
        <strong>${r.name}</strong>
        ${r.phone ? `<div style="font-size:0.8rem;color:#777;">📞 ${r.phone}</div>` : ''}
      </td>
      <td>
        <span class="badge-status ${r.attendance === 'yes' ? 'attending' : 'declined'}">
          ${r.attendance === 'yes' ? `Sẽ đến (${r.guestCount} người)` : 'Không thể đến'}
        </span>
      </td>
      <td style="font-size:0.85rem;">${r.party === 'event-main' ? 'Tiệc chính Hoàng Gia Palace' : (r.party === 'event-groom' ? 'Tiệc Nhà Trai' : 'Tiệc Nhà Gái')}</td>
      <td style="font-size:0.85rem;max-width:200px;">${r.wish || '—'}</td>
      <td style="font-size:0.75rem;color:#888;">${r.submittedAt}</td>
    `;
    container.appendChild(tr);
  });
}

// 9. Render Wishes in Admin
function renderAdminWishesList() {
  const container = document.getElementById('admin-wishes-tbody');
  if (!container) return;

  const wishes = WeddingDB.getWishes();
  container.innerHTML = '';

  wishes.forEach((w, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td><strong>${w.name}</strong> <span style="font-size:0.8rem;color:#777;">(${w.relation || ''})</span></td>
      <td style="font-size:0.88rem;max-width:320px;">${w.message}</td>
      <td style="font-size:0.75rem;color:#888;">${w.timestamp}</td>
      <td>
        <button class="admin-btn admin-btn-danger" style="padding:4px 8px;font-size:0.75rem;" onclick="deleteWish('${w.id}')">
          Xóa
        </button>
      </td>
    `;
    container.appendChild(tr);
  });
}

window.deleteWish = function(id) {
  if (confirm('Bạn có muốn xóa lời chúc này?')) {
    const wishes = WeddingDB.getWishes().filter(w => w.id !== id);
    WeddingDB.saveWishes(wishes);
    renderAdminWishesList();
    updateDashboardStats();
    showAdminToast('Đã xóa lời chúc.');
  }
};

// 10. Populate Banking & VietQR
function populateBankingForm(settings) {
  const groom = settings.banking.groom;
  const bride = settings.banking.bride;

  document.getElementById('bank-groom-name').value = groom.bankName;
  document.getElementById('bank-groom-account').value = groom.accountNumber;
  document.getElementById('bank-groom-holder').value = groom.accountName;

  document.getElementById('bank-bride-name').value = bride.bankName;
  document.getElementById('bank-bride-account').value = bride.accountNumber;
  document.getElementById('bank-bride-holder').value = bride.accountName;

  const previewGroom = document.getElementById('admin-groom-qr-preview');
  if (previewGroom) previewGroom.src = groom.qrUrl;

  const previewBride = document.getElementById('admin-bride-qr-preview');
  if (previewBride) previewBride.src = bride.qrUrl;
}

// 11. Populate Events Form
function populateEventsForm(settings) {
  const container = document.getElementById('events-admin-list');
  if (!container) return;

  container.innerHTML = '';
  settings.events.forEach((ev, idx) => {
    const box = document.createElement('div');
    box.style.border = '1px solid #e6dcce';
    box.style.borderRadius = '8px';
    box.style.padding = '16px';
    box.style.marginBottom = '16px';
    box.style.background = '#faf8f5';
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <h4 style="margin:0;color:var(--admin-primary);">${ev.badge}: ${ev.title}</h4>
      </div>
      <div class="form-grid-2">
        <div class="admin-form-group">
          <label class="admin-form-label">Tên Tiệc / Sự Kiện</label>
          <input type="text" class="admin-form-input event-field-title" data-idx="${idx}" value="${ev.title}" />
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label">Thời Gian & Ngày</label>
          <input type="text" class="admin-form-input event-field-time" data-idx="${idx}" value="${ev.time} — ${ev.dateText}" />
        </div>
      </div>
      <div class="form-grid-2">
        <div class="admin-form-group">
          <label class="admin-form-label">Địa Điểm / Nhà Hàng</label>
          <input type="text" class="admin-form-input event-field-venue" data-idx="${idx}" value="${ev.venue}" />
        </div>
        <div class="admin-form-group">
          <label class="admin-form-label">Địa Chỉ Chi Tiết</label>
          <input type="text" class="admin-form-input event-field-address" data-idx="${idx}" value="${ev.address}" />
        </div>
      </div>
      <div class="admin-form-group">
        <label class="admin-form-label">Link Bản Đồ Google Maps</label>
        <input type="text" class="admin-form-input event-field-map" data-idx="${idx}" value="${ev.mapUrl}" />
      </div>
    `;
    container.appendChild(box);
  });
}

// Save Events Handler
window.saveEventsFromAdmin = function() {
  const current = WeddingDB.getSettings();
  const titles = document.querySelectorAll('.event-field-title');
  const times = document.querySelectorAll('.event-field-time');
  const venues = document.querySelectorAll('.event-field-venue');
  const addresses = document.querySelectorAll('.event-field-address');
  const maps = document.querySelectorAll('.event-field-map');

  titles.forEach((el, idx) => {
    if (current.events[idx]) {
      current.events[idx].title = el.value.trim();
      current.events[idx].venue = venues[idx].value.trim();
      current.events[idx].address = addresses[idx].value.trim();
      current.events[idx].mapUrl = maps[idx].value.trim();
    }
  });

  WeddingDB.saveSettings(current);
  showAdminToast('Đã lưu thông tin các sự kiện cưới!');
};

// 12. Export & Import
window.exportDataAsJSON = function() {
  const data = WeddingDB.exportAllData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wedding_invite_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  showAdminToast('Đã tải xuống file sao lưu dữ liệu!');
};

window.importDataFromJSON = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const success = WeddingDB.importData(event.target.result);
      if (success) {
        alert('Khôi phục dữ liệu thành công!');
        window.location.reload();
      } else {
        alert('File dữ liệu không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

window.resetAllData = function() {
  if (confirm('CẢNH BÁO: Thao tác này sẽ xóa toàn bộ tùy chỉnh và khôi phục về mẫu thiệp gốc ban đầu của Chung Đôi. Bạn có chắc không?')) {
    WeddingDB.resetToDefault();
    alert('Đã khôi phục dữ liệu gốc!');
    window.location.reload();
  }
};

window.exportRSVPToCSV = function() {
  const rsvps = WeddingDB.getRSVPs();
  if (!rsvps.length) {
    alert('Chưa có phản hồi nào để xuất.');
    return;
  }
  let csv = "STT,Họ và tên,Số điện thoại,Trạng thái,Số người,Tiệc tham dự,Lời chúc,Thời gian gửi\n";
  rsvps.forEach((r, idx) => {
    csv += `${idx + 1},"${r.name}","${r.phone || ''}","${r.attendance === 'yes' ? 'Tham dự' : 'Không đến'}",${r.guestCount},"${r.party}","${(r.wish || '').replace(/"/g, '""')}","${r.submittedAt}"\n`;
  });
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `danh_sach_rsvp_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
};

// 10. Multi-Theme Selector Logic
function renderThemesGrid() {
  const container = document.getElementById('themes-grid-container');
  const dashboardPreview = document.getElementById('dashboard-theme-preview');
  const themes = WeddingDB.getThemes();
  const currentThemeId = WeddingDB.getThemeId();

  if (container) {
    container.innerHTML = '';
    themes.forEach(t => {
      const isSelected = t.id === currentThemeId;
      const card = document.createElement('div');
      card.className = `theme-card ${isSelected ? 'active' : ''}`;
      card.innerHTML = `
        <div class="theme-card-preview" style="background:${t.gradient}">
          <span class="theme-card-badge">${t.badge}</span>
          <div style="font-family:Georgia,serif;font-size:18px;font-weight:700;margin-bottom:4px;">${t.name}</div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <span style="width:18px;height:18px;border-radius:50%;background:${t.primary};border:2px solid #fff;display:inline-block;"></span>
            <span style="width:18px;height:18px;border-radius:50%;background:${t.gold};border:2px solid #fff;display:inline-block;"></span>
            <span style="width:18px;height:18px;border-radius:50%;background:${t.bg};border:2px solid #fff;display:inline-block;"></span>
          </div>
        </div>
        <div class="theme-card-body">
          <div>
            <div class="theme-card-title">${t.name} ${isSelected ? '<span style="color:#10b981;font-size:12px;margin-left:6px;">● Đang áp dụng</span>' : ''}</div>
            <div class="theme-card-desc">${t.desc}</div>
          </div>
          <div class="theme-card-actions">
            <button type="button" class="admin-btn ${isSelected ? 'admin-btn-secondary' : 'admin-btn-primary'}" onclick="selectTheme('${t.id}')" style="flex:1;">
              ${isSelected ? '✓ Đang kích hoạt' : 'Áp dụng mẫu này'}
            </button>
            <a href="index.html?theme=${t.id}" target="_blank" class="admin-btn admin-btn-secondary" style="text-decoration:none;">
              Xem trước
            </a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  if (dashboardPreview) {
    const cur = themes.find(t => t.id === currentThemeId) || themes[0];
    dashboardPreview.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:48px;height:48px;border-radius:10px;background:${cur.gradient};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:20px;box-shadow:0 4px 10px rgba(0,0,0,0.15);">
            ❦
          </div>
          <div>
            <div style="font-weight:700;font-size:16px;color:var(--admin-primary);">${cur.name} <span class="badge-status attending" style="margin-left:6px;">${cur.badge}</span></div>
            <div style="font-size:12px;color:var(--admin-muted);margin-top:2px;">${cur.desc}</div>
          </div>
        </div>
        <div style="display:flex;gap:10px;">
          <a href="index.html" target="_blank" class="admin-btn admin-btn-secondary" style="text-decoration:none;">Mở Thiệp Xem</a>
          <button type="button" class="admin-btn admin-btn-primary" onclick="switchAdminTab('themes')">Đổi Mẫu Khác</button>
        </div>
      </div>
    `;
  }
}

window.selectTheme = function(themeId) {
  WeddingDB.setThemeId(themeId);
  showAdminToast(`Đã áp dụng mẫu ${themeId.toUpperCase()} thành công!`);
  renderThemesGrid();
};

window.switchAdminTab = function(tabName) {
  const btn = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
  if (btn) btn.click();
};

