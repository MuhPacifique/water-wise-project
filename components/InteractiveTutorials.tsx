import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Eye, Home, Star, BookOpen, Layers, Globe, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VideoModal from './VideoModal';

// Simple TranslatableText component
const TranslatableText: React.FC<{ text: string }> = ({ text }) => {
  return <span>{text}</span>;
};

const InteractiveTutorials: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [tutorials, setTutorials] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Video Modal State
  const [selectedTutorial, setSelectedTutorial] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openTutorial = (tutorial: any) => {
    setSelectedTutorial(tutorial);
    setIsModalOpen(true);
  };

  const closeTutorial = () => {
    setIsModalOpen(false);
  };

  // Fetch tutorials from API
  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/tutorials?limit=50');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch tutorials');
        }

        setTutorials(data.data.tutorials);
      } catch (err) {
        console.error('Error fetching tutorials:', err);
        setError('Failed to load interactive tutorials. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutorials();
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
    <motion.div
      className="min-h-screen bg-slate-50 py-24"
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
            <BookOpen className="text-white" size={32} />
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 tracking-tight"
            variants={itemVariants}
          >
            <TranslatableText text="Interactive Tutorials" />
          </motion.h1>
          <motion.p
            className="text-slate-600 max-w-2xl mx-auto font-medium text-lg"
            variants={itemVariants}
          >
            <TranslatableText text="Step-by-step guides and interactive videos to help you master water conservation techniques and sustainable practices." />
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
              <span className="font-bold text-xl"><TranslatableText text="Loading tutorials..." /></span>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              <TranslatableText text="Error Loading Tutorials" />
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
            {tutorials.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold text-lg">
                  <TranslatableText text="No interactive tutorials available yet." />
                </p>
                <p className="text-slate-400 mt-2">
                  <TranslatableText text="Check back soon for new learning materials!" />
                </p>
              </div>
            ) : (
              tutorials.map((tutorial, i) => (
                <motion.div
                  key={tutorial.id}
                  className="bg-white rounded-[1.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden group cursor-pointer"
                  variants={cardVariants}
                  custom={i}
                  whileHover="hover"
                  onClick={() => openTutorial(tutorial)}
                >
                  <div className="aspect-video bg-slate-200 relative overflow-hidden">
                    {tutorial.video_url && (
                      <div className="block w-full h-full">
                        {tutorial.thumbnail_url ? (
                          <img
                            src={tutorial.thumbnail_url}
                            alt={tutorial.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="text-slate-400" size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                            <Play className="text-white ml-1" size={24} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <span className="bg-white/90 backdrop-blur-sm text-blue-700 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                        {tutorial.difficulty}
                      </span>
                    </div>

                    {tutorial.duration && (
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[10px] font-bold">
                        {Math.floor(tutorial.duration / 60)}:{(tutorial.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Layers size={10} />
                        {tutorial.category || 'General'}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Globe size={10} />
                        {tutorial.language === 'en' ? 'English' : tutorial.language}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {tutorial.title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                      {tutorial.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openTutorial(tutorial);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                      >
                        <Play size={12} fill="currentColor" />
                        <TranslatableText text="Start Tutorial" />
                      </button>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
                        <Calendar size={12} />
                        {new Date(tutorial.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedTutorial && (
        <VideoModal
          isOpen={isModalOpen}
          onClose={closeTutorial}
          videoSrc={selectedTutorial.video_url}
          title={selectedTutorial.title}
          description={selectedTutorial.description}
          poster={selectedTutorial.thumbnail_url}
        />
      )}
    </motion.div>
  );
};

export default InteractiveTutorials;
