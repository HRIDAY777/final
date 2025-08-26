// Simple i18n utility for basic internationalization support
import { banglaTranslations } from './translations/bangla';

export type Language = 'en' | 'bn' | 'hi' | 'ar';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Common
  'common.loading': {
    en: 'Loading...',
    bn: 'লোড হচ্ছে...',
    hi: 'लोड हो रहा है...',
    ar: 'جاري التحميل...'
  },
  'common.error': {
    en: 'Error',
    bn: 'ত্রুটি',
    hi: 'त्रुटि',
    ar: 'خطأ'
  },
  'common.success': {
    en: 'Success',
    bn: 'সফল',
    hi: 'सफल',
    ar: 'نجح'
  },
  'common.save': {
    en: 'Save',
    bn: 'সংরক্ষণ করুন',
    hi: 'सहेजें',
    ar: 'حفظ'
  },
  'common.cancel': {
    en: 'Cancel',
    bn: 'বাতিল করুন',
    hi: 'रद्द करें',
    ar: 'إلغاء'
  },
  'common.delete': {
    en: 'Delete',
    bn: 'মুছুন',
    hi: 'हटाएं',
    ar: 'حذف'
  },
  'common.edit': {
    en: 'Edit',
    bn: 'সম্পাদনা করুন',
    hi: 'संपादित करें',
    ar: 'تعديل'
  },
  'common.add': {
    en: 'Add',
    bn: 'যোগ করুন',
    hi: 'जोड़ें',
    ar: 'إضافة'
  },
  'common.search': {
    en: 'Search',
    bn: 'অনুসন্ধান করুন',
    hi: 'खोजें',
    ar: 'بحث'
  },
  'common.filter': {
    en: 'Filter',
    bn: 'ফিল্টার করুন',
    hi: 'फ़िल्टर करें',
    ar: 'تصفية'
  },
  'common.view': {
    en: 'View',
    bn: 'দেখুন',
    hi: 'देखें',
    ar: 'عرض'
  },
  'common.update': {
    en: 'Update',
    bn: 'আপডেট করুন',
    hi: 'अपडेट करें',
    ar: 'تحديث'
  },
  'common.create': {
    en: 'Create',
    bn: 'তৈরি করুন',
    hi: 'बनाएं',
    ar: 'إنشاء'
  },
  'common.submit': {
    en: 'Submit',
    bn: 'জমা দিন',
    hi: 'सबमिट करें',
    ar: 'إرسال'
  },
  'common.back': {
    en: 'Back',
    bn: 'ফিরে যান',
    hi: 'वापस',
    ar: 'رجوع'
  },
  'common.next': {
    en: 'Next',
    bn: 'পরবর্তী',
    hi: 'अगला',
    ar: 'التالي'
  },
  'common.previous': {
    en: 'Previous',
    bn: 'পূর্ববর্তী',
    hi: 'पिछला',
    ar: 'السابق'
  },
  'common.close': {
    en: 'Close',
    bn: 'বন্ধ করুন',
    hi: 'बंद करें',
    ar: 'إغلاق'
  },
  'common.open': {
    en: 'Open',
    bn: 'খুলুন',
    hi: 'खोलें',
    ar: 'فتح'
  },
  'common.download': {
    en: 'Download',
    bn: 'ডাউনলোড করুন',
    hi: 'डाउनलोड करें',
    ar: 'تحميل'
  },
  'common.upload': {
    en: 'Upload',
    bn: 'আপলোড করুন',
    hi: 'अपलोड करें',
    ar: 'رفع'
  },
  'common.print': {
    en: 'Print',
    bn: 'প্রিন্ট করুন',
    hi: 'प्रिंट करें',
    ar: 'طباعة'
  },
  'common.export': {
    en: 'Export',
    bn: 'এক্সপোর্ট করুন',
    hi: 'एक्सपोर्ट करें',
    ar: 'تصدير'
  },
  'common.import': {
    en: 'Import',
    bn: 'ইমপোর্ট করুন',
    hi: 'इम्पोर्ट करें',
    ar: 'استيراد'
  },
  'common.refresh': {
    en: 'Refresh',
    bn: 'রিফ্রেশ করুন',
    hi: 'रिफ्रेश करें',
    ar: 'تحديث'
  },
  'common.yes': {
    en: 'Yes',
    bn: 'হ্যাঁ',
    hi: 'हाँ',
    ar: 'نعم'
  },
  'common.no': {
    en: 'No',
    bn: 'না',
    hi: 'नहीं',
    ar: 'لا'
  },
  'common.ok': {
    en: 'OK',
    bn: 'ঠিক আছে',
    hi: 'ठीक है',
    ar: 'موافق'
  },
  'common.confirm': {
    en: 'Confirm',
    bn: 'নিশ্চিত করুন',
    hi: 'पुष्टि करें',
    ar: 'تأكيد'
  },
  'common.details': {
    en: 'Details',
    bn: 'বিস্তারিত',
    hi: 'विवरण',
    ar: 'تفاصيل'
  },
  'common.more': {
    en: 'More',
    bn: 'আরও',
    hi: 'और',
    ar: 'المزيد'
  },
  'common.less': {
    en: 'Less',
    bn: 'কম',
    hi: 'कम',
    ar: 'أقل'
  },

  // Navigation
  'nav.dashboard': {
    en: 'Dashboard',
    bn: 'ড্যাশবোর্ড',
    hi: 'डैशबोर्ड',
    ar: 'لوحة التحكم'
  },
  'nav.students': {
    en: 'Students',
    bn: 'শিক্ষার্থীরা',
    hi: 'छात्र',
    ar: 'الطلاب'
  },
  'nav.teachers': {
    en: 'Teachers',
    bn: 'শিক্ষকরা',
    hi: 'शिक्षक',
    ar: 'المعلمون'
  },
  'nav.classes': {
    en: 'Classes',
    bn: 'ক্লাস',
    hi: 'कक्षाएं',
    ar: 'الفصول'
  },
  'nav.attendance': {
    en: 'Attendance',
    bn: 'উপস্থিতি',
    hi: 'उपस्थिति',
    ar: 'الحضور'
  },
  'nav.exams': {
    en: 'Exams',
    bn: 'পরীক্ষা',
    hi: 'परीक्षा',
    ar: 'الامتحانات'
  },
  'nav.library': {
    en: 'Library',
    bn: 'গ্রন্থাগার',
    hi: 'पुस्तकालय',
    ar: 'المكتبة'
  },
  'nav.finance': {
    en: 'Finance',
    bn: 'অর্থ',
    hi: 'वित्त',
    ar: 'المالية'
  },
  'nav.settings': {
    en: 'Settings',
    bn: 'সেটিংস',
    hi: 'सेटिंग्स',
    ar: 'الإعدادات'
  },
  'nav.academics': {
    en: 'Academics',
    bn: 'একাডেমিক',
    hi: 'शैक्षणिक',
    ar: 'الأكاديمية'
  },
  'nav.subjects': {
    en: 'Subjects',
    bn: 'বিষয়সমূহ',
    hi: 'विषय',
    ar: 'المواد'
  },
  'nav.assignments': {
    en: 'Assignments',
    bn: 'অ্যাসাইনমেন্ট',
    hi: 'कार्य',
    ar: 'المهام'
  },
  'nav.guardians': {
    en: 'Guardians',
    bn: 'অভিভাবক',
    hi: 'अभिभावक',
    ar: 'الأوصياء'
  },
  'nav.hostel': {
    en: 'Hostel',
    bn: 'হোস্টেল',
    hi: 'छात्रावास',
    ar: 'السكن'
  },
  'nav.transport': {
    en: 'Transport',
    bn: 'পরিবহন',
    hi: 'परिवहन',
    ar: 'النقل'
  },
  'nav.hr': {
    en: 'HR',
    bn: 'মানবসম্পদ',
    hi: 'मानव संसाधन',
    ar: 'الموارد البشرية'
  },
  'nav.timetable': {
    en: 'Timetable',
    bn: 'সময়সূচী',
    hi: 'समय सारणी',
    ar: 'الجدول الزمني'
  },
  'nav.analytics': {
    en: 'Analytics',
    bn: 'বিশ্লেষণ',
    hi: 'विश्लेषण',
    ar: 'التحليلات'
  },
  'nav.ai_tools': {
    en: 'AI Tools',
    bn: 'এআই টুলস',
    hi: 'एआई टूल्स',
    ar: 'أدوات الذكاء الاصطناعي'
  },
  'nav.events': {
    en: 'Events',
    bn: 'ইভেন্ট',
    hi: 'कार्यक्रम',
    ar: 'الأحداث'
  },
  'nav.notices': {
    en: 'Notices',
    bn: 'নোটিশ',
    hi: 'सूचनाएं',
    ar: 'الإشعارات'
  },
  'nav.reports': {
    en: 'Reports',
    bn: 'রিপোর্ট',
    hi: 'रिपोर्ट',
    ar: 'التقارير'
  },
  'nav.inventory': {
    en: 'Inventory',
    bn: 'ইনভেন্টরি',
    hi: 'इन्वेंटरी',
    ar: 'المخزون'
  },
  'nav.ecommerce': {
    en: 'E-commerce',
    bn: 'ই-কমার্স',
    hi: 'ई-कॉमर्स',
    ar: 'التجارة الإلكترونية'
  },
  'nav.elearning': {
    en: 'E-learning',
    bn: 'ই-লার্নিং',
    hi: 'ई-लर्निंग',
    ar: 'التعلم الإلكتروني'
  },
  'nav.billing': {
    en: 'Billing',
    bn: 'বিলিং',
    hi: 'बिलिंग',
    ar: 'الفواتير'
  },
  'nav.tenants': {
    en: 'Tenants',
    bn: 'টেন্যান্ট',
    hi: 'किरायेदार',
    ar: 'المستأجرون'
  },

  // Dashboard
  'dashboard.welcome': {
    en: 'Welcome back',
    bn: 'স্বাগতম',
    hi: 'वापसी पर स्वागत है',
    ar: 'مرحباً بعودتك'
  },
  'dashboard.total_students': {
    en: 'Total Students',
    bn: 'মোট শিক্ষার্থী',
    hi: 'कुल छात्र',
    ar: 'إجمالي الطلاب'
  },
  'dashboard.total_teachers': {
    en: 'Total Teachers',
    bn: 'মোট শিক্ষক',
    hi: 'कुल शिक्षक',
    ar: 'إجمالي المعلمين'
  },
  'dashboard.attendance_rate': {
    en: 'Attendance Rate',
    bn: 'উপস্থিতির হার',
    hi: 'उपस्थिति दर',
    ar: 'معدل الحضور'
  },
  'dashboard.active_exams': {
    en: 'Active Exams',
    bn: 'সক্রিয় পরীক্ষা',
    hi: 'सक्रिय परीक्षा',
    ar: 'الامتحانات النشطة'
  },

  // Actions
  'actions.mark_attendance': {
    en: 'Mark Attendance',
    bn: 'উপস্থিতি চিহ্নিত করুন',
    hi: 'उपस्थिति चिह्नित करें',
    ar: 'تسجيل الحضور'
  },
  'actions.create_exam': {
    en: 'Create Exam',
    bn: 'পরীক্ষা তৈরি করুন',
    hi: 'परीक्षा बनाएं',
    ar: 'إنشاء امتحان'
  },
  'actions.add_student': {
    en: 'Add Student',
    bn: 'শিক্ষার্থী যোগ করুন',
    hi: 'छात्र जोड़ें',
    ar: 'إضافة طالب'
  },
  'actions.add_teacher': {
    en: 'Add Teacher',
    bn: 'শিক্ষক যোগ করুন',
    hi: 'शिक्षक जोड़ें',
    ar: 'إضافة معلم'
  },
  'actions.add_class': {
    en: 'Add Class',
    bn: 'ক্লাস যোগ করুন',
    hi: 'कक्षा जोड़ें',
    ar: 'إضافة فصل'
  },
  'actions.add_subject': {
    en: 'Add Subject',
    bn: 'বিষয় যোগ করুন',
    hi: 'विषय जोड़ें',
    ar: 'إضافة مادة'
  },
  'actions.schedule_exam': {
    en: 'Schedule Exam',
    bn: 'পরীক্ষার সময়সূচী করুন',
    hi: 'परीक्षा शेड्यूल करें',
    ar: 'جدولة الامتحان'
  },
  'actions.assign_teacher': {
    en: 'Assign Teacher',
    bn: 'শিক্ষক নিয়োগ করুন',
    hi: 'शिक्षक असाइन करें',
    ar: 'تعيين معلم'
  },
  'actions.generate_report': {
    en: 'Generate Report',
    bn: 'রিপোর্ট তৈরি করুন',
    hi: 'रिपोर्ट जनरेट करें',
    ar: 'إنشاء تقرير'
  },
  'actions.send_notification': {
    en: 'Send Notification',
    bn: 'বিজ্ঞপ্তি পাঠান',
    hi: 'सूचना भेजें',
    ar: 'إرسال إشعار'
  },
  'actions.process_payment': {
    en: 'Process Payment',
    bn: 'পেমেন্ট প্রক্রিয়া করুন',
    hi: 'भुगतान प्रक्रिया करें',
    ar: 'معالجة الدفع'
  },
  'actions.issue_book': {
    en: 'Issue Book',
    bn: 'বই ইস্যু করুন',
    hi: 'पुस्तक जारी करें',
    ar: 'إصدار كتاب'
  },
  'actions.create_event': {
    en: 'Create Event',
    bn: 'ইভেন্ট তৈরি করুন',
    hi: 'कार्यक्रम बनाएं',
    ar: 'إنشاء حدث'
  },
  'actions.assign_room': {
    en: 'Assign Room',
    bn: 'রুম বরাদ্দ করুন',
    hi: 'कमरा असाइन करें',
    ar: 'تعيين غرفة'
  },
  'actions.create_timetable': {
    en: 'Create Timetable',
    bn: 'সময়সূচী তৈরি করুন',
    hi: 'समय सारणी बनाएं',
    ar: 'إنشاء جدول زمني'
  },

  // Additional translations for demo
  'common.number': {
    en: 'Number',
    bn: 'সংখ্যা',
    hi: 'संख्या',
    ar: 'رقم'
  },
  'common.date': {
    en: 'Date',
    bn: 'তারিখ',
    hi: 'दिनांक',
    ar: 'تاريخ'
  },
  'common.current_language': {
    en: 'Current Language',
    bn: 'বর্তমান ভাষা',
    hi: 'वर्तमान भाषा',
    ar: 'اللغة الحالية'
  },
  'common.switch_language': {
    en: 'Switch Language',
    bn: 'ভাষা পরিবর্তন করুন',
    hi: 'भाषा बदलें',
    ar: 'تغيير اللغة'
  },
  'common.using': {
    en: 'using',
    bn: 'ব্যবহার করে',
    hi: 'का उपयोग करके',
    ar: 'باستخدام'
  },
  'common.language_selector': {
    en: 'Language Selector',
    bn: 'ভাষা নির্বাচক',
    hi: 'भाषा चयनकर्ता',
    ar: 'محدد اللغة'
  },
  'common.above': {
    en: 'above',
    bn: 'উপরে',
    hi: 'ऊपर',
    ar: 'أعلاه'
  },
  'nav.actions': {
    en: 'Actions',
    bn: 'কর্ম',
    hi: 'कार्य',
    ar: 'الإجراءات'
  }
};

