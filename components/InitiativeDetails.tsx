
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  AlertCircle,
  Share2,
  Heart,
  Clock,
  Home
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTranslation, TranslatableText } from '../contexts/TranslationContext';
import { LANGUAGES } from '../constants';
import { TakeActionContent } from '../types';

const InitiativeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, isTranslating } = useTranslation();
  
  const [initiative, setInitiative] = useState<any>(null);
  const [takeActionContent, setTakeActionContent] = useState<TakeActionContent>({
    title: "Take Action",
    description: "Be part of the solution. Every small action counts towards protecting our water resources.",
    volunteer_button_text: "Volunteer with Us",
    donate_button_text: "Donate to this Cause"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: initiative.title,
          text: initiative.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareSuccess(true);
        setTimeout(() => setShowShareSuccess(false), 3000);
      } catch (err) {
        console.error('Error copying to clipboard:', err);
      }
    }
  };

  const handleSupport = () => {
    setIsSupported(true);
    // In a real app, this would hit a backend endpoint
    setTimeout(() => setIsSupported(false), 3000);
  };

  useEffect(() => {
    const fetchInitiative = async () => {
      setIsLoading(true);
      try {
        const [initiativeRes, takeActionRes] = await Promise.all([
          fetch(`/api/initiatives/${id}`),
          fetch('/api/settings/initiatives-take-action')
        ]);
        
        if (!initiativeRes.ok) {
          throw new Error(`HTTP error! status: ${initiativeRes.status}`);
        }
        
        const initiativeData = await initiativeRes.json();
        
        if (initiativeData.success) {
          setInitiative(initiativeData.data);
        } else {
          setError(initiativeData.message || 'Initiative not found');
        }

        if (takeActionRes.ok) {
          const takeActionData = await takeActionRes.json();
          setTakeActionContent(takeActionData.data);
        }
      } catch (err) {
        console.error('Fetch initiative error:', err);
        setError('Failed to load initiative details. Please check your internet connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitiative();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !initiative) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h2>
        <p className="text-slate-600 mb-6">{error || 'Initiative not found'}</p>
        <Link to="/" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold">
          Back to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Header Image Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <img 
          src={initiative.image_url || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80'} 
          alt={initiative.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        
        <div className="absolute top-24 left-6 md:left-12">
          <Link 
            to="/" 
            className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={18} />
            <TranslatableText text="Back Home" />
          </Link>
        </div>

        <div className="absolute bottom-12 left-6 md:left-12 right-6 md:right-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-xl">
              {initiative.icon}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            {initiative.title}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100"
            >
              <div 
                className="prose prose-blue prose-lg max-w-none text-slate-600 leading-relaxed initiative-content"
                dangerouslySetInnerHTML={{ __html: initiative.content }}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-blue-900/20 sticky top-24"
            >
              <h3 className="text-2xl font-black mb-6"><TranslatableText text={takeActionContent.title} /></h3>
              <p className="text-slate-300 mb-8 font-medium">
                <TranslatableText text={takeActionContent.description} />
              </p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/volunteer')}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-700/20"
                >
                  <TranslatableText text={takeActionContent.volunteer_button_text} />
                </button>
                <button 
                  onClick={() => navigate('/donate')}
                  className="w-full py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all border border-white/10"
                >
                  <TranslatableText text={takeActionContent.donate_button_text} />
                </button>
              </div>

              <div className="flex grid grid-cols-2 gap-4 mt-8 relative">
                <button 
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-3 bg-white/5 rounded-xl font-bold text-xs hover:bg-white/10 transition-all"
                >
                  <Share2 size={14} />
                  <TranslatableText text={showShareSuccess ? "Copied!" : "Share"} />
                </button>
                <button 
                  onClick={handleSupport}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${
                    isSupported ? 'bg-red-500 text-white' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Heart size={14} className={isSupported ? 'fill-current' : ''} />
                  <TranslatableText text={isSupported ? "Thanks!" : "Support"} />
                </button>
              </div>
            </motion.div>

            <div className="mt-8 px-4 flex items-center gap-4 text-slate-400">
              <Clock size={20} />
              <p className="text-xs font-medium italic">
                <TranslatableText text="Last updated:" /> {new Date(initiative.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
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

export default InitiativeDetails;
