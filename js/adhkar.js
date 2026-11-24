/**
 * نُور القرآن | NOOR AL-QURAN
 * adhkar.js - أذكار الصباح والمساء ونظام الأذكار اليومية (3 أذكار متجددة يومياً) مع تفاعل فوري ومباشر دون اعتماد على الشبكة
 */

const Adhkar = {
  // بيانات الأذكار الأساسية مدمجة بالكامل لتعمل فوراً 100% سواء عبر file:/// أو http:// أو بدون إنترنت
  data: {
    morning: [
      {
        id: "m1",
        text: "أَصْبَحْنَا وَأَصْبَحَ المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا اليَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا اليَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الكَسَلِ وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَبْرِ.",
        count: 1,
        reward: "حفظ من الشرور وبداية يوم مبارك برضا الله وحمايته.",
        reference: "صحيح مسلم"
      },
      {
        id: "m2",
        text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.",
        count: 1,
        reward: "سيد الاستغفار؛ من قاله موقناً به حين يصبح فمات من يومه دخل الجنة.",
        reference: "صحيح البخاري"
      },
      {
        id: "m3",
        text: "رَضِيتُ بِاللَّهِ رَبّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيّاً.",
        count: 3,
        reward: "كان حقاً على الله أن يرضيه يوم القيامة.",
        reference: "سنن أبي داود والترمذي"
      },
      {
        id: "m4",
        text: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ.",
        count: 3,
        reward: "لم يضره شيء حتى يمسي، وفي المساء لم يضره شيء حتى يصبح.",
        reference: "سنن أبي داود والترمذي وصححه الألباني"
      },
      {
        id: "m5",
        text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.",
        count: 1,
        reward: "شكر نعمة الصباح والحياة وتفويض الأمر لله عز وجل.",
        reference: "سنن الترمذي"
      },
      {
        id: "m6",
        text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الكُفْرِ، وَالفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ القَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ.",
        count: 3,
        reward: "سؤال العافية في الجسد والحواس والاستعاذة من الفقر وعذاب القبر.",
        reference: "سنن أبي داود وأحمد"
      },
      {
        id: "m7",
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.",
        count: 1,
        reward: "دعاء جامع للحفظ من الجهات الست والسلامة في الدين والدنيا.",
        reference: "سنن أبي داود وابن ماجه"
      },
      {
        id: "m8",
        text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
        count: 3,
        reward: "تضرع باسم الله الأعظم وطلب التوفيق والمعونة في كل الأمور.",
        reference: "المستدرك للحاكم وصححه الألباني"
      },
      {
        id: "m9",
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.",
        count: 3,
        reward: "تعدل في ميزان الأجر ساعات طويلة من الذكر المتواصل.",
        reference: "صحيح مسلم"
      },
      {
        id: "m10",
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
        count: 100,
        reward: "حُطّت خطاياه وإن كانت مثل زبد البحر، ولم يأتِ أحد يوم القيامة بأفضل مما جاء به.",
        reference: "صحيح البخاري ومسلم"
      },
      {
        id: "m11",
        text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        count: 10,
        reward: "كانت له عدل أربع رقاب من ولد إسماعيل، وحرزاً من الشيطان.",
        reference: "صحيح البخاري ومسلم"
      },
      {
        id: "m12",
        text: "أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ.",
        count: 1,
        reward: "تجديد الإيمان والتمسك بهدي الأنبياء صلوات الله عليهم.",
        reference: "مسند أحمد وصحيح الجامع"
      }
    ],
    evening: [
      {
        id: "e1",
        text: "أَمْسَيْنَا وَأَمْسَى المُلْكُ لِلَّهِ، وَالحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الكَسَلِ وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي القَبْرِ.",
        count: 1,
        reward: "حفظ تام من شرور الليل وبداية ليلة مباركة بذكر الله وحمايته.",
        reference: "صحيح مسلم"
      },
      {
        id: "e2",
        text: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ.",
        count: 1,
        reward: "سيد الاستغفار؛ من قاله موقناً به حين يمسي فمات من ليلته دخل الجنة.",
        reference: "صحيح البخاري"
      },
      {
        id: "e3",
        text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.",
        count: 3,
        reward: "لم يضره شيء، ولم تصبه حُمّة (لدغة عقرب أو سم) في تلك الليلة.",
        reference: "صحيح مسلم"
      },
      {
        id: "e4",
        text: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ العَلِيمُ.",
        count: 3,
        reward: "لم تصبه فجأة بلاء حتى يصبح.",
        reference: "سنن أبي داود والترمذي"
      },
      {
        id: "e5",
        text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ المَصِيرُ.",
        count: 1,
        reward: "إقرار بنعم الله وتجديد التوكل عليه عند إقبال الليل.",
        reference: "سنن الترمذي"
      },
      {
        id: "e6",
        text: "رَضِيتُ بِاللَّهِ رَبّاً، وَبِالإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيّاً.",
        count: 3,
        reward: "كان حقاً على الله أن يرضيه يوم القيامة.",
        reference: "سنن أبي داود والترمذي"
      },
      {
        id: "e7",
        text: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الكُفْرِ، وَالفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ القَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ.",
        count: 3,
        reward: "صلاح البدن والروح والنجاة من فتن القبر.",
        reference: "سنن أبي داود وأحمد"
      },
      {
        id: "e8",
        text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ العَفْوَ وَالعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.",
        count: 1,
        reward: "حفظ رباني شامل لجميع أحوال المسلم وأهله وماله.",
        reference: "سنن أبي داود وابن ماجه"
      },
      {
        id: "e9",
        text: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
        count: 3,
        reward: "استغاثة برحمة الحي القيوم واستسلام لقضائه الجميل.",
        reference: "المستدرك للحاكم"
      },
      {
        id: "e10",
        text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
        count: 100,
        reward: "غفران الذنوب وعظم الأجر عند الله تعالى.",
        reference: "صحيح مسلم"
      },
      {
        id: "e11",
        text: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ المُلْكُ وَلَهُ الحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.",
        count: 10,
        reward: "حرز وحصن حصين من وساوس الشياطين وشرورهم.",
        reference: "صحيح البخاري ومسلم"
      },
      {
        id: "e12",
        text: "أَمْسَيْنَا عَلَى فِطْرَةِ الإِسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ.",
        count: 1,
        reward: "الوفاء بعهد الإيمان والموت على ملة التوحيد الخالص.",
        reference: "مسند أحمد وصحيح الجامع"
      }
    ]
  },

  activeTab: 'morning', // 'morning' | 'evening'
  viewFilter: 'daily',  // 'daily' (3 أذكار متجددة) | 'all' (الورد الكامل)
  userProgress: {},

  init() {
    this.detectTimeOfDayTab();
    this.loadProgress();
    this.bindDOMEvents();
    this.syncTabButtons();
    // الريندر الفوري دون انتظار
    this.render();
    // محاولة التحديث من الملف إذا كان متاحاً في الخلفية
    this.tryRefreshFromFile();
  },

  detectTimeOfDayTab() {
    const hour = new Date().getHours();
    // من الساعة 3 صباحاً حتى 12 ظهراً: أذكار الصباح، عدا ذلك: أذكار المساء
    if (hour >= 3 && hour < 12) {
      this.activeTab = 'morning';
    } else {
      this.activeTab = 'evening';
    }
  },

  syncTabButtons() {
    document.querySelectorAll('.adhkar-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === this.activeTab);
    });
    document.querySelectorAll('.home-adhkar-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === this.activeTab);
    });
    document.querySelectorAll('.adhkar-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === this.viewFilter);
    });
  },

  async tryRefreshFromFile() {
    try {
      if (window.API && typeof window.API.getAdhkar === 'function') {
        const fetched = await window.API.getAdhkar();
        if (fetched && fetched.morning && fetched.morning.length > 0) {
          this.data = fetched;
          this.render();
        }
      }
    } catch (e) {
      // استخدام البيانات المدمجة بنجاح
    }
  },

  loadProgress() {
    try {
      const todayKey = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`noor_adhkar_progress_${todayKey}`);
      if (saved) {
        this.userProgress = JSON.parse(saved);
      } else {
        this.userProgress = {};
      }
    } catch (e) {
      this.userProgress = {};
    }
  },

  saveProgress() {
    try {
      const todayKey = new Date().toISOString().split('T')[0];
      localStorage.setItem(`noor_adhkar_progress_${todayKey}`, JSON.stringify(this.userProgress));
    } catch (e) {
      console.error(e);
    }
  },

  getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  },

  /**
   * اختيار 3 أذكار يومية تتغير تلقائياً بحسب تاريخ اليوم المحدد
   */
  getDailyFeatured(list) {
    if (!list || list.length === 0) return [];
    if (list.length <= 3) return list;

    const dayOfYear = this.getDayOfYear();
    const startIndex = (dayOfYear * 3) % list.length;

    const featured = [];
    for (let i = 0; i < 3; i++) {
      const idx = (startIndex + i) % list.length;
      featured.push(list[idx]);
    }
    return featured;
  },

  render() {
    this.renderSectionAdhkar();
    this.renderHomeDailyWidget();
  },

  /**
   * 1. ريندر قسم الأذكار الرئيسي (#section-adhkar)
   */
  renderSectionAdhkar() {
    const container = document.getElementById('adhkar-cards-container');
    const progressFill = document.getElementById('adhkar-total-progress-fill');
    const progressText = document.getElementById('adhkar-total-progress-text');
    if (!container) return;

    const list = this.activeTab === 'morning' ? this.data.morning : this.data.evening;
    const itemsToDisplay = this.viewFilter === 'daily' ? this.getDailyFeatured(list) : list;

    if (!itemsToDisplay || itemsToDisplay.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>جاري تحضير الأذكار الشريفة...</p>
        </div>
      `;
      return;
    }

    let completedCount = 0;
    container.innerHTML = itemsToDisplay.map((item, index) => {
      const targetCount = item.count || 1;
      const remaining = this.userProgress[item.id] !== undefined ? this.userProgress[item.id] : targetCount;
      const isDone = remaining <= 0;
      if (isDone) completedCount++;

      return this.generateCardHTML(item, targetCount, remaining, isDone, index, 'section');
    }).join('');

    // تحديث شريط الإنجاز الكلي
    const totalItems = itemsToDisplay.length;
    const overallPct = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    if (progressFill) progressFill.style.width = `${overallPct}%`;
    if (progressText) progressText.textContent = `${overallPct}% (${completedCount} من ${totalItems})`;
  },

  /**
   * 2. ريندر ويدجت أذكار اليوم المباركة في الصفحة الرئيسية (#section-home)
   */
  renderHomeDailyWidget() {
    const homeContainer = document.getElementById('home-daily-adhkar-cards');
    const homeProgressFill = document.getElementById('home-daily-progress-fill');
    const homeProgressText = document.getElementById('home-daily-progress-text');
    const homeBadge = document.getElementById('home-adhkar-time-badge');
    if (!homeContainer) return;

    if (homeBadge) {
      homeBadge.textContent = this.activeTab === 'morning' ? 'أذكار الصباح ☀️' : 'أذكار المساء 🌙';
    }

    const list = this.activeTab === 'morning' ? this.data.morning : this.data.evening;
    const dailyItems = this.getDailyFeatured(list);

    if (!dailyItems || dailyItems.length === 0) {
      homeContainer.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;">جاري تحميل أذكار اليوم...</p>`;
      return;
    }

    let completedCount = 0;
    homeContainer.innerHTML = dailyItems.map((item, index) => {
      const targetCount = item.count || 1;
      const remaining = this.userProgress[item.id] !== undefined ? this.userProgress[item.id] : targetCount;
      const isDone = remaining <= 0;
      if (isDone) completedCount++;

      return this.generateCardHTML(item, targetCount, remaining, isDone, index, 'home');
    }).join('');

    const total = dailyItems.length;
    const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    if (homeProgressFill) homeProgressFill.style.width = `${pct}%`;
    if (homeProgressText) {
      homeProgressText.textContent = `${completedCount} من ${total} أذكار مكتملة (${pct}%)`;
    }

    const celebrationNotice = document.getElementById('home-adhkar-completed-banner');
    if (celebrationNotice) {
      celebrationNotice.style.display = (completedCount === total && total > 0) ? 'flex' : 'none';
    }
  },

  /**
   * إنشاء كود بطاقة الذكر التفاعلية
   */
  generateCardHTML(item, targetCount, remaining, isDone, index, source) {
    const progressPct = ((targetCount - remaining) / targetCount) * 100;
    const tabName = this.activeTab === 'morning' ? 'أذكار الصباح' : 'أذكار المساء';

    return `
      <div class="adhkar-card ${isDone ? 'is-completed' : ''}" 
           id="adhkar-card-${source}-${item.id}"
           onclick="Adhkar.handleCardClick('${item.id}', ${targetCount}, event)"
           title="${isDone ? 'تم إتمام هذا الذكر اليوم ✓ اضغط لإعادة القراءة' : 'اضغط على البطاقة في أي مكان لاحتساب التكرار'}"
           role="button"
           tabindex="0">
        
        <div class="adhkar-card-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="adhkar-index-badge">الذكر #${index + 1}</span>
            <span class="adhkar-badge">${tabName}</span>
          </div>
          <span class="adhkar-reference">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            ${item.reference}
          </span>
        </div>

        <div class="adhkar-card-body">
          <p class="adhkar-text">${item.text}</p>
          ${item.reward ? `
            <div class="adhkar-reward">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span><strong>الفضل:</strong> ${item.reward}</span>
            </div>
          ` : ''}
        </div>

        <div class="adhkar-card-footer">
          <div class="adhkar-progress-info">
            <div class="adhkar-mini-progress">
              <div class="adhkar-mini-fill" style="width: ${progressPct}%"></div>
            </div>
            <span class="adhkar-counter-label">${targetCount - remaining} من ${targetCount} مرات</span>
          </div>

          <div class="adhkar-action-wrapper">
            <button class="btn-adhkar-count ${isDone ? 'done' : ''}" 
                    onclick="event.stopPropagation(); Adhkar.handleCount('${item.id}', ${targetCount}, event)"
                    aria-label="تسبيح">
              ${isDone 
                ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> <span>تم الإتمام ✓</span>` 
                : `<span class="count-pulse-label">اضغط (${remaining})</span>`
              }
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * النقر على بطاقة الذكر كاملة (بحيث يقرأ ويضغط فتتم بسهولة تامة)
   */
  handleCardClick(id, maxCount, event) {
    this.handleCount(id, maxCount, event);
  },

  handleCount(id, maxCount, event) {
    let remaining = this.userProgress[id] !== undefined ? this.userProgress[id] : maxCount;

    if (remaining > 0) {
      remaining -= 1;
      this.userProgress[id] = remaining;
      this.saveProgress();

      // رد فعل صوتي واهتزاز ناعم
      if (window.Sound) {
        Sound.playTasbeehBeadClick();
      }
      if (window.Settings && Settings.get('tasbeehVibrate') && navigator.vibrate) {
        try { navigator.vibrate(22); } catch(e) {}
      }

      // تأثير بصري للبطاقة المنقورة
      const cards = document.querySelectorAll(`[id*="adhkar-card-"][id$="-${id}"]`);
      cards.forEach(card => {
        card.classList.remove('adhkar-tap-pulse');
        void card.offsetWidth;
        card.classList.add('adhkar-tap-pulse');
      });

      // عند إتمام جميع تكرارات الذكر الحالي
      if (remaining === 0) {
        if (window.Sound) Sound.playGoalCelebration();
        if (window.App) App.showToast('✨ تقبل الله! تم إتمام هذا الذكر المبارك 🤲', 3500);
      }

      this.render();
    } else {
      // الذكر مكتمل بالفعل
      if (window.App) {
        App.showToast('أحسنت! هذا الذكر مكتمل لليوم بفضل الله ✓', 2000);
      }
    }
  },

  resetAll() {
    this.userProgress = {};
    this.saveProgress();
    this.render();
    if (window.Sound) Sound.playUIClick();
    if (window.App) App.showToast('تمت إعادة تعيين عداد جميع الأذكار لليوم');
  },

  setTab(tab) {
    this.activeTab = tab;
    this.syncTabButtons();
    if (window.Sound) Sound.playUIClick();
    this.render();
  },

  setFilter(filter) {
    this.viewFilter = filter;
    this.syncTabButtons();
    if (window.Sound) Sound.playUIClick();
    this.render();
  },

  bindDOMEvents() {
    // تبويبات قسم الأذكار
    document.querySelectorAll('.adhkar-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTab(btn.dataset.tab);
      });
    });

    // تبويبات ويدجت الصفحة الرئيسية
    document.querySelectorAll('.home-adhkar-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTab(btn.dataset.tab);
      });
    });

    document.querySelectorAll('.adhkar-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setFilter(btn.dataset.filter);
      });
    });

    const resetBtn = document.getElementById('btn-adhkar-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetAll());
    }
  }
};

window.Adhkar = Adhkar;
