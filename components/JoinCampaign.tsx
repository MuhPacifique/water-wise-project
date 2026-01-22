
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  MapPin, 
  Calendar, 
  Users, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Heart,
  FlaskConical,
  Truck,
  Megaphone,
  HandHelping
} from 'lucide-react';

const JoinCampaign: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    experience: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/community/campaigns/${id}`);
        const data = await response.json();
        if (data.success) {
          setCampaign(data.data);
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/community/campaigns/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsSubmitted(true);
      } else {
        const errorMsg = data.message || (data.error && data.error.message) || 'Registration failed';
        alert(errorMsg);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const campaignName = campaign?.title || "Active Conservation";
  const location = campaign?.location || "Our Community";

  return (
    <div className="min-h-screen bg-slate-50">


      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link to="/water-campaigns" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to Campaigns
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column: Copywriting Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                <Droplets size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                Be the Hero {location} Needs. <br/>
                <span className="text-blue-600">Join the {campaignName}.</span>
              </h1>
              <div className="prose prose-lg text-slate-600 leading-relaxed font-medium">
                <p>
                  Every drop counts, but every person counts more. We are standing at a crossroads for water security in <strong>{location}</strong>. The time for passive observation has passed; the time for collective action is <strong>now</strong>.
                </p>
                <p>
                  By registering for the <strong>{campaignName}</strong>, you aren't just signing up for a task—you are becoming a guardian of our most precious resource. Join a community of dedicated volunteers committed to sustaining life and protecting our future.
                </p>
              </div>
            </div>

            {/* Volunteer Roles */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <HandHelping className="text-blue-600" />
                Critical Volunteer Roles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: FlaskConical, title: "Water Testing", desc: "Monitor water quality and pollution levels." },
                  { icon: Truck, title: "Logistics", desc: "Coordinate supplies and resource distribution." },
                  { icon: Megaphone, title: "Outreach", desc: "Spread awareness in local communities." },
                  { icon: ShieldCheck, title: "Conservation", desc: "On-the-ground restoration work." }
                ].map((role, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-blue-600 transition-all">
                    <role.icon className="text-blue-600 mb-3 group-hover:text-white transition-colors" size={24} />
                    <h4 className="font-bold text-slate-900 group-hover:text-white transition-colors">{role.title}</h4>
                    <p className="text-xs text-slate-500 group-hover:text-blue-100 transition-colors">{role.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What to Expect */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900">What to Expect</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 size={14} className="text-green-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium"><strong>Training & Gear:</strong> We provide all necessary equipment and safety briefings.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 size={14} className="text-green-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium"><strong>Community Impact:</strong> Real, measurable results in water quality and conservation.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 size={14} className="text-green-600" />
                  </div>
                  <p className="text-slate-600 text-sm font-medium"><strong>Digital Recognition:</strong> Certificate of Impact issued upon completion.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Registration Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:pt-12"
          >
            {isSubmitted ? (
              <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-blue-200 border border-slate-100">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheck size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">You're on the Team!</h2>
                <p className="text-slate-600 font-medium mb-8">
                  Thank you, {formData.name}. We've received your registration for <strong>{campaignName}</strong>. A coordinator will contact you at <strong>{formData.email}</strong> shortly with next steps.
                </p>
                <button 
                  onClick={() => navigate('/water-campaigns')}
                  className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all"
                >
                  Return to Campaigns
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-200 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                
                <div className="mb-10">
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Volunteer Registration</h2>
                  <p className="text-slate-500 text-sm font-medium">Fill out your details to begin your journey.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">User Data Collection</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Full Name</label>
                        <input 
                          required
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Your Name"
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Address</label>
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="email@example.com"
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Phone Number (Optional)</label>
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+250 000 000 000"
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Volunteer Role</label>
                        <select 
                          required
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold"
                        >
                          <option value="">Select a Role</option>
                          <option value="Water Testing">Water Testing</option>
                          <option value="Logistics">Logistics</option>
                          <option value="Outreach">Outreach</option>
                          <option value="Conservation">Conservation</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Experience/Message (Optional)</label>
                        <textarea 
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: e.target.value})}
                          placeholder="Tell us about your relevant experience or why you want to join..."
                          rows={3}
                          className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3"
                  >
                    <Heart size={20} />
                    I'm Ready to Help
                  </button>
                  
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Protecting Water. Sustaining Life.
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JoinCampaign;
