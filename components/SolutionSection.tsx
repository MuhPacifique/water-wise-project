
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Video, BookOpen, GraduationCap, Users, Megaphone } from 'lucide-react';

interface SolutionSectionProps {
  TranslatableText: React.FC<{ text: string }>;
  items: string[];
}

const SolutionSection: React.FC<SolutionSectionProps> = ({ TranslatableText, items }) => {
  const navigate = useNavigate();

  // Using component references instead of elements to avoid React.cloneElement type issues with Lucide icons
  const IconComponents = [Video, BookOpen, GraduationCap, Users, Megaphone];

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
    hidden: { opacity: 0, y: 50 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }),
    hover: {
      y: -5,
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.section
      className="py-20 bg-slate-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <motion.h2
          className="text-3xl font-bold text-slate-900 mb-4"
          variants={itemVariants}
        >
          <TranslatableText text="Our Solutions" />
        </motion.h2>
        <motion.p
          className="text-slate-600 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          <TranslatableText text="A comprehensive digital platform designed to enhance awareness and drive cultural sensitivity in water resource protection." />
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {items.map((item, idx) => {
            const Icon = IconComponents[idx % IconComponents.length];
            return (
              <motion.div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer"
                variants={cardVariants}
                custom={idx}
                whileHover="hover"
                whileTap={{ scale: 0.98 }}
                onClick={
                  idx === 0 ? () => navigate('/educational-videos') : 
                  idx === 1 ? () => navigate('/interactive-tutorials') : 
                  idx === 2 ? () => navigate('/professional-trainings') : 
                  idx === 3 ? () => navigate('/community-testimonies') : 
                  idx === 4 ? () => navigate('/water-campaigns') : 
                  undefined
                }
              >
                <motion.div
                  className="w-12 h-12 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon size={24} />
                </motion.div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  <TranslatableText text={item.split(' & ')[0] || item} />
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  <TranslatableText text="Providing accessible and culturally relevant education to all age groups in their native languages." />
                </p>
                <motion.div
                  className="flex items-center gap-2 text-slate-600 text-xs font-bold uppercase tracking-wider"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <CheckCircle2 size={14} />
                  </motion.div>
                  <TranslatableText text="Feature Ready" />
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="mt-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 lg:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="max-w-xl text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4">
              <TranslatableText text="Our Uniqueness: 3D Animation" />
            </h3>
            <p className="text-blue-100 leading-relaxed">
              <TranslatableText text="We use cutting-edge 3D animation (inspired by Ubongo Kids) to make complex environmental lessons engaging and easy to understand for children and teenagers." />
            </p>
          </motion.div>
          <motion.button
            className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/educational-videos')}
          >
            <TranslatableText text="Watch Demo" />
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default SolutionSection;
