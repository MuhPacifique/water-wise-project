
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Video, CheckCircle, FolderOpen, RefreshCw, X } from 'lucide-react';
import { googleTranslateService } from '../services/gemini';
import { Language } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ResourceHubProps {
  TranslatableText: React.FC<{ text: string }>;
}

const ResourceHub: React.FC<ResourceHubProps> = ({ TranslatableText }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [uploads, setUploads] = useState<{id: number, name: string, type: 'doc' | 'video', url?: string, translatedName?: string}[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Make API call to fetch resources
        const response = await fetch('/api/resources?limit=20');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch resources');
        }

        // Map API response to component's expected format
        const resources = data.data.resources.map((resource: any) => ({
          id: resource.id,
          name: resource.translated_title || resource.title,
          type: resource.type === 'document' ? 'doc' : resource.type === 'video' ? 'video' : 'doc',
          url: resource.file_url,
          translatedName: resource.translated_title || resource.title
        }));

        setUploads(resources);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('Failed to load resources from database. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
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

  const fileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.02,
      x: 5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.section
      className="py-24 bg-blue-50/50 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h2
            className="text-4xl font-black text-slate-900 mb-4 tracking-tight"
            variants={itemVariants}
          >
            <TranslatableText text="Knowledge & Resource Hub" />
          </motion.h2>
          <motion.p
            className="text-slate-600 max-w-2xl mx-auto font-medium"
            variants={itemVariants}
          >
            <TranslatableText text="Contribute to our collective wisdom by uploading training manuals (DOCX) and 3D tutorial videos (MP4) to help protect East African water sources." />
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-white rounded-[2.5rem] p-12 shadow-xl shadow-blue-100 border border-slate-100"
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}
        >
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.h3
              className="text-2xl font-bold text-slate-900 flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <FolderOpen className="text-blue-600" size={32} />
              </motion.div>
              <TranslatableText text="Resource Database" />
            </motion.h3>
            <div className="flex items-center gap-4">
              <motion.span
                className="text-[10px] font-black uppercase text-slate-400 tracking-widest"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {uploads.length} <TranslatableText text="Files" />
              </motion.span>
              {error && (
                <motion.button
                  onClick={() => window.location.reload()}
                  className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  title="Retry loading resources"
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <RefreshCw size={16} />
                </motion.button>
              )}
            </div>
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
                  className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                ></motion.div>
                <span className="font-bold"><TranslatableText text="Loading resources..." /></span>
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
                <RefreshCw size={24} />
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
              className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
              variants={containerVariants}
            >
              {uploads.length === 0 ? (
                <motion.div
                  className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-slate-400 font-bold italic">
                    <TranslatableText text="No resources available in database." />
                  </p>
                </motion.div>
              ) : (
                uploads.map((file, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer"
                    variants={fileItemVariants}
                    custom={i}
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      {file.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{file.name}</p>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">
                        <TranslatableText text="Database Resource" />
                      </p>
                    </div>
                    {file.url && (
                      <motion.a
                        href={`/api/resources/${file.id}/download`}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <TranslatableText text="Download" />
                      </motion.a>
                    )}
                    <motion.div
                      className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <CheckCircle size={18} />
                    </motion.div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ResourceHub;
