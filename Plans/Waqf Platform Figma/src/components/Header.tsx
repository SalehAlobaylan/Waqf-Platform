import { Button } from './ui/button';
import { Globe, Menu, Bell, Search, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  variant?: 'landing' | 'app';
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function Header({ variant = 'landing', currentPage = 'landing', onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logo = (
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => { onNavigate?.('landing'); setMobileMenuOpen(false); }}>
      <div className="w-8 h-8 text-[#1f705d] bg-[#1f705d]/10 rounded-lg flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 7v6.5c0 4.97 3.5 9.04 8 10.5 4.5-1.46 8-5.53 8-10.5V7l-8-5zm0 2.18l6 3.75v5.57c0 4.13-2.88 7.68-6 8.82-3.12-1.14-6-4.69-6-8.82V7.93l6-3.75z"/>
        </svg>
      </div>
      <div className="flex flex-col">
        <h2 className="text-[#101917] text-xl font-bold leading-none tracking-[-0.015em]">Waqf</h2>
        <span className="text-[10px] text-[#1f705d] font-bold uppercase tracking-widest leading-none mt-0.5">Open Source</span>
      </div>
    </div>
  );

  if (variant === 'landing') {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-[#e9f1ef] bg-[#f9fbfb]/95 backdrop-blur supports-[backdrop-filter]:bg-[#f9fbfb]/60">
        <div className="px-4 md:px-10 py-3 flex items-center justify-between mx-auto max-w-[1280px]">
          {logo}
          
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#explore" 
              onClick={(e) => { e.preventDefault(); onNavigate?.('explore'); }}
              className="text-[#101917] hover:text-[#1f705d] transition-colors text-sm font-medium cursor-pointer"
            >
              Explore
            </a>
            <a href="#how-it-works" className="text-[#101917] hover:text-[#1f705d] transition-colors text-sm font-medium">How it Works</a>
            <a href="#about" className="text-[#101917] hover:text-[#1f705d] transition-colors text-sm font-medium">About</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="hidden sm:flex text-[#101917] hover:bg-gray-100 rounded-lg px-2 py-1 text-xs font-bold items-center gap-1 border border-transparent hover:border-gray-200">
              <Globe className="w-4 h-4" />
              <span>EN/AR</span>
            </button>
            <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
            <button className="hidden sm:flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 text-[#101917] hover:bg-gray-50 text-sm font-bold transition-colors">
              Log In
            </button>
            <button className="hidden sm:flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-[#1f705d] hover:bg-[#165244] transition-colors text-[#f9fbfb] text-sm font-bold shadow-md shadow-[#1f705d]/20">
              Sign Up
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-[#101917] hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e9f1ef] bg-white">
            <nav className="flex flex-col p-4 space-y-4">
              <a 
                href="#explore" 
                onClick={(e) => { e.preventDefault(); onNavigate?.('explore'); setMobileMenuOpen(false); }}
                className="text-[#101917] hover:text-[#1f705d] transition-colors text-base font-medium cursor-pointer py-2"
              >
                Explore Projects
              </a>
              <a href="#how-it-works" className="text-[#101917] hover:text-[#1f705d] transition-colors text-base font-medium py-2">How it Works</a>
              <a href="#about" className="text-[#101917] hover:text-[#1f705d] transition-colors text-base font-medium py-2">About</a>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                <button className="w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 text-[#101917] bg-gray-100 hover:bg-gray-200 text-sm font-bold transition-colors">
                  Log In
                </button>
                <button className="w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#1f705d] hover:bg-[#165244] transition-colors text-[#f9fbfb] text-sm font-bold">
                  Sign Up
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#e9f1ef] backdrop-blur-md bg-white/80">
      <div className="px-6 py-3 flex items-center justify-between max-w-[1280px] mx-auto">
        {logo}
        
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="#dashboard" 
            onClick={(e) => { e.preventDefault(); onNavigate?.('landing'); }}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentPage === 'dashboard' || currentPage === 'landing'
                ? 'text-[#1f705d]' 
                : 'text-[#101917] hover:text-[#1f705d]'
            }`}
          >
            Dashboard
          </a>
          <a 
            href="#explore" 
            onClick={(e) => { e.preventDefault(); onNavigate?.('explore'); }}
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentPage === 'explore' 
                ? 'text-[#1f705d]' 
                : 'text-[#101917] hover:text-[#1f705d]'
            }`}
          >
            Explore Projects
          </a>
          <a 
            href="#contributions" 
            className={`text-sm font-medium transition-colors cursor-pointer ${
              currentPage === 'contributions' 
                ? 'text-[#1f705d]' 
                : 'text-[#101917] hover:text-[#1f705d]'
            }`}
          >
            My Contributions
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 text-[#588d81] hover:text-[#1f705d] hover:bg-[#e0f2ed]/50 rounded-full transition-colors relative hidden md:block">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div 
            className="h-8 w-8 rounded-full bg-[#1f705d]/10 flex items-center justify-center border border-[#1f705d]/20 cursor-pointer overflow-hidden"
            onClick={() => { onNavigate?.('profile'); setMobileMenuOpen(false); }}
          >
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Profile" className="w-full h-full object-cover" />
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-[#101917] hover:bg-gray-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e9f1ef] bg-white">
          <nav className="flex flex-col p-4 space-y-4">
            <a 
              href="#dashboard" 
              onClick={(e) => { e.preventDefault(); onNavigate?.('landing'); setMobileMenuOpen(false); }}
              className={`text-base font-medium transition-colors cursor-pointer py-2 ${
                currentPage === 'dashboard' || currentPage === 'landing'
                  ? 'text-[#1f705d]' 
                  : 'text-[#101917]'
              }`}
            >
              Dashboard
            </a>
            <a 
              href="#explore" 
              onClick={(e) => { e.preventDefault(); onNavigate?.('explore'); setMobileMenuOpen(false); }}
              className={`text-base font-medium transition-colors cursor-pointer py-2 ${
                currentPage === 'explore' 
                  ? 'text-[#1f705d]' 
                  : 'text-[#101917]'
              }`}
            >
              Explore Projects
            </a>
            <a 
              href="#contributions" 
              className={`text-base font-medium transition-colors cursor-pointer py-2 ${
                currentPage === 'contributions' 
                  ? 'text-[#1f705d]' 
                  : 'text-[#101917]'
              }`}
            >
              My Contributions
            </a>
            <button className="flex items-center gap-3 py-2 border-t border-gray-100 pt-4">
              <Bell className="w-5 h-5 text-[#588d81]" />
              <span className="text-[#101917] font-medium">Notifications</span>
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}