
export type Language = 'en' | 'sw' | 'rw' | 'rn' | 'lg';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export interface TeamMember {
  name: string;
  country: string;
  role?: string;
  image?: string;
}

export interface Activity {
  title: string;
  description: string;
  icon: string;
}

export interface Solution {
  title: string;
  description: string;
  items: string[];
}

export interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
  setIsTranslating: (val: boolean) => void;
}

export interface ProblemContent {
  title: string;
  subtitle: string;
  description: string;
  points: string[];
  image_url: string;
}

export interface FooterContent {
  facebook_url: string;
  twitter_url: string;
  github_url: string;
  contact_email: string;
  locations: string;
  quick_links: { label: string; href: string }[];
  programs: string[];
  copyright_text: string;
}
