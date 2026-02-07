import { MapPin, Mail, Share2, Github, Linkedin, Globe, Clock, CodeSquare, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

const heatmapData = [
  [0, 4, 0, 0, 3, 0, 0],
  [2, 3, 0, 4, 4, 0, 2],
  [0, 0, 3, 0, 0, 0, 0],
  [4, 4, 3, 2, 0, 0, 0],
  [0, 0, 0, 3, 3, 0, 0],
  [4, 4, 4, 0, 0, 0, 2],
  [0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 3, 3, 4],
  [2, 0, 0, 0, 0, 0, 0],
  [0, 3, 3, 4, 4, 0, 0],
  [4, 4, 0, 0, 0, 3, 0],
  [0, 0, 0, 3, 4, 4, 0],
  [2, 0, 0, 0, 0, 0, 0],
  [0, 3, 3, 4, 4, 0, 0]
];

const getHeatmapColor = (level: number) => {
  if (level === 0) return 'bg-slate-100 dark:bg-slate-800';
  if (level === 1) return 'bg-[#99f6e4]';
  if (level === 2) return 'bg-[#5eead4]';
  if (level === 3) return 'bg-[#2dd4bf]';
  return 'bg-[#1f705d]';
};

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  return (
    <div className="min-h-screen" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%231f705d' fill-opacity='0.03' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Profile Card & Quick Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-[#1f705d]/20 to-[#99f6e4] dark:to-[#1f705d]/10 opacity-50"></div>
              
              <div className="relative flex flex-col items-center text-center mt-4">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-md overflow-hidden bg-slate-100 mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" 
                    alt="Ahmed Al-Farsi" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Ahmed Al-Farsi</h1>
                
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm mb-4">
                  <MapPin className="w-[18px] h-[18px]" />
                  <span>Cairo, Egypt</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold border border-emerald-100 dark:border-emerald-900/50 mb-6">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Available for Waqf
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                  Building digital tools for the Ummah. Passionate about React, Node.js, and contributing to open-source Sadaqah Jariyah projects.
                </p>

                <div className="flex gap-3 w-full">
                  <button className="flex-1 h-10 bg-[#1f705d] text-white rounded-lg font-medium text-sm hover:bg-[#1f705d]/90 transition shadow-sm flex items-center justify-center gap-2">
                    <Mail className="w-5 h-5" />
                    Invite to Project
                  </button>
                  <button className="h-10 w-10 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 w-full justify-center">
                  <a href="#" className="text-slate-400 hover:text-[#1f705d] transition-colors">
                    <Github className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-[#1f705d] transition-colors">
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-[#1f705d] transition-colors">
                    <Globe className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* Skills Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-[#1f705d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Skills Matrix</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Frontend</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Tailwind CSS', 'TypeScript', 'Next.js'].map((skill) => (
                      <Badge 
                        key={skill}
                        variant="secondary" 
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Backend</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Node.js', 'PostgreSQL', 'Redis'].map((skill) => (
                      <Badge 
                        key={skill}
                        variant="secondary" 
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">DevOps</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Docker', 'AWS'].map((skill) => (
                      <Badge 
                        key={skill}
                        variant="secondary" 
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats, Activity, Timeline */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[#1f705d] mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Donated</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  120 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Hours</span>
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[#1f705d] mb-1">
                  <CodeSquare className="w-5 h-5" />
                  <span className="text-sm font-medium">Projects</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  5 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Completed</span>
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-1">
                <div className="flex items-center gap-2 text-[#1f705d] mb-1">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Active Since</span>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  2022 <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Nov</span>
                </p>
              </div>
            </div>

            {/* Contribution Heatmap */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-4 min-w-[600px]">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-[#1f705d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Contribution Activity
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#99f6e4]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#2dd4bf]"></div>
                    <div className="w-3 h-3 rounded-sm bg-[#1f705d]"></div>
                  </div>
                  <span>More</span>
                </div>
              </div>

              <div className="flex gap-1 min-w-[600px]">
                {heatmapData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => (
                      <div 
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm ${getHeatmapColor(day)}`}
                        title={`Activity level: ${day}`}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 mt-4 text-center">342 contributions in the last year</p>
            </div>

            {/* Waqf History Timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-8">
                <svg className="w-6 h-6 text-[#1f705d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Waqf History</h2>
              </div>

              <div className="relative pl-6 sm:pl-10">
                {/* Vertical Line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

                {/* Timeline Item 1 */}
                <div className="relative mb-10 group">
                  <div className="absolute -left-1 sm:-left-3.5 w-8 h-8 rounded-full bg-[#1f705d] flex items-center justify-center border-4 border-white dark:border-slate-900 z-10 shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:border-[#1f705d]/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Quran App API</h3>
                      <Badge variant="secondary" className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 w-fit">
                        Nov 2023
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      Optimized search query performance for quicker ayah retrieval. Implemented caching strategy using Redis.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>15 hours contributed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-[#1f705d]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Merged</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative mb-10 group">
                  <div className="absolute -left-1 sm:-left-3.5 w-8 h-8 rounded-full bg-[#2dd4bf] flex items-center justify-center border-4 border-white dark:border-slate-900 z-10 shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:border-[#1f705d]/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Charity CRM Dashboard</h3>
                      <Badge variant="secondary" className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 w-fit">
                        Aug 2023
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      Built the frontend dashboard for managing donor relationships. Created reusable React components for data visualization.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>40 hours contributed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-[#1f705d]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Merged</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 3 */}
                <div className="relative group">
                  <div className="absolute -left-1 sm:-left-3.5 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center border-4 border-white dark:border-slate-900 z-10 shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-100 dark:border-slate-700/50 hover:border-[#1f705d]/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Open Halal Guide</h3>
                      <Badge variant="secondary" className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 w-fit">
                        Jan 2023
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      Initial setup of the repository and project structure. Configured Docker containers for development environment.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>25 hours contributed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Show More Button */}
              <div className="mt-8 flex justify-center">
                <button className="text-sm text-[#1f705d] font-medium hover:underline flex items-center gap-1">
                  View Full History
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#1f705d]/10 p-2 rounded-lg text-[#1f705d]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4 7v6.5c0 4.97 3.5 9.04 8 10.5 4.5-1.46 8-5.53 8-10.5V7l-8-5z"/>
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block">Waqf</span>
              <span className="text-xs text-slate-500">Sadaqah Jariyah through Code</span>
            </div>
          </div>
          <div className="text-sm text-slate-500 text-center md:text-right">
            <p>© 2024 Waqf Platform. All rights reserved.</p>
            <div className="flex gap-4 justify-center md:justify-end mt-2">
              <a href="#" className="hover:text-[#1f705d]">Privacy</a>
              <a href="#" className="hover:text-[#1f705d]">Terms</a>
              <a href="#" className="hover:text-[#1f705d]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
