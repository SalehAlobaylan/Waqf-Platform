// Mock data for the Waqf platform

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  impact?: string;
  organization?: string;
  isOrganization: boolean;
  skills: string[];
  contributorCount: number;
  status: 'open' | 'active' | 'completed';
  postedDate: string;
  timeCommitment?: string;
  featured?: boolean;
  image?: string;
  difficulty?: string;
  githubUrl?: string;
  lastActive?: string;
}

export interface Contributor {
  id: string;
  name: string;
  avatar: string;
  location: string;
  timezone: string;
  bio: string;
  isAvailable: boolean;
  skills: {
    category: string;
    items: { name: string; level: string }[];
  }[];
  totalHours: number;
  projectsCompleted: number;
  activeSince: string;
  contributionActivity: number[];
  waqfHistory: {
    projectName: string;
    date: string;
    hoursContributed: number;
    description: string;
    status: string;
  }[];
}

export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'OpenQuran API',
    slug: 'openquran-api',
    category: 'Quran Apps',
    description: 'A RESTful API for Quranic verses, translations, and tafsir. Helps developers build Quran apps with easy access to authenticated Islamic text.',
    impact: 'Building an open-source, high-performance API for digitized manuscripts to preserve Islamic heritage for future generations.',
    organization: 'QuranFoundation',
    isOrganization: true,
    skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Elasticsearch'],
    contributorCount: 12,
    status: 'active',
    postedDate: '2d ago',
    timeCommitment: '5-10 hours/week',
    featured: true,
    image: 'figma:asset/dcda133303c11502dbc0281bf5e162625e6ff9c0.png',
    difficulty: 'Intermediate',
    githubUrl: 'https://github.com/openquran/api',
    lastActive: '2d ago'
  },
  {
    id: '2',
    title: 'Salah Time Calculator',
    slug: 'salah-time-calculator',
    category: 'Prayer',
    description: 'Modern, extensible prayer time library supporting multiple calculation methods.',
    organization: 'IslamTech',
    isOrganization: true,
    skills: ['JavaScript', 'React', 'TypeScript'],
    contributorCount: 8,
    status: 'open',
    postedDate: '5h ago',
    timeCommitment: '3-5 hours/week',
    featured: true,
    image: 'figma:asset/dcda133303c11502dbc0281bf5e162625e6ff9c0.png',
    difficulty: 'Intermediate',
    lastActive: '5h ago'
  },
  {
    id: '3',
    title: 'Zakat Dashboard',
    slug: 'zakat-dashboard',
    category: 'Charity & Zakat',
    description: 'Modern application to help users track wealth and calculate exact zakat annually.',
    organization: 'CommunityDevs',
    isOrganization: false,
    skills: ['Kotlin', 'Android', 'Firebase'],
    contributorCount: 15,
    status: 'active',
    postedDate: '1w ago',
    timeCommitment: '10-15 hours/week',
    featured: true,
    image: 'figma:asset/dcda133303c11502dbc0281bf5e162625e6ff9c0.png',
    difficulty: 'Advanced',
    lastActive: '1w ago'
  },
  {
    id: '4',
    title: 'HalalInvest',
    slug: 'halalinvest',
    category: 'Halal Finance',
    description: 'An educational platform and screening tool to help Muslims identify shariah-compliant investment opportunities.',
    organization: 'EthicalFinance',
    isOrganization: true,
    skills: ['Python', 'Django', 'React'],
    contributorCount: 6,
    status: 'open',
    postedDate: '12m ago',
    timeCommitment: '5-10 hours/week',
    difficulty: 'Intermediate',
    lastActive: '12m ago'
  },
  {
    id: '5',
    title: 'Dhikr Companion',
    slug: 'dhikr-companion',
    category: 'Islamic EdTech',
    description: 'A minimalist mobile application for daily Adhkar with progress tracking and reminders.',
    organization: 'NoorLabs',
    isOrganization: false,
    skills: ['Flutter', 'Dart', 'Firebase'],
    contributorCount: 4,
    status: 'open',
    postedDate: '3h ago',
    timeCommitment: '3-5 hours/week',
    difficulty: 'Beginner',
    lastActive: '3h ago'
  },
  {
    id: '6',
    title: 'MasjidFlow',
    slug: 'masjidflow',
    category: 'Islamic EdTech',
    description: 'Open source management system for weekend Islamic schools to track attendance, grades, and curriculum.',
    organization: 'UmmahTech',
    isOrganization: true,
    skills: ['Laravel', 'Vue.js', 'MySQL'],
    contributorCount: 18,
    status: 'active',
    postedDate: '1w ago',
    timeCommitment: '10-20 hours/week',
    difficulty: 'Advanced',
    lastActive: '1w ago'
  },
  {
    id: '7',
    title: 'UmmahConnect',
    slug: 'ummahconnect',
    category: 'Community',
    description: 'Connecting Muslims in remote areas with local resources, halal food finder, and prayer spaces.',
    organization: 'GlobalMuslims',
    isOrganization: true,
    skills: ['Go', 'React Native'],
    contributorCount: 9,
    status: 'open',
    postedDate: '4d ago',
    timeCommitment: '5-10 hours/week',
    difficulty: 'Intermediate',
    lastActive: '4d ago'
  },
  {
    id: '8',
    title: 'ZakatCalc UI',
    slug: 'zakatcalc-ui',
    category: 'Charity & Zakat',
    description: 'A modern, accessible Zakat calculator interface focusing on local currency support.',
    organization: 'CommunityDevs',
    isOrganization: false,
    skills: ['React', 'Tailwind', 'TypeScript'],
    contributorCount: 7,
    status: 'open',
    postedDate: '5h ago',
    timeCommitment: '2-5 hours/week',
    difficulty: 'Beginner',
    lastActive: '5h ago'
  }
];

