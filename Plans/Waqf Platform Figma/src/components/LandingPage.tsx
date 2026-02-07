import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Code, Sparkles, Search, Heart, ArrowRight, BookOpen, HandHeart, GraduationCap, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string, projectId?: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#f9fbfb]">
      {/* Hero Section */}
      <section className="w-full py-16 md:py-24 px-4 flex justify-center border-b border-[#e9f1ef] relative overflow-hidden" style={{
        backgroundImage: 'url(https://www.transparenttextures.com/patterns/clean-gray-paper.png)',
        backgroundColor: '#f9fbfb'
      }}>
        <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 md:gap-8">
            <div className="flex flex-col gap-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4a056]/10 border border-[#d4a056]/20 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#d4a056]"></span>
                <span className="text-[#d4a056] text-xs font-bold uppercase tracking-wide">Beta Available</span>
              </div>
              <h1 className="text-[#101917] text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-[-0.033em]">
                Tech for the Ummah <br/>
                <span className="text-[#1f705d] text-4xl md:text-5xl lg:text-6xl mt-2 block" style={{ fontFamily: 'Noto Sans Arabic, sans-serif' }}>
                  صدقة جارية عبر الكود
                </span>
              </h1>
              <p className="text-gray-600 text-lg md:text-xl font-normal leading-relaxed max-w-xl">
                Join the first open-source community building technology for the Muslim Ummah. Contribute your skills to projects that benefit millions—Sadaqah Jariyah through code.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onNavigate('explore')}
                className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-[#1f705d] hover:bg-[#165244] text-white text-base font-bold shadow-lg shadow-[#1f705d]/25 transition-all hover:translate-y-[-1px] cursor-pointer"
              >
                <Code className="w-5 h-5" />
                <span>Start Contributing</span>
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl h-12 px-6 bg-white border border-gray-200 text-[#101917] text-base font-bold hover:bg-gray-50 transition-colors cursor-pointer">
                <span className="text-xl">+</span>
                <span>List a Project</span>
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                <img alt="Contributor" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" />
                <img alt="Contributor" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" />
                <img alt="Contributor" className="w-8 h-8 rounded-full border-2 border-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold">+2k</div>
              </div>
              <p>Join 2,000+ contributors worldwide</p>
            </div>
          </div>

          <div className="relative h-full min-h-[300px] lg:min-h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1f705d]/5 to-[#d4a056]/10 border border-[#1f705d]/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative z-10 p-8 w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">contribute.js</span>
                  </div>
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex gap-2">
                      <span className="text-purple-500">const</span>
                      <span className="text-blue-500">sadaqah</span>
                      <span className="text-gray-400">=</span>
                      <span className="text-yellow-600">async</span>
                      <span className="text-gray-400">()</span>
                      <span className="text-purple-500">=&gt;</span>
                      <span className="text-gray-400">{'{'}</span>
                    </div>
                    <div className="pl-4 flex gap-2">
                      <span className="text-purple-500">await</span>
                      <span className="text-blue-500">buildForUmmah</span>
                      <span className="text-gray-400">();</span>
                    </div>
                    <div className="pl-4 flex gap-2">
                      <span className="text-purple-500">return</span>
                      <span className="text-green-600">"Hasanat++"</span>
                      <span className="text-gray-400">;</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-400">{'}'}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-[#1f705d] text-white p-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                  <Heart className="w-5 h-5" fill="currentColor" />
                  <div>
                    <p className="text-xs opacity-80">Impact</p>
                    <p className="font-bold">1.2M Users reached</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-[#e9f1ef]">
        <div className="max-w-[1280px] mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center md:divide-x divide-gray-100">
            <div className="flex flex-col gap-1 p-2">
              <span className="text-3xl font-black text-[#101917] tracking-tight">150+</span>
              <span className="text-sm font-medium text-gray-500">Active Projects</span>
            </div>
            <div className="flex flex-col gap-1 p-2">
              <span className="text-3xl font-black text-[#101917] tracking-tight">2,000+</span>
              <span className="text-sm font-medium text-gray-500">Contributors</span>
            </div>
            <div className="flex flex-col gap-1 p-2">
              <span className="text-3xl font-black text-[#101917] tracking-tight">10k+</span>
              <span className="text-sm font-medium text-gray-500">Commits for Good</span>
            </div>
            <div className="flex flex-col gap-1 p-2">
              <span className="text-3xl font-black text-[#101917] tracking-tight">Zero</span>
              <span className="text-sm font-medium text-gray-500">Platform Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 md:py-24 px-4 bg-[#f9fbfb]">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold text-[#101917] tracking-tight mb-2">Explore Domains</h2>
              <p className="text-gray-500 max-w-lg">Discover projects across various sectors needing your expertise.</p>
            </div>
            <button className="text-[#1f705d] font-bold flex items-center gap-1 hover:underline">
              View All Categories <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white p-6 rounded-2xl border border-[#e9f1ef] hover:border-[#1f705d]/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[#1f705d]/10 text-[#1f705d] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101917] mb-2">Quran & Sunnah</h3>
              <p className="text-sm text-gray-500 leading-relaxed">APIs, reading apps, and memorization tools.</p>
            </div>

            <div className="group bg-white p-6 rounded-2xl border border-[#e9f1ef] hover:border-[#1f705d]/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-[#d4a056]/10 text-[#d4a056] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HandHeart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101917] mb-2">Charity & Zakat</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Donation platforms, Zakat calculators, and aid tracking.</p>
            </div>

            <div className="group bg-white p-6 rounded-2xl border border-[#e9f1ef] hover:border-[#1f705d]/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101917] mb-2">Islamic EdTech</h3>
              <p className="text-sm text-gray-500 leading-relaxed">LMS for Madrasahs, Arabic learning, and kids apps.</p>
            </div>

            <div className="group bg-white p-6 rounded-2xl border border-[#e9f1ef] hover:border-[#1f705d]/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PiggyBank className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#101917] mb-2">Halal Finance</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Ethical investment tools, inheritance calculators.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-4 bg-[#1f705d]/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#1f705d]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-[#d4a056]/5 rounded-full blur-3xl"></div>
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#101917] tracking-tight mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Your journey from code commit to eternal reward.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-[#1f705d]/20 flex items-center justify-center mb-6 shadow-sm">
                <Search className="w-10 h-10 text-[#1f705d]" />
              </div>
              <h3 className="text-xl font-bold text-[#101917] mb-2">1. Discover</h3>
              <p className="text-sm text-gray-500 max-w-xs">Find open-source projects that match your tech stack and interests.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-[#1f705d]/20 flex items-center justify-center mb-6 shadow-sm">
                <Code className="w-10 h-10 text-[#1f705d]" />
              </div>
              <h3 className="text-xl font-bold text-[#101917] mb-2">2. Contribute</h3>
              <p className="text-sm text-gray-500 max-w-xs">Submit pull requests, fix bugs, or add features to improve the codebase.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-[#d4a056]/40 flex items-center justify-center mb-6 shadow-sm relative">
                <Heart className="w-10 h-10 text-[#d4a056]" fill="currentColor" />
                <span className="absolute -top-2 -right-2 bg-[#d4a056] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Reward</span>
              </div>
              <h3 className="text-xl font-bold text-[#101917] mb-2">3. Earn Hasanat</h3>
              <p className="text-sm text-gray-500 max-w-xs">Benefit from Sadaqah Jariyah as your code serves the community continuously.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 md:py-24 px-4 bg-[#f9fbfb]">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-[#101917] tracking-tight">Featured Projects</h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              className="flex flex-col rounded-xl overflow-hidden bg-white border border-[#e9f1ef] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate('project', '1')}
            >
              <div className="relative h-48 bg-gray-100">
                <img src="https://images.unsplash.com/photo-1597505495109-7fc35bb64d8e?w=600" alt="Open Quran" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-800">
                  1.2k Stars
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-100">Python</Badge>
                  <Badge className="bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-100">Django</Badge>
                </div>
                <h3 className="text-lg font-bold text-[#101917] mb-2">OpenQuran API</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">A RESTful API for Quranic verses, translations, and audio. Needs help with Python optimization.</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-gray-500">2 Issues Open</span>
                  </div>
                  <button className="text-[#1f705d] font-bold text-sm hover:underline">View Repo</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-xl overflow-hidden bg-white border border-[#e9f1ef] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate('project', '2')}
            >
              <div className="relative h-48 bg-gray-100">
                <img src="https://images.unsplash.com/photo-1668060741423-a7d4b1fcf566?w=600" alt="Mosque" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-800">
                  850 Stars
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex gap-2 mb-3">
                  <Badge className="bg-yellow-100 text-yellow-700 text-xs font-semibold hover:bg-yellow-100">JavaScript</Badge>
                  <Badge className="bg-sky-100 text-sky-700 text-xs font-semibold hover:bg-sky-100">React</Badge>
                </div>
                <h3 className="text-lg font-bold text-[#101917] mb-2">Salah Time Calculator</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">Modern, lightweight prayer time library supporting multiple calculation methods.</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    <span className="text-xs text-gray-500">5 Issues Open</span>
                  </div>
                  <button className="text-[#1f705d] font-bold text-sm hover:underline">View Repo</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col rounded-xl overflow-hidden bg-white border border-[#e9f1ef] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onNavigate('project', '3')}
            >
              <div className="relative h-48 bg-gray-100">
                <img src="https://images.unsplash.com/photo-1748609622257-bb917eda4d14?w=600" alt="Dashboard" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-gray-800">
                  400 Stars
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex gap-2 mb-3">
                  <Badge className="bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-100">Kotlin</Badge>
                  <Badge className="bg-orange-100 text-orange-700 text-xs font-semibold hover:bg-orange-100">Android</Badge>
                </div>
                <h3 className="text-lg font-bold text-[#101917] mb-2">Zakat Dashboard</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">Mobile application to help users track wealth and calculate Zakat annually.</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-gray-500">12 Issues Open</span>
                  </div>
                  <button className="text-[#1f705d] font-bold text-sm hover:underline">View Repo</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-20 pt-10">
        <div className="max-w-[1280px] mx-auto bg-[#1f705d] rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Ready to code for a cause?</h2>
            <p className="text-lg text-white/80">Join thousands of developers turning their commits into Sadaqah Jariyah.</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
              <button className="bg-white text-[#1f705d] hover:bg-gray-100 px-8 py-3 rounded-xl font-bold text-lg transition-colors">
                Sign Up Now
              </button>
              <button 
                onClick={() => onNavigate('explore')}
                className="bg-[#165244]/50 hover:bg-[#165244] border border-white/20 text-white px-8 py-3 rounded-xl font-bold text-lg transition-colors"
              >
                Explore Projects
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e9f1ef] py-12 px-4">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 text-[#1f705d] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L4 7v6.5c0 4.97 3.5 9.04 8 10.5 4.5-1.46 8-5.53 8-10.5V7l-8-5z"/>
                  </svg>
                </div>
                <h2 className="text-[#101917] text-lg font-bold">Waqf</h2>
              </div>
              <p className="text-sm text-gray-500 mb-4">Building the digital future of the Ummah, one commit at a time.</p>
            </div>

            <div>
              <h4 className="font-bold text-[#101917] mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a className="hover:text-[#1f705d]" href="#">Explore Projects</a></li>
                <li><a className="hover:text-[#1f705d]" href="#">How it Works</a></li>
                <li><a className="hover:text-[#1f705d]" href="#">Pricing</a></li>
                <li><a className="hover:text-[#1f705d]" href="#">Leaderboard</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#101917] mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a className="hover:text-[#1f705d]" href="#">Guidelines</a></li>
                <li><a className="hover:text-[#1f705d]" href="#">Discord</a></li>
                <li><a className="hover:text-[#1f705d]" href="#">Blog</a></li>
                <li><a className="hover:text-[#1f705d]" href="#">Events</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#101917] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a className="hover:text-[#1f705d]" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-[#1f705d]" href="#">Terms of Service</a></li>
                <li><a className="hover:text-[#1f705d]" href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2024 Waqf Platform. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
              <span>for the Ummah</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}