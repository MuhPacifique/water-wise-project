import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Home, Star, BookOpen, Layers, Globe, Calendar, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation, TranslatableText } from '../contexts/TranslationContext';
import { LANGUAGES } from '../constants';
import Navbar from './Navbar';
import Footer from './Footer';

const ProfessionalTrainings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isTranslating } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch trainings from API
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/professional-trainings?limit=50');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch trainings');
        }

        setTrainings(data.data.trainings);
      } catch (err) {
        console.error('Error fetching trainings:', err);
        setError('Failed to load professional trainings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }),
    hover: {
      y: -8,
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <motion.div
        className="py-24"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start mb-4">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home size={16} />
            <TranslatableText text="Back to Homepage" />
          </motion.button>
        </div>
        
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.div
            className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <GraduationCap className="text-white" size={32} />
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 tracking-tight"
            variants={itemVariants}
          >
            <TranslatableText text="Professional Trainings" />
          </motion.h1>
          <motion.p
            className="text-slate-600 max-w-2xl mx-auto font-medium text-lg"
            variants={itemVariants}
          >
            <TranslatableText text="Specialized training materials and documents for water management professionals and conservation specialists." />
          </motion.p>
        </motion.div>

        {isLoading ? (
          <motion.div
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3 text-slate-900">
              <motion.div
                className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              <span className="font-bold text-xl"><TranslatableText text="Loading trainings..." /></span>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              <TranslatableText text="Error Loading Trainings" />
            </h4>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
            >
              <TranslatableText text="Try Again" />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainings.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-lg">
                  <TranslatableText text="No professional trainings available yet." />
                </p>
                <p className="text-slate-400 mt-2">
                  <TranslatableText text="Check back soon for new training documents!" />
                </p>
              </div>
            ) : (
              trainings.map((training, i) => (
                <motion.div
                  key={training.id}
                  className="bg-white rounded-[1.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden group"
                  variants={cardVariants}
                  custom={i}
                  whileHover="hover"
                >
                  <div className="aspect-[4/3] bg-slate-200 relative overflow-hidden">
                    {training.thumbnail_url ? (
                      <img
                        src={training.thumbnail_url}
                        alt={training.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                        <FileText size={64} className="mb-4" />
                        <span className="text-xs font-bold uppercase tracking-widest"><TranslatableText text="Document" /></span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <span className="bg-white/90 backdrop-blur-sm text-blue-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                        <TranslatableText text={training.difficulty} />
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Layers size={10} />
                        <TranslatableText text={training.category || 'Professional'} />
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Globe size={10} />
                        <TranslatableText text={training.language === 'en' ? 'English' : (training.language || 'General')} />
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      <TranslatableText text={training.title} />
                    </h3>
                    
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                      <TranslatableText text={training.description} />
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <a
                        href={training.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                      >
                        <Download size={12} />
                        <TranslatableText text="View Document" />
                      </a>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                        <Calendar size={12} />
                        {new Date(training.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
      </motion.div>
      <Footer TranslatableText={TranslatableText} />

      {/* Global Loading Spinner for Translations */}
      {isTranslating && (
        <motion.div
          className="fixed bottom-6 right-6 bg-white/90 backdrop-blur shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 border border-blue-100 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </div>
          <span className="text-sm font-bold text-blue-700 tracking-tight">
            Translating to {LANGUAGES.find(l => l.code === language)?.nativeName}...
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default ProfessionalTrainings;
