import { useState } from 'react';
import { Search, Filter, BookmarkIcon, CheckCircle, Heart, Globe, Users, GraduationCap, Code, Calendar, Package, ChevronDown } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ExplorePageProps {
  onNavigate: (page: string, projectId?: string) => void;
}

const projects = [
  {
    id: '1',
    name: 'OpenQuran API',
    organization: 'QuranFoundation',
    verified: true,
    icon: '📖',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    impact: 'Sadaqah Jariyah Impact',
    impactBg: 'bg-green-50',
    impactColor: 'text-green-700',
    impactIcon: '🤲',
    description: 'Building a robust, open-source API to facilitate easy access to Quranic text, translations, and audio for developers worldwide.',
    skills: ['Node.js', 'PostgreSQL', 'Docker'],
    activeStatus: 'Active 2d ago',
    statusColor: 'bg-green-500'
  },
  {
    id: '2',
    name: 'ZakatCalc UI',
    organization: 'CommunityDevs',
    verified: false,
    icon: '🤝',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    impact: 'Community Utility',
    impactBg: 'bg-blue-50',
    impactColor: 'text-blue-700',
    impactIcon: '🌐',
    description: 'A modern, accessible Zakat calculator interface focusing on local currency conversion and gold nisab updates.',
    skills: ['React', 'Tailwind', 'TypeScript'],
    activeStatus: 'Active 5h ago',
    statusColor: 'bg-yellow-500'
  },
  {
    id: '3',
    name: 'MasjidFlow',
    organization: 'UmmahTech',
    verified: true,
    icon: '🕌',
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    impact: 'Education',
    impactBg: 'bg-purple-50',
    impactColor: 'text-purple-700',
    impactIcon: '🎓',
    description: 'Open source management system for weekend Islamic schools to track attendance, grades, and parent communication.',
    skills: ['Laravel', 'Vue.js', 'MySQL'],
    activeStatus: 'Last active 1w ago',
    statusColor: 'bg-gray-300'
  },
  {
    id: '4',
    name: 'HalalInvest',
    organization: 'EthicalFinance',
    verified: false,
    icon: '💰',
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    impact: 'Economic Justice',
    impactBg: 'bg-green-50',
    impactColor: 'text-green-700',
    impactIcon: '⚖️',
    description: 'An educational platform and screening tool to help Muslims identify shariah-compliant investment opportunities.',
    skills: ['Python', 'Django', 'React'],
    activeStatus: 'Active 12m ago',
    statusColor: 'bg-green-500'
  },
  {
    id: '5',
    name: 'Dhikr Companion',
    organization: 'NoorLabs',
    verified: true,
    icon: '📱',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    impact: 'Spiritual Growth',
    impactBg: 'bg-blue-50',
    impactColor: 'text-blue-700',
    impactIcon: '🧠',
    description: 'A minimalist mobile application for daily Adhkar with progress tracking and community challenges.',
    skills: ['Flutter', 'Dart', 'Firebase'],
    activeStatus: 'Active 3h ago',
    statusColor: 'bg-green-500'
  },
  {
    id: '6',
    name: 'UmmahConnect',
    organization: 'GlobalMuslims',
    verified: false,
    icon: '🌍',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    impact: 'Community',
    impactBg: 'bg-purple-50',
    impactColor: 'text-purple-700',
    impactIcon: '👥',
    description: 'Connecting Muslims in remote areas with local resources, halal food finders, and event organization tools.',
    skills: ['Go', 'React Native'],
    activeStatus: 'Last active 4d ago',
    statusColor: 'bg-gray-300'
  }
];

