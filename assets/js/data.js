/**
 * Wedding Invitation Data & LocalStorage State Management
 * Chung Đôi "Tender" Theme - Đức Anh & Thuỳ Linh
 */

const STORAGE_KEYS = {
  SETTINGS: 'wedding_invite_settings',
  GUESTS: 'wedding_invite_guests',
  RSVPS: 'wedding_invite_rsvps',
  WISHES: 'wedding_invite_wishes',
  AUTH: 'wedding_admin_auth'
};

const WEDDING_THEMES = [
  {
    id: 'tender',
    name: 'Chung Đôi Tender',
    badge: 'Hoàng Gia Đỏ Nhung',
    desc: 'Đỏ rượu vang nhung, con dấu sáp 3D nhịp đập, lâu đài cổ tích, ảnh Polaroid lơ lửng và album xoay 3D băng đạn.',
    primary: '#511419',
    gold: '#c9a24a',
    bg: '#fff7eb',
    gradient: 'linear-gradient(135deg, #511419, #380a0e)'
  },
  {
    id: 'editorial',
    name: 'Modern Editorial',
    badge: 'Tạp Chí Hàn Quốc',
    desc: 'Tone trắng ngà thanh khiết, kiểu chữ serif Vogue cao cấp, viền vàng kim đôi, tối giản tinh tế chuẩn Hàn Quốc.',
    primary: '#242220',
    gold: '#C5A059',
    bg: '#FBF9F5',
    gradient: 'linear-gradient(135deg, #242220, #4A4643)'
  },
  {
    id: 'botanical',
    name: 'Secret Garden',
    badge: 'Vườn Cổ Tích Lãng Mạn',
    desc: 'Tone xanh rêu sage/olive và hoa pastel, họa tiết cành lá vẽ tay, mộc mạc nhẹ nhàng và ấm áp ngọt ngào.',
    primary: '#344E41',
    gold: '#BC6C25',
    bg: '#F7F8F4',
    gradient: 'linear-gradient(135deg, #344E41, #588157)'
  },
  {
    id: 'midnight',
    name: 'Midnight Glamour',
    badge: 'Dạ Tiệc Ánh Sao',
    desc: 'Tone xanh navy đêm huyền bí kết hợp ánh sao vàng lấp lánh, phong cách dạ tiệc hoàng gia sang trọng bậc nhất.',
    primary: '#F8FAFC',
    gold: '#F59E0B',
    bg: '#0B0F19',
    gradient: 'linear-gradient(135deg, #0B0F19, #1E293B)'
  }
];

