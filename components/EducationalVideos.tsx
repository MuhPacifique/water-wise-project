import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Download, Eye, Calendar, User, Home, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { googleTranslateService } from '../services/gemini';
import { Language } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Simple TranslatableText component for EducationalVideos
const TranslatableText: React.FC<{ text: string }> = ({ text }) => {
  return <span>{text}</span>;
};

const EducationalVideos: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [videos, setVideos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch videos from API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Make API call to fetch video resources
        const response = await fetch('/api/resources?type=video&limit=50');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch videos');
        }

        setVideos(data.data.resources);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load educational videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
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

  const videoCardVariants = {
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
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-24"
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
            className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Video className="text-white" size={32} />
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 tracking-tight"
            variants={itemVariants}
          >
            <TranslatableText text="Educational Videos" />
          </motion.h1>
          <motion.p
            className="text-slate-600 max-w-2xl mx-auto font-medium text-lg"
            variants={itemVariants}
          >
            <TranslatableText text="Discover our collection of educational videos and 3D animations designed to teach water conservation and environmental awareness in East Africa." />
          </motion.p>
        </motion.div>

        {isLoading ? (
          <motion.div
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-3 text-blue-600">
              <motion.div
                className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              ></motion.div>
              <span className="font-bold text-xl"><TranslatableText text="Loading videos..." /></span>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Video size={24} />
            </motion.div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">
              <TranslatableText text="Connection Error" />
            </h4>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TranslatableText text="Try Again" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {videos.length === 0 ? (
              <motion.div
                className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Video size={24} />
                </motion.div>
                <p className="text-slate-500 font-bold italic text-lg">
                  <TranslatableText text="No educational videos available yet." />
                </p>
                <p className="text-slate-400 mt-2">
                  <TranslatableText text="Check back soon for new content!" />
                </p>
              </motion.div>
            ) : (
              videos.map((video, i) => (
                <motion.div
                  key={video.id}
                  className="bg-white rounded-2xl shadow-lg shadow-blue-100 border border-slate-100 overflow-hidden group"
                  variants={videoCardVariants}
                  custom={i}
                  whileHover="hover"
                >
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    <a href={`/api/resources/${video.id}/view`} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                      {video.thumbnail_url ? (
                        <motion.img
                          src={video.thumbnail_url}
                          alt={video.translated_title || video.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <motion.div
                          className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Play className="text-white ml-1" size={24} />
                          </motion.div>
                        </motion.div>
                      )}
                    </a>
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {video.is_featured ? (
                        <motion.div
                          className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg text-xs font-black flex items-center gap-1 shadow-lg shadow-yellow-200/50"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <Star size={12} fill="currentColor" />
                          FEATURED
                        </motion.div>
                      ) : null}
                    </div>

                    <motion.div
                      className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Video size={12} />
                      VIDEO
                    </motion.div>
                    
                    <a href={`/api/resources/${video.id}/view`} target="_blank" rel="noopener noreferrer">
                      <motion.div
                        className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <motion.div
                          className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Play className="text-white ml-1" size={24} />
                        </motion.div>
                      </motion.div>
                    </a>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                      {video.translated_title || video.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {video.translated_description || video.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(video.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        {video.view_count || 0} views
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User size={12} />
                        {video.uploaded_by_name || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-2">
                        {video.file_url && (
                          <>
                            <motion.a
                              href={`/api/resources/${video.id}/view`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Play size={14} fill="currentColor" />
                              <TranslatableText text="Watch" />
                            </motion.a>
                            <motion.a
                              href={`/api/resources/${video.id}/download`}
                              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Download video"
                            >
                              <Download size={16} />
                            </motion.a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EducationalVideos;