export function ExplorePage({ onNavigate }: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Charity & Zakat']);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Verified Organization']);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar Filters */}
      <aside className="w-72 hidden lg:flex flex-col border-r border-[#e9f1ef] bg-white h-[calc(100vh-65px)] sticky top-[65px] overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-lg text-[#101917]">Filters</h2>
            <button className="text-xs font-medium text-[#1f705d] hover:text-[#165a4a]">Clear All</button>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-[#101917] mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#588d81]" />
              Category
            </h3>
            <div className="space-y-2">
              {['Quran Apps', 'Charity & Zakat', 'Masjid ERP', 'Islamic Education'].map((category) => (
                <label key={category} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-[#1f705d] focus:ring-[#1f705d]"
                    checked={selectedCategories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, category]);
                      } else {
                        setSelectedCategories(selectedCategories.filter(c => c !== category));
                      }
                    }}
                  />
                  <span className="text-sm text-gray-600 group-hover:text-[#1f705d] transition-colors">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skills Filter */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-[#101917] mb-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-[#588d81]" />
              Skills
            </h3>
            <div className="space-y-2">
              {['React / Next.js', 'Python', 'Flutter', 'Go'].map((skill) => (
                <label key={skill} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-[#1f705d] focus:ring-[#1f705d]"
                    checked={selectedSkills.includes(skill)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSkills([...selectedSkills, skill]);
                      } else {
                        setSelectedSkills(selectedSkills.filter(s => s !== skill));
                      }
                    }}
                  />
                  <span className="text-sm text-gray-600 group-hover:text-[#1f705d] transition-colors">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Project Type */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-[#101917] mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#588d81]" />
              Project Type
            </h3>
            <div className="space-y-2">
              {['Verified Organization', 'Community Driven'].map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-[#1f705d] focus:ring-[#1f705d]"
                    checked={selectedTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTypes([...selectedTypes, type]);
                      } else {
                        setSelectedTypes(selectedTypes.filter(t => t !== type));
                      }
                    }}
                  />
                  <span className="text-sm text-gray-600 group-hover:text-[#1f705d] transition-colors">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time Commitment */}
          <div>
            <h3 className="text-sm font-semibold text-[#101917] mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#588d81]" />
              Commitment
            </h3>
            <div className="space-y-2">
              {['< 2 hrs/week', 'One-time task'].map((commitment) => (
                <label key={commitment} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-[#1f705d] focus:ring-[#1f705d]"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-[#1f705d] transition-colors">{commitment}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-65px)] overflow-y-auto bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search & Header Section */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-[#101917] mb-2">Explore Opportunities</h1>
                <p className="text-[#588d81]">Find a project to contribute your skills for Sadaqah Jariyah.</p>
              </div>
              <div className="hidden md:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#1f705d]/10 text-[#1f705d]">
                  <span className="w-2 h-2 rounded-full bg-[#1f705d] mr-2"></span>
                  24 Active Projects
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-[#588d81]" />
                </div>
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1f705d] focus:border-[#1f705d] sm:text-sm shadow-sm"
                  placeholder="Search projects by name, technology, or impact..."
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative min-w-[180px]">
                <select className="block w-full pl-3 pr-10 py-3 text-base border-gray-200 focus:outline-none focus:ring-[#1f705d] focus:border-[#1f705d] sm:text-sm rounded-xl bg-white shadow-sm appearance-none cursor-pointer">
                  <option>Recommended</option>
                  <option>Newest First</option>
                  <option>Most Active</option>
                  <option>Expiring Soon</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Mobile Filter Toggle */}
              <button className="md:hidden flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl bg-white text-[#101917] shadow-sm">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id}
                className="bg-white rounded-xl border border-[#e9f1ef] shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full cursor-pointer"
                onClick={() => onNavigate('project', project.id)}
              >
                <div className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg ${project.iconBg} flex items-center justify-center ${project.iconColor} text-2xl`}>
                        {project.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-[#101917] group-hover:text-[#1f705d] transition-colors">
                            {project.name}
                          </h3>
                          {project.verified && (
                            <CheckCircle className="w-[18px] h-[18px] text-[#1f705d] fill-[#1f705d]" title="Verified Organization" />
                          )}
                        </div>
                        <p className="text-xs text-[#588d81]">by {project.organization}</p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-[#1f705d] transition-colors">
                      <BookmarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${project.impactBg} ${project.impactColor} text-xs font-medium mb-3`}>
                      <span className="text-base">{project.impactIcon}</span>
                      {project.impact}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-100">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${project.statusColor}`}></span>
                      {project.activeStatus}
                    </span>
                    <button className="px-4 py-2 bg-[#1f705d] hover:bg-[#165a4a] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm shadow-[#1f705d]/30">
                      Contribute
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 flex justify-center">
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl bg-white text-[#101917] font-medium hover:bg-gray-50 transition-colors">
              Load More Projects
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
