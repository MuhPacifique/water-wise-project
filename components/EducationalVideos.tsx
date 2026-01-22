import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Download, Eye, Calendar, User, Home, Star, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { googleTranslateService } from '../services/gemini';
import { Language } from '../types';
import { useAuth } from '../contexts/AuthContext';
import VideoModal from './VideoModal';

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
  
  // Video Modal State
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openVideo = (video: any) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeVideo = () => {
    setIsModalOpen(false);
  };

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
            className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-200"
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
            <div className="flex items-center gap-3 text-slate-900">
              <motion.div
                className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full"
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
                  className="bg-white rounded-[1.5rem] shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden group cursor-pointer"
                  variants={videoCardVariants}
                  custom={i}
                  whileHover="hover"
                  onClick={() => openVideo(video)}
                >
                  <div className="aspect-video bg-slate-200 relative overflow-hidden">
                    <div className="block w-full h-full">
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
                          className="w-full h-full bg-slate-200 flex items-center justify-center"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Play className="text-slate-400" size={48} />
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {video.is_featured ? (
                        <motion.div
                          className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-lg"
                        >
                          <Star size={10} fill="currentColor" />
                          FEATURED
                        </motion.div>
                      ) : null}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1">
                      <Music size={10} className="text-white" />
                      {video.duration || '2:20'}
                    </div>
                    
                    <motion.div
                      className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Play className="text-white ml-0.5" size={20} />
                      </motion.div>
                    </motion.div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-2">
                      {video.translated_title || video.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            openVideo(video);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play size={12} fill="currentColor" />
                          <TranslatableText text="Watch Now" />
                        </motion.button>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <Eye size={12} />
                          {video.view_count || 0}
                        </div>
                        {video.file_url && (
                          <motion.a
                            href={`/api/resources/${video.id}/download`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Download"
                          >
                            <Download size={12} />
                          </motion.a>
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

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={isModalOpen}
          onClose={closeVideo}
          videoSrc={`/api/resources/${selectedVideo.id}/view`}
          title={selectedVideo.translated_title || selectedVideo.title}
          description={selectedVideo.translated_description || selectedVideo.description}
          poster={selectedVideo.thumbnail_url}
        />
      )}
    </motion.div>
  );
};

export default EducationalVideos;
