
// Bank switch toggle handler
window.handleBankSwitchToggle = function(isChecked) {
  const badge = document.getElementById('setting-show-bank-badge');
  if (badge) {
    if (isChecked) {
      badge.className = 'admin-switch-status on';
      badge.innerHTML = '● Đang BẬT (Hiển thị)';
    } else {
      badge.className = 'admin-switch-status off';
      badge.innerHTML = '○ Đang TẮT (Ẩn khỏi thiệp)';
    }
  }
  if (typeof triggerAutoSave === 'function') {
    triggerAutoSave();
  }
};
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
      if (target === 'gallery') renderGalleryAdmin();
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
  renderGalleryAdmin();
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
  const groomAddrInput = document.getElementById('groom-address-input');
  if (groomAddrInput) groomAddrInput.value = settings.couple.groom.address || '';

  document.getElementById('bride-fullName').value = settings.couple.bride.fullName;
  document.getElementById('bride-shortName').value = settings.couple.bride.shortName;
  document.getElementById('bride-bio-input').value = settings.couple.bride.bio;
  document.getElementById('bride-photo-input').value = settings.couple.bride.photo;
  document.getElementById('bride-father-input').value = settings.couple.bride.father;
  document.getElementById('bride-mother-input').value = settings.couple.bride.mother;
  const brideAddrInput = document.getElementById('bride-address-input');
  if (brideAddrInput) brideAddrInput.value = settings.couple.bride.address || '';

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
  // Hook auto-save to all admin form inputs
  document.querySelectorAll('input, textarea, select').forEach(el => {
    el.addEventListener('input', triggerAutoSave);
    el.addEventListener('change', triggerAutoSave);
  });

  setupGalleryEventListeners();

  const dateInput = document.getElementById('wedding-date-input');
  const dateTextInput = document.getElementById('wedding-dateText-input');
  if (dateInput && dateTextInput) {
    dateInput.addEventListener('change', () => {
      if (dateInput.value) {
        const d = new Date(dateInput.value);
        if (!isNaN(d)) {
          const daysOfWeekVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
          dateTextInput.value = `${daysOfWeekVi[d.getDay()]}, ${d.getDate()} Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
        }
      }
    });
  }

  const settingsForm = document.getElementById('form-wedding-settings');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = WeddingDB.getSettings();

      const groomFull = document.getElementById('groom-fullName').value.trim();
      let groomShort = document.getElementById('groom-shortName').value.trim();
      if (!groomShort && groomFull) {
        const words = groomFull.split(' ');
        groomShort = words[words.length - 1];
      }

      const brideFull = document.getElementById('bride-fullName').value.trim();
      let brideShort = document.getElementById('bride-shortName').value.trim();
      if (!brideShort && brideFull) {
        const words = brideFull.split(' ');
        brideShort = words[words.length - 1];
      }

      current.couple.groom.fullName = groomFull;
      current.couple.groom.shortName = groomShort;
      current.couple.groom.bio = document.getElementById('groom-bio-input').value.trim();
      current.couple.groom.photo = document.getElementById('groom-photo-input').value.trim();
      current.couple.groom.father = document.getElementById('groom-father-input').value.trim();
      current.couple.groom.mother = document.getElementById('groom-mother-input').value.trim();
      const gAddr = document.getElementById('groom-address-input');
      if (gAddr) current.couple.groom.address = gAddr.value.trim();

      current.couple.bride.fullName = brideFull;
      current.couple.bride.shortName = brideShort;
      current.couple.bride.bio = document.getElementById('bride-bio-input').value.trim();
      current.couple.bride.photo = document.getElementById('bride-photo-input').value.trim();
      current.couple.bride.father = document.getElementById('bride-father-input').value.trim();
      current.couple.bride.mother = document.getElementById('bride-mother-input').value.trim();
      const bAddr = document.getElementById('bride-address-input');
      if (bAddr) current.couple.bride.address = bAddr.value.trim();

      current.wedding.date = document.getElementById('wedding-date-input').value;
      current.wedding.time = document.getElementById('wedding-time-input').value;
      
      let dateTextVal = document.getElementById('wedding-dateText-input').value.trim();
      if (!dateTextVal && current.wedding.date) {
        const d = new Date(current.wedding.date);
        if (!isNaN(d)) {
          const daysOfWeekVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
          dateTextVal = `${daysOfWeekVi[d.getDay()]}, ${d.getDate()} Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
        }
      }
      current.wedding.dateText = dateTextVal;
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

      const showBankCheckbox = document.getElementById('setting-show-bank');
      if (showBankCheckbox) {
        current.showBank = showBankCheckbox.checked;
      }

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
    container.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#6b7280;padding:32px 16px;font-size:14px;">Chưa có khách mời nào trong danh sách.<br><span style="font-size:12.5px;color:#9ca3af;">Bấm nút "+ Thêm Khách Mới" hoặc "Nhập Nhiều Khách" ở trên để tạo link mời cá nhân hoá.</span></td></tr>`;
    return;
  }

  let domainOrigin = window.location.origin;
  if (window.location.hostname.includes('vercel.app')) {
    domainOrigin = 'https://wedding-anhhd-linhtt.vercel.app';
  }
  const baseUrl = `${domainOrigin}/`;

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

  if (wishes.length === 0) {
    container.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#6b7280;padding:28px 16px;font-size:14px;">Chưa có lời chúc nào từ khách mời.</td></tr>';
    return;
  }

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

  const showBankCheckbox = document.getElementById('setting-show-bank');
  if (showBankCheckbox) {
    const isChecked = settings.showBank !== false;
    showBankCheckbox.checked = isChecked;
    const badge = document.getElementById('setting-show-bank-badge');
    if (badge) {
      badge.className = isChecked ? 'admin-switch-status on' : 'admin-switch-status off';
      badge.innerHTML = isChecked ? '● Đang BẬT (Hiển thị)' : '○ Đang TẮT (Ẩn khỏi thiệp)';
    }
  }

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
      if (times[idx]) {
        const val = times[idx].value.trim();
        const parts = val.split('—');
        if (parts.length > 1) {
          current.events[idx].time = parts[0].trim();
          current.events[idx].dateText = parts[1].trim();
        } else {
          current.events[idx].time = val;
        }
      }
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

window.copyOfficialLink = function() {
  const url = 'https://wedding-anhhd-linhtt.vercel.app/';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showAdminToast('Đã sao chép link thiệp cưới chính thức!');
    }).catch(() => {
      prompt('Link thiệp cưới chính thức của bạn:', url);
    });
  } else {
    prompt('Link thiệp cưới chính thức của bạn:', url);
  }
};