export const mockContributor: Contributor = {
  id: '1',
  name: 'Ahmed Al-Farsi',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  location: 'Cairo, Egypt',
  timezone: 'EET (UTC+2)',
  bio: 'Building digital tools for the Ummah. Passionate about React, Node.js, and contributing to open-source Sadaqah Jariyah projects.',
  isAvailable: true,
  skills: [
    {
      category: 'FRONTEND',
      items: [
        { name: 'React', level: 'Expert' },
        { name: 'Tailwind CSS', level: 'Advanced' },
        { name: 'TypeScript', level: 'Advanced' },
        { name: 'Next.js', level: 'Intermediate' }
      ]
    },
    {
      category: 'BACKEND',
      items: [
        { name: 'Node.js', level: 'Advanced' },
        { name: 'PostgreSQL', level: 'Intermediate' },
        { name: 'Redis', level: 'Intermediate' }
      ]
    },
    {
      category: 'DEVOPS',
      items: [
        { name: 'Docker', level: 'Intermediate' },
        { name: 'AWS', level: 'Beginner' }
      ]
    }
  ],
  totalHours: 120,
  projectsCompleted: 5,
  activeSince: '2022',
  contributionActivity: Array(52).fill(0).map(() => Math.floor(Math.random() * 5)),
  waqfHistory: [
    {
      projectName: 'Quran App API',
      date: 'Nov 2023',
      hoursContributed: 15,
      description: 'Optimized search query performance for quicker ayah retrieval. Implemented caching strategy using Redis.',
      status: 'Merged'
    },
    {
      projectName: 'Charity CRM Dashboard',
      date: 'Aug 2023',
      hoursContributed: 40,
      description: 'Built the frontend dashboard for managing donor relationships. Created reusable React components for data visualization.',
      status: 'Merged'
    },
    {
      projectName: 'Open Halal Guide',
      date: 'Jan 2023',
      hoursContributed: 25,
      description: 'Initial setup of the repository and project structure. Configured Docker containers for development environment.',
      status: 'Completed'
    }
  ]
};

export const categories = [
  { id: 'quran', name: 'Quran Apps', icon: '📖', color: 'bg-blue-100 text-blue-700' },
  { id: 'charity', name: 'Charity & Zakat', icon: '🤲', color: 'bg-orange-100 text-orange-700' },
  { id: 'prayer', name: 'Prayer', icon: '🕌', color: 'bg-purple-100 text-purple-700' },
  { id: 'education', name: 'Islamic EdTech', icon: '📚', color: 'bg-green-100 text-green-700' },
  { id: 'finance', name: 'Halal Finance', icon: '💰', color: 'bg-pink-100 text-pink-700' },
  { id: 'community', name: 'Community', icon: '🌍', color: 'bg-teal-100 text-teal-700' }
];

export const skills = [
  'React', 'Vue.js', 'Angular', 'Next.js', 'Python', 'Django', 'Node.js', 'PostgreSQL',
  'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'React Native', 'Flutter', 'TypeScript',
  'JavaScript', 'Go', 'Rust', 'Laravel', 'Tailwind CSS', 'GraphQL', 'Firebase',
  'Elasticsearch', 'Redis', 'Kotlin', 'Swift', 'Java'
];