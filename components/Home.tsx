import React, { useState, useEffect, createContext, useContext, Component, ReactNode, ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Language, TranslationContextType, ProblemContent, TeamMember, FooterContent } from '../types';
import { googleTranslateService } from '../services/gemini';
import { useTranslation, TranslatableText } from '../contexts/TranslationContext';
import { useContent } from '../contexts/ContentContext';
import { LANGUAGES, TEAM, ACTIVITIES, SOLUTIONS_ITEMS, PROBLEM_POINTS } from '../constants';
import Navbar from './Navbar';
import Hero from './Hero';
import ProblemSection from './ProblemSection';
import SolutionSection from './SolutionSection';
import ActivitiesSection from './ActivitiesSection';
import TeamSection from './TeamSection';
import ChatHub from './ChatHub';
import ResourceHub from './ResourceHub';
import Footer from './Footer';
import MaintenanceMode from './MaintenanceMode';
import { Sparkles, Info, Lightbulb, X } from 'lucide-react';

const DailyInsight: React.FC<{ TranslatableText: React.FC<{ text: string }> }> = ({ TranslatableText }) => {
  const [insight, setInsight] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/consultation/daily-insight')
      .then(res => res.json())
      .then(data => {
        if (data.success) setInsight(data.data.insight);
      })
      .catch(console.error);
  }, []);

  if (!insight || !isVisible) return null;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[60] max-w-[320px] sm:max-w-md"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white/95 backdrop-blur-sm border border-blue-100 rounded-3xl p-5 flex items-start gap-4 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 z-10"
          aria-label="Hide insight"
        >
          <X size={14} />
        </button>

        <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
          <Lightbulb size={20} />
        </div>
        <div className="pr-4">
          <h4 className="text-blue-900 font-black text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <Sparkles size={12} className="text-blue-600" />
            Daily AI Insight
          </h4>
          <p className="text-slate-700 text-xs font-bold leading-relaxed">
            <TranslatableText text={insight} />
          </p>
        </div>
      </div>
    </motion.div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState;
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong</h2>
            <p className="text-slate-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={18} />
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-slate-100 rounded text-xs overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface FrontendVisibility {
  showHero: boolean;
  showProblem: boolean;
  showSolutions: boolean;
  showResources: boolean;
  showChat: boolean;
  showTeam: boolean;
  showActivities: boolean;
  showFooter: boolean;
  showNav: boolean;
}

const Home: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { language, isTranslating } = useTranslation();
  const { siteContent, setSiteContent } = useContent();
  const { maintenanceMode } = useOutletContext<{ maintenanceMode: boolean }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM);
  const [initiatives, setInitiatives] = useState<any[]>(ACTIVITIES);
  const [problemContent, setProblemContent] = useState<ProblemContent>({
    title: "Water Resource Challenge",
    subtitle: "Critical Challenge",
    description: "All over the world, the issue of climate change is a subject under discussion. Most countries face its effects, especially in Africa, due to specific challenges:",
    points: PROBLEM_POINTS,
    image_url: "https://picsum.photos/seed/water-problem/800/600"
  });
  const [footerContent, setFooterContent] = useState<FooterContent | null>(null);
  const [visibilitySettings, setVisibilitySettings] = useState<FrontendVisibility>({
    showHero: true,
    showProblem: true,
    showSolutions: true,
    showResources: true,
    showChat: true,
    showTeam: true,
    showActivities: true,
    showFooter: true,
    showNav: true,
  });

  // Check for user's reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [visibilityResponse, contentResponse, problemResponse, teamResponse, footerResponse, initiativesResponse] = await Promise.all([
          fetch('/api/settings/frontend-visibility'),
          fetch('/api/settings/content'),
          fetch('/api/settings/problem-content'),
          fetch('/api/team/public'),
          fetch('/api/settings/footer'),
          fetch('/api/initiatives')
        ]);

        const visibilityData = await visibilityResponse.json();
        const contentData = await contentResponse.json();
        const problemData = await problemResponse.json();
        const teamData = await teamResponse.json();
        const footerData = await footerResponse.json();
        const initiativesData = await initiativesResponse.json();

        setVisibilitySettings(visibilityData.data || visibilitySettings);
        if (contentData.success && contentData.data) {
          setSiteContent(contentData.data);
        }
        if (problemData.success && problemData.data) {
          setProblemContent(problemData.data);
        }
        if (footerData.success && footerData.data) {
          setFooterContent(footerData.data);
        }
        if (teamData.success && teamData.data && teamData.data.length > 0) {
          // Map backend image_url to frontend image property
          const mappedTeam = teamData.data.map((member: any) => ({
            ...member,
            image: member.image_url
          }));
          setTeamMembers(mappedTeam);
        }
        if (initiativesData.success && initiativesData.data && initiativesData.data.length > 0) {
          setInitiatives(initiativesData.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Show loading state while fetching settings
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
          <motion.div
            className="min-h-screen bg-water-pattern transition-colors duration-500"
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={prefersReducedMotion ? {} : { opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Navbar />
            
            <main>
              {visibilitySettings.showHero && (
                <motion.section
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Hero TranslatableText={TranslatableText} />
                </motion.section>
              )}

              {visibilitySettings.showProblem && (
                <motion.section
                  id="problem"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <ProblemSection
                    TranslatableText={TranslatableText}
                    points={problemContent.points}
                    title={problemContent.title}
                    subtitle={problemContent.subtitle}
                    description={problemContent.description}
                    imageUrl={problemContent.image_url}
                  />
                </motion.section>
              )}

              {visibilitySettings.showSolutions && (
                <motion.section
                  id="solutions"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <SolutionSection TranslatableText={TranslatableText} items={SOLUTIONS_ITEMS} />
                </motion.section>
              )}

              {visibilitySettings.showActivities && (
                <motion.section
                  id="activities"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <ActivitiesSection TranslatableText={TranslatableText} activities={initiatives} />
                </motion.section>
              )}

              {visibilitySettings.showResources && (
                <motion.section
                  id="resources"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <ResourceHub TranslatableText={TranslatableText} />
                </motion.section>
              )}

              <motion.section
                id="chat"
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <ChatHub TranslatableText={TranslatableText} />
              </motion.section>

              {visibilitySettings.showTeam && (
                <motion.section
                  id="team"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <TeamSection TranslatableText={TranslatableText} team={teamMembers} />
                </motion.section>
              )}
            </main>

            {visibilitySettings.showFooter && <Footer TranslatableText={TranslatableText} content={footerContent} />}

            <DailyInsight TranslatableText={TranslatableText} />

            {/* Global Loading Spinner for Translations */}
            {isTranslating && (
              <motion.div
                className="fixed bottom-6 left-6 bg-white/90 backdrop-blur shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 border border-blue-100 z-50"
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
          </motion.div>
    </ErrorBoundary>
  );
};

export default Home;
