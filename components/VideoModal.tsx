import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Download, Info } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title: string;
  description?: string;
  poster?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ 
  isOpen, 
  onClose, 
  videoSrc, 
  title, 
  description,
  poster 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{title}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Internal Video Player</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player Area */}
            <div className="flex-1 bg-black flex items-center justify-center min-h-0">
              <VideoPlayer src={videoSrc} poster={poster} autoPlay={true} />
            </div>

            {/* Footer / Info */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 mb-1">About this video</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {description || "No additional description available for this educational resource."}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 transition-colors">
                    <Share2 size={16} />
                    Share
                  </button>
                  <a 
                    href={videoSrc.includes('/view') ? videoSrc.replace('/view', '/download') : videoSrc}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    download
                  >
                    <Download size={16} />
                    Download
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;
