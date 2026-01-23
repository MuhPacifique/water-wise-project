
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard,
  Gift,
  Coins,
  DollarSign,
  Heart
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTranslation, TranslatableText } from '../contexts/TranslationContext';
import { LANGUAGES } from '../constants';

const DonatePage: React.FC = () => {
  const navigate = useNavigate();
  const { language, isTranslating } = useTranslation();
  
  const [amount, setAmount] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const donationTiers = [
    { label: '$10', value: '10', description: 'Provides clean water for one student for a year.' },
    { label: '$25', value: '25', description: 'Provides water testing kits for a rural village.' },
    { label: '$50', value: '50', description: 'Supports a community water conservation workshop.' },
    { label: 'Other', value: 'custom', description: 'Every donation makes a significant impact.' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/actions/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payment_method: 'Credit Card'
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setIsSubmitted(true);
      } else {
        alert(data.message || 'Donation failed');
      }
    } catch (err) {
      console.error('Error submitting donation:', err);
      alert('Failed to process donation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-12 pt-24">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors">
          <ArrowLeft size={18} /> <TranslatableText text="Back Home" />
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                <Gift size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                <TranslatableText text="Empower Communities Through Giving" />
              </h1>
              <p className="text-xl text-slate-600 font-medium">
                <TranslatableText text="Your donation directly funds water conservation and education programs across East Africa." />
              </p>
            </div>

            <div className="space-y-6 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900"><TranslatableText text="Your Impact" /></h3>
              <div className="space-y-4">
                {[
                  "100% of your donation goes to field projects",
                  "Secure and encrypted payment processing",
                  "Regular updates on the projects you fund",
                  "Tax-deductible contributions in eligible regions"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 size={14} className="text-green-600" />
                    </div>
                    <p className="text-slate-600 font-medium"><TranslatableText text={item} /></p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isSubmitted ? (
              <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl shadow-blue-200 border border-slate-100">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart size={40} className="fill-current" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4"><TranslatableText text="Thank You for Your Generosity!" /></h2>
                <p className="text-slate-600 font-medium mb-8">
                  <TranslatableText text={`Your donation of $${amount} has been processed successfully. You've made a real difference today.`} />
                </p>
                <button 
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all"
                >
                  <TranslatableText text="Back Home" />
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-200 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                
                <h2 className="text-2xl font-black text-slate-900 mb-8"><TranslatableText text="Make a Donation" /></h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    {donationTiers.map((tier) => (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => setAmount(tier.value === 'custom' ? '' : tier.value)}
                        className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                          amount === tier.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-100 bg-slate-50 hover:border-blue-200'
                        }`}
                      >
                        <div className={`text-xl font-black mb-1 ${
                          amount === tier.value ? 'text-blue-600' : 'text-slate-900'
                        }`}>
                          <TranslatableText text={tier.label} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-tight">
                          <TranslatableText text={tier.description} />
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                    <input 
                      required
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-12 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-2 focus:ring-blue-600 outline-none transition-all text-2xl font-black"
                    />
                  </div>

                  <div className="space-y-4">
                    <button 
                      type="submit"
                      disabled={isLoading || !amount}
                      className="w-full py-5 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CreditCard size={20} />
                          <TranslatableText text="Complete Donation" />
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-4 text-slate-400">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Secure 256-bit SSL Encryption</span>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer TranslatableText={TranslatableText} />

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

export default DonatePage;