/* ==========================================================================
   PHOTO & 3D GALLERY MANAGEMENT LOGIC (ALBUM CƯỚI & ẢNH ĐẠI DIỆN)
   ========================================================================== */

// Helper: Read and compress image to base64 safely within localStorage size limits
function readAndOptimizeImage(file, callback, maxDim = 1600, quality = 0.85) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(dataUrl);
    };
    img.onerror = () => {
      alert('Không thể đọc định dạng ảnh này. Vui lòng thử ảnh khác!');
    };
    img.src = e.target.result;
  };
  reader.onerror = () => {
    alert('Lỗi đọc tập tin từ thiết bị!');
  };
  reader.readAsDataURL(file);
}

// 1. Setup Gallery Event Listeners (URL input live previews and file uploads)
function setupGalleryEventListeners() {
  // Hero Polaroid photo
  const heroInput = document.getElementById('admin-hero-photo-input');
  const heroPreview = document.getElementById('hero-photo-preview-img');
  const heroFile = document.getElementById('hero-photo-file-upload');

  if (heroInput && heroPreview) {
    heroInput.addEventListener('input', () => {
      const v = heroInput.value.trim();
      if (v) heroPreview.src = v;
    });
  }

  if (heroFile && heroInput && heroPreview) {
    heroFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        readAndOptimizeImage(file, (dataUrl) => {
          heroInput.value = dataUrl;
          heroPreview.src = dataUrl;
          showAdminToast('Đã đọc ảnh bìa Polaroid thành công! Bấm "Lưu" để hoàn tất.');
        });
      }
    });
  }

  // Groom photo
  const groomInput = document.getElementById('groom-gallery-photo-input');
  const groomPreview = document.getElementById('groom-gallery-preview-img');
  const groomFile = document.getElementById('groom-photo-file-upload');

  if (groomInput && groomPreview) {
    groomInput.addEventListener('input', () => {
      const v = groomInput.value.trim();
      if (v) groomPreview.src = v;
    });
  }

  if (groomFile && groomInput && groomPreview) {
    groomFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        readAndOptimizeImage(file, (dataUrl) => {
          groomInput.value = dataUrl;
          groomPreview.src = dataUrl;
          showAdminToast('Đã đọc ảnh Chú Rể thành công! Bấm "Lưu" để hoàn tất.');
        });
      }
    });
  }

  // Bride photo
  const brideInput = document.getElementById('bride-gallery-photo-input');
  const bridePreview = document.getElementById('bride-gallery-preview-img');
  const brideFile = document.getElementById('bride-photo-file-upload');

  if (brideInput && bridePreview) {
    brideInput.addEventListener('input', () => {
      const v = brideInput.value.trim();
      if (v) bridePreview.src = v;
    });
  }

  if (brideFile && brideInput && bridePreview) {
    brideFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        readAndOptimizeImage(file, (dataUrl) => {
          brideInput.value = dataUrl;
          bridePreview.src = dataUrl;
          showAdminToast('Đã đọc ảnh Cô Dâu thành công! Bấm "Lưu" để hoàn tất.');
        });
      }
    });
  }

  // Add new photo into 3D gallery
  const newUrlInput = document.getElementById('new-photo-url-input');
  const newPreviewWrap = document.getElementById('new-photo-preview-wrap');
  const newPreviewImg = document.getElementById('new-photo-preview-img');
  const newFileInput = document.getElementById('new-photo-file-upload');
  const newStatus = document.getElementById('new-photo-file-status');

  if (newUrlInput && newPreviewWrap && newPreviewImg) {
    newUrlInput.addEventListener('input', () => {
      const v = newUrlInput.value.trim();
      if (v) {
        newPreviewImg.src = v;
        newPreviewWrap.style.display = 'flex';
      } else {
        newPreviewWrap.style.display = 'none';
      }
    });
  }

  if (newFileInput && newUrlInput && newPreviewWrap && newPreviewImg) {
    newFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        readAndOptimizeImage(file, (dataUrl) => {
          newUrlInput.value = dataUrl;
          newPreviewImg.src = dataUrl;
          newPreviewWrap.style.display = 'flex';
          if (newStatus) newStatus.style.display = 'inline';
          showAdminToast('Đã đọc ảnh từ máy tính/điện thoại! Nhập chú thích và bấm Thêm.');
        });
      }
    });
  }
}

