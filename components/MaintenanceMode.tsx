import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Facebook, Twitter, Instagram, Timer, Lock } from 'lucide-react';
import { useTranslation, TranslatableText } from '../contexts/TranslationContext';
import { LANGUAGES } from '../constants';

interface MaintenanceModeProps {
  progress?: number;
  completionDate?: string;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ 
  progress = 0, 
  completionDate = "" 
}) => {
  const { language, isTranslating } = useTranslation();

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

      <motion.div
        className="max-w-2xl w-full bg-white/5 backdrop-blur-2xl rounded-[40px] shadow-2xl p-6 md:p-12 text-center border border-white/10 relative z-10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Subtle decorative ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-white/5 rounded-full pointer-events-none" />

        <div className="relative mb-10">
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto relative shadow-2xl shadow-blue-500/20"
            initial={{ y: 20, opacity: 0, rotate: -10 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Settings size={40} className="text-white animate-spin-slow" />
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-[#020617]">
              <Lock size={12} className="text-white" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight leading-none">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              <TranslatableText text="WE ARE UNDER MAINTENANCE" />
            </span>
          </h1>
          
          <p className="text-base md:text-xl text-blue-200/60 font-medium mb-10 max-w-lg mx-auto leading-relaxed">
            <TranslatableText text="We're currently upgrading our platform to provide you with a better experience. We'll be back shortly." />
          </p>
        </motion.div>

        {/* Status Section */}
        <motion.div 
          className="max-w-md mx-auto space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
              <span className="text-blue-400 font-bold text-[10px] tracking-widest uppercase">
                <TranslatableText text="System Update" />
              </span>
              <span className="text-white font-mono text-lg font-bold">
                {progress}%
              </span>
            </div>
            
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 via-blue-400 to-indigo-500 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.8, duration: 1.5, ease: "circOut" }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer" />
              </motion.div>
            </div>
          </div>

          {completionDate && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-slate-300 text-xs">
              <Timer size={14} className="text-blue-400" />
              <span className="font-medium">
                <TranslatableText text="Expected return:" />
                <span className="text-white ml-1 font-bold">{completionDate}</span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="flex items-center gap-6">
            {[
              { Icon: Facebook, href: "#" },
              { Icon: Twitter, href: "#" },
              { Icon: Instagram, href: "#" }
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="text-slate-500 hover:text-blue-400 transition-colors duration-300"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Language Indicator */}
      {isTranslating && (
        <motion.div
          className="fixed bottom-8 left-8 bg-[#020617] border border-white/10 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-4 z-50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-white/60 tracking-widest uppercase">
            Switching to {LANGUAGES.find(l => l.code === language)?.nativeName}...
          </span>
        </motion.div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}} />
    </div>
  );
};

export default MaintenanceMode;