class I18n {
  private currentLanguage: Language = 'en';

  constructor() {
    // Initialize with saved language or browser preference
    const saved = localStorage.getItem('language');
    if (saved && this.isValidLanguage(saved)) {
      this.currentLanguage = saved as Language;
    } else {
      // Try to detect from browser
      const browserLang = navigator.language.split('-')[0];
      if (this.isValidLanguage(browserLang)) {
        this.currentLanguage = browserLang as Language;
      }
    }
  }

  private isValidLanguage(lang: string): lang is Language {
    return ['en', 'bn', 'hi', 'ar'].includes(lang);
  }

  setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    
    // Update document direction for RTL languages
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  t(key: string): string {
    // First check if it's a Bangla-specific translation
    if (this.currentLanguage === 'bn' && (banglaTranslations as any)[key]) {
      return (banglaTranslations as any)[key];
    }
    
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    return translation[this.currentLanguage] || translation.en || key;
  }

  // Format numbers based on locale
  formatNumber(num: number): string {
    return new Intl.NumberFormat(this.getLocale()).format(num);
  }

  // Format dates based on locale
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(this.getLocale()).format(dateObj);
  }

  // Format currency based on locale
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.getLocale(), {
      style: 'currency',
      currency
    }).format(amount);
  }

  private getLocale(): string {
    const localeMap: Record<Language, string> = {
      en: 'en-US',
      bn: 'bn-BD',
      hi: 'hi-IN',
      ar: 'ar-SA'
    };
    return localeMap[this.currentLanguage] || 'en-US';
  }

  // Get available languages
  getAvailableLanguages(): { code: Language; name: string; nativeName: string }[] {
    return [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
      { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
    ];
  }
}

export const i18n = new I18n();

// Hook for React components
export const useTranslation = () => {
  return {
    t: i18n.t.bind(i18n),
    language: i18n.getLanguage(),
    setLanguage: i18n.setLanguage.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    availableLanguages: i18n.getAvailableLanguages()
  };
};
