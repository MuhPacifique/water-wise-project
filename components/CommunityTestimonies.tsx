
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Quote, User, Home, Heart, Share2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TranslatableText: React.FC<{ text: string }> = ({ text }) => {
  return <span>{text}</span>;
};

const CommunityTestimonies: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [testimonies, setTestimonies] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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
            className="text-slate-600 max-w-2xl mx-auto font-medium text-lg"
            variants={itemVariants}
          >
            <TranslatableText text="Hear from local community members across East Africa who are making a difference in water resource protection." />
          </motion.p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-20 font-bold text-slate-400 italic">
            <TranslatableText text="Loading testimonies..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonies.map((testimony, i) => (
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
                  "{testimony.text}"
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{testimony.name}</h4>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{testimony.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors">
                      <Heart size={16} />
                      <span className="text-xs font-bold">{testimony.likes}</span>
                    </button>
                    <button className="text-slate-400 hover:text-blue-500 transition-colors">
                      <Share2 size={16} />
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
                  <span className="text-blue-100 text-xs font-black uppercase tracking-widest">Join the Movement</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Share Your Story</h3>
                <p className="text-blue-100 opacity-90 leading-relaxed">
                  Has our project helped you or your community? We'd love to hear your story and share it to inspire others across the region.
                </p>
              </div>
              <button className="px-8 py-4 bg-white text-blue-700 font-black rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 whitespace-nowrap">
                <TranslatableText text="Submit Testimony" />
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommunityTestimonies;
