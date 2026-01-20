import React from 'react';
import { motion } from 'framer-motion';
import { useContent } from './Home';

interface HeroProps {
  TranslatableText: React.FC<{ text: string }>;
}

const Hero: React.FC<HeroProps> = ({ TranslatableText }) => {
  const { hero_title, site_name, hero_subtitle, site_description } = useContent();
  
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

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className="text-blue-600 font-semibold tracking-wide uppercase text-sm mb-4"
            variants={itemVariants}
          >
            <TranslatableText text={hero_title} />
          </motion.h2>
          <motion.h1
            className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-8"
            variants={itemVariants}
          >
            <motion.span className="block mb-2" variants={itemVariants}>
              <TranslatableText text={site_name} />
            </motion.span>
            <motion.span className="text-blue-600" variants={itemVariants}>
              <TranslatableText text={hero_subtitle} />
            </motion.span>
          </motion.h1>
          <motion.p
            className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed"
            variants={itemVariants}
          >
            <TranslatableText text={site_description} />
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-4"
            variants={itemVariants}
          >
            <motion.a
              href="#activities"
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <TranslatableText text="Get Involved" />
            </motion.a>
            <motion.a
              href="#solutions"
              className="px-8 py-3 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-600 font-bold rounded-full hover:bg-blue-50 dark:hover:bg-slate-700 transition-all"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <TranslatableText text="Our Solutions" />
            </motion.a>
          </motion.div>
        </motion.div>
      </div>

      {/* Abstract Background Decoration */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-20"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          className="w-full h-full fill-blue-400"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <circle cx="50" cy="50" r="40" />
        </motion.svg>
      </motion.div>
    </section>
  );
};

export default Hero;
