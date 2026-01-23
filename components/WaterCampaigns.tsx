
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, MapPin, Calendar, Users, Home, ArrowRight, ShieldCheck, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation, TranslatableText } from '../contexts/TranslationContext';
import Navbar from './Navbar';
import Footer from './Footer';

const WaterCampaigns: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, isTranslating } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/community/campaigns');
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          // Map image_url to image for compatibility
          const mappedData = data.data.map((c: any) => ({
            ...c,
            image: c.image_url
          }));
          setCampaigns(mappedData);
        } else {
          // Mock data for campaigns if DB is empty
          const initialMockCampaigns = [
            {
              id: 1,
              title: "Clean River Mara Initiative",
              location: "Bomet, Kenya",
              date: "Feb 15, 2026",
              participants: 150,
              status: "Upcoming",
              image: "https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?auto=format&fit=crop&q=80&w=800"
            },
            {
              id: 2,
              title: "Lake Victoria Shoreline Cleanup",
              location: "Mwanza, Tanzania",
              date: "Mar 10, 2026",
              participants: 300,
              status: "Planned",
              image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800"
            }
          ];
          setCampaigns(initialMockCampaigns);
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
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
    <div className="min-h-screen bg-white">
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
            className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Megaphone size={32} />
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 tracking-tight"
            variants={itemVariants}
          >
            <TranslatableText text="Water Campaigns" />
          </motion.h1>
          <motion.p
            className="text-slate-600 max-w-2xl mx-auto font-medium text-lg"
            variants={itemVariants}
          >
            <TranslatableText text="Join our active awareness campaigns in rural areas across East Africa to protect our water resources." />
          </motion.p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-20 font-bold text-slate-400 italic">
            <TranslatableText text="Loading active campaigns..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {campaigns.map((campaign, i) => (
              <motion.div
                key={campaign.id}
                className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col group"
                variants={itemVariants}
                whileHover={{ y: -10 }}
              >
                <div className="h-60 relative overflow-hidden">
                  <motion.img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      campaign.status === 'Ongoing' ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                    } shadow-lg`}>
                      <TranslatableText text={campaign.status} />
                    </span>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
                    <MapPin size={12} />
                    <TranslatableText text={campaign.location} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 leading-tight">
                    <TranslatableText text={campaign.title} />
                  </h3>
                  
                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Calendar size={16} className="text-slate-400" />
                      <TranslatableText text={campaign.date} />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      <Users size={16} className="text-slate-400" />
                      {campaign.participants}+ <TranslatableText text="Participants" />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/join-campaign/${campaign.id}`)}
                    className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all group/btn shadow-xl shadow-slate-200"
                  >
                    <TranslatableText text="Join Campaign" />
                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}

            <motion.div
              className="col-span-full mt-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-12 text-center"
              variants={itemVariants}
            >
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} className="text-slate-900" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2"><TranslatableText text="Start a Local Campaign" /></h3>
              <p className="text-slate-600 max-w-lg mx-auto mb-8 font-medium">
                <TranslatableText text="Want to organize a water conservation awareness program in your rural community? We provide tools, resources, and guidance." />
              </p>
              <button className="px-10 py-4 border-2 border-slate-900 text-slate-900 font-black rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 mx-auto">
                <Target size={18} />
                <TranslatableText text="Propose a Campaign" />
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
    </div>
  );
};

export default WaterCampaigns;
