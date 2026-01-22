
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Share2,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const TranslatableText: React.FC<{ text: string }> = ({ text }) => {
  return <span>{text}</span>;
};

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/community/campaigns/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setCampaign(data.data);
        } else {
          setError(data.message || 'Campaign not found');
        }
      } catch (err) {
        console.error('Fetch campaign error:', err);
        setError('Failed to load campaign details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleJoinCampaign = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsJoining(true);
    try {
      const token = localStorage.getItem('token');
      // We'll increment the participant count in the database
      const response = await fetch(`/api/community/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participants: (campaign.participants || 0) + 1
        })
      });

      if (response.ok) {
        setHasJoined(true);
        setCampaign({
          ...campaign,
          participants: (campaign.participants || 0) + 1
        });
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to join campaign');
      }
    } catch (err) {
      console.error('Join campaign error:', err);
      alert('An error occurred while joining the campaign');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops!</h2>
        <p className="text-slate-600 mb-6">{error || 'Campaign not found'}</p>
        <Link to="/water-campaigns" className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Image Section */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img 
          src={campaign.image_url || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80'} 
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        
        <div className="absolute top-6 left-6 md:left-12">
          <Link 
            to="/water-campaigns" 
            className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={18} />
            <TranslatableText text="Back" />
          </Link>
        </div>

        <div className="absolute bottom-10 left-6 md:left-12 right-6 md:right-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg`}>
              {campaign.status}
            </span>
            <span className="flex items-center gap-1 text-white/90 text-xs font-bold bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
              <MapPin size={12} />
              {campaign.location}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {campaign.title}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">About this Campaign</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
                <p>
                  Join us for the {campaign.title} in {campaign.location}. This campaign is dedicated to increasing awareness about water conservation and sustainable management in rural areas.
                </p>
                <p>
                  We believe that community-driven initiatives are the key to protecting our most precious resource. By participating, you help us spread knowledge, implement practical solutions, and build a more water-wise future for everyone.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-2xl my-8">
                  <h4 className="text-blue-900 font-bold mb-2">Campaign Goals:</h4>
                  <ul className="list-disc list-inside text-blue-800 space-y-2">
                    <li>Educational workshops for local schools</li>
                    <li>Community water source restoration</li>
                    <li>Sustainable irrigation demonstrations</li>
                    <li>Waste management near water bodies</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Time</p>
                  <p className="font-bold text-slate-900">{campaign.date || 'TBA'}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Participants</p>
                  <p className="font-bold text-slate-900">{campaign.participants || 0} People Joined</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Action Card */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20 sticky top-12"
            >
              <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                <Megaphone className="text-blue-400" />
                Join Now
              </h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 size={14} className="text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-300">Get exclusive updates on campaign activities and progress.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 size={14} className="text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-300">Connect with other community members and conservationists.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 size={14} className="text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-300">Receive a digital certificate of participation upon completion.</p>
                </div>
              </div>

              {hasJoined ? (
                <div className="bg-green-500/20 border border-green-500/50 rounded-2xl p-6 text-center mb-6">
                  <CheckCircle2 size={32} className="text-green-400 mx-auto mb-3" />
                  <p className="font-bold text-green-100">You've joined this campaign!</p>
                  <p className="text-xs text-green-200/70 mt-1">We'll notify you about upcoming events.</p>
                </div>
              ) : (
                <button 
                  onClick={handleJoinCampaign}
                  disabled={isJoining}
                  className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-700/20 disabled:opacity-50"
                >
                  {isJoining ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <TranslatableText text="Count Me In!" />
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              )}

              <div className="flex grid grid-cols-2 gap-4 mt-6">
                <button className="flex items-center justify-center gap-2 py-3 bg-white/10 rounded-xl font-bold text-xs hover:bg-white/20 transition-all">
                  <Share2 size={14} />
                  Share
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-white/10 rounded-xl font-bold text-xs hover:bg-white/20 transition-all">
                  <Heart size={14} />
                  Support
                </button>
              </div>
            </motion.div>

            <div className="mt-8 px-4">
              <div className="flex items-center gap-4 text-slate-400">
                <Clock size={20} />
                <p className="text-xs font-medium italic">
                  Last updated: {new Date(campaign.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
