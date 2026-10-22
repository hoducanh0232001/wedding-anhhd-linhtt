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

const DEFAULT_SETTINGS = {
  theme: {
    name: 'Tender Burgundy & Gold',
    primaryColor: '#511419',
    primaryDark: '#380a0e',
    secondaryColor: '#c9a24a',
    accentColor: '#8a252d',
    bgColor: '#fffaf3',
    textColor: '#2e181b'
  },
  couple: {
    groom: {
      fullName: 'Nguyễn Đức Anh',
      shortName: 'Đức Anh',
      role: 'Chú Rể',
      bio: 'Chàng trai điềm tĩnh, ấm áp và luôn dành trọn tình yêu thương, chở che cho người phụ nữ của cuộc đời mình.',
      photo: 'assets/images/groom.jpg',
      father: 'Nguyễn Văn Hùng',
      mother: 'Trần Thị Mai',
      familySide: 'Nhà Trai'
    },
    bride: {
      fullName: 'Trần Thuỳ Linh',
      shortName: 'Thuỳ Linh',
      role: 'Cô Dâu',
      bio: 'Cô gái dịu dàng với nụ cười tỏa nắng, luôn mang lại niềm vui, sự bình yên và ấm áp cho tổ ấm tương lai.',
      photo: 'assets/images/bride.jpg',
      father: 'Trần Quốc Tuấn',
      mother: 'Lê Thu Hà',
      familySide: 'Nhà Gái'
    }
  },
  wedding: {
    date: '2026-11-29',
    time: '11:00',
    dateText: 'Chủ Nhật, 29 Tháng 11, 2026',
    lunarDateText: 'Ngày 21 Tháng 10 Năm Bính Ngọ',
    venueName: 'Trung tâm tiệc cưới Hoàng Gia Palace (Cơ sở 1)',
    venueAddress: 'Tầng 2, Tòa nhà Victoria, KĐT Văn Phú, Quận Hà Đông, Hà Nội',
    mapUrl: 'https://maps.google.com/?q=Trung+tâm+tiệc+cưới+Hoàng+Gia+Palace+Hà+Đông+Hà+Nội',
    heroQuote: 'Tình yêu không phải là tìm kiếm một người hoàn hảo, mà là học cách nhìn nhận một người không hoàn hảo theo cách hoàn hảo nhất.',
    thankYouQuote: 'Sự hiện diện và lời chúc phúc của quý khách là niềm vinh hạnh to lớn và là món quà ý nghĩa nhất dành cho chúng mình trong ngày trọng đại này!',
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
      mapUrl: 'https://maps.google.com/?q=Trung+tâm+tiệc+cưới+Hoàng+Gia+Palace+Hà+Đông+Hà+Nội',
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
      address: 'Số 68 Đường Quang Trung, Phường Quang Trung, Quận Hà Đông, Hà Nội',
      mapUrl: 'https://maps.google.com/?q=Quang+Trung+Hà+Đông+Hà+Nội',
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
      address: 'Số 12 Ngõ 102 Đường Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
      mapUrl: 'https://maps.google.com/?q=102+Nguyễn+Trãi+Thanh+Xuân+Hà+Nội',
      isPrimary: false
    }
  ],
  stories: [
    {
      id: 'story-1',
      year: 'Tháng 10 / 2021',
      title: 'Lần đầu gặp gỡ',
      description: 'Một buổi chiều thu Hà Nội trong một góc quán cà phê nhỏ, ánh mắt vô tình chạm nhau đã mở ra một hành trình tràn ngập ngọt ngào và tiếng cười.',
      photo: 'assets/images/story_dating.jpg'
    },
    {
      id: 'story-2',
      year: 'Tháng 02 / 2022',
      title: 'Lời tỏ tình ngọt ngào',
      description: 'Dưới ánh đèn lung linh của đêm Valentine, anh lấy hết can đảm trao em đóa hồng cùng lời hẹn ước chân thành. Nụ cười gật đầu của em là món quà tuyệt vời nhất.',
      photo: 'assets/images/hero_couple.jpg'
    },
    {
      id: 'story-3',
      year: 'Tháng 06 / 2025',
      title: 'Lời cầu hôn bên bờ biển',
      description: 'Giữa tiếng sóng vỗ và ráng chiều hoàng hôn rực rỡ, chiếc nhẫn lấp lánh được trao cùng câu hỏi: "Em đồng ý cùng anh đi hết cuộc đời này chứ?". Em nói: "Em đồng ý!".',
      photo: 'assets/images/story_proposal.jpg'
    },
    {
      id: 'story-4',
      year: 'Tháng 11 / 2026',
      title: 'Ngày ta chung đôi',
      description: 'Sau 5 năm cùng nhau đi qua bao thăng trầm, giờ đây chúng mình hạnh phúc nắm tay nhau bước vào lễ đường, chính thức về chung một mái nhà.',
      photo: 'assets/images/gallery_walk.jpg'
    }
  ],
  gallery: [
    { id: 'g1', src: 'assets/images/hero_couple.jpg', caption: 'Hạnh phúc rạng ngời ngày chung đôi' },
    { id: 'g2', src: 'assets/images/story_dating.jpg', caption: 'Bình yên bên góc cà phê quen' },
    { id: 'g3', src: 'assets/images/story_proposal.jpg', caption: 'Khoảnh khắc thiêng liêng bên hoàng hôn' },
    { id: 'g4', src: 'assets/images/gallery_walk.jpg', caption: 'Cùng nhau dạo bước trong vườn hồng' },
    { id: 'g5', src: 'assets/images/groom.jpg', caption: 'Chú rể Đức Anh lịch lãm' },
    { id: 'g6', src: 'assets/images/bride.jpg', caption: 'Cô dâu Thuỳ Linh rạng rỡ' }
  ],
  banking: {
    groom: {
      bankName: 'MB Bank (Quân Đội)',
      bankBin: '970422',
      accountNumber: '0988889999',
      accountName: 'NGUYEN DUC ANH',
      branch: 'Hà Nội',
      qrUrl: 'https://img.vietqr.io/image/MB-0988889999-compact2.png?amount=0&addInfo=Mung%20cuoi%20Duc%20Anh%20Thuy%20Linh'
    },
    bride: {
      bankName: 'Vietcombank',
      bankBin: '970436',
      accountNumber: '9988776655',
      accountName: 'TRAN THUY LINH',
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

// Database helper functions
const WeddingDB = {
  getSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Error reading settings from localStorage:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
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
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
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
