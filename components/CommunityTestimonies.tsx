
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Quote, User, Home, Heart, Share2, Sparkles, X, Send, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation, TranslatableText } from '../contexts/TranslationContext';
import { LANGUAGES } from '../constants';
import Navbar from './Navbar';
import Footer from './Footer';

const CommunityTestimonies: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isTranslating } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [testimonies, setTestimonies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [shareSuccessId, setShareSuccessId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    text: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/community/testimonies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitSuccess(true);
        setFormData({ name: '', location: '', text: '' });
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(false);
        }, 2000);
        // Refresh testimonies
        const refreshRes = await fetch('/api/community/testimonies');
        const refreshData = await refreshRes.json();
        if (refreshData.success) setTestimonies(refreshData.data);
      }
    } catch (err) {
      console.error('Error submitting testimony:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (id: number) => {
    setLikedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShare = async (testimony: any) => {
    const shareData = {
      title: 'Water-Wise Community Testimony',
      text: `"${testimony.text}" - ${testimony.name} from ${testimony.location}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n\nRead more at: ${shareData.url}`);
        setShareSuccessId(testimony.id);
        setTimeout(() => setShareSuccessId(null), 3000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  useEffect(() => {
    const fetchTestimonies = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/community/testimonies');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          setTestimonies(data.data);
        } else {
          // Use provided mock data if no data in DB
          const initialMockData = [
            {
              id: 1,
              name: "John Kamau",
              location: "Kenya",
              text: "Since we started the river protection program in our village, the water clarity has improved significantly. We no longer see plastics floating downstream.",
              date: "Jan 15, 2026",
              likes: 24
            },
            {
              id: 2,
              name: "Mary Anyango",
              location: "Uganda",
              text: "The tree planting initiative helped us restore the buffer zone near our farm. The soil erosion has stopped, and our crops are healthier than ever.",
              date: "Jan 10, 2026",
              likes: 18
            }
          ];
          setTestimonies(initialMockData);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching testimonies:', err);
        setError('Failed to load testimonies.');
        setIsLoading(false);
      }
    };

    fetchTestimonies();
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
            className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <MessageSquare className="text-white" size={32} />
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 tracking-tight"
            variants={itemVariants}
          >
            <TranslatableText text="Community Testimonies" />
          </motion.h1>
          <motion.p
            className="text-slate-600 max-w-2xl mx-auto font-medium text-lg mb-10"
            variants={itemVariants}
          >
            <TranslatableText text="Hear from local community members across East Africa who are making a difference in water resource protection." />
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="max-w-md mx-auto relative group"
          >
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text"
              placeholder="Search testimonies..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-20 font-bold text-slate-400 italic">
            <TranslatableText text="Loading testimonies..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonies
              .filter(t => 
                t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                t.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                t.text.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((testimony, i) => (
              <motion.div
                key={testimony.id}
                className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative group"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                  <Quote size={20} />
                </div>
                
                <p className="text-slate-700 italic mb-8 leading-relaxed text-lg">
                  "<TranslatableText text={testimony.text} />"
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm"><TranslatableText text={testimony.name} /></h4>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest"><TranslatableText text={testimony.location} /></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleLike(testimony.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        likedIds.has(testimony.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                      }`}
                    >
                      <Heart size={16} className={likedIds.has(testimony.id) ? 'fill-current' : ''} />
                      <span className="text-xs font-bold">
                        {likedIds.has(testimony.id) ? (testimony.likes || 0) + 1 : (testimony.likes || 0)}
                      </span>
                    </button>
                    <button 
                      onClick={() => handleShare(testimony)}
                      className={`transition-colors ${
                        shareSuccessId === testimony.id ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'
                      }`}
                    >
                      {shareSuccessId === testimony.id ? (
                        <span className="text-[10px] font-black uppercase tracking-widest">Copied!</span>
                      ) : (
                        <Share2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div
              className="col-span-full mt-12 bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-200"
              variants={itemVariants}
            >
              <div className="max-w-xl text-center md:text-left">
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                  <Sparkles size={20} className="text-blue-200" />
                  <span className="text-blue-100 text-xs font-black uppercase tracking-widest"><TranslatableText text="Join the Movement" /></span>
                </div>
                <h3 className="text-2xl font-bold mb-2"><TranslatableText text="Share Your Story" /></h3>
                <p className="text-blue-100 opacity-90 leading-relaxed">
                  <TranslatableText text="Has our project helped you or your community? We'd love to hear your story and share it to inspire others across the region." />
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 whitespace-nowrap"
              >
                <TranslatableText text="Submit Testimony" />
              </button>
            </motion.div>
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

      {/* Submit Testimony Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-lg relative shadow-2xl overflow-hidden"
          >
            {submitSuccess ? (
              <div className="py-12 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Thank You!</h2>
                <p className="text-slate-600 font-medium">Your testimony has been submitted successfully and will be visible after review.</p>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X size={24} />
                </button>
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-slate-900 mb-2">Share Your Story</h2>
                  <p className="text-slate-500 font-medium">Inspire others by sharing your experience with our community.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Location</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                      placeholder="e.g. Nairobi, Kenya"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Your Testimony</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none"
                      placeholder="Tell us your story..."
                      value={formData.text}
                      onChange={(e) => setFormData({...formData, text: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={isSubmitting}
                    type="submit"
                    className="w-full py-5 bg-blue-600 text-white font-black rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        Submit Testimony
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CommunityTestimonies;