const DEFAULT_SETTINGS = {
  themeId: 'tender',
  showBank: true,
  theme: {
    name: 'Tender Burgundy & Gold',
    primaryColor: '#511419',
    primaryDark: '#380a0e',
    secondaryColor: '#c9a24a',
    accentColor: '#8a252d',
    bgColor: '#fff7eb',
    textColor: '#2e181b'
  },

  couple: {
    groom: {
      fullName: 'Hồ Đức Anh',
      shortName: 'Đức Anh',
      role: 'Trưởng Nam',
      bio: 'Chàng trai điềm tĩnh, ấm áp và luôn dành trọn tình yêu thương, chở che cho người phụ nữ của cuộc đời mình.',
      photo: 'assets/images/groom.jpg',
      father: 'Hồ Xuân Tươi',
      mother: 'Vũ Thị Tươi',
      address: '18LK 15 Khu đô thị Phú Lương - Văn Phú - Hà Đông',
      familySide: 'Nhà Trai'
    },
    bride: {
      fullName: 'Thái Thuỳ Linh',
      shortName: 'Thuỳ Linh',
      role: 'Út Nữ',
      bio: 'Cô gái dịu dàng với nụ cười tỏa nắng, luôn mang lại niềm vui, sự bình yên và ấm áp cho tổ ấm tương lai.',
      photo: 'assets/images/bride.jpg',
      father: 'Thái Đức Tuyển',
      mother: 'Nguyễn Thị Tố Hoài',
      address: 'Số 2 ngõ 4 Đường Thống Nhất - Phú Nhiêu - Phú Xuyên - Hà Nội',
      familySide: 'Nhà Gái'
    }
  },
  wedding: {
    date: '2026-11-29',
    time: '11:00',
    receptionTime: '10:30',
    dateText: 'Chủ Nhật, 29 Tháng 11, 2026',
    lunarDateText: 'Tức Ngày 21 Tháng 10 Năm Bính Ngọ',
    venueName: 'Trung tâm tiệc cưới Hoàng Gia Palace (Cơ sở 1)',
    venueAddress: 'Tầng 2, Tòa nhà Victoria, KĐT Văn Phú, Quận Hà Đông, Hà Nội',
    mapUrl: 'https://maps.app.goo.gl/ijkYsunZoUQ79kQbA',
    heroQuote: 'TÌNH YÊU LÀ SỰ THẤU HIỂU VÀ ĐỒNG ĐIỆU CỦA HAI TÂM HỒN',
    heroPhoto: 'assets/images/hero_couple.jpg',
    thankYouQuote: 'Sự hiện diện của quý khách là niềm vinh hạnh to lớn và là món quà ý nghĩa nhất dành cho chúng mình!',
    announcementText: 'TRÂN TRỌNG BÁO TIN\nLỄ THÀNH HÔN CỦA CHÚNG TÔI',
    groomStk: '0988889999',
    groomBank: 'MB Bank',
    groomAccountHolder: 'HO DUC ANH',
    brideStk: '9988776655',
    brideBank: 'Vietcombank',
    brideAccountHolder: 'THAI THUY LINH',
    musicUrl: 'https://assets.mixkit.co/music/preview/mixkit-wedding-waltz-piano-581.mp3',
    musicTitle: 'Wedding Waltz - Romantic Piano',
    adminPasscode: '123456'
  },
  events: [
    {
      id: 'event-main',
      type: 'main',
      badge: 'TIỆC CƯỚI CHÍNH',
      title: 'Lễ Thành Hôn & Tiệc Chiêu Đãi',
      time: '11:00',
      date: '2026-11-29',
      dateText: 'Chủ Nhật, 29/11/2026 (21/10 Âm Lịch)',
      venue: 'Trung tâm tiệc cưới Hoàng Gia Palace',
      address: 'Tầng 2, Tòa nhà Victoria, KĐT Văn Phú, Quận Hà Đông, Hà Nội',
      mapUrl: 'https://maps.app.goo.gl/ijkYsunZoUQ79kQbA',
      isPrimary: true
    },
    {
      id: 'event-bride',
      type: 'bride',
      badge: 'NHÀ GÁI',
      title: 'Tiệc Cưới Nhà Gái (Lễ Vu Quy)',
      time: '17:30',
      date: '2026-11-28',
      dateText: 'Thứ Bảy, 28/11/2026 (20/10 Âm Lịch)',
      venue: 'Tư Gia Nhà Gái',
      address: 'Số 2 ngõ 4 Đường Thống Nhất, Phú Nhiêu, Phú Xuyên, Hà Nội',
      mapUrl: 'https://maps.app.goo.gl/ijkYsunZoUQ79kQbA',
      isPrimary: false
    },
    {
      id: 'event-groom',
      type: 'groom',
      badge: 'NHÀ TRAI',
      title: 'Tiệc Cưới Nhà Trai (Lễ Tân Hôn)',
      time: '09:00',
      date: '2026-11-29',
      dateText: 'Chủ Nhật, 29/11/2026 (21/10 Âm Lịch)',
      venue: 'Tư Gia Nhà Trai',
      address: '18LK 15 Khu đô thị Phú Lương, Văn Phú, Quận Hà Đông, Hà Nội',
      mapUrl: 'https://maps.app.goo.gl/ijkYsunZoUQ79kQbA',
      isPrimary: false
    }
  ],
  stories: [
    {
      id: 'story-1',
      year: 'Năm 2021',
      title: 'Chạm Ánh Mắt Đầu Tiên',
      description: 'Một buổi chiều thu Hà Nội dịu dàng, chúng mình vô tình quen nhau qua những người bạn chung. Một nụ cười làm say cả một đời.',
      photo: 'assets/images/gallery/photo_01.jpg'
    },
    {
      id: 'story-2',
      year: 'Năm 2024',
      title: 'Lời Cầu Hôn Ngọt Ngào',
      description: 'Dưới ánh nến lung linh và tiếng sóng biển vỗ rì rào, anh trao chiếc nhẫn nhỏ cùng lời hẹn ước: “Hãy cùng anh đi trọn cuộc đời này nhé!”.',
      photo: 'assets/images/gallery/photo_02.jpg'
    },
    {
      id: 'story-3',
      year: 'Năm 2026',
      title: 'Ngày Chung Đôi Trọn Vẹn',
      description: 'Sau ngần ấy năm gắn bó và sẻ chia, chúng mình hạnh phúc nắm chặt tay nhau bước vào ngưỡng cửa hôn nhân, bắt đầu tổ ấm nhỏ tràn ngập yêu thương.',
      photo: 'assets/images/gallery/photo_03.jpg'
    }
  ],
  gallery: [
    { id: 'g1', src: 'assets/images/hero_couple.jpg', caption: 'Đức Anh & Thuỳ Linh - Tình yêu thăng hoa' },
    { id: 'g2', src: 'assets/images/gallery/photo_01.jpg', caption: 'Nụ cười rạng rỡ của đôi uyên ương' },
    { id: 'g3', src: 'assets/images/gallery/photo_02.jpg', caption: 'Khoảnh khắc ngọt ngào trao nhau' },
    { id: 'g4', src: 'assets/images/gallery/photo_03.jpg', caption: 'Ánh mắt đong đầy yêu thương' },
    { id: 'g5', src: 'assets/images/gallery/photo_04.jpg', caption: 'Chú rể Đức Anh thanh lịch' },
    { id: 'g6', src: 'assets/images/gallery/photo_05.jpg', caption: 'Cô dâu Thuỳ Linh duyên dáng' },
    { id: 'g7', src: 'assets/images/gallery/photo_06.jpg', caption: 'Tay trong tay bước vào tương lai' },
    { id: 'g8', src: 'assets/images/gallery/photo_07.jpg', caption: 'Chuyện tình yêu đơm hoa kết trái' },
    { id: 'g9', src: 'assets/images/gallery/photo_08.jpg', caption: 'Nét đẹp kiêu sa trong ngày hạnh phúc' },
    { id: 'g10', src: 'assets/images/gallery/photo_09.jpg', caption: 'Hẹn ước trọn đời' },
    { id: 'g11', src: 'assets/images/gallery/photo_10.jpg', caption: 'Từng phút giây bên em đều quý giá' },
    { id: 'g12', src: 'assets/images/gallery/photo_11.jpg', caption: 'Hạnh phúc giản đơn là có nhau' },
    { id: 'g13', src: 'assets/images/gallery/photo_12.jpg', caption: 'Bức tranh tình yêu hoàn hảo' },
    { id: 'g14', src: 'assets/images/gallery/photo_13.jpg', caption: 'Ngày đẹp nhất trần đời' },
    { id: 'g15', src: 'assets/images/gallery/photo_14.jpg', caption: 'Bình yên là khi ở bên anh' },
    { id: 'g16', src: 'assets/images/gallery/photo_15.jpg', caption: 'Mãi mãi một tình yêu' }
  ],
  banking: {
    groom: {
      bankName: 'MB Bank (Quân Đội)',
      bankBin: '970422',
      accountNumber: '0988889999',
      accountName: 'HO DUC ANH',
      branch: 'Hà Nội',
      qrUrl: 'https://img.vietqr.io/image/MB-0988889999-compact2.png?amount=0&addInfo=Mung%20cuoi%20Duc%20Anh%20Thuy%20Linh'
    },
    bride: {
      bankName: 'Vietcombank',
      bankBin: '970436',
      accountNumber: '9988776655',
      accountName: 'THAI THUY LINH',
      branch: 'Hà Nội',
      qrUrl: 'https://img.vietqr.io/image/VCB-9988776655-compact2.png?amount=0&addInfo=Mung%20cuoi%20Thuy%20Linh%20Duc%20Anh'
    }
  }
};

