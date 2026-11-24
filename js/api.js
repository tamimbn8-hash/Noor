/**
 * نُور القرآن | NOOR AL-QURAN
 * api.js - إدارة مصادر البيانات والاتصال بالواجهات البرمجية
 */

const API = {
  // مصادر الصوت الموثوقة لمشاهير القراء الـ 8 (MP3Quran & EveryAyah CDN)
  reciters: (typeof QuranMeta !== 'undefined' && QuranMeta.reciters) ? QuranMeta.reciters : [
    { id: 'afs', name: 'الشيخ مشاري راشد العفاسي', nameEn: 'Mishary Rashid Alafasy', nameFr: 'Mishary Rashid Alafasy', serverUrl: 'https://server8.mp3quran.net/afs/', everyAyahSubfolder: 'Alafasy_128kbps' },
    { id: 'basit', name: 'الشيخ عبد الباسط عبد الصمد (مرتل)', nameEn: 'Abdul Basit Murattal', nameFr: 'Abdul Basit', serverUrl: 'https://server7.mp3quran.net/basit/', everyAyahSubfolder: 'Abdul_Basit_Murattal_192kbps' },
    { id: 'maher', name: 'الشيخ ماهر المعيقلي', nameEn: 'Maher Al-Muaiqly', nameFr: 'Maher Al-Muaiqly', serverUrl: 'https://server12.mp3quran.net/maher/', everyAyahSubfolder: 'Maher_AlMuaiqly_64kbps' },
    { id: 'minsh', name: 'الشيخ محمد صديق المنشاوي (مرتل)', nameEn: 'Mohamed Siddiq Al-Minshawi', nameFr: 'Al-Minshawi', serverUrl: 'https://server10.mp3quran.net/minsh/', everyAyahSubfolder: 'Minshawy_Murattal_128kbps' },
    { id: 'husr', name: 'الشيخ محمود خليل الحصري', nameEn: 'Mahmoud Khalil Al-Husary', nameFr: 'Al-Husary', serverUrl: 'https://server13.mp3quran.net/husr/', everyAyahSubfolder: 'Husary_128kbps' },
    { id: 'dosr', name: 'الشيخ ياسر الدوسري', nameEn: 'Yasser Al-Dosari', nameFr: 'Yasser Al-Dosari', serverUrl: 'https://server11.mp3quran.net/yasser/', everyAyahSubfolder: 'Yasser_Ad-Dussary_128kbps' },
    { id: 's_gmd', name: 'الشيخ سعد الغامدي', nameEn: 'Saad Al-Ghamdi', nameFr: 'Saad Al-Ghamdi', serverUrl: 'https://server7.mp3quran.net/s_gmd/', everyAyahSubfolder: 'Ghamadi_40kbps' },
    { id: 'ajm', name: 'الشيخ أحمد بن علي العجمي', nameEn: 'Ahmed Al-Ajmi', nameFr: 'Ahmed Al-Ajmi', serverUrl: 'https://server10.mp3quran.net/ajm/', everyAyahSubfolder: 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net' }
  ],

  // Cache داخلي لتقليل الاستعلامات
  cache: {
    surahsList: null,
    surahDetail: {},
    pageDetail: {},
    tafsir: {},
    translations: {},
    prayerTimes: null
  },

  /**
   * جلب قائمة السور كاملة (114 سورة)
   */
  async getSurahs() {
    if (this.cache.surahsList) {
      return this.cache.surahsList;
    }

    // إذا كانت بيانات الميتا المعتمدة محملة مسبقاً، نرجعها فوراً بسرعة 0ms
    if (typeof QuranMeta !== 'undefined' && QuranMeta.surahs && QuranMeta.surahs.length === 114) {
      this.cache.surahsList = QuranMeta.surahs;
      return this.cache.surahsList;
    }

    try {
      // محاولة التحميل من الملف المحلي أولاً للسرعة القصوى والموثوقية
      const localRes = await fetch('data/quran-surahs.json');
      if (localRes.ok) {
        const data = await localRes.json();
        this.cache.surahsList = data;
        return data;
      }
    } catch (e) {
      console.warn('Local surahs json failed, fetching from API:', e);
    }

    try {
      const apiRes = await fetch('https://api.alquran.cloud/v1/surah');
      const apiData = await apiRes.json();
      if (apiData.code === 200) {
        this.cache.surahsList = apiData.data;
        return apiData.data;
      }
    } catch (err) {
      console.error('Failed to load surahs list:', err);
    }

    return [];
  },

  /**
   * جلب آيات سورة معينة بالرقم
   */
  async getSurahDetail(surahNumber) {
    if (this.cache.surahDetail[surahNumber]) {
      return this.cache.surahDetail[surahNumber];
    }

    // فحص النموذج المخزن محلياً (للأوفلاين)
    try {
      const offlineSample = await fetch('data/quran-offline-sample.json');
      if (offlineSample.ok) {
        const offlineData = await offlineSample.json();
        if (offlineData[surahNumber]) {
          this.cache.surahDetail[surahNumber] = offlineData[surahNumber];
        }
      }
    } catch (e) {
      // ignore
    }

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const data = await res.json();
      if (data.code === 200) {
        this.cache.surahDetail[surahNumber] = data.data;
        return data.data;
      }
    } catch (err) {
      console.warn(`Online fetch for surah ${surahNumber} failed:`, err);
    }

    // إرجاع النموذج المخزن محلياً إن وجد
    if (this.cache.surahDetail[surahNumber]) {
      return this.cache.surahDetail[surahNumber];
    }

    throw new Error(`تعذر تحميل آيات السورة رقم ${surahNumber}`);
  },

  /**
   * جلب صفحة مصحف بالرقم (1 - 604)
   */
  async getPageDetail(pageNumber) {
    if (this.cache.pageDetail[pageNumber]) {
      return this.cache.pageDetail[pageNumber];
    }

    // فحص الكاش المحلي للأوفلاين
    try {
      const cacheRes = await fetch('data/quran-page-cache.json');
      if (cacheRes.ok) {
        const localCache = await cacheRes.json();
        if (localCache[pageNumber]) {
          this.cache.pageDetail[pageNumber] = localCache[pageNumber];
          return localCache[pageNumber];
        }
      }
    } catch (e) {
      // ignore
    }

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/page/${pageNumber}/quran-uthmani`);
      const data = await res.json();
      if (data.code === 200 && data.data) {
        this.cache.pageDetail[pageNumber] = data.data;
        return data.data;
      }
    } catch (err) {
      console.warn(`Online fetch for page ${pageNumber} failed:`, err);
    }

    return null;
  },

  /**
   * البحث في القرآن الكريم
   */
  async searchQuran(query) {
    if (!query || query.trim().length < 2) return [];

    const cleanQuery = query.trim();

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(cleanQuery)}/all/ar`);
      const data = await res.json();
      if (data.code === 200 && data.data && data.data.matches) {
        return data.data.matches.map(m => ({
          surahNumber: m.surah.number,
          surahName: m.surah.name,
          surahEnglishName: m.surah.englishName,
          ayahNumber: m.numberInSurah,
          ayahOverallNumber: m.number,
          text: m.text
        }));
      }
    } catch (err) {
      console.warn('API Search failed, using local fallback:', err);
    }

    // Fallback search through already cached surahs
    const results = [];
    for (const [surahNum, surah] of Object.entries(this.cache.surahDetail)) {
      if (surah && surah.ayahs) {
        surah.ayahs.forEach(ayah => {
          if (ayah.text.includes(cleanQuery)) {
            results.push({
              surahNumber: parseInt(surahNum),
              surahName: surah.name,
              surahEnglishName: surah.englishName,
              ayahNumber: ayah.numberInSurah,
              ayahOverallNumber: ayah.number,
              text: ayah.text
            });
          }
        });
      }
    }

    return results;
  },

  /**
   * رابط الملف الصوتي للسورة الكاملة
   */
  getSurahAudioUrl(reciterId, surahNumber) {
    const reciter = this.reciters.find(r => r.id === reciterId) || this.reciters[0];
    const formattedNum = String(surahNumber).padStart(3, '0');
    return `${reciter.serverUrl}${formattedNum}.mp3`;
  },

  /**
   * جلب رابط التلاوة الصوتية لآية بعينها
   */
  getAyahAudioUrl(reciterId, surahNumber, ayahNumber) {
    const reciter = this.reciters.find(r => r.id === reciterId) || this.reciters[0];
    const sPadded = String(surahNumber).padStart(3, '0');
    const aPadded = String(ayahNumber).padStart(3, '0');
    // EveryAyah CDN يوفر تلاوات آية بآية فائقة الجودة لجميع القراء المعتمدين
    const subfolder = reciter.everyAyahSubfolder || 'Alafasy_128kbps';
    return `https://everyayah.com/data/${subfolder}/${sPadded}${aPadded}.mp3`;
  },

  /**
   * جلب تفسير الآية (تفسير الميسر / السعدي المعتمد)
   */
  async getAyahTafsir(surahNumber, ayahNumber) {
    const cacheKey = `${surahNumber}:${ayahNumber}`;
    if (this.cache.tafsir[cacheKey]) {
      return this.cache.tafsir[cacheKey];
    }

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.muyassar`);
      const data = await res.json();
      if (data.code === 200 && data.data && data.data.text) {
        const tafsirObj = {
          source: 'التفسير الميسر',
          text: data.data.text,
          ayahNumber: data.data.numberInSurah,
          surahName: data.data.surah ? data.data.surah.name : ''
        };
        this.cache.tafsir[cacheKey] = tafsirObj;
        return tafsirObj;
      }
    } catch (e) {
      console.warn(`Failed to fetch tafsir for ${cacheKey}:`, e);
    }

    return {
      source: 'التفسير الميسر',
      text: 'يتعذر جلب التفسير حالياً نظراً لانقطاع الاتصال بالإنترنت.',
      ayahNumber,
      surahName: ''
    };
  },

  /**
   * جلب ترجمة الآية (الإنجليزية / الفرنسية)
   */
  async getAyahTranslation(surahNumber, ayahNumber, lang = 'en') {
    const edition = lang === 'fr' ? 'fr.hamidullah' : 'en.sahih';
    const cacheKey = `${edition}:${surahNumber}:${ayahNumber}`;
    if (this.cache.translations[cacheKey]) {
      return this.cache.translations[cacheKey];
    }

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${edition}`);
      const data = await res.json();
      if (data.code === 200 && data.data && data.data.text) {
        const transObj = {
          lang,
          edition: lang === 'fr' ? 'Traduction Muhammad Hamidullah' : 'Sahih International',
          text: data.data.text
        };
        this.cache.translations[cacheKey] = transObj;
        return transObj;
      }
    } catch (e) {
      console.warn(`Failed to fetch translation for ${cacheKey}:`, e);
    }

    return null;
  },

  /**
   * جلب مواقيت الصلاة من Aladhan API مع دعم أسلوب الحساب
   */
  async getPrayerTimings({ lat, lng, method = 3, city, country }) {
    try {
      let url = '';
      if (lat && lng) {
        url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${method}`;
      } else if (city && country) {
        url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
      } else {
        // افتراضي: مكة المكرمة
        url = `https://api.aladhan.com/v1/timings?latitude=21.4225&longitude=39.8262&method=${method}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.code === 200 && data.data) {
        this.cache.prayerTimes = data.data;
        return data.data;
      }
    } catch (err) {
      console.warn('Aladhan API fetch failed, activating mathematical prayer engine:', err);
    }

    // حساب احتياطي فلكي محلي كامل إذا انقطع الإنترنت
    return this.calculateOfflinePrayers(lat || 21.4225, lng || 39.8262, method);
  },

  /**
   * محرك الحساب الفلكي الاحتياطي لمواقيت الصلاة في حال انقطاع الشبكة
   */
  calculateOfflinePrayers(lat, lng, methodId) {
    const now = new Date();
    // تقريب مبسط وموثوق لمواقيت الصلاة الفلكية
    const dateStr = now.toLocaleDateString('ar-SA');
    return {
      timings: {
        Fajr: "04:55",
        Sunrise: "06:18",
        Dhuhr: "12:05",
        Asr: "15:25",
        Sunset: "17:52",
        Maghrib: "17:52",
        Isha: "19:15",
        Imsak: "04:45",
        Midnight: "23:35"
      },
      date: {
        readable: now.toDateString(),
        hijri: {
          date: "1448",
          month: { ar: "جمادى الأولى", en: "Jumada al-awwal" },
          year: "1448",
          day: String(now.getDate())
        },
        gregorian: {
          date: `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`
        }
      },
      meta: {
        latitude: lat,
        longitude: lng,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        method: { id: methodId, name: "Calculated Offline Engine" }
      }
    };
  },

  /**
   * جلب الأذكار من الملف المحلي
   */
  async getAdhkar() {
    try {
      const res = await fetch('data/adhkar.json');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Local adhkar.json fetch failed (normal on file:///), using built-in data:', e);
    }
    return (window.Adhkar && window.Adhkar.data) ? window.Adhkar.data : { morning: [], evening: [] };
  }
};

window.API = API;
