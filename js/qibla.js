/**
 * نُور القرآن | NOOR AL-QURAN
 * qibla.js - بوصلة القبلة التفاعلية وحساب الاتجاه الدقيق والمسافة إلى الكعبة المشرفة
 */

const Qibla = {
  // إحداثيات الكعبة المشرفة في مكة المكرمة
  KAABA_LAT: 21.422487,
  KAABA_LNG: 39.826206,

  userLat: 21.4225,
  userLng: 39.8262,
  qiblaBearing: 0,
  distanceKm: 0,
  deviceHeading: 0,
  hasCompassSensor: false,
  isPermissionGranted: false,

  init() {
    this.bindDOMEvents();
    const loc = Settings.get('lastLocation');
    if (loc && loc.lat && loc.lng) {
      this.updateCoordinates(loc.lat, loc.lng);
    } else {
      this.updateCoordinates(this.userLat, this.userLng);
    }
    this.setupOrientationListener();
  },

  updateCoordinates(lat, lng) {
    this.userLat = lat;
    this.userLng = lng;
    this.qiblaBearing = this.calculateBearing(lat, lng, this.KAABA_LAT, this.KAABA_LNG);
    this.distanceKm = this.calculateDistance(lat, lng, this.KAABA_LAT, this.KAABA_LNG);
    this.updateUI();
  },

  /**
   * حساب زاوية القبلة الدقيقة باستخدام صيغة Great-Circle Azimuth
   */
  calculateBearing(lat1, lon1, lat2, lon2) {
    const toRad = deg => (deg * Math.PI) / 180;
    const toDeg = rad => (rad * 180) / Math.PI;

    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const deltaLambda = toRad(lon2 - lon1);

    const y = Math.sin(deltaLambda) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

    const bearing = toDeg(Math.atan2(y, x));
    return (bearing + 360) % 360;
  },

  /**
   * حساب المسافة بالكيلومتر عبر Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const toRad = deg => (deg * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },

  setupOrientationListener() {
    const handleOrientation = (e) => {
      let heading = null;

      // أجهزة iOS Safari
      if (e.webkitCompassHeading !== undefined) {
        heading = e.webkitCompassHeading;
        this.hasCompassSensor = true;
      } else if (e.alpha !== null) {
        // أجهزة Android / Chrome (absolute orientation)
        if (e.absolute) {
          heading = 360 - e.alpha;
          this.hasCompassSensor = true;
        } else {
          heading = 360 - e.alpha;
        }
      }

      if (heading !== null) {
        this.deviceHeading = (heading + 360) % 360;
        this.updateCompassRotation();
      }
    };

    if (window.DeviceOrientationEvent) {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        // تحتاج إذن المستخدم في iOS 13+
        const btnPerm = document.getElementById('btn-qibla-compass-perm');
        if (btnPerm) btnPerm.style.display = 'inline-flex';
      } else {
        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    }
  },

  async requestPermissionIOS() {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          this.isPermissionGranted = true;
          const btnPerm = document.getElementById('btn-qibla-compass-perm');
          if (btnPerm) btnPerm.style.display = 'none';

          window.addEventListener('deviceorientation', (e) => {
            if (e.webkitCompassHeading) {
              this.deviceHeading = e.webkitCompassHeading;
              this.updateCompassRotation();
            }
          });
          App.showToast('تم تفعيل مستشعر البوصلة بنجاح!');
        } else {
          App.showToast('تم رفض إذن مستشعر البوصلة');
        }
      } catch (err) {
        console.error(err);
      }
    }
  },

  updateCompassRotation() {
    const dial = document.getElementById('qibla-compass-dial');
    const needle = document.getElementById('qibla-kaaba-needle');
    const statusText = document.getElementById('qibla-alignment-status');
    const angleReadout = document.getElementById('qibla-current-angle');

    if (dial) {
      // تدوير قرص البوصلة بحسب اتجاه الجهاز
      dial.style.transform = `rotate(${-this.deviceHeading}deg)`;
    }

    if (needle) {
      // إبرة الكعبة تشير دائماً لزاوية القبلة بالنسبة للشمال
      const relativeAngle = (this.qiblaBearing - this.deviceHeading + 360) % 360;
      needle.style.transform = `rotate(${relativeAngle}deg)`;

      // إذا كان الاتجاه قريباً من القبلة بنطاق ±4 درجات
      const diff = Math.abs(relativeAngle);
      const isAligned = diff < 4 || diff > 356;

      const compassBox = document.getElementById('qibla-compass-wrapper');
      if (compassBox) {
        compassBox.classList.toggle('qibla-aligned', isAligned);
      }

      if (statusText) {
        if (isAligned) {
          statusText.innerHTML = '<span class="status-aligned">أنت باتجاه القبلة الآن بالضبط! 🕋</span>';
        } else if (relativeAngle < 180) {
          statusText.textContent = `أدر جهازك لليمين بمقدار ${Math.round(relativeAngle)}°`;
        } else {
          statusText.textContent = `أدر جهازك لليسار بمقدار ${Math.round(360 - relativeAngle)}°`;
        }
      }

      if (angleReadout) {
        angleReadout.textContent = `${Math.round(this.deviceHeading)}°`;
      }
    }
  },

  updateUI() {
    const bearingEl = document.getElementById('qibla-bearing-val');
    const distEl = document.getElementById('qibla-distance-val');
    const staticPointer = document.getElementById('qibla-static-pointer');
    const cityEl = document.getElementById('qibla-user-city');

    const loc = Settings.get('lastLocation');

    if (bearingEl) bearingEl.textContent = `${Math.round(this.qiblaBearing)}°`;
    if (distEl) distEl.textContent = `${this.distanceKm.toLocaleString('ar-SA')} كم`;
    if (cityEl && loc) cityEl.textContent = `${loc.city} (${loc.country})`;

    // إذا لم تتوفر بوصلة المستشعر (مثل أجهزة الديسكتوب)، نوجه الإبرة مباشرة بزاوية القبلة المحسوبة
    if (staticPointer) {
      staticPointer.style.transform = `rotate(${this.qiblaBearing}deg)`;
    }
  },

  bindDOMEvents() {
    const btnPerm = document.getElementById('btn-qibla-compass-perm');
    if (btnPerm) {
      btnPerm.addEventListener('click', () => this.requestPermissionIOS());
    }

    const btnGPS = document.getElementById('btn-qibla-gps');
    if (btnGPS) {
      btnGPS.addEventListener('click', () => {
        if (window.Prayer && typeof window.Prayer.requestGPSLocation === 'function') {
          window.Prayer.requestGPSLocation();
        }
      });
    }
  }
};

window.Qibla = Qibla;
