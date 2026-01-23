import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation, TranslatableText } from '../contexts/TranslationContext';
import { useContent } from '../contexts/ContentContext';
import { LANGUAGES } from '../constants';
import { Droplets, AlertTriangle, Globe, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();
  const { siteContent } = useContent();
  const { site_name } = siteContent;
  const { language, setLanguage } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const isHomePage = location.pathname === '/';

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    if (isHomePage) {
      e.preventDefault();
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on home page, navigate to home with hash
      // React Router doesn't always handle hashes well on navigate, 
      // but standard href will work if we prefix with /
    }
  };

  const handleLogoClick = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const logoVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      rotate: 5,
      transition: { duration: 0.2 }
    }
  };

  const navItemVariants = {
    hover: {
      scale: 1.1,
      color: "#2563eb",
      transition: { duration: 0.2 }
    }
  };


  // Clear error when user changes
  useEffect(() => {
    setError(null);
  }, [user]);

  return (
    <motion.nav
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleLogoClick}
            variants={logoVariants}
            initial="initial"
            whileHover="hover"
          >
            <motion.div
              className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Droplets size={24} />
            </motion.div>
            <motion.span
              className="text-xl font-black tracking-tighter bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent hidden sm:block uppercase"
              whileHover={{ scale: 1.02 }}
            >
              {site_name}
            </motion.span>
          </motion.div>

          <div className="flex items-center gap-4 sm:gap-6">
            <motion.div
              className="hidden lg:flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.a
                href="/#problem"
                onClick={(e) => handleNavClick(e, '#problem')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
                variants={navItemVariants}
                whileHover="hover"
              >
                <TranslatableText text="Problem" />
              </motion.a>
              <motion.a
                href="/#solutions"
                onClick={(e) => handleNavClick(e, '#solutions')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
                variants={navItemVariants}
                whileHover="hover"
              >
                <TranslatableText text="Solutions" />
              </motion.a>
              <motion.a
                href="/#activities"
                onClick={(e) => handleNavClick(e, '#activities')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
                variants={navItemVariants}
                whileHover="hover"
              >
                <TranslatableText text="Activities" />
              </motion.a>
              <motion.a
                href="/#resources"
                onClick={(e) => handleNavClick(e, '#resources')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
                variants={navItemVariants}
                whileHover="hover"
              >
                <TranslatableText text="Resources" />
              </motion.a>
              <motion.a
                href="/#chat"
                onClick={(e) => handleNavClick(e, '#chat')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
                variants={navItemVariants}
                whileHover="hover"
              >
                <TranslatableText text="Specialist Chat" />
              </motion.a>
              <motion.a
                href="/#team"
                onClick={(e) => handleNavClick(e, '#team')}
                className="hover:text-blue-600 transition-colors cursor-pointer"
                variants={navItemVariants}
                whileHover="hover"
              >
                <TranslatableText text="Team" />
              </motion.a>
            </motion.div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {/* Error Display */}
              {error && (
                <motion.div
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertTriangle size={16} />
                  <span className="text-sm font-medium"><TranslatableText text={error} /></span>
                </motion.div>
              )}

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-blue-50 text-slate-700 px-3 py-2 rounded-xl transition-all border border-slate-100 hover:border-blue-100 group"
                >
                  <Globe size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs font-black uppercase tracking-widest hidden sm:block">
                    {LANGUAGES.find(l => l.code === language)?.nativeName}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${showLangDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showLangDropdown && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden z-50"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors ${language === lang.code ? 'bg-blue-50/50' : ''}`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${language === lang.code ? 'text-blue-600' : 'text-slate-900'}`}>
                            {lang.nativeName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                            {lang.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;