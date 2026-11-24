/**
 * نُور القرآن | NOOR AL-QURAN
 * quran-meta.js - البيانات الوصفية الكاملة للقرآن الكريم: 114 سورة، 30 جزءاً، 60 حزباً، والقراء المعتمدون
 */

const QuranMeta = {
  // 1. القراء المعتمدون مع روابط خوادم الصوت المباشرة والموثوقة 100%
  reciters: [
    {
      id: 'afs',
      name: 'مشاري راشد العفاسي',
      nameEn: 'Mishary Rashid Alafasy',
      subtext: 'رواية حفص عن عاصم',
      serverUrl: 'https://server8.mp3quran.net/afs/',
      everyAyahSubfolder: 'Alafasy_128kbps'
    },
    {
      id: 'basit',
      name: 'عبد الباسط عبد الصمد (مرتل)',
      nameEn: 'Abdul Basit Abdul Samad',
      subtext: 'المصحف المرتل',
      serverUrl: 'https://server7.mp3quran.net/basit/',
      everyAyahSubfolder: 'Abdul_Basit_Murattal_192kbps'
    },
    {
      id: 'maher',
      name: 'ماهر المعيقلي',
      nameEn: 'Maher Al-Muaiqly',
      subtext: 'إمام الحرم المكي الشريف',
      serverUrl: 'https://server12.mp3quran.net/maher/',
      everyAyahSubfolder: 'MaherAlMuaiqly128kbps'
    },
    {
      id: 'minsh',
      name: 'محمد صديق المنشاوي (مرتل)',
      nameEn: 'Mohamed Siddiq Al-Minshawi',
      subtext: 'المصحف المرتل',
      serverUrl: 'https://server10.mp3quran.net/minsh/',
      everyAyahSubfolder: 'Minshawy_Murattal_128kbps'
    },
    {
      id: 'husr',
      name: 'محمود خليل الحصري',
      nameEn: 'Mahmoud Khalil Al-Husary',
      subtext: 'شيخ عموم المقارئ المصرية',
      serverUrl: 'https://server13.mp3quran.net/husr/',
      everyAyahSubfolder: 'Husary_128kbps'
    },
    {
      id: 'dosr',
      name: 'ياسر الدوسري',
      nameEn: 'Yasser Al-Dosari',
      subtext: 'إمام الحرم المكي الشريف',
      serverUrl: 'https://server11.mp3quran.net/yasser/',
      everyAyahSubfolder: 'Yasser_Ad-Dussary_128kbps'
    },
    {
      id: 's_gmd',
      name: 'سعد الغامدي',
      nameEn: 'Saad Al-Ghamdi',
      subtext: 'رواية حفص عن عاصم',
      serverUrl: 'https://server7.mp3quran.net/s_gmd/',
      everyAyahSubfolder: 'Ghamadi_40kbps'
    },
    {
      id: 'ajm',
      name: 'أحمد بن علي العجمي',
      nameEn: 'Ahmed Al-Ajmy',
      subtext: 'رواية حفص عن عاصم',
      serverUrl: 'https://server10.mp3quran.net/ajm/',
      everyAyahSubfolder: 'Ahmed_ibn_Ali_al-Ajamy_128kbps'
    }
  ],

  // 2. قائمة سور القرآن الكريم كاملة (114 سورة مرتبة بالترتيب التوقيفي الصحيح)
  surahs: [
    { number: 1, name: "الفاتحة", englishName: "Al-Faatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan", startingPage: 1 },
    { number: 2, name: "البقرة", englishName: "Al-Baqarah", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan", startingPage: 2 },
    { number: 3, name: "آل عمران", englishName: "Aal-i-Imraan", englishNameTranslation: "The Family of Imraan", numberOfAyahs: 200, revelationType: "Medinan", startingPage: 50 },
    { number: 4, name: "النساء", englishName: "An-Nisaa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan", startingPage: 77 },
    { number: 5, name: "المائدة", englishName: "Al-Maaida", englishNameTranslation: "The Table", numberOfAyahs: 120, revelationType: "Medinan", startingPage: 106 },
    { number: 6, name: "الأنعام", englishName: "Al-An'aam", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan", startingPage: 128 },
    { number: 7, name: "الأعراف", englishName: "Al-A'raaf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan", startingPage: 151 },
    { number: 8, name: "الأنفال", englishName: "Al-Anfaal", englishNameTranslation: "The Spoils of War", numberOfAyahs: 75, revelationType: "Medinan", startingPage: 177 },
    { number: 9, name: "التوبة", englishName: "At-Tawba", englishNameTranslation: "The Repentance", numberOfAyahs: 129, revelationType: "Medinan", startingPage: 187 },
    { number: 10, name: "يونس", englishName: "Yunus", englishNameTranslation: "Jonas", numberOfAyahs: 109, revelationType: "Meccan", startingPage: 208 },
    { number: 11, name: "هود", englishName: "Hud", englishNameTranslation: "Hud", numberOfAyahs: 123, revelationType: "Meccan", startingPage: 221 },
    { number: 12, name: "يوسف", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111, revelationType: "Meccan", startingPage: 235 },
    { number: 13, name: "الرعد", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", numberOfAyahs: 43, revelationType: "Medinan", startingPage: 249 },
    { number: 14, name: "إبراهيم", englishName: "Ibrahim", englishNameTranslation: "Abraham", numberOfAyahs: 52, revelationType: "Meccan", startingPage: 255 },
    { number: 15, name: "الحجر", englishName: "Al-Hijr", englishNameTranslation: "The Rock", numberOfAyahs: 99, revelationType: "Meccan", startingPage: 262 },
    { number: 16, name: "النحل", englishName: "An-Nahl", englishNameTranslation: "The Bee", numberOfAyahs: 128, revelationType: "Meccan", startingPage: 267 },
    { number: 17, name: "الإسراء", englishName: "Al-Israa", englishNameTranslation: "The Night Journey", numberOfAyahs: 111, revelationType: "Meccan", startingPage: 282 },
    { number: 18, name: "الكهف", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan", startingPage: 293 },
    { number: 19, name: "مريم", englishName: "Maryam", englishNameTranslation: "Mary", numberOfAyahs: 98, revelationType: "Meccan", startingPage: 305 },
    { number: 20, name: "طه", englishName: "Taa-Haa", englishNameTranslation: "Taa-Haa", numberOfAyahs: 135, revelationType: "Meccan", startingPage: 312 },
    { number: 21, name: "الأنبياء", englishName: "Al-Anbiyaa", englishNameTranslation: "The Prophets", numberOfAyahs: 112, revelationType: "Meccan", startingPage: 322 },
    { number: 22, name: "الحج", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", numberOfAyahs: 78, revelationType: "Medinan", startingPage: 332 },
    { number: 23, name: "المؤمنون", englishName: "Al-Muminoon", englishNameTranslation: "The Believers", numberOfAyahs: 118, revelationType: "Meccan", startingPage: 342 },
    { number: 24, name: "النور", englishName: "An-Noor", englishNameTranslation: "The Light", numberOfAyahs: 64, revelationType: "Medinan", startingPage: 350 },
    { number: 25, name: "الفرقان", englishName: "Al-Furqaan", englishNameTranslation: "The Criterion", numberOfAyahs: 77, revelationType: "Meccan", startingPage: 359 },
    { number: 26, name: "الشعراء", englishName: "Ash-Shu'araa", englishNameTranslation: "The Poets", numberOfAyahs: 227, revelationType: "Meccan", startingPage: 367 },
    { number: 27, name: "النمل", englishName: "An-Naml", englishNameTranslation: "The Ant", numberOfAyahs: 93, revelationType: "Meccan", startingPage: 377 },
    { number: 28, name: "القصص", englishName: "Al-Qasas", englishNameTranslation: "The Stories", numberOfAyahs: 88, revelationType: "Meccan", startingPage: 385 },
    { number: 29, name: "العنكبوت", englishName: "Al-Ankaboot", englishNameTranslation: "The Spider", numberOfAyahs: 69, revelationType: "Meccan", startingPage: 396 },
    { number: 30, name: "الروم", englishName: "Ar-Room", englishNameTranslation: "The Romans", numberOfAyahs: 60, revelationType: "Meccan", startingPage: 404 },
    { number: 31, name: "لقمان", englishName: "Luqman", englishNameTranslation: "Luqman", numberOfAyahs: 34, revelationType: "Meccan", startingPage: 411 },
    { number: 32, name: "السجدة", englishName: "As-Sajda", englishNameTranslation: "The Prostration", numberOfAyahs: 30, revelationType: "Meccan", startingPage: 415 },
    { number: 33, name: "الأحزاب", englishName: "Al-Ahzaab", englishNameTranslation: "The Clans", numberOfAyahs: 73, revelationType: "Medinan", startingPage: 418 },
    { number: 34, name: "سبأ", englishName: "Saba", englishNameTranslation: "Sheba", numberOfAyahs: 54, revelationType: "Meccan", startingPage: 428 },
    { number: 35, name: "فاطر", englishName: "Faatir", englishNameTranslation: "The Originator", numberOfAyahs: 45, revelationType: "Meccan", startingPage: 434 },
    { number: 36, name: "يس", englishName: "Yaseen", englishNameTranslation: "Yaseen", numberOfAyahs: 83, revelationType: "Meccan", startingPage: 440 },
    { number: 37, name: "الصافات", englishName: "As-Saaffaat", englishNameTranslation: "Those drawn up in Ranks", numberOfAyahs: 182, revelationType: "Meccan", startingPage: 446 },
    { number: 38, name: "ص", englishName: "Saad", englishNameTranslation: "The letter Saad", numberOfAyahs: 88, revelationType: "Meccan", startingPage: 453 },
    { number: 39, name: "الزمر", englishName: "Az-Zumar", englishNameTranslation: "The Groups", numberOfAyahs: 75, revelationType: "Meccan", startingPage: 458 },
    { number: 40, name: "غافر", englishName: "Ghafir", englishNameTranslation: "The Forgiver", numberOfAyahs: 85, revelationType: "Meccan", startingPage: 467 },
    { number: 41, name: "فصلت", englishName: "Fussilat", englishNameTranslation: "Explained in detail", numberOfAyahs: 54, revelationType: "Meccan", startingPage: 477 },
    { number: 42, name: "الشورى", englishName: "Ash-Shura", englishNameTranslation: "Consultation", numberOfAyahs: 53, revelationType: "Meccan", startingPage: 483 },
    { number: 43, name: "الزخرف", englishName: "Az-Zukhruf", englishNameTranslation: "Ornaments of gold", numberOfAyahs: 89, revelationType: "Meccan", startingPage: 489 },
    { number: 44, name: "الدخان", englishName: "Ad-Dukhaan", englishNameTranslation: "The Smoke", numberOfAyahs: 59, revelationType: "Meccan", startingPage: 496 },
    { number: 45, name: "الجاثية", englishName: "Al-Jaathiya", englishNameTranslation: "Crouching", numberOfAyahs: 37, revelationType: "Meccan", startingPage: 499 },
    { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf", englishNameTranslation: "The Dunes", numberOfAyahs: 35, revelationType: "Meccan", startingPage: 502 },
    { number: 47, name: "محمد", englishName: "Muhammad", englishNameTranslation: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan", startingPage: 507 },
    { number: 48, name: "الفتح", englishName: "Al-Fath", englishNameTranslation: "The Victory", numberOfAyahs: 29, revelationType: "Medinan", startingPage: 511 },
    { number: 49, name: "الحجرات", englishName: "Al-Hujuraat", englishNameTranslation: "The Inner Apartments", numberOfAyahs: 18, revelationType: "Medinan", startingPage: 515 },
    { number: 50, name: "ق", englishName: "Qaaf", englishNameTranslation: "The letter Qaaf", numberOfAyahs: 45, revelationType: "Meccan", startingPage: 518 },
    { number: 51, name: "الذاريات", englishName: "Adh-Dhaariyat", englishNameTranslation: "The Winnowing Winds", numberOfAyahs: 60, revelationType: "Meccan", startingPage: 520 },
    { number: 52, name: "الطور", englishName: "At-Toor", englishNameTranslation: "The Mount", numberOfAyahs: 49, revelationType: "Meccan", startingPage: 523 },
    { number: 53, name: "النجم", englishName: "An-Najm", englishNameTranslation: "The Star", numberOfAyahs: 62, revelationType: "Meccan", startingPage: 526 },
    { number: 54, name: "القمر", englishName: "Al-Qamar", englishNameTranslation: "The Moon", numberOfAyahs: 55, revelationType: "Meccan", startingPage: 528 },
    { number: 55, name: "الرحمن", englishName: "Ar-Rahmaan", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan", startingPage: 531 },
    { number: 56, name: "الواقعة", englishName: "Al-Waaqia", englishNameTranslation: "The Inevitable", numberOfAyahs: 96, revelationType: "Meccan", startingPage: 534 },
    { number: 57, name: "الحديد", englishName: "Al-Hadid", englishNameTranslation: "The Iron", numberOfAyahs: 29, revelationType: "Medinan", startingPage: 537 },
    { number: 58, name: "المجادلة", englishName: "Al-Mujaadila", englishNameTranslation: "The Pleading Woman", numberOfAyahs: 22, revelationType: "Medinan", startingPage: 542 },
    { number: 59, name: "الحشر", englishName: "Al-Hashr", englishNameTranslation: "The Exile", numberOfAyahs: 24, revelationType: "Medinan", startingPage: 545 },
    { number: 60, name: "الممتحنة", englishName: "Al-Mumtahana", englishNameTranslation: "She that is to be examined", numberOfAyahs: 13, revelationType: "Medinan", startingPage: 549 },
    { number: 61, name: "الصف", englishName: "As-Saff", englishNameTranslation: "The Ranks", numberOfAyahs: 14, revelationType: "Medinan", startingPage: 551 },
    { number: 62, name: "الجمعة", englishName: "Al-Jumu'a", englishNameTranslation: "Friday", numberOfAyahs: 11, revelationType: "Medinan", startingPage: 553 },
    { number: 63, name: "المنافقون", englishName: "Al-Munaafiqoon", englishNameTranslation: "The Hypocrites", numberOfAyahs: 11, revelationType: "Medinan", startingPage: 554 },
    { number: 64, name: "التغابن", englishName: "At-Taghaabun", englishNameTranslation: "Mutual Disillusion", numberOfAyahs: 18, revelationType: "Medinan", startingPage: 556 },
    { number: 65, name: "الطلاق", englishName: "At-Talaaq", englishNameTranslation: "Divorce", numberOfAyahs: 12, revelationType: "Medinan", startingPage: 558 },
    { number: 66, name: "التحريم", englishName: "At-Tahrim", englishNameTranslation: "The Prohibition", numberOfAyahs: 12, revelationType: "Medinan", startingPage: 560 },
    { number: 67, name: "الملك", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan", startingPage: 562 },
    { number: 68, name: "القلم", englishName: "Al-Qalam", englishNameTranslation: "The Pen", numberOfAyahs: 52, revelationType: "Meccan", startingPage: 564 },
    { number: 69, name: "الحاقة", englishName: "Al-Haaqqa", englishNameTranslation: "The Reality", numberOfAyahs: 52, revelationType: "Meccan", startingPage: 566 },
    { number: 70, name: "المعارج", englishName: "Al-Ma'aarij", englishNameTranslation: "The Ascending Stairways", numberOfAyahs: 44, revelationType: "Meccan", startingPage: 568 },
    { number: 71, name: "نوح", englishName: "Nooh", englishNameTranslation: "Noah", numberOfAyahs: 28, revelationType: "Meccan", startingPage: 570 },
    { number: 72, name: "الجن", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", numberOfAyahs: 28, revelationType: "Meccan", startingPage: 572 },
    { number: 73, name: "المزمل", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", numberOfAyahs: 20, revelationType: "Meccan", startingPage: 574 },
    { number: 74, name: "المدثر", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", numberOfAyahs: 56, revelationType: "Meccan", startingPage: 575 },
    { number: 75, name: "القيامة", englishName: "Al-Qiyaama", englishNameTranslation: "The Resurrection", numberOfAyahs: 40, revelationType: "Meccan", startingPage: 577 },
    { number: 76, name: "الإنسان", englishName: "Al-Insaan", englishNameTranslation: "Man", numberOfAyahs: 31, revelationType: "Medinan", startingPage: 578 },
    { number: 77, name: "المرسلات", englishName: "Al-Mursalaat", englishNameTranslation: "The Emissaries", numberOfAyahs: 50, revelationType: "Meccan", startingPage: 580 },
    { number: 78, name: "النبأ", englishName: "An-Naba", englishNameTranslation: "The Tidings", numberOfAyahs: 40, revelationType: "Meccan", startingPage: 582 },
    { number: 79, name: "النازعات", englishName: "An-Naazi'aat", englishNameTranslation: "Those who drag forth", numberOfAyahs: 46, revelationType: "Meccan", startingPage: 583 },
    { number: 80, name: "عبس", englishName: "Abasa", englishNameTranslation: "He frowned", numberOfAyahs: 42, revelationType: "Meccan", startingPage: 585 },
    { number: 81, name: "التكوير", englishName: "At-Takwir", englishNameTranslation: "The Overthrowing", numberOfAyahs: 29, revelationType: "Meccan", startingPage: 586 },
    { number: 82, name: "الانفطار", englishName: "Al-Infitaar", englishNameTranslation: "The Cleaving", numberOfAyahs: 19, revelationType: "Meccan", startingPage: 587 },
    { number: 83, name: "المطففين", englishName: "Al-Mutaffifin", englishNameTranslation: "Defrauding", numberOfAyahs: 36, revelationType: "Meccan", startingPage: 587 },
    { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaaq", englishNameTranslation: "The Splitting Open", numberOfAyahs: 25, revelationType: "Meccan", startingPage: 589 },
    { number: 85, name: "البروج", englishName: "Al-Burooj", englishNameTranslation: "The Constellations", numberOfAyahs: 22, revelationType: "Meccan", startingPage: 590 },
    { number: 86, name: "الطارق", englishName: "At-Taariq", englishNameTranslation: "The Morning Star", numberOfAyahs: 17, revelationType: "Meccan", startingPage: 591 },
    { number: 87, name: "الأعلى", englishName: "Al-A'laa", englishNameTranslation: "The Most High", numberOfAyahs: 19, revelationType: "Meccan", startingPage: 591 },
    { number: 88, name: "الغاشية", englishName: "Al-Ghaashiya", englishNameTranslation: "The Overwhelming", numberOfAyahs: 26, revelationType: "Meccan", startingPage: 592 },
    { number: 89, name: "الفجر", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", numberOfAyahs: 30, revelationType: "Meccan", startingPage: 593 },
    { number: 90, name: "البلد", englishName: "Al-Balad", englishNameTranslation: "The City", numberOfAyahs: 20, revelationType: "Meccan", startingPage: 594 },
    { number: 91, name: "الشمس", englishName: "Ash-Shams", englishNameTranslation: "The Sun", numberOfAyahs: 15, revelationType: "Meccan", startingPage: 595 },
    { number: 92, name: "الليل", englishName: "Al-Lail", englishNameTranslation: "The Night", numberOfAyahs: 21, revelationType: "Meccan", startingPage: 595 },
    { number: 93, name: "الضحى", englishName: "Ad-Dhuhaa", englishNameTranslation: "The Morning Hours", numberOfAyahs: 11, revelationType: "Meccan", startingPage: 596 },
    { number: 94, name: "الشرح", englishName: "Ash-Sharh", englishNameTranslation: "The Consolation", numberOfAyahs: 8, revelationType: "Meccan", startingPage: 596 },
    { number: 95, name: "التين", englishName: "At-Teen", englishNameTranslation: "The Fig", numberOfAyahs: 8, revelationType: "Meccan", startingPage: 597 },
    { number: 96, name: "العلق", englishName: "Al-Alaq", englishNameTranslation: "The Clot", numberOfAyahs: 19, revelationType: "Meccan", startingPage: 597 },
    { number: 97, name: "القدر", englishName: "Al-Qadr", englishNameTranslation: "The Power", numberOfAyahs: 5, revelationType: "Meccan", startingPage: 598 },
    { number: 98, name: "البينة", englishName: "Al-Bayyina", englishNameTranslation: "The Clear Proof", numberOfAyahs: 8, revelationType: "Medinan", startingPage: 598 },
    { number: 99, name: "الزلزلة", englishName: "Az-Zalzala", englishNameTranslation: "The Earthquake", numberOfAyahs: 8, revelationType: "Medinan", startingPage: 599 },
    { number: 100, name: "العاديات", englishName: "Al-Aadiyaat", englishNameTranslation: "The Courser", numberOfAyahs: 11, revelationType: "Meccan", startingPage: 599 },
    { number: 101, name: "القارعة", englishName: "Al-Qaari'a", englishNameTranslation: "The Calamity", numberOfAyahs: 11, revelationType: "Meccan", startingPage: 600 },
    { number: 102, name: "التكاثر", englishName: "At-Takaathur", englishNameTranslation: "Rivalry in world increase", numberOfAyahs: 8, revelationType: "Meccan", startingPage: 600 },
    { number: 103, name: "العصر", englishName: "Al-Asr", englishNameTranslation: "The Declining Day", numberOfAyahs: 3, revelationType: "Meccan", startingPage: 601 },
    { number: 104, name: "الهمزة", englishName: "Al-Humaza", englishNameTranslation: "The Traducer", numberOfAyahs: 9, revelationType: "Meccan", startingPage: 601 },
    { number: 105, name: "الفيل", englishName: "Al-Feel", englishNameTranslation: "The Elephant", numberOfAyahs: 5, revelationType: "Meccan", startingPage: 601 },
    { number: 106, name: "قريش", englishName: "Quraish", englishNameTranslation: "Quraysh", numberOfAyahs: 4, revelationType: "Meccan", startingPage: 602 },
    { number: 107, name: "الماعون", englishName: "Al-Maa'oon", englishNameTranslation: "Small Kindnesses", numberOfAyahs: 7, revelationType: "Meccan", startingPage: 602 },
    { number: 108, name: "الكوثر", englishName: "Al-Kawthar", englishNameTranslation: "Abundance", numberOfAyahs: 3, revelationType: "Meccan", startingPage: 602 },
    { number: 109, name: "الكافرون", englishName: "Al-Kaafiroon", englishNameTranslation: "The Disbelievers", numberOfAyahs: 6, revelationType: "Meccan", startingPage: 603 },
    { number: 110, name: "النصر", englishName: "An-Nasr", englishNameTranslation: "The Divine Support", numberOfAyahs: 3, revelationType: "Medinan", startingPage: 603 },
    { number: 111, name: "المسد", englishName: "Al-Masad", englishNameTranslation: "The Palm Fibre", numberOfAyahs: 5, revelationType: "Meccan", startingPage: 603 },
    { number: 112, name: "الإخلاص", englishName: "Al-Ikhlaas", englishNameTranslation: "Sincerity", numberOfAyahs: 4, revelationType: "Meccan", startingPage: 604 },
    { number: 113, name: "الفلق", englishName: "Al-Falaq", englishNameTranslation: "The Dawn", numberOfAyahs: 5, revelationType: "Meccan", startingPage: 604 },
    { number: 114, name: "الناس", englishName: "An-Naas", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan", startingPage: 604 }
  ],

  // 3. أجزاء القرآن الكريم الثلاثون (30 جزءاً بالبداية والصفحة)
  juzs: [
    { number: 1, name: "الجزء الأول", startSurah: "الفاتحة", startSurahNumber: 1, startAyah: 1, startText: "الم ۞ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ", startingPage: 1 },
    { number: 2, name: "الجزء الثاني", startSurah: "البقرة", startSurahNumber: 2, startAyah: 142, startText: "سَيَقُولُ السُّفَهَاءُ مِنَ النَّاسِ", startingPage: 22 },
    { number: 3, name: "الجزء الثالث", startSurah: "البقرة", startSurahNumber: 2, startAyah: 253, startText: "تِلْكَ الرُّسُلُ فَضَّلْنَا بَعْضَهُمْ عَلَىٰ بَعْضٍ", startingPage: 42 },
    { number: 4, name: "الجزء الرابع", startSurah: "آل عمران", startSurahNumber: 3, startAyah: 93, startText: "كُلُّ الطَّعَامِ كَانَ حِلًّا لِّبَنِي إِسْرَائِيلَ", startingPage: 62 },
    { number: 5, name: "الجزء الخامس", startSurah: "النساء", startSurahNumber: 4, startAyah: 24, startText: "وَالْمُحْصَنَاتُ مِنَ النِّسَاءِ", startingPage: 82 },
    { number: 6, name: "الجزء السادس", startSurah: "النساء", startSurahNumber: 4, startAyah: 148, startText: "لَّا يُحِبُّ اللَّهُ الْجَهْرَ بِالسُّوءِ", startingPage: 102 },
    { number: 7, name: "الجزء السابع", startSurah: "المائدة", startSurahNumber: 5, startAyah: 82, startText: "لَتَجِدَنَّ أَشَدَّ النَّاسِ عَدَاوَةً", startingPage: 121 },
    { number: 8, name: "الجزء الثامن", startSurah: "الأنعام", startSurahNumber: 6, startAyah: 111, startText: "وَلَوْ أَنَّنَا نَزَّلْنَا إِلَيْهِمُ الْمَلَائِكَةَ", startingPage: 142 },
    { number: 9, name: "الجزء التاسع", startSurah: "الأعراف", startSurahNumber: 7, startAyah: 88, startText: "قَالَ الْمَلَأُ الَّذِينَ اسْتَكْبَرُوا", startingPage: 162 },
    { number: 10, name: "الجزء العاشر", startSurah: "الأنفال", startSurahNumber: 8, startAyah: 41, startText: "وَاعْلَمُوا أَنَّمَا غَنِمْتُم مِّن شَيْءٍ", startingPage: 182 },
    { number: 11, name: "الجزء الحادي عشر", startSurah: "التوبة", startSurahNumber: 9, startAyah: 93, startText: "إِنَّمَا السَّبِيلُ عَلَى الَّذِينَ يَسْتَأْذِنُونَكَ", startingPage: 201 },
    { number: 12, name: "الجزء الثاني عشر", startSurah: "هود", startSurahNumber: 11, startAyah: 6, startText: "وَمَا مِن دَابَّةٍ فِي الْأَرْضِ إِلَّا عَلَى اللَّهِ رِزْقُهَا", startingPage: 222 },
    { number: 13, name: "الجزء الثالث عشر", startSurah: "يوسف", startSurahNumber: 12, startAyah: 53, startText: "وَمَا أُبَرِّئُ نَفْسِي ۚ إِنَّ النَّفْسَ لَأَمَّارَةٌ بِالسُّوءِ", startingPage: 242 },
    { number: 14, name: "الجزء الرابع عشر", startSurah: "الحجر", startSurahNumber: 15, startAyah: 1, startText: "الر ۚ تِلْكَ آيَاتُ الْكِتَابِ وَقُرْآنٍ مُّبِينٍ", startingPage: 262 },
    { number: 15, name: "الجزء الخامس عشر", startSurah: "الإسراء", startSurahNumber: 17, startAyah: 1, startText: "سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا", startingPage: 282 },
    { number: 16, name: "الجزء السادس عشر", startSurah: "الكهف", startSurahNumber: 18, startAyah: 75, startText: "قَالَ أَلَمْ أَقُل لَّكَ إِنَّكَ لَن تَسْتَطِيعَ مَعِيَ صَبْرًا", startingPage: 302 },
    { number: 17, name: "الجزء السابع عشر", startSurah: "الأنبياء", startSurahNumber: 21, startAyah: 1, startText: "اقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ وَهُمْ فِي غَفْلَةٍ مَّعْرِضُونَ", startingPage: 322 },
    { number: 18, name: "الجزء الثامن عشر", startSurah: "المؤمنون", startSurahNumber: 23, startAyah: 1, startText: "قَدْ أَفْلَحَ الْمُؤْمِنُونَ", startingPage: 342 },
    { number: 19, name: "الجزء التاسع عشر", startSurah: "الفرقان", startSurahNumber: 25, startAyah: 21, startText: "وَقَالَ الَّذِينَ لَا يَرْجُونَ لِقَاءَنَا", startingPage: 362 },
    { number: 20, name: "الجزء العشرون", startSurah: "النمل", startSurahNumber: 27, startAyah: 56, startText: "فَمَا كَانَ جَوَابَ قَوْمِهِ إِلَّا أَن قَالُوا", startingPage: 382 },
    { number: 21, name: "الجزء الحادي والعشرون", startSurah: "العنكبوت", startSurahNumber: 29, startAyah: 46, startText: "وَلَا تُجَادِلُوا أَهْلَ الْكِتَابِ إِلَّا بِالَّتِي هِيَ أَحْسَنُ", startingPage: 402 },
    { number: 22, name: "الجزء الثاني والعشرون", startSurah: "الأحزاب", startSurahNumber: 33, startAyah: 31, startText: "وَمَن يَقْنُتْ مِنكُنَّ لِلَّهِ وَرَسُولِهِ", startingPage: 422 },
    { number: 23, name: "الجزء الثالث والعشرون", startSurah: "يس", startSurahNumber: 36, startAyah: 28, startText: "وَمَا أَنزَلْنَا عَلَىٰ قَوْمِهِ مِن بَعْدِهِ مِن جُندٍ", startingPage: 442 },
    { number: 24, name: "الجزء الرابع والعشرون", startSurah: "الزمر", startSurahNumber: 39, startAyah: 32, startText: "فَمَنْ أَظْلَمُ مِمَّن كَذَبَ عَلَى اللَّهِ", startingPage: 462 },
    { number: 25, name: "الجزء الخامس والعشرون", startSurah: "فصلت", startSurahNumber: 41, startAyah: 47, startText: "إِلَيْهِ يُرَدُّ عِلْمُ السَّاعَةِ", startingPage: 482 },
    { number: 26, name: "الجزء السادس والعشرون", startSurah: "الأحقاف", startSurahNumber: 46, startAyah: 1, startText: "حم ۞ تَنزِيلُ الْكِتَابِ مِنَ اللَّهِ الْعَزِيزِ الْحَكِيمِ", startingPage: 502 },
    { number: 27, name: "الجزء السابع والعشرون", startSurah: "الذاريات", startSurahNumber: 51, startAyah: 31, startText: "قَالَ فَمَا خَطْبُكُمْ أَيُّهَا الْمُرْسَلُونَ", startingPage: 522 },
    { number: 28, name: "الجزء الثامن والعشرون", startSurah: "المجادلة", startSurahNumber: 58, startAyah: 1, startText: "قَدْ سَمِعَ اللَّهُ قَوْلَ الَّتِي تُجَادِلُكَ فِي زَوْجِهَا", startingPage: 542 },
    { number: 29, name: "الجزء التاسع والعشرون (تبارك)", startSurah: "الملك", startSurahNumber: 67, startAyah: 1, startText: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ", startingPage: 562 },
    { number: 30, name: "الجزء الثلاثون (عمّ)", startSurah: "النبأ", startSurahNumber: 78, startAyah: 1, startText: "عَمَّ يَتَسَاءَلُونَ ۞ عَنِ النَّبَإِ الْعَظِيمِ", startingPage: 582 }
  ],

  // 4. الأحزاب الستون (60 حزباً في القرآن الكريم)
  hizbs: [
    { number: 1, name: "الحزب 1", surah: "الفاتحة", ayah: 1, page: 1 },
    { number: 2, name: "الحزب 2", surah: "البقرة", ayah: 75, page: 11 },
    { number: 3, name: "الحزب 3", surah: "البقرة", ayah: 142, page: 22 },
    { number: 4, name: "الحزب 4", surah: "البقرة", ayah: 203, page: 32 },
    { number: 5, name: "الحزب 5", surah: "البقرة", ayah: 253, page: 42 },
    { number: 6, name: "الحزب 6", surah: "آل عمران", ayah: 15, page: 51 },
    { number: 7, name: "الحزب 7", surah: "آل عمران", ayah: 93, page: 62 },
    { number: 8, name: "الحزب 8", surah: "آل عمران", ayah: 171, page: 72 },
    { number: 9, name: "الحزب 9", surah: "النساء", ayah: 24, page: 82 },
    { number: 10, name: "الحزب 10", surah: "النساء", ayah: 88, page: 92 },
    { number: 11, name: "الحزب 11", surah: "النساء", ayah: 148, page: 102 },
    { number: 12, name: "الحزب 12", surah: "المائدة", ayah: 27, page: 112 },
    { number: 13, name: "الحزب 13", surah: "المائدة", ayah: 82, page: 121 },
    { number: 14, name: "الحزب 14", surah: "الأنعام", ayah: 36, page: 131 },
    { number: 15, name: "الحزب 15", surah: "الأنعام", ayah: 111, page: 142 },
    { number: 16, name: "الحزب 16", surah: "الأعراف", ayah: 1, page: 151 },
    { number: 17, name: "الحزب 17", surah: "الأعراف", ayah: 88, page: 162 },
    { number: 18, name: "الحزب 18", surah: "الأعراف", ayah: 171, page: 172 },
    { number: 19, name: "الحزب 19", surah: "الأنفال", ayah: 41, page: 182 },
    { number: 20, name: "الحزب 20", surah: "التوبة", ayah: 34, page: 192 },
    { number: 21, name: "الحزب 21", surah: "التوبة", ayah: 93, page: 201 },
    { number: 22, name: "الحزب 22", surah: "يونس", ayah: 26, page: 212 },
    { number: 23, name: "الحزب 23", surah: "هود", ayah: 6, page: 222 },
    { number: 24, name: "الحزب 24", surah: "هود", ayah: 84, page: 231 },
    { number: 25, name: "الحزب 25", surah: "يوسف", ayah: 53, page: 242 },
    { number: 26, name: "الحزب 26", surah: "الرعد", ayah: 19, page: 252 },
    { number: 27, name: "الحزب 27", surah: "الحجر", ayah: 1, page: 262 },
    { number: 28, name: "الحزب 28", surah: "النحل", ayah: 51, page: 272 },
    { number: 29, name: "الحزب 29", surah: "الإسراء", ayah: 1, page: 282 },
    { number: 30, name: "الحزب 30", surah: "الإسراء", ayah: 99, page: 292 },
    { number: 31, name: "الحزب 31", surah: "الكهف", ayah: 75, page: 302 },
    { number: 32, name: "الحزب 32", surah: "مريم", ayah: 59, page: 310 },
    { number: 33, name: "الحزب 33", surah: "الأنبياء", ayah: 1, page: 322 },
    { number: 34, name: "الحزب 34", surah: "الحج", ayah: 1, page: 332 },
    { number: 35, name: "الحزب 35", surah: "المؤمنون", ayah: 1, page: 342 },
    { number: 36, name: "الحزب 36", surah: "النور", ayah: 21, page: 352 },
    { number: 37, name: "الحزب 37", surah: "الفرقان", ayah: 21, page: 362 },
    { number: 38, name: "الحزب 38", surah: "الشعراء", ayah: 111, page: 371 },
    { number: 39, name: "الحزب 39", surah: "النمل", ayah: 56, page: 382 },
    { number: 40, name: "الحزب 40", surah: "القصص", ayah: 51, page: 391 },
    { number: 41, name: "الحزب 41", surah: "العنكبوت", ayah: 46, page: 402 },
    { number: 42, name: "الحزب 42", surah: "لقمان", ayah: 22, page: 413 },
    { number: 43, name: "الحزب 43", surah: "الأحزاب", ayah: 31, page: 422 },
    { number: 44, name: "الحزب 44", surah: "سبأ", ayah: 24, page: 431 },
    { number: 45, name: "الحزب 45", surah: "يس", ayah: 28, page: 442 },
    { number: 46, name: "الحزب 46", surah: "الصافات", ayah: 145, page: 451 },
    { number: 47, name: "الحزب 47", surah: "الزمر", ayah: 32, page: 462 },
    { number: 48, name: "الحزب 48", surah: "غافر", ayah: 41, page: 472 },
    { number: 49, name: "الحزب 49", surah: "فصلت", ayah: 47, page: 482 },
    { number: 50, name: "الحزب 50", surah: "الزخرف", ayah: 24, page: 491 },
    { number: 51, name: "الحزب 51", surah: "الأحقاف", ayah: 1, page: 502 },
    { number: 52, name: "الحزب 52", surah: "الفتح", ayah: 18, page: 513 },
    { number: 53, name: "الحزب 53", surah: "الذاريات", ayah: 31, page: 522 },
    { number: 54, name: "الحزب 54", surah: "القمر", ayah: 9, page: 529 },
    { number: 55, name: "الحزب 55", surah: "الحديد", ayah: 1, page: 537 },
    { number: 56, name: "الحزب 56", surah: "المجادلة", ayah: 1, page: 542 },
    { number: 57, name: "الحزب 57", surah: "الصف", ayah: 1, page: 551 },
    { number: 58, name: "الحزب 58", surah: "الملك", ayah: 1, page: 562 },
    { number: 59, name: "الحزب 59", surah: "القيامة", ayah: 1, page: 577 },
    { number: 60, name: "الحزب 60", surah: "النبأ", ayah: 1, page: 582 }
  ],

  /**
   * البحث عن السورة برقمها
   */
  getSurah(num) {
    return this.surahs.find(s => s.number === parseInt(num, 10));
  },

  /**
   * معرفة الجزء المقترن برقم الصفحة
   */
  getJuzForPage(page) {
    const pageNum = parseInt(page, 10);
    for (let i = this.juzs.length - 1; i >= 0; i--) {
      if (pageNum >= this.juzs[i].startingPage) {
        return this.juzs[i];
      }
    }
    return this.juzs[0];
  },

  /**
   * معرفة الحزب المقترن برقم الصفحة
   */
  getHizbForPage(page) {
    const pageNum = parseInt(page, 10);
    for (let i = this.hizbs.length - 1; i >= 0; i--) {
      if (pageNum >= this.hizbs[i].page) {
        return this.hizbs[i];
      }
    }
    return this.hizbs[0];
  }
};

// إنشاء قواميس مساعدة سريعة
QuranMeta.surahTypesAr = {};
QuranMeta.surahAyahCounts = {};
QuranMeta.surahs.forEach(s => {
  QuranMeta.surahTypesAr[s.number] = (s.revelationType === 'Meccan' || s.revelationType === 1) ? 'مكية' : 'مدنية';
  QuranMeta.surahAyahCounts[s.number] = s.numberOfAyahs;
});

window.QuranMeta = QuranMeta;