// 2. Render Gallery Tab Data
function renderGalleryAdmin() {
  const settings = WeddingDB.getSettings();
  if (!settings) return;

  // 1. Hero Polaroid Photo
  const heroInput = document.getElementById('admin-hero-photo-input');
  const heroPreview = document.getElementById('hero-photo-preview-img');
  const heroVal = settings.wedding.heroPhoto || (settings.gallery && settings.gallery[0] ? settings.gallery[0].src : 'assets/images/hero_couple.jpg');
  if (heroInput) heroInput.value = heroVal;
  if (heroPreview) heroPreview.src = heroVal;

  // 2. Groom & Bride Photos
  const groomInput = document.getElementById('groom-gallery-photo-input');
  const groomPreview = document.getElementById('groom-gallery-preview-img');
  const groomVal = settings.couple.groom.photo || 'assets/images/groom.jpg';
  if (groomInput) groomInput.value = groomVal;
  if (groomPreview) groomPreview.src = groomVal;

  const brideInput = document.getElementById('bride-gallery-photo-input');
  const bridePreview = document.getElementById('bride-gallery-preview-img');
  const brideVal = settings.couple.bride.photo || 'assets/images/bride.jpg';
  if (brideInput) brideInput.value = brideVal;
  if (bridePreview) bridePreview.src = brideVal;

  // 3. 3D Gallery Grid
  const container = document.getElementById('gallery-admin-list');
  const badge = document.getElementById('gallery-count-badge');
  const gallery = Array.isArray(settings.gallery) ? settings.gallery : [];

  if (badge) {
    badge.textContent = `${gallery.length} ảnh trong Album`;
  }

  if (!container) return;
  container.innerHTML = '';

  if (gallery.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:40px 20px;background:#f9fafb;border-radius:12px;border:1px dashed #d1d5db;">
        <p style="color:#6b7280;margin-bottom:12px;">Hiện tại chưa có ảnh nào trong Album cưới 3D.</p>
        <button type="button" class="admin-btn admin-btn-primary" onclick="resetGalleryDefault()">
          🔄 Khôi Phục 16 Ảnh Mẫu Gốc
        </button>
      </div>
    `;
    return;
  }

  gallery.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'gallery-item-card';
    card.dataset.idx = idx;

    card.innerHTML = `
      <div class="gallery-item-thumb-box">
        <span class="gallery-item-badge">#${idx + 1}</span>
        <img class="gallery-item-thumb" id="gallery-thumb-${idx}" src="${item.src}" alt="${item.caption || 'Ảnh cưới'}" onerror="this.src='assets/images/hero_couple.jpg'" />
      </div>
      <div class="gallery-item-body">
        <div class="admin-form-group" style="margin:0;">
          <label class="admin-form-label" style="font-size:0.75rem;">Link / Đường dẫn ảnh:</label>
          <input type="text" class="admin-form-input gallery-item-src-input" data-idx="${idx}" value="${item.src}" placeholder="Link ảnh..." style="font-size:0.8rem;padding:6px 10px;" />
        </div>
        <div class="admin-form-group" style="margin:0;">
          <label class="admin-form-label" style="font-size:0.75rem;">Chú thích ảnh (Hiển thị khi phóng to):</label>
          <input type="text" class="admin-form-input gallery-item-caption-input" data-idx="${idx}" value="${item.caption || ''}" placeholder="Nhập chú thích..." style="font-size:0.8rem;padding:6px 10px;" />
        </div>
      </div>
      <div class="gallery-item-actions">
        <div style="display:flex;gap:4px;">
          <button type="button" class="admin-btn admin-btn-secondary" style="padding:4px 8px;font-size:0.75rem;" onclick="moveGalleryItem(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''} title="Di chuyển lên trước">
            ▲ Lên
          </button>
          <button type="button" class="admin-btn admin-btn-secondary" style="padding:4px 8px;font-size:0.75rem;" onclick="moveGalleryItem(${idx}, 1)" ${idx === gallery.length - 1 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''} title="Di chuyển xuống sau">
            ▼ Xuống
          </button>
        </div>
        <button type="button" class="admin-btn admin-btn-danger" style="padding:4px 10px;font-size:0.75rem;" onclick="removeGalleryItem(${idx})">
          🗑️ Xoá
        </button>
      </div>
    `;

    // Live preview when typing new URL
    const srcInput = card.querySelector('.gallery-item-src-input');
    const thumbImg = card.querySelector('.gallery-item-thumb');
    if (srcInput && thumbImg) {
      srcInput.addEventListener('input', () => {
        const v = srcInput.value.trim();
        if (v) thumbImg.src = v;
      });
    }

    container.appendChild(card);
  });
}

// 3. Save Hero Polaroid Photo
window.saveHeroPhotoAdmin = function() {
  const input = document.getElementById('admin-hero-photo-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) {
    alert('Vui lòng nhập đường dẫn hoặc chọn ảnh bìa Polaroid!');
    input.focus();
    return;
  }
  const settings = WeddingDB.getSettings();
  settings.wedding.heroPhoto = val;
  WeddingDB.saveSettings(settings);
  showAdminToast('Đã cập nhật Ảnh Bìa Polaroid & Thumbnail MXH thành công!');
};

// 4. Save Couple Portraits
window.saveCouplePhotosAdmin = function() {
  const groomInput = document.getElementById('groom-gallery-photo-input');
  const brideInput = document.getElementById('bride-gallery-photo-input');
  const settings = WeddingDB.getSettings();

  if (groomInput && groomInput.value.trim()) {
    settings.couple.groom.photo = groomInput.value.trim();
    const sInput = document.getElementById('groom-photo-input');
    if (sInput) sInput.value = groomInput.value.trim();
  }
  if (brideInput && brideInput.value.trim()) {
    settings.couple.bride.photo = brideInput.value.trim();
    const sInput = document.getElementById('bride-photo-input');
    if (sInput) sInput.value = brideInput.value.trim();
  }

  WeddingDB.saveSettings(settings);
  showAdminToast('Đã lưu ảnh chân dung Chú Rể & Cô Dâu thành công!');
};

// 5. Add New Photo to 3D Gallery
window.addPhotoToGallery = function() {
  const urlInput = document.getElementById('new-photo-url-input');
  const captionInput = document.getElementById('new-photo-caption-input');
  const previewWrap = document.getElementById('new-photo-preview-wrap');
  const statusEl = document.getElementById('new-photo-file-status');

  if (!urlInput) return;
  const url = urlInput.value.trim();
  if (!url) {
    alert('Vui lòng nhập link ảnh hoặc bấm "Tải ảnh từ máy tính/điện thoại"!');
    urlInput.focus();
    return;
  }

  const caption = captionInput ? captionInput.value.trim() : '';
  const settings = WeddingDB.getSettings();
  if (!Array.isArray(settings.gallery)) settings.gallery = [];

  const newItem = {
    id: 'g' + Date.now(),
    src: url,
    caption: caption || `Ảnh cưới ${settings.gallery.length + 1}`
  };

  settings.gallery.push(newItem);
  WeddingDB.saveSettings(settings);

  // Clear inputs
  urlInput.value = '';
  if (captionInput) captionInput.value = '';
  if (previewWrap) previewWrap.style.display = 'none';
  if (statusEl) statusEl.style.display = 'none';

  renderGalleryAdmin();
  showAdminToast('Đã thêm ảnh mới vào Album cưới thành công!');
};

// 6. Remove Photo from 3D Gallery
window.removeGalleryItem = function(idx) {
  const settings = WeddingDB.getSettings();
  if (!settings.gallery || !settings.gallery[idx]) return;

  const caption = settings.gallery[idx].caption || `ảnh #${idx + 1}`;
  if (!confirm(`Bạn có chắc chắn muốn xoá ${caption} khỏi Album cưới?`)) return;

  settings.gallery.splice(idx, 1);
  WeddingDB.saveSettings(settings);
  renderGalleryAdmin();
  showAdminToast('Đã xoá ảnh khỏi Album cưới!');
};

// 7. Move Photo Up / Down in 3D Gallery
window.moveGalleryItem = function(idx, dir) {
  const settings = WeddingDB.getSettings();
  if (!settings.gallery) return;
  const targetIdx = idx + dir;
  if (targetIdx < 0 || targetIdx >= settings.gallery.length) return;

  const temp = settings.gallery[idx];
  settings.gallery[idx] = settings.gallery[targetIdx];
  settings.gallery[targetIdx] = temp;

  WeddingDB.saveSettings(settings);
  renderGalleryAdmin();
};

// 8. Save All Edits in 3D Gallery
window.saveAllGalleryAdmin = function() {
  const settings = WeddingDB.getSettings();
  if (!Array.isArray(settings.gallery)) settings.gallery = [];

  const cards = document.querySelectorAll('.gallery-item-card');
  cards.forEach(card => {
    const idx = parseInt(card.dataset.idx, 10);
    const srcInput = card.querySelector('.gallery-item-src-input');
    const capInput = card.querySelector('.gallery-item-caption-input');
    if (!isNaN(idx) && settings.gallery[idx]) {
      if (srcInput) settings.gallery[idx].src = srcInput.value.trim();
      if (capInput) settings.gallery[idx].caption = capInput.value.trim();
    }
  });

  WeddingDB.saveSettings(settings);
  renderGalleryAdmin();
  showAdminToast('Đã lưu toàn bộ Album cưới thành công!');
};

// 9. Reset 3D Gallery to Default 16 Photos
window.resetGalleryDefault = function() {
  if (!confirm('Khôi phục Album cưới về 16 bức ảnh cưới mẫu ban đầu?')) return;
  const settings = WeddingDB.getSettings();
  settings.gallery = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.gallery));
  WeddingDB.saveSettings(settings);
  renderGalleryAdmin();
  showAdminToast('Đã khôi phục 16 ảnh cưới mẫu gốc thành công!');
};



