import { Star, Share2, Heart, Check, ChevronRight, BookOpen, BarChart3, Clock, Code, FileText, Mail, Search } from 'lucide-react';
import { Badge } from './ui/badge';

interface ProjectDetailPageProps {
  projectId: string;
  onNavigate: (page: string) => void;
}

export function ProjectDetailPage({ projectId, onNavigate }: ProjectDetailPageProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Main Content Wrapper */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6 text-sm text-slate-500">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onNavigate('explore'); }}
            className="hover:text-[#1f705d] transition-colors cursor-pointer"
          >
            Projects
          </a>
          <span className="mx-2">/</span>
          <a href="#" className="hover:text-[#1f705d] transition-colors">Education</a>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-medium">Quran Digital Library</span>
        </nav>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm mb-8">
          {/* Abstract Pattern Background */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 p-8 md:p-10 items-start">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-xl bg-[#1f705d]/10 flex items-center justify-center text-[#1f705d] border border-[#1f705d]/20">
                <BookOpen className="w-12 h-12" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold uppercase tracking-wide border border-green-200 hover:bg-green-100">
                  Active Development
                </Badge>
                <Badge className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide border border-blue-200 hover:bg-blue-100">
                  Help Wanted
                </Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                Quran Digital Library API
              </h1>
              <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">
                Building an open-source, high-performance API for digitized manuscripts to preserve Islamic heritage for future generations.
              </p>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto flex flex-col gap-3">
              <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#1f705d] hover:bg-[#1f705d]/90 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-[#1f705d]/20 transition-all transform hover:-translate-y-0.5">
                <Heart className="w-5 h-5" />
                Contribute Now
              </button>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">
                  <Star className="w-[18px] h-[18px]" />
                  Star (1.2k)
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm">
                  <Share2 className="w-[18px] h-[18px]" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Content */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Bismillah Header */}
            <div className="flex justify-center py-4 opacity-60">
              <svg className="h-12" viewBox="0 0 512 85" fill="currentColor">
                <text x="10" y="60" fontSize="48" fontFamily="serif" className="fill-current">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</text>
              </svg>
            </div>

            {/* Impact Card */}
            <div className="bg-gradient-to-br from-[#1f705d]/5 to-[#1f705d]/10 border border-[#1f705d]/20 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-[#1f705d] pointer-events-none">
                <svg className="w-36 h-36" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                </svg>
              </div>
              <h3 className="flex items-center gap-2 text-[#1f705d] font-bold text-lg mb-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Project Impact (Sadaqah Jariyah)
              </h3>
              <p className="text-slate-700 leading-relaxed relative z-10">
                By contributing to this project, you are helping to digitize over <strong>5,000 ancient manuscripts</strong> that are currently at risk of decay. This creates a permanent, accessible resource for students of knowledge worldwide—a continuous charity that benefits the Ummah for generations to come, Insha'Allah.
              </p>
            </div>

            {/* Description / README */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-2xl font-bold mb-4">About the Project</h2>
                <p className="mb-4 text-slate-700">
                  The Quran Digital Library (QDL) is an initiative to create a standardized, open-source API for accessing Quranic text, translations, tafsir, and digitized manuscript images. Unlike existing solutions, QDL focuses on high-fidelity manuscript preservation and advanced search capabilities rooted in Arabic morphology.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">Core Features</h3>
                <ul className="list-disc pl-5 space-y-2 mb-6 text-slate-700">
                  <li><strong>RESTful & GraphQL API:</strong> Flexible endpoints for fetching verses, chapters, and metadata.</li>
                  <li><strong>Morphological Search:</strong> Powered by Elasticsearch, allowing root-word based searching.</li>
                  <li><strong>Manuscript Viewer:</strong> A specialized deep-zoom viewer for high-resolution manuscript scans using IIIF standards.</li>
                  <li><strong>Multilingual Support:</strong> Built-in i18n support for translations in 40+ languages.</li>
                </ul>

                <h3 className="text-xl font-semibold mt-6 mb-3">Current Roadmap</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Check className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Phase 1: Core API Design</p>
                      <p className="text-sm text-slate-500">Completed schema design and initial database migrations.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 border-[#1f705d] flex items-center justify-center">
                      <div className="w-2 h-2 bg-[#1f705d] rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Phase 2: Search Engine Integration (Current)</p>
                      <p className="text-sm text-slate-500">Implementing Elasticsearch for advanced Arabic text analysis.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 opacity-60">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 border-gray-300"></div>
                    <div>
                      <p className="font-medium text-slate-900">Phase 3: Frontend Client</p>
                      <p className="text-sm text-slate-500">Building the reference React application.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800">
                  <strong>Note for Contributors:</strong> Please ensure you read our Code of Conduct. We value adab (etiquette) in communication and technical excellence in code.
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-slate-900">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex gap-3 pb-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold">Ahmed K.</span> merged PR{' '}
                      <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded text-[#1f705d]">
                        #42: Fix search indexing bug
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-slate-800">
                      <span className="font-semibold">Sarah M.</span> opened issue{' '}
                      <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded text-[#1f705d]">
                        #45: Add Urdu translation support
                      </span>
                    </p>
                    <p className="text-xs text-slate-500">5 hours ago</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 text-sm text-[#1f705d] font-medium hover:underline text-center">
                View all activity on GitHub
              </button>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Metadata Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Project Details</h4>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="text-slate-400 mt-0.5">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Category</p>
                    <p className="font-medium text-slate-900">Education & Research</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-slate-400 mt-0.5">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Difficulty Level</p>
                    <p className="font-medium text-slate-900">Intermediate</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="text-slate-400 mt-0.5">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Est. Time Commitment</p>
                    <p className="font-medium text-slate-900">3-5 hours / week</p>
                  </div>
                </div>
              </div>

              <hr className="my-5 border-gray-100" />

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {['Python', 'Django', 'PostgreSQL', 'Docker', 'Elasticsearch'].map((tech) => (
                  <Badge 
                    key={tech}
                    variant="secondary" 
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 hover:bg-slate-100"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <a 
                  href="#" 
                  className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                >
                  <Code className="w-[18px] h-[18px]" />
                  View Repository
                </a>
                <a 
                  href="#" 
                  className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  <FileText className="w-[18px] h-[18px]" />
                  Read Documentation
                </a>
              </div>
            </div>

            {/* Creator Profile */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Meet the Creator</h4>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#1f705d]/10 flex items-center justify-center text-[#1f705d] font-bold text-xl border border-[#1f705d]/20 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100" 
                    alt="Organization" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Al-Ilm Foundation</h3>
                  <p className="text-xs text-slate-500">Mutawalli • Joined 2021</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                A non-profit organization dedicated to leveraging technology for Islamic education and heritage preservation. Based in Cairo, Egypt.
              </p>
              <button className="w-full py-2 px-4 rounded-lg border border-[#1f705d] text-[#1f705d] hover:bg-[#1f705d]/5 font-medium text-sm transition-colors flex items-center justify-center gap-2">
                <Mail className="w-[18px] h-[18px]" />
                Contact Organizer
              </button>
            </div>

            {/* Similar Projects */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Similar Projects</h4>
              <a href="#" className="flex gap-3 items-center group">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L4 7v6.5c0 4.97 3.5 9.04 8 10.5 4.5-1.46 8-5.53 8-10.5V7l-8-5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1f705d] transition-colors">
                    Open Prayer Times
                  </p>
                  <p className="text-xs text-slate-500">Utilities</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-200 text-center text-slate-500 text-sm">
        <p>© 2024 Waqf Platform. Built for the Ummah.</p>
      </footer>
    </div>
  );
}