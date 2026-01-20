import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { googleTranslateService } from '../services/gemini';
import { useTranslation } from './Home';
import { Send, MessageSquare, ShieldCheck, User, Sparkles, Lightbulb, Target, Users, BookOpen } from 'lucide-react';

interface ChatHubProps {
  TranslatableText: React.FC<{ text: string }>;
}

const ChatHub: React.FC<ChatHubProps> = ({ TranslatableText }) => {
  const { language } = useTranslation();
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string, timestamp?: Date}[]>([
    {
      role: 'model',
      text: '👋 Welcome to the Water-Wise Professional Consultation Hub! I\'m your AI Water Conservation Specialist. I can help you with:\n\n💧 River protection strategies\n♻️ Plastic waste management\n🌳 Tree planting initiatives\n📚 Educational resources\n🎯 Community engagement\n\nWhat would you like to learn about today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEngagement, setUserEngagement] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // AI response system for water conservation
  const getAIResponse = async (userMessage: string, chatHistory: {role: 'user' | 'model', text: string}[], currentLanguage: string): Promise<string> => {
    try {
      const response = await fetch('/api/consultation/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory,
          language: currentLanguage
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data.response;
    } catch (error) {
      console.error("Consultation API Error:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    const chatHistory = messages.map(msg => ({
      role: msg.role,
      text: msg.text
    }));
    
    const newMessages = [...messages, { role: 'user' as const, text: userMsg, timestamp: new Date() }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setUserEngagement(prev => prev + 1);

    try {
      const reply = await getAIResponse(userMsg, chatHistory, language);
      setMessages(prev => [...prev, { role: 'model', text: reply, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: '⚠️ I\'m experiencing technical difficulties connecting to my expert knowledge base. Please try again in a moment, or visit our Resource Hub for offline materials.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.section
      className="py-24 bg-white relative"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          variants={itemVariants}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles size={12} />
            </motion.div>
            <TranslatableText text="AI Professional Advisor" />
          </motion.div>
          <motion.h2
            className="text-4xl font-black text-slate-900 mb-4 tracking-tight"
            variants={itemVariants}
          >
            <TranslatableText text="Expert Consultation Chat" />
          </motion.h2>
          <motion.p
            className="text-slate-600 font-medium mb-4"
            variants={itemVariants}
          >
            <TranslatableText text="Bridge the gap between professionals and the community. Ask questions, seek advice, and learn more about our conservation strategies." />
          </motion.p>
          <AnimatePresence>
            {userEngagement > 0 && (
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold border border-green-200"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Target size={12} />
                </motion.div>
                {userEngagement} {userEngagement === 1 ? 'Question' : 'Questions'} Asked Today
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="bg-slate-50 rounded-[3rem] shadow-2xl shadow-blue-100 border border-slate-100 overflow-hidden flex flex-col h-[650px]"
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.01 }}
        >
          {/* Header */}
          <motion.div
            className="bg-blue-600 p-6 flex items-center justify-between text-white"
            initial={{ y: -50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30 shadow-inner"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <ShieldCheck size={24} />
              </motion.div>
              <div>
                <p className="font-black text-sm tracking-tight"><TranslatableText text="Project Specialist" /></p>
                <div className="flex items-center gap-2 opacity-80">
                  <motion.span
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  ></motion.span>
                  <p className="text-[10px] uppercase font-bold tracking-widest"><TranslatableText text="Online Now" /></p>
                </div>
              </div>
            </div>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare size={20} className="opacity-40" />
            </motion.div>
          </motion.div>

          {/* Messages Container */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                >
                  <motion.div
                    className={`max-w-[85%] rounded-[2rem] p-5 shadow-sm border ${
                      msg.role === 'user'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-200 rounded-br-lg'
                      : 'bg-white text-slate-800 border-slate-100 rounded-bl-lg'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-2 opacity-70 font-black text-[10px] uppercase tracking-widest">
                      {msg.role === 'user' ? (
                        <><User size={10} /> <TranslatableText text="You" /></>
                      ) : (
                        <><ShieldCheck size={10} /> <TranslatableText text="Water Specialist" /></>
                      )}
                      {msg.timestamp && (
                        <span className="ml-auto opacity-50">
                          {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text.split('\n').map((line, idx) => (
                        <motion.p
                          key={idx}
                          className={line.startsWith('**') && line.endsWith(':**') ? 'font-bold mt-3 mb-2 text-blue-600' : line.startsWith('•') ? 'ml-4 mb-1' : 'mb-2'}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          {line}
                        </motion.p>
                      ))}
                    </div>
                    {msg.role === 'model' && i > 0 && (
                      <motion.div
                        className="mt-3 pt-3 border-t border-slate-200 opacity-60"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.6, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Lightbulb size={10} />
                          </motion.div>
                          <span><TranslatableText text="Click for more details or ask follow-up questions!" /></span>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.div
                    className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 text-slate-400 text-xs italic"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <TranslatableText text="Consultant is generating response..." />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <motion.div
            className="p-6 bg-white border-t border-slate-100"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative group">
              <motion.input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your conservation question..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 pr-16 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />
              <motion.button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Send size={18} />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ChatHub;
