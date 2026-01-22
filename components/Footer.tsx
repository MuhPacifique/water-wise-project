
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Github, Mail, Droplets, MapPin, ChevronRight } from 'lucide-react';
import { SOCIAL_LINKS } from '../constants';
import { FooterContent } from '../types';

interface FooterProps {
  TranslatableText: React.FC<{ text: string }>;
  content?: FooterContent | null;
}

const Footer: React.FC<FooterProps> = ({ TranslatableText, content }) => {
  // Use content from props or fallback to constants
  const facebook = content?.facebook_url || SOCIAL_LINKS.facebook;
  const twitter = content?.twitter_url || "#";
  const github = content?.github_url || SOCIAL_LINKS.github;
  const email = content?.contact_email || SOCIAL_LINKS.email;
  const locations = content?.locations || "Kigali, Rwanda | Bujumbura, Burundi | Dar es Salaam, Tanzania";
  const copyright = content?.copyright_text || "WATER-WISE PROJECT. SUSTAINING LIFE.";
  const programs = content?.programs || [
    "Water Heroes Certificate",
    "3D Animation Classes",
    "Rural Outreach",
    "Tree Planting"
  ];
  const quickLinks = content?.quick_links || [
    { label: "Home", href: "#" },
    { label: "Challenges", href: "#problem" },
    { label: "Our Solution", href: "#solutions" },
    { label: "Specialist Hub", href: "#chat" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const socialIconVariants = {
    hover: {
      scale: 1.1,
      y: -2,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    }
  };

  const linkVariants = {
    hover: {
      x: 5,
      color: "#60a5fa",
      transition: { duration: 0.2 }
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="col-span-1 md:col-span-1" variants={itemVariants}>
            <motion.div
              className="flex items-center gap-3 mb-8"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div
                className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Droplets size={28} />
              </motion.div>
              <span className="text-2xl font-black text-white tracking-tighter italic">WATER-WISE</span>
            </motion.div>
            <p className="text-sm leading-relaxed mb-10 opacity-70">
              <TranslatableText text="Leading the cultural revolution in East African water resource protection through high-tech education and grassroots mobilization." />
            </p>
            <div className="flex gap-4">
              <motion.a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-lg border border-white/5"
                title="Facebook"
                variants={socialIconVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all shadow-lg border border-white/5"
                title="Github"
                variants={socialIconVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Github size={20} />
              </motion.a>
              <motion.a
                href={twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-all shadow-lg border border-white/5"
                title="Twitter"
                variants={socialIconVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Twitter size={20} />
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] mb-10 relative">
              <TranslatableText text="Quick Nav" />
              <motion.div
                className="absolute -bottom-2 left-0 w-1/4 h-1 bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "25%" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              ></motion.div>
            </h4>
            <ul className="space-y-4 text-sm font-bold">
              {quickLinks.map((link, index) => (
                <motion.li key={index} variants={itemVariants}>
                  <motion.a
                    href={link.href}
                    className="hover:text-blue-400 flex items-center gap-2 transition-all"
                    variants={linkVariants}
                    whileHover="hover"
                  >
                    <ChevronRight size={14} />
                    <TranslatableText text={link.label} />
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] mb-10 relative">
              <TranslatableText text="Programs" />
              <motion.div
                className="absolute -bottom-2 left-0 w-1/4 h-1 bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "25%" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              ></motion.div>
            </h4>
            <ul className="space-y-4 text-sm font-bold">
              {programs.map((program, index) => (
                <motion.li key={index} variants={itemVariants}>
                  <TranslatableText text={program} />
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.25em] mb-10 relative">
              <TranslatableText text="Contact" />
              <motion.div
                className="absolute -bottom-2 left-0 w-1/4 h-1 bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "25%" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              ></motion.div>
            </h4>
            <div className="space-y-6">
              <motion.div className="flex items-start gap-4" variants={itemVariants}>
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm font-bold">{email}</p>
              </motion.div>
              <motion.div className="flex items-start gap-4" variants={itemVariants}>
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm opacity-70 italic font-medium leading-relaxed">
                  <TranslatableText text={locations} />
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">
            © {new Date().getFullYear()} <TranslatableText text={copyright} />
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest opacity-40">
            <TranslatableText text="Privacy" />
            <TranslatableText text="Terms" />
            <TranslatableText text="Legal" />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.05 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        viewport={{ once: true }}
      ></motion.div>
    </footer>
  );
};

export default Footer;