const DEFAULT_GUESTS = [
  {
    id: 'guest-1',
    name: 'Nguyễn Văn Nam',
    prefix: 'Anh',
    group: 'Bạn Chú Rể',
    customMessage: 'Rất mong được đón tiếp anh và người thương đến chung vui cùng gia đình chúng em!',
    phone: '0987654321',
    status: 'attending',
    party: 'event-main',
    guestCount: 2,
    createdAt: '2026-10-20'
  },
  {
    id: 'guest-2',
    name: 'Lê Thuỳ Dung',
    prefix: 'Bạn',
    group: 'Bạn Cô Dâu',
    customMessage: 'Sự hiện diện của bạn là niềm vinh hạnh to lớn cho chúng mình!',
    phone: '0912345678',
    status: 'attending',
    party: 'event-main',
    guestCount: 1,
    createdAt: '2026-10-21'
  },
  {
    id: 'guest-3',
    name: 'Gia đình Bác Thành',
    prefix: 'Gia đình',
    group: 'Họ hàng Nhà Trai',
    customMessage: 'Kính mời Bác cùng toàn thể gia đình đến dự bữa cơm thân mật và chung vui cùng hai cháu!',
    phone: '0903456789',
    status: 'attending',
    party: 'event-groom',
    guestCount: 4,
    createdAt: '2026-10-21'
  },
  {
    id: 'guest-4',
    name: 'Team VTIT',
    prefix: 'Anh Chị Em',
    group: 'Đồng Nghiệp',
    customMessage: 'Trân trọng kính mời toàn thể anh chị em Team đến chung vui quẩy hết mình cùng Đức Anh!',
    phone: '0966889900',
    status: 'pending',
    party: 'event-main',
    guestCount: 5,
    createdAt: '2026-10-22'
  }
];