// ==========================================
// AUTO-SAVE & SERVER SYNC MECHANISM
// ==========================================
let autoSaveTimeout = null;

function triggerAutoSave() {
  const indicator = document.getElementById('admin-save-indicator');
  if (indicator) {
    indicator.innerHTML = '<span style="color:#d97706;">⏳ Đang lưu...</span>';
    indicator.style.background = '#fef3c7';
    indicator.style.borderColor = '#fde68a';
    indicator.style.color = '#92400e';
  }

  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    collectAndSaveSettings();
  }, 600);
}

function collectAndSaveSettings() {
  const current = WeddingDB.getSettings();

  // 1. Couple Information
  const gFull = document.getElementById('groom-fullName');
  if (gFull && gFull.value.trim()) current.couple.groom.fullName = gFull.value.trim();
  const gShort = document.getElementById('groom-shortName');
  if (gShort && gShort.value.trim()) current.couple.groom.shortName = gShort.value.trim();
  const gBio = document.getElementById('groom-bio-input');
  if (gBio) current.couple.groom.bio = gBio.value.trim();
  const gPhoto = document.getElementById('groom-photo-input');
  if (gPhoto && gPhoto.value.trim()) current.couple.groom.photo = gPhoto.value.trim();
  const gFather = document.getElementById('groom-father-input');
  if (gFather) current.couple.groom.father = gFather.value.trim();
  const gMother = document.getElementById('groom-mother-input');
  if (gMother) current.couple.groom.mother = gMother.value.trim();
  const gAddr = document.getElementById('groom-address-input');
  if (gAddr) current.couple.groom.address = gAddr.value.trim();

  const bFull = document.getElementById('bride-fullName');
  if (bFull && bFull.value.trim()) current.couple.bride.fullName = bFull.value.trim();
  const bShort = document.getElementById('bride-shortName');
  if (bShort && bShort.value.trim()) current.couple.bride.shortName = bShort.value.trim();
  const bBio = document.getElementById('bride-bio-input');
  if (bBio) current.couple.bride.bio = bBio.value.trim();
  const bPhoto = document.getElementById('bride-photo-input');
  if (bPhoto && bPhoto.value.trim()) current.couple.bride.photo = bPhoto.value.trim();
  const bFather = document.getElementById('bride-father-input');
  if (bFather) current.couple.bride.father = bFather.value.trim();
  const bMother = document.getElementById('bride-mother-input');
  if (bMother) current.couple.bride.mother = bMother.value.trim();
  const bAddr = document.getElementById('bride-address-input');
  if (bAddr) current.couple.bride.address = bAddr.value.trim();

  // 2. Wedding Date & Venue
  const wDate = document.getElementById('wedding-date-input');
  if (wDate && wDate.value) current.wedding.date = wDate.value;
  const wTime = document.getElementById('wedding-time-input');
  if (wTime && wTime.value) current.wedding.time = wTime.value;
  const wDateText = document.getElementById('wedding-dateText-input');
  if (wDateText) current.wedding.dateText = wDateText.value.trim();
  const wLunar = document.getElementById('wedding-lunar-input');
  if (wLunar) current.wedding.lunarDateText = wLunar.value.trim();
  const wVenue = document.getElementById('wedding-venue-input');
  if (wVenue) current.wedding.venueName = wVenue.value.trim();
  const wAddress = document.getElementById('wedding-address-input');
  if (wAddress) current.wedding.venueAddress = wAddress.value.trim();
  const wMap = document.getElementById('wedding-mapUrl-input');
  if (wMap) current.wedding.mapUrl = wMap.value.trim();

  // 3. Quotes & Music
  const hQuote = document.getElementById('hero-quote-input');
  if (hQuote) current.wedding.heroQuote = hQuote.value.trim();
  const tQuote = document.getElementById('thankyou-quote-input');
  if (tQuote) current.wedding.thankYouQuote = tQuote.value.trim();
  const mUrl = document.getElementById('music-url-input');
  if (mUrl) current.wedding.musicUrl = mUrl.value.trim();
  const pCode = document.getElementById('admin-passcode-input');
  if (pCode && pCode.value.trim()) current.wedding.adminPasscode = pCode.value.trim();

  // 4. Banking Information
  const showBankToggle = document.getElementById('setting-show-bank');
  if (showBankToggle) current.showBank = showBankToggle.checked;

  const gBankName = document.getElementById('bank-groom-name');
  if (gBankName && current.banking && current.banking.groom) current.banking.groom.bankName = gBankName.value.trim();
  const gBankAcc = document.getElementById('bank-groom-account');
  if (gBankAcc && current.banking && current.banking.groom) {
    const acc = gBankAcc.value.trim();
    current.banking.groom.accountNumber = acc;
    const holder = (document.getElementById('bank-groom-holder')?.value || current.banking.groom.accountName || '').trim().toUpperCase();
    current.banking.groom.qrUrl = `https://img.vietqr.io/image/MB-${acc}-compact2.png?amount=0&addInfo=Mung%20cuoi%20Duc%20Anh%20Thuy%20Linh&accountName=${encodeURIComponent(holder)}`;
  }
  const gBankHolder = document.getElementById('bank-groom-holder');
  if (gBankHolder && current.banking && current.banking.groom) current.banking.groom.accountName = gBankHolder.value.trim().toUpperCase();

  const bBankName = document.getElementById('bank-bride-name');
  if (bBankName && current.banking && current.banking.bride) current.banking.bride.bankName = bBankName.value.trim();
  const bBankAcc = document.getElementById('bank-bride-account');
  if (bBankAcc && current.banking && current.banking.bride) {
    const acc = bBankAcc.value.trim();
    current.banking.bride.accountNumber = acc;
    const holder = (document.getElementById('bank-bride-holder')?.value || current.banking.bride.accountName || '').trim().toUpperCase();
    current.banking.bride.qrUrl = `https://img.vietqr.io/image/VCB-${acc}-compact2.png?amount=0&addInfo=Mung%20cuoi%20Thuy%20Linh%20Duc%20Anh&accountName=${encodeURIComponent(holder)}`;
  }
  const bBankHolder = document.getElementById('bank-bride-holder');
  if (bBankHolder && current.banking && current.banking.bride) current.banking.bride.accountName = bBankHolder.value.trim().toUpperCase();

  // 5. Events / Ceremonies
  const eventTitles = document.querySelectorAll('.event-field-title');
  const eventTimes = document.querySelectorAll('.event-field-time');
  const eventVenues = document.querySelectorAll('.event-field-venue');
  const eventAddresses = document.querySelectorAll('.event-field-address');
  const eventMaps = document.querySelectorAll('.event-field-map');

  if (eventTitles.length > 0 && current.events) {
    eventTitles.forEach((el, idx) => {
      if (current.events[idx]) {
        current.events[idx].title = el.value.trim();
        if (eventVenues[idx]) current.events[idx].venue = eventVenues[idx].value.trim();
        if (eventAddresses[idx]) current.events[idx].address = eventAddresses[idx].value.trim();
        if (eventMaps[idx]) current.events[idx].mapUrl = eventMaps[idx].value.trim();
        if (eventTimes[idx]) {
          const val = eventTimes[idx].value.trim();
          const parts = val.split('—');
          if (parts.length > 1) {
            current.events[idx].time = parts[0].trim();
            current.events[idx].dateText = parts[1].trim();
          } else {
            current.events[idx].time = val;
          }
        }
      }
    });
  }

  // 6. Photo inputs
  const heroPhotoInput = document.getElementById('hero-photo-input');
  if (heroPhotoInput && heroPhotoInput.value.trim()) {
    current.wedding.heroPhoto = heroPhotoInput.value.trim();
  }

  // Save to LocalStorage & Auto Sync
  WeddingDB.saveSettings(current);

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const indicator = document.getElementById('admin-save-indicator');
  if (indicator) {
    indicator.innerHTML = `🟢 Đã tự động lưu (${timeStr})`;
    indicator.style.background = '#ecfdf5';
    indicator.style.borderColor = '#a7f3d0';
    indicator.style.color = '#065f46';
  }
}

window.quickSaveAllAndSync = function() {
  collectAndSaveSettings();
  const current = WeddingDB.getSettings();

  fetch('/api/save-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(current)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showAdminToast('✅ Đã lưu và đồng bộ trực tiếp vào dữ liệu dự án!');
    } else {
      showAdminToast('Đã lưu thành công vào trình duyệt!');
    }
  })
  .catch(() => {
    showAdminToast('Đã lưu thành công vào bộ nhớ trình duyệt!');
  });
};

window.copySettingsCode = function() {
  collectAndSaveSettings();
  const settings = WeddingDB.getSettings();
  const code = JSON.stringify(settings, null, 2);
  navigator.clipboard.writeText(code).then(() => {
    alert('Đã sao chép toàn bộ cấu hình vào Clipboard! Bạn có thể dán (Paste) vào chat hoặc file data.js.');
  }).catch(() => {
    prompt('Vui lòng sao chép đoạn mã cấu hình dưới đây:', code);
  });
};
