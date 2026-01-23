
import { LanguageOption, TeamMember, Activity } from './types';

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼' },
  { code: 'rn', name: 'Kirundi', nativeName: 'Ikirundi', flag: '🇧🇮' },
  { code: 'lg', name: 'Luganda', nativeName: 'Oluganda', flag: '🇺🇬' },
];

export const TEAM: TeamMember[] = [
  { 
    name: 'Aimable Hakizimana', 
    country: 'Rwanda', 
    role: 'Project Lead & Lead Developer',
    image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=300' 
  },
  { 
    name: 'Protogene HARAMBINEZA', 
    country: 'Rwanda', 
    role: 'Project Founder',
    image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=300' 
  },
  { 
    name: 'Glory Honoratus RUGEMALILA', 
    country: 'Tanzania', 
    role: 'Conservation Specialist',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=300' 
  },
  { 
    name: 'Yohana MWAKATOBE', 
    country: 'Tanzania', 
    role: 'Community Outreach',
    image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=300' 
  },
  { 
    name: 'Tariro CHIDEWU', 
    country: 'Zimbabwe', 
    role: 'Environmental Engineer',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300' 
  },
  { 
    name: 'Louis Second MUGISHA', 
    country: 'Burundi', 
    role: 'Education Coordinator',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' 
  },
];

export const ACTIVITIES: Activity[] = [
  {
    id: 1,
    title: 'Tree Planting',
    description: 'Planting trees for water resource conservation and ecosystem restoration.',
    icon: '🌳'
  },
  {
    id: 2,
    title: 'Plastic Collection',
    description: 'Collecting plastics from water bodies to prevent pollution and protect aquatic life.',
    icon: '♻️'
  },
  {
    id: 3,
    title: 'Agroforestry',
    description: 'Enhancing agroforestry practices to improve soil water retention and rural livelihoods.',
    icon: '🌾'
  }
];

export const SOLUTIONS_ITEMS = [
  'Educational Videos & 3D Animation',
  'Interactive Tutorials',
  'Professional Trainings',
  'Sharing Community Testimonies',
  'Water Campaigns in Rural Areas'
];

export const PROBLEM_POINTS = [
  'Lack of awareness about water resources protection',
  'Direct dumping of waste into rivers, lakes, and oceans',
  'Agricultural activities too close to river banks',
  'Language barriers in existing online awareness programs'
];

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/trixy.aimable',
  github: 'https://github.com/aimablehakizimana',
  email: 'info@water-wise.africa'
};