const DEFAULT_WISHES = [
  {
    id: 'wish-0',
    name: 'Bí mật',
    relation: 'Khách quý',
    message: 'Chúc 105 hạnh phúc 🎉🥂🎉',
    timestamp: '9:57:58 22/10/2026',
    likes: 1
  },
  {
    id: 'wish-1',
    name: 'Nguyễn Văn Nam',
    relation: 'Bạn thân chú rể',
    message: 'Chúc mừng Đức Anh và Thuỳ Linh! Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long, mãi mãi thấu hiểu và yêu thương nhau như ngày đầu nhé!',
    timestamp: '2026-10-21 14:30',
    likes: 12
  },
  {
    id: 'wish-2',
    name: 'Lê Thuỳ Dung',
    relation: 'Bạn đại học cô dâu',
    message: 'Nhìn hai đứa hạnh phúc mà xúc động quá! Chúc cô dâu xinh đẹp nhất trần đời và chú rể tuyệt vời có một cuộc hôn nhân ngập tràn mật ngọt!',
    timestamp: '2026-10-21 18:45',
    likes: 18
  },
  {
    id: 'wish-3',
    name: 'Anh Tuấn & Chị Lan',
    relation: 'Đồng nghiệp',
    message: 'Chúc hai em có một ngày cưới thật trọn vẹn và đáng nhớ. Cùng nhau xây dựng tổ ấm vững chắc, sớm đón thiên thần nhỏ nhé!',
    timestamp: '2026-10-22 09:15',
    likes: 9
  }
];

const AI_WISH_SUGGESTIONS = {
  friends: [
    'Chúc hai bạn trăm năm tình viên mãn, bạc đầu nghĩa phu thê! Luôn ngọt ngào và hạnh phúc như ngày đầu nhé!',
    'Mừng cho người anh em đã tìm thấy bến đỗ bình yên! Chúc đôi bạn trẻ sớm có quý tử, tiền vào như nước, gia đạo an vui!',
    'Chúc cô dâu xinh đẹp và chú rể tuấn tú có một hành trình hôn nhân ngập tràn tiếng cười và thấu hiểu!'
  ],
  colleagues: [
    'Thay mặt anh chị em công ty, chúc hai bạn trăm năm hạnh phúc, gia đình êm ấm, sự nghiệp thăng hoa!',
    'Chúc mừng ngày trọng đại của hai em! Chúc hai vợ chồng luôn là điểm tựa vững chắc cho nhau trên mọi bước đường tương lai!',
    'Chúc tình yêu của hai bạn luôn bền chặt, cùng nhau vượt qua mọi thử thách và gặt hái thật nhiều thành công!'
  ],
  elders: [
    'Chúc hai cháu trăm năm hạnh phúc, thuận hòa êm ấm, hiếu thuận với ông bà cha mẹ và sớm sinh con thảo cháu hiền!',
    'Mừng ngày vui của hai cháu. Chúc gia đình nhỏ luôn ngập tràn phúc lộc, bình an và yêu thương!'
  ]
};

