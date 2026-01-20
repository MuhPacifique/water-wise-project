
import React from 'react';
import { motion } from 'framer-motion';
import { TeamMember } from '../types';

interface TeamSectionProps {
  TranslatableText: React.FC<{ text: string }>;
  team: TeamMember[];
}

const TeamSection: React.FC<TeamSectionProps> = ({ TranslatableText, team }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15
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

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }),
    hover: {
      y: -10,
      scale: 1.02,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.section
      className="py-24 bg-slate-50 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-20"
          variants={itemVariants}
        >
          <motion.h2
            className="text-4xl font-black text-slate-900 mb-4 tracking-tight"
            variants={itemVariants}
          >
            <TranslatableText text="Our Visionary Team" />
          </motion.h2>
          <motion.p
            className="text-slate-600 max-w-2xl mx-auto font-medium text-lg"
            variants={itemVariants}
          >
            <TranslatableText text="Meet the dedicated individuals from across East Africa driving the cultural shift in water resource protection." />
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          variants={containerVariants}
        >
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col items-center text-center border border-slate-100 cursor-pointer"
              variants={cardVariants}
              custom={idx}
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="relative mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-xl shadow-blue-100 group-hover:scale-105 transition-transform duration-500 ring-4 ring-slate-50 group-hover:ring-blue-100"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200 transform group-hover:rotate-12 transition-transform"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="text-[10px] font-black uppercase tracking-tighter">
                    {member.country.slice(0,3)}
                  </div>
                </motion.div>
              </motion.div>

              <motion.h3
                className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                {member.name}
              </motion.h3>
              <motion.p
                className="text-xs font-black uppercase tracking-widest text-blue-500 mb-6 bg-blue-50 px-3 py-1 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                <TranslatableText text={member.role || 'Team Member'} />
              </motion.p>

              <motion.div
                className="mt-auto w-full pt-6 border-t border-slate-50"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 bg-blue-300 rounded-full"
                    whileHover={{ scale: 1.5 }}
                  ></motion.span>
                  <TranslatableText text={member.country} />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Background Decorative Element */}
      <motion.div
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100/30 rounded-full blur-[100px] pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        viewport={{ once: true }}
      ></motion.div>
    </motion.section>
  );
};

export default TeamSection;
