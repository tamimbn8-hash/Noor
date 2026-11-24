/**
 * نُور القرآن | NOOR AL-QURAN
 * sound.js - محرك المؤثرات الصوتية الروحانية والطبيعية
 * يعتمد على Web Audio API لتوليد أصوات حقيقية ونقية 100% داخل المتصفح بدون أي ملفات خارجية قابلة للتلف أو البطء
 */

const Sound = {
  ctx: null,
  isMuted: false,
  masterVolume: 0.85,
  rainVolume: 0.22,
  uiVolume: 0.5,
  tasbeehVolume: 0.6,
  pageTurnVolume: 0.4,
  isRainPlaying: false,
  rainNode: null,
  rainGainNode: null,
  hasUserInteracted: false,

  init() {
    this.loadPreferences();
    this.bindAutoplayUnlock();
  },

  loadPreferences() {
    try {
      const saved = localStorage.getItem('noor_sound_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isMuted !== undefined) this.isMuted = !!parsed.isMuted;
        if (parsed.masterVolume !== undefined) this.masterVolume = parseFloat(parsed.masterVolume);
        if (parsed.rainVolume !== undefined) this.rainVolume = parseFloat(parsed.rainVolume);
        if (parsed.isRainPlaying !== undefined) this.isRainPlaying = !!parsed.isRainPlaying;
      }
    } catch (e) {
      console.warn('Could not load sound preferences:', e);
    }
  },

  savePreferences() {
    try {
      localStorage.setItem('noor_sound_settings', JSON.stringify({
        isMuted: this.isMuted,
        masterVolume: this.masterVolume,
        rainVolume: this.rainVolume,
        isRainPlaying: this.isRainPlaying
      }));
    } catch (e) {
      console.warn('Could not save sound preferences:', e);
    }
  },

  /**
   * تهيئة سياق الصوت بمجرد أول تفاعل للمستخدم امتثالاً لسياسات المتصفح
   */
  getContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  bindAutoplayUnlock() {
    const unlock = () => {
      this.hasUserInteracted = true;
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      // إذا كان المستخدم قد فعل صوت المطر سابقاً، ابدأ بتشغيله بهدوء
      if (this.isRainPlaying && !this.isMuted) {
        this.startRainSound();
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('click', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
  },

  /**
   * كتم أو تفعيل كل الأصوات (Master Mute Toggle)
   */
  toggleMasterMute() {
    this.isMuted = !this.isMuted;
    this.savePreferences();

    if (this.isMuted) {
      this.stopRainSound(true);
      if (window.Quran && Quran.audio) Quran.audio.muted = true;
      if (window.Prayer && Prayer.audio) Prayer.audio.muted = true;
      if (window.App) App.showToast('تم كتم الصوت العام للمنصة 🔇');
    } else {
      if (window.Quran && Quran.audio) Quran.audio.muted = false;
      if (window.Prayer && Prayer.audio) Prayer.audio.muted = false;
      if (this.isRainPlaying) {
        this.startRainSound();
      }
      if (window.App) App.showToast('تم تفعيل الصوت 🔊');
    }

    this.updateMuteUI();
    return this.isMuted;
  },

  updateMuteUI() {
    const muteButtons = document.querySelectorAll('.btn-master-mute-toggle');
    muteButtons.forEach(btn => {
      btn.classList.toggle('is-muted', this.isMuted);
      btn.setAttribute('title', this.isMuted ? 'إلغاء كتم الصوت' : 'كتم جميع الأصوات');
      btn.innerHTML = this.isMuted
        ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`
        : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
    });

    const rainToggleBtn = document.getElementById('btn-toggle-rain-sound');
    if (rainToggleBtn) {
      rainToggleBtn.classList.toggle('active', this.isRainPlaying && !this.isMuted);
    }
  },

  /**
   * 1. صوت المطر الهادئ في الخلفية (Ambient Rain Synthesizer)
   * يتم توليده بواسطة براون/بينك نويز وفلاتر ترددية ناعمة تحاكي هطول المطر الواقعي
   */
  startRainSound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.rainNode) return; // قيد التشغيل بالفعل

    try {
      // إنشاء بافر ضوضاء براون/بينك مدته 5 ثوانٍ يتم تكراره بسلاسة
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // فلتر تكاملي بسيط لإنتاج Brown noise الدافئ المريح للأذن
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // تعويض السعة
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      // فلتر تمرير نطاقي لمعالجة صوت قطرات المطر الهادئة (Bandpass Filter)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(650, ctx.currentTime);
      bandpass.Q.setValueAtTime(0.65, ctx.currentTime);

      // فلتر تمرير منخفض لنعومة الصوت وخفته المريحة (Lowpass Filter)
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(1150, ctx.currentTime);

      // عقدة التحكم بالصوت مع تلاشٍ تدريجي هادئ وخفيف جداً (Soft Gentle Fade-in)
      const gainNode = ctx.createGain();
      const targetVol = this.rainVolume * this.masterVolume * 0.26;
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 1.2);

      // ربط المسار الصوتي
      noiseSource.connect(bandpass);
      bandpass.connect(lowpass);
      lowpass.connect(gainNode);
      gainNode.connect(ctx.destination);

      noiseSource.start(0);

      this.rainNode = noiseSource;
      this.rainGainNode = gainNode;
      this.isRainPlaying = true;
      this.savePreferences();
      this.updateMuteUI();
    } catch (e) {
      console.warn('Rain sound initialization failed:', e);
    }
  },

  stopRainSound(temporary = false) {
    if (!temporary) {
      this.isRainPlaying = false;
      this.savePreferences();
    }
    if (this.rainNode && this.ctx) {
      try {
        const currentGain = this.rainGainNode;
        if (currentGain) {
          currentGain.gain.setValueAtTime(currentGain.gain.value, this.ctx.currentTime);
          currentGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
        }
        setTimeout(() => {
          if (this.rainNode) {
            try { this.rainNode.stop(); } catch(err) {}
            this.rainNode.disconnect();
            this.rainNode = null;
            this.rainGainNode = null;
          }
        }, 650);
      } catch (e) {
        this.rainNode = null;
      }
    }
    this.updateMuteUI();
  },

  toggleRainSound() {
    if (this.isRainPlaying) {
      this.stopRainSound(false);
      if (window.App) App.showToast('تم إيقاف صوت المطر');
    } else {
      if (this.isMuted) this.toggleMasterMute();
      this.startRainSound();
      if (window.App) App.showToast('🌧️ بدأ تشغيل صوت المطر الهادئ في الخلفية');
    }
  },

  setRainVolume(val) {
    this.rainVolume = Math.max(0, Math.min(1, parseFloat(val)));
    if (this.rainGainNode && this.ctx) {
      const targetVol = this.rainVolume * this.masterVolume * 0.26;
      this.rainGainNode.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.1);
    }
    this.savePreferences();
  },

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, parseFloat(val)));
    if (this.rainGainNode && this.ctx) {
      const targetVol = this.rainVolume * this.masterVolume * 0.26;
      this.rainGainNode.gain.linearRampToValueAtTime(targetVol, this.ctx.currentTime + 0.1);
    }
    if (window.Quran && Quran.audio) {
      Quran.audio.volume = this.masterVolume * (Quran.volume || 1);
    }
    this.savePreferences();
  },

  /**
   * 2. صوت نقرة خرزة السبحة الطبيعية (Authentic Wooden/Stone Bead Clack)
   */
  playTasbeehBeadClick() {
    if (this.isMuted || !Settings.get('tasbeehSound')) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // تذبذب يحاكي اصطدام حبتي خشب/أحجار كريمة ببعضهما
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(680 + Math.random() * 80, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.045);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      const vol = this.tasbeehVolume * this.masterVolume * 0.35;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.055);
    } catch (e) {}
  },

  /**
   * 3. صوت الاحتفال بإتمام الورد أو التسبيح (Spiritual Harmonic Chime / Singing Bowl)
   */
  playGoalCelebration() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // نغمات روحانية متناغمة (تردد 528Hz مع التوافقية 792Hz و 1056Hz)
      const freqs = [528, 792, 1056];
      const masterGain = ctx.createGain();
      const vol = this.masterVolume * 0.4;
      masterGain.gain.setValueAtTime(vol, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      masterGain.connect(ctx.destination);

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const individualVol = 0.35 / (idx + 1);
        oscGain.gain.setValueAtTime(individualVol, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + (2.5 - idx * 0.4));

        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 2.8);
      });
    } catch (e) {}
  },

  /**
   * 4. صوت تقليب صفحات المصحف الشريف (Realistic Paper Rustle / Page Turn)
   */
  playPageTurn() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.18; // 180ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(800, now);
      bandpass.frequency.linearRampToValueAtTime(450, now + 0.18);
      bandpass.Q.setValueAtTime(1.2, now);

      const gain = ctx.createGain();
      const vol = this.pageTurnVolume * this.masterVolume * 0.28;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.06);
      gain.gain.linearRampToValueAtTime(0.0001, now + 0.18);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.19);
    } catch (e) {}
  },

  /**
   * 5. أصوات نقرات واجهة المستخدم الرقيقة (Micro-interaction UI Click)
   */
  playUIClick() {
    if (this.isMuted || !this.hasUserInteracted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(550, now + 0.025);

      const vol = this.uiVolume * this.masterVolume * 0.14;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {}
  }
};

window.Sound = Sound;