function deepMergeSettings(target, source) {
  if (!source) return target;
  const result = Array.isArray(target) ? [...target] : { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMergeSettings(target[key] || {}, source[key]);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
}

// Database helper functions
const WeddingDB = {
  getSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return deepMergeSettings(DEFAULT_SETTINGS, parsed);
      }
    } catch (e) {
      console.warn('Error reading settings from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('wedding_settings_updated', { detail: settings }));
      }
      return true;
    } catch (e) {
      console.error('Error saving settings:', e);
      return false;
    }
  },

  getGuests() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GUESTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading guests:', e);
    }
    return DEFAULT_GUESTS;
  },

  saveGuests(guests) {
    try {
      localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
      return true;
    } catch (e) {
      console.error('Error saving guests:', e);
      return false;
    }
  },

  addGuest(guest) {
    const guests = this.getGuests();
    const newGuest = {
      id: 'guest-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      ...guest
    };
    guests.unshift(newGuest);
    this.saveGuests(guests);
    return newGuest;
  },

  updateGuest(id, updatedFields) {
    const guests = this.getGuests();
    const index = guests.findIndex(g => g.id === id);
    if (index !== -1) {
      guests[index] = { ...guests[index], ...updatedFields };
      this.saveGuests(guests);
      return guests[index];
    }
    return null;
  },

  deleteGuest(id) {
    const guests = this.getGuests().filter(g => g.id !== id);
    this.saveGuests(guests);
    return true;
  },

  getWishes() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading wishes:', e);
    }
    return DEFAULT_WISHES;
  },

  saveWishes(wishes) {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(wishes));
      return true;
    } catch (e) {
      console.error('Error saving wishes:', e);
      return false;
    }
  },

  addWish(wish) {
    const wishes = this.getWishes();
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const newWish = {
      id: 'wish-' + Date.now(),
      timestamp: timeStr,
      likes: 1,
      ...wish
    };
    wishes.unshift(newWish);
    this.saveWishes(wishes);
    return newWish;
  },

  getRSVPs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RSVPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading RSVPs:', e);
    }
    return [];
  },

  addRSVP(rsvp) {
    const rsvps = this.getRSVPs();
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newRSVP = {
      id: 'rsvp-' + Date.now(),
      submittedAt: timeStr,
      ...rsvp
    };
    rsvps.unshift(newRSVP);
    localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(rsvps));

    // Also update guest status if matched by name or phone
    const guests = this.getGuests();
    const matched = guests.find(g => 
      (rsvp.name && g.name.toLowerCase() === rsvp.name.toLowerCase()) || 
      (rsvp.phone && g.phone === rsvp.phone)
    );
    if (matched) {
      this.updateGuest(matched.id, {
        status: rsvp.attendance === 'yes' ? 'attending' : 'declined',
        guestCount: rsvp.guestCount || 1,
        party: rsvp.party || 'event-main'
      });
    }

    return newRSVP;
  },

  getThemeId() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('theme')) {
      return urlParams.get('theme');
    }
    const s = this.getSettings();
    return s.themeId || 'tender';
  },

  setThemeId(themeId) {
    const s = this.getSettings();
    s.themeId = themeId;
    this.saveSettings(s);
    return themeId;
  },

  getThemes() {
    return WEDDING_THEMES;
  },

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.GUESTS);
    localStorage.removeItem(STORAGE_KEYS.RSVPS);
    localStorage.removeItem(STORAGE_KEYS.WISHES);
    return true;
  },

  exportAllData() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      guests: this.getGuests(),
      rsvps: this.getRSVPs(),
      wishes: this.getWishes()
    }, null, 2);
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (data.guests) this.saveGuests(data.guests);
      if (data.wishes) this.saveWishes(data.wishes);
      if (data.rsvps) localStorage.setItem(STORAGE_KEYS.RSVPS, JSON.stringify(data.rsvps));
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
};

// Export to window
if (typeof window !== 'undefined') {
  window.WeddingDB = WeddingDB;
  window.AI_WISH_SUGGESTIONS = AI_WISH_SUGGESTIONS;
}
