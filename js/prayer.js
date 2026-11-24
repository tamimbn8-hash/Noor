/**
 * نُور القرآن | NOOR AL-QURAN
 * prayer.js - مواقيت الصلاة الدقيقة، العد التنازلي الحي، تحديد الموقع، ونظام الأذان الحقيقي
 */

const Prayer = {
  timings: null,
  countdownInterval: null,
  nextPrayer: null,
  adhanAudio: new Audio(),
  adhanTriggeredFor: null,
  isTestingAdhan: false,

  // قائمة المدن الشهيرة للاختيار اليدوي الفوري
  presetLocations: [
    { country: 'السعودية', countryEn: 'Saudi Arabia', city: 'مكة المكرمة', cityEn: 'Makkah', region: 'منطقة مكة المكرمة', lat: 21.4225, lng: 39.8262 },
    { country: 'السعودية', countryEn: 'Saudi Arabia', city: 'المدينة المنورة', cityEn: 'Madinah', region: 'منطقة المدينة', lat: 24.5247, lng: 39.5692 },
    { country: 'السعودية', countryEn: 'Saudi Arabia', city: 'الرياض', cityEn: 'Riyadh', region: 'منطقة الرياض', lat: 24.7136, lng: 46.6753 },
    { country: 'مصر', countryEn: 'Egypt', city: 'القاهرة', cityEn: 'Cairo', region: 'محافظة القاهرة', lat: 30.0444, lng: 31.2357 },
    { country: 'مصر', countryEn: 'Egypt', city: 'الإسكندرية', cityEn: 'Alexandria', region: 'محافظة الإسكندرية', lat: 31.2001, lng: 29.9187 },
    { country: 'الجزائر', countryEn: 'Algeria', city: 'سطيف', cityEn: 'Setif', region: 'ولاية سطيف', lat: 36.1911, lng: 5.4137 },
    { country: 'الجزائر', countryEn: 'Algeria', city: 'الجزائر العاصمة', cityEn: 'Algiers', region: 'ولاية الجزائر', lat: 36.7538, lng: 3.0588 },
    { country: 'الجزائر', countryEn: 'Algeria', city: 'وهران', cityEn: 'Oran', region: 'ولاية وهران', lat: 35.6987, lng: -0.6349 },
    { country: 'الجزائر', countryEn: 'Algeria', city: 'قسنطينة', cityEn: 'Constantine', region: 'ولاية قسنطينة', lat: 36.3650, lng: 6.6147 },
    { country: 'المغرب', countryEn: 'Morocco', city: 'الرباط', cityEn: 'Rabat', region: 'جهة الرباط', lat: 34.0209, lng: -6.8416 },
    { country: 'المغرب', countryEn: 'Morocco', city: 'الدار البيضاء', cityEn: 'Casablanca', region: 'جهة الدار البيضاء', lat: 33.5731, lng: -7.5898 },
    { country: 'المغرب', countryEn: 'Morocco', city: 'فاس', cityEn: 'Fes', region: 'جهة فاس مكناس', lat: 34.0331, lng: -5.0003 },
    { country: 'تونس', countryEn: 'Tunisia', city: 'تونس العاصمة', cityEn: 'Tunis', region: 'ولاية تونس', lat: 36.8065, lng: 10.1815 },
    { country: 'الإمارات', countryEn: 'UAE', city: 'دبي', cityEn: 'Dubai', region: 'إمارة دبي', lat: 25.2048, lng: 55.2708 },
    { country: 'الإمارات', countryEn: 'UAE', city: 'أبوظبي', cityEn: 'Abu Dhabi', region: 'إمارة أبوظبي', lat: 24.4539, lng: 54.3773 },
    { country: 'الكويت', countryEn: 'Kuwait', city: 'مدينة الكويت', cityEn: 'Kuwait City', region: 'محافظة العاصمة', lat: 29.3759, lng: 47.9774 },
    { country: 'قطر', countryEn: 'Qatar', city: 'الدوحة', cityEn: 'Doha', region: 'بلدية الدوحة', lat: 25.2854, lng: 51.5310 },
    { country: 'الأردن', countryEn: 'Jordan', city: 'عمان', cityEn: 'Amman', region: 'محافظة العاصمة', lat: 31.9454, lng: 35.9284 },
    { country: 'تركيا', countryEn: 'Turkey', city: 'إسطنبول', cityEn: 'Istanbul', region: 'منطقة مرمرة', lat: 41.0082, lng: 28.9784 },
    { country: 'فرنسا', countryEn: 'France', city: 'باريس', cityEn: 'Paris', region: 'إيل دو فرانس', lat: 48.8566, lng: 2.3522 },
    { country: 'بريطانيا', countryEn: 'UK', city: 'لندن', cityEn: 'London', region: 'إنجلترا', lat: 51.5074, lng: -0.1278 }
  ],

  // طرق الحساب المعتمدة
  calculationMethods: [
    { id: 3, name: 'رابطة العالم الإسلامي (Muslim World League)' },
    { id: 4, name: 'جامعة أم القرى - مكة المكرمة' },
    { id: 5, name: 'الهيئة المصرية العامة للمساحة' },
    { id: 1, name: 'جامعة العلوم الإسلامية بكراتشي' },
    { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
    { id: 8, name: 'منطقة الخليج العربي' }
  ],

  async init() {
    this.setupAdhanAudio();
    this.bindDOMEvents();
    this.populateMethodSelect();
    this.populateCitySelect();
    await this.loadPrayerTimes();
    this.startCountdownLoop();
  },

  setupAdhanAudio() {
    const vol = Settings.get('adhanVolume') !== undefined ? Settings.get('adhanVolume') : 1.0;
    this.adhanAudio.volume = vol;
    
    this.adhanAudio.addEventListener('ended', () => {
      this.showAdhanBanner(false);
      this.isTestingAdhan = false;
      this.updateTestAdhanBtnText();
    });

    this.adhanAudio.addEventListener('error', (e) => {
      console.warn('Adhan playback error:', e);
      this.showAdhanBanner(false);
      this.isTestingAdhan = false;
      this.updateTestAdhanBtnText();
    });
  },

  populateMethodSelect() {
    const select = document.getElementById('prayer-calc-method-select');
    if (!select) return;

    select.innerHTML = this.calculationMethods.map(m => 
      `<option value="${m.id}">${m.name}</option>`
    ).join('');

    const savedMethod = Settings.get('calculationMethod') || 3;
    select.value = savedMethod;
  },

  populateCitySelect(filterText = '') {
    const select = document.getElementById('prayer-manual-city-select');
    if (!select) return;

    const cleanFilter = filterText.trim().toLowerCase();
    const filtered = cleanFilter 
      ? this.presetLocations.filter(loc => 
          loc.city.toLowerCase().includes(cleanFilter) || 
          loc.cityEn.toLowerCase().includes(cleanFilter) ||
          loc.country.toLowerCase().includes(cleanFilter) ||
          (loc.region && loc.region.toLowerCase().includes(cleanFilter))
        )
      : this.presetLocations;

    select.innerHTML = '<option value="">-- اختر مدينتك من القائمة --</option>' + 
      filtered.map((loc) => {
        const originalIndex = this.presetLocations.indexOf(loc);
        const regionPart = loc.region ? ` - ${loc.region}` : '';
        return `<option value="${originalIndex}">${loc.city} (${loc.country}${regionPart})</option>`;
      }).join('');
  },

  async requestGPSLocation() {
    if (!navigator.geolocation) {
      App.showToast('متصفحك لا يدعم تحديد الموقع الجغرافي تلقائياً، يمكنك الاختيار يدوياً');
      return;
    }

    App.showToast('جاري تحديد موقعك بدقة عالية عبر الأقمار الاصطناعية...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let detectedCity = 'موقعي الحالي';
        let detectedCountry = 'GPS';
        let detectedRegion = '';

        // Reverse Geocoding لجلب اسم المدينة والدولة والولاية بدقة
        try {
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            detectedCity = geoData.city || geoData.locality || 'موقعي';
            detectedCountry = geoData.countryName || 'GPS';
            detectedRegion = geoData.principalSubdivision || '';
          }
        } catch (e) {
          console.warn('Reverse geocoding failed:', e);
        }

        Settings.set('lastLocation', {
          country: detectedCountry,
          city: detectedCity,
          region: detectedRegion,
          lat: lat,
          lng: lng,
          isGPS: true
        });

        App.showToast(`تم تحديد موقعك: ${detectedCity} (${detectedCountry})`);
        await this.loadPrayerTimes();

        if (window.Qibla && typeof window.Qibla.updateCoordinates === 'function') {
          window.Qibla.updateCoordinates(lat, lng);
        }
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        App.showToast('تعذر تحديد موقعك تلقائياً، يمكنك اختيار مدينتك يدوياً من القائمة.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  },

  setManualLocationByIndex(index) {
    const loc = this.presetLocations[index];
    if (!loc) return;

    Settings.set('lastLocation', {
      country: loc.country,
      city: loc.city,
      region: loc.region || '',
      lat: loc.lat,
      lng: loc.lng,
      isGPS: false
    });

    App.showToast(`تم تغيير الموقع إلى: ${loc.city} - ${loc.country}`);
    this.loadPrayerTimes();

    if (window.Qibla && typeof window.Qibla.updateCoordinates === 'function') {
      window.Qibla.updateCoordinates(loc.lat, loc.lng);
    }
  },

  async loadPrayerTimes() {
    const loc = Settings.get('lastLocation') || { lat: 21.4225, lng: 39.8262, city: 'مكة المكرمة', country: 'السعودية' };
    const method = Settings.get('calculationMethod') || 3;

    this.setCardsLoading(true);

    // تحديث بطاقة الموقع في الواجهة
    const locLabel = document.getElementById('prayer-location-label');
    if (locLabel) {
      const regionText = loc.region ? ` • ${loc.region}` : '';
      locLabel.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${loc.city} (${loc.country}${regionText})</span>
      `;
    }

    try {
      const data = await API.getPrayerTimings({ lat: loc.lat, lng: loc.lng, method });
      this.timings = data.timings;
      this.renderPrayerTimes(data);
      this.setCardsLoading(false);
      this.updateCountdown();
    } catch (err) {
      console.error('Failed to load prayer times:', err);
      this.setCardsLoading(false);
      App.showToast('تعذر تحميل مواقيت الصلاة، يرجى المحاولة لاحقاً');
    }
  },

  setCardsLoading(isLoading) {
    const cards = document.querySelectorAll('.prayer-card-time');
    cards.forEach(card => {
      if (isLoading) {
        card.classList.add('skeleton-text');
        card.textContent = '--:--';
      } else {
        card.classList.remove('skeleton-text');
      }
    });
  },

  renderPrayerTimes(data) {
    if (!data || !data.timings) return;
    const t = data.timings;

    const prayerKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    prayerKeys.forEach(k => {
      const el = document.getElementById(`prayer-time-${k.toLowerCase()}`);
      if (el) {
        const cleanTime = t[k].split(' ')[0];
        el.textContent = this.formatTo12Hour(cleanTime);
      }
    });

    const hijriEl = document.getElementById('prayer-hijri-date');
    if (hijriEl && data.date && data.date.hijri) {
      const h = data.date.hijri;
      hijriEl.textContent = `${h.day} ${h.month.ar || h.month.en} ${h.year} هـ`;
    }
  },

  formatTo12Hour(time24) {
    if (!time24) return '--:--';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'م' : 'ص';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  },

  startCountdownLoop() {
    clearInterval(this.countdownInterval);
    this.updateCountdown();
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  },

  updateCountdown() {
    if (!this.timings) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();

    const prayerList = [
      { key: 'Fajr', name: 'الفجر', nameEn: 'Fajr', nameFr: 'Fajr', timeStr: this.timings.Fajr.split(' ')[0] },
      { key: 'Sunrise', name: 'الشروق', nameEn: 'Sunrise', nameFr: 'Chourouk', timeStr: this.timings.Sunrise.split(' ')[0] },
      { key: 'Dhuhr', name: 'الظهر', nameEn: 'Dhuhr', nameFr: 'Dhuhr', timeStr: this.timings.Dhuhr.split(' ')[0] },
      { key: 'Asr', name: 'العصر', nameEn: 'Asr', nameFr: 'Asr', timeStr: this.timings.Asr.split(' ')[0] },
      { key: 'Maghrib', name: 'المغرب', nameEn: 'Maghrib', nameFr: 'Maghrib', timeStr: this.timings.Maghrib.split(' ')[0] },
      { key: 'Isha', name: 'العشاء', nameEn: 'Isha', nameFr: 'Isha', timeStr: this.timings.Isha.split(' ')[0] }
    ];

    const prayersWithMins = prayerList.map(p => {
      const [h, m] = p.timeStr.split(':').map(Number);
      return { ...p, minutes: h * 60 + m };
    });

    let next = prayersWithMins.find(p => p.minutes > currentMinutes || (p.minutes === currentMinutes && currentSeconds === 0));
    let isNextTomorrow = false;

    if (!next) {
      next = prayersWithMins[0];
      isNextTomorrow = true;
    }

    this.nextPrayer = next;

    let diffSecs = 0;
    if (!isNextTomorrow) {
      const targetSecs = next.minutes * 60;
      const nowTotalSecs = currentMinutes * 60 + currentSeconds;
      diffSecs = targetSecs - nowTotalSecs;
    } else {
      const remainingToday = (24 * 60 - currentMinutes) * 60 - currentSeconds;
      const tomorrowSecs = next.minutes * 60;
      diffSecs = remainingToday + tomorrowSecs;
    }

    const hrs = Math.floor(diffSecs / 3600);
    const mins = Math.floor((diffSecs % 3600) / 60);
    const secs = diffSecs % 60;
    const formattedTimer = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const nextNameEl = document.getElementById('prayer-next-name');
    const timerEl = document.getElementById('prayer-countdown-timer');
    const headerBadgeName = document.getElementById('header-prayer-name');
    const headerBadgeTimer = document.getElementById('header-prayer-time');

    const lang = Settings.get('language') || 'ar';
    const displayName = lang === 'ar' ? next.name : (lang === 'fr' ? next.nameFr : next.nameEn);

    if (nextNameEl) nextNameEl.textContent = displayName;
    if (timerEl) timerEl.textContent = formattedTimer;
    if (headerBadgeName) headerBadgeName.textContent = displayName;
    if (headerBadgeTimer) headerBadgeTimer.textContent = formattedTimer;

    document.querySelectorAll('.prayer-card').forEach(c => c.classList.remove('is-next', 'is-current'));
    const nextCard = document.getElementById(`prayer-card-${next.key.toLowerCase()}`);
    if (nextCard) nextCard.classList.add('is-next');

    // إطلاق الأذان تلقائياً عند الدخول الدقيق لوقت الصلاة (غير الشروق)
    if (diffSecs === 0 && next.key !== 'Sunrise') {
      this.triggerAdhan(next);
    }
  },

  triggerAdhan(prayerObj) {
    if (this.adhanTriggeredFor === prayerObj.key) return;
    this.adhanTriggeredFor = prayerObj.key;

    this.sendNotification(`حان الآن موعد أذان ${prayerObj.name}`, `حيّ على الصلاة، تقبل الله منا ومنكم صالح الأعمال.`);

    // عرض النافذة الروحانية لدخول وقت الصلاة
    this.showAdhanNotificationModal(prayerObj.name);

    if (Settings.get('adhanSound')) {
      this.playAdhan();
    }
  },

  showAdhanNotificationModal(prayerName) {
    const modal = document.getElementById('adhan-modal');
    const label = document.getElementById('adhan-modal-prayer-name');
    if (label) label.textContent = `حان الآن وقت أذان ${prayerName} المبارك`;
    if (modal) modal.classList.add('active');
  },

  closeAdhanNotificationModal() {
    const modal = document.getElementById('adhan-modal');
    if (modal) modal.classList.remove('active');
  },

  playAdhan() {
    const muezzin = Settings.get('muezzin') || 'muezzin1';
    const audioSrc = muezzin === 'muezzin2' ? 'assets/audio/adhan2.mp3' : 'assets/audio/adhan1.mp3';
    
    const vol = Settings.get('adhanVolume') !== undefined ? Settings.get('adhanVolume') : 1.0;
    this.adhanAudio.volume = vol;
    this.adhanAudio.src = audioSrc;

    this.adhanAudio.play().then(() => {
      this.showAdhanBanner(true);
      this.hideAutoplayPrompt();
    }).catch(err => {
      console.warn('Autoplay prevented by browser:', err);
      this.showAutoplayPrompt();
    });
  },

  stopAdhan() {
    this.adhanAudio.pause();
    this.adhanAudio.currentTime = 0;
    this.showAdhanBanner(false);
    this.isTestingAdhan = false;
    this.updateTestAdhanBtnText();
  },

  showAdhanBanner(show) {
    let banner = document.getElementById('adhan-playing-banner');
    if (!banner) return;
    banner.style.display = show ? 'flex' : 'none';
  },

  showAutoplayPrompt() {
    let promptEl = document.getElementById('adhan-autoplay-prompt');
    if (promptEl) {
      promptEl.style.display = 'block';
    }
  },

  hideAutoplayPrompt() {
    let promptEl = document.getElementById('adhan-autoplay-prompt');
    if (promptEl) {
      promptEl.style.display = 'none';
    }
  },

  setAdhanVolume(vol) {
    const v = Math.max(0, Math.min(1, parseFloat(vol)));
    this.adhanAudio.volume = v;
    Settings.set('adhanVolume', v);
  },

  updateTestAdhanBtnText() {
    const btn = document.getElementById('btn-test-adhan');
    if (btn) {
      btn.textContent = this.isTestingAdhan ? 'إيقاف صوت الأذان' : 'تجربة صوت الأذان';
    }
  },

  sendNotification(title, body) {
    if (Settings.get('prayerNotifications') && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: body,
          icon: 'assets/icons/icon-192.png'
        });
      }
    }
  },

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      App.showToast('متصفحك لا يدعم نظام الإشعارات');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      Settings.set('prayerNotifications', true);
      App.showToast('تم تفعيل إشعارات مواقيت الصلاة بنجاح');
      new Notification('نُور القرآن', { body: 'تم تفعيل إشعارات الصلاة بنجاح' });
    } else {
      Settings.set('prayerNotifications', false);
      App.showToast('تم رفض إذن الإشعارات من إعدادات المتصفح');
    }
  },

  bindDOMEvents() {
    // زر تحديد الموقع التلقائي GPS
    const btnGPS = document.getElementById('btn-prayer-gps');
    if (btnGPS) {
      btnGPS.addEventListener('click', () => this.requestGPSLocation());
    }

    // فلتر وبحث المدن اليدوية
    const cityFilterInput = document.getElementById('prayer-city-filter-input');
    if (cityFilterInput) {
      cityFilterInput.addEventListener('input', (e) => {
        this.populateCitySelect(e.target.value);
      });
    }

    // قائمة المدن اليدوية
    const citySelect = document.getElementById('prayer-manual-city-select');
    if (citySelect) {
      citySelect.addEventListener('change', (e) => {
        if (e.target.value !== '') {
          this.setManualLocationByIndex(parseInt(e.target.value));
        }
      });
    }

    // طريقة الحساب
    const methodSelect = document.getElementById('prayer-calc-method-select');
    if (methodSelect) {
      methodSelect.addEventListener('change', (e) => {
        const m = parseInt(e.target.value);
        Settings.set('calculationMethod', m);
        this.loadPrayerTimes();
        App.showToast('تم تحديث طريقة الحساب الفلكي لمواقيت الصلاة');
      });
    }

    // أزرار نافذة الأذان الروحانية
    const btnAdhanListen = document.getElementById('btn-adhan-modal-listen');
    if (btnAdhanListen) {
      btnAdhanListen.addEventListener('click', () => {
        this.closeAdhanNotificationModal();
        this.playAdhan();
      });
    }

    const btnAdhanClose = document.getElementById('btn-adhan-modal-close');
    if (btnAdhanClose) {
      btnAdhanClose.addEventListener('click', () => {
        this.closeAdhanNotificationModal();
      });
    }

    // زر تجربة صوت الأذان
    const btnTestAdhan = document.getElementById('btn-test-adhan');
    if (btnTestAdhan) {
      btnTestAdhan.addEventListener('click', () => {
        if (this.isTestingAdhan) {
          this.stopAdhan();
        } else {
          this.isTestingAdhan = true;
          this.playAdhan();
          this.updateTestAdhanBtnText();
        }
      });
    }

    // زر إيقاف الأذان من البانر
    const btnStopAdhanBanner = document.getElementById('btn-stop-adhan-banner');
    if (btnStopAdhanBanner) {
      btnStopAdhanBanner.addEventListener('click', () => this.stopAdhan());
    }

    // زر تفعيل الصوت من بانر Autoplay
    const btnEnableAudio = document.getElementById('btn-enable-adhan-prompt');
    if (btnEnableAudio) {
      btnEnableAudio.addEventListener('click', () => {
        this.playAdhan();
      });
    }

    // شريط مستوى صوت الأذان
    const adhanVolSlider = document.getElementById('prayer-adhan-volume-slider');
    if (adhanVolSlider) {
      adhanVolSlider.addEventListener('input', (e) => {
        this.setAdhanVolume(e.target.value);
      });
    }
  }
};

window.Prayer = Prayer;
