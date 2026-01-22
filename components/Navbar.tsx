import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TranslatableText, useContent } from '../components/Home';
import { useAuth } from '../contexts/AuthContext';
import { Droplets, AlertTriangle, LogIn, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { site_name } = useContent();
  const [error, setError] = useState<string | null>(null);

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
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
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
                href="#problem"
                className="hover:text-blue-600 transition-colors cursor-pointer"
                variants={navItemVariants}
                whileHover="hover"
              >
                <TranslatableText text="Problem" />
              </motion.a>
              <motion.a
                href="#solutions"
                className="hover:text-blue-600 transition-colors cursor-pointer"
                variants={navItemVariants}
                whileHover="hover"
              >
                <TranslatableText text="Solutions" />
              </motion.a>
              <motion.a
                href="#resources"
                className="hover:text-blue-600 transition-colors cursor-pointer"
                variants={navItemVariants}
                whileHover="hover"
              >
                <TranslatableText text="Resources" />
              </motion.a>
              <motion.a
                href="#chat"
                className="hover:text-blue-600 transition-colors cursor-pointer"
                variants={navItemVariants}
                whileHover="hover"
              >
                <TranslatableText text="Specialist Chat" />
              </motion.a>
              <motion.a
                href="#team"
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
                  <span className="text-sm font-medium">{error}</span>
                </motion.div>
              )}

              {/* Google Translate Widget Mount Point */}
              <div id="google_translate_element" className="block"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;