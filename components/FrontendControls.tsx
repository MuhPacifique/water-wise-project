import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Eye,
  EyeOff,
  ToggleRight,
  ToggleLeft,
  Save,
  AlertCircle,
  Moon,
  Sun,
  Plus
} from 'lucide-react';
import { ProblemContent, FooterContent } from '../types';

interface FrontendSettings {
  showHero: boolean;
  showProblem: boolean;
  showSolutions: boolean;
  showResources: boolean;
  showChat: boolean;
  showTeam: boolean;
  showActivities: boolean;
  showFooter: boolean;
  showNav: boolean;
  maintenanceMode: boolean;
  darkMode: boolean;
}

interface SiteContent {
  hero_title: string;
  site_name: string;
  hero_subtitle: string;
  site_description: string;
}

const FrontendControls: React.FC = () => {
  const [settings, setSettings] = useState<FrontendSettings>({
    showHero: true,
    showProblem: true,
    showSolutions: true,
    showResources: true,
    showChat: true,
    showTeam: true,
    showActivities: true,
    showFooter: true,
    showNav: true,
    maintenanceMode: false,
    darkMode: false,
  });
  const [content, setContent] = useState<SiteContent>({
    hero_title: '',
    site_name: '',
    hero_subtitle: '',
    site_description: '',
  });
  const [problemContent, setProblemContent] = useState<ProblemContent>({
    title: '',
    subtitle: '',
    description: '',
    points: [],
    image_url: '',
  });
  const [footerContent, setFooterContent] = useState<FooterContent>({
    facebook_url: '',
    twitter_url: '',
    github_url: '',
    contact_email: '',
    locations: '',
    quick_links: [],
    programs: [],
    copyright_text: '',
  });
  const [saved, setSaved] = useState(false);
  const [contentSaved, setContentSaved] = useState(false);
  const [problemContentSaved, setProblemContentSaved] = useState(false);
  const [footerSaved, setFooterSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [settingsRes, contentRes, problemContentRes, footerRes] = await Promise.all([
          fetch('/api/settings/frontend', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/settings/content', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/settings/problem-content', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/settings/footer', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings(data.data);
        }

        if (contentRes.ok) {
          const data = await contentRes.json();
          setContent(data.data);
        }

        if (problemContentRes.ok) {
          const data = await problemContentRes.json();
          setProblemContent(data.data);
        }

        if (footerRes.ok) {
          const data = await footerRes.json();
          setFooterContent(data.data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sections = [
    { key: 'showHero', label: 'Hero Section', icon: '🎯' },
    { key: 'showProblem', label: 'Problem Section', icon: '⚠️' },
    { key: 'showSolutions', label: 'Solutions Section', icon: '💡' },
    { key: 'showResources', label: 'Resources Hub', icon: '📚' },
    { key: 'showChat', label: 'Specialist Chat', icon: '💬' },
    { key: 'showTeam', label: 'Team Section', icon: '👥' },
    { key: 'showActivities', label: 'Activities Section', icon: '🎨' },
  ];

  const handleToggle = (key: keyof FrontendSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/frontend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Failed to save settings');
      }
    } catch (err) {
      setError('Error saving settings');
      console.error('Save error:', err);
    }
  };

  const handleContentSave = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        setContentSaved(true);
        setTimeout(() => setContentSaved(false), 3000);
      } else {
        setError('Failed to save content');
      }
    } catch (err) {
      setError('Error saving content');
      console.error('Save error:', err);
    }
  };

  const handleProblemContentSave = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/problem-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(problemContent),
      });

      if (response.ok) {
        setProblemContentSaved(true);
        setTimeout(() => setProblemContentSaved(false), 3000);
      } else {
        setError('Failed to save problem content');
      }
    } catch (err) {
      setError('Error saving problem content');
      console.error('Save error:', err);
    }
  };

  const handleFooterSave = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/settings/footer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(footerContent),
      });

      if (response.ok) {
        setFooterSaved(true);
        setTimeout(() => setFooterSaved(false), 3000);
      } else {
        setError('Failed to save footer content');
      }
    } catch (err) {
      setError('Error saving footer content');
      console.error('Save error:', err);
    }
  };

  const addPoint = () => {
    setProblemContent(prev => ({
      ...prev,
      points: [...prev.points, '']
    }));
  };

  const updatePoint = (index: number, value: string) => {
    setProblemContent(prev => ({
      ...prev,
      points: prev.points.map((point, i) => i === index ? value : point)
    }));
  };

  const removePoint = (index: number) => {
    setProblemContent(prev => ({
      ...prev,
      points: prev.points.filter((_, i) => i !== index)
    }));
  };

  const addProgram = () => {
    setFooterContent(prev => ({
      ...prev,
      programs: [...prev.programs, '']
    }));
  };

  const updateProgram = (index: number, value: string) => {
    setFooterContent(prev => ({
      ...prev,
      programs: prev.programs.map((p, i) => i === index ? value : p)
    }));
  };

  const removeProgram = (index: number) => {
    setFooterContent(prev => ({
      ...prev,
      programs: prev.programs.filter((_, i) => i !== index)
    }));
  };

  const addQuickLink = () => {
    setFooterContent(prev => ({
      ...prev,
      quick_links: [...prev.quick_links, { label: '', href: '' }]
    }));
  };

  const updateQuickLink = (index: number, field: 'label' | 'href', value: string) => {
    setFooterContent(prev => ({
      ...prev,
      quick_links: prev.quick_links.map((link, i) => i === index ? { ...link, [field]: value } : link)
    }));
  };

  const removeQuickLink = (index: number) => {
    setFooterContent(prev => ({
      ...prev,
      quick_links: prev.quick_links.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Content Management */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Settings size={20} />
          Site Content Management
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Hero Title
            </label>
            <input
              type="text"
              value={content.hero_title}
              onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Protecting water resources"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Project Name (Site Title)
            </label>
            <input
              type="text"
              value={content.site_name}
              onChange={(e) => setContent({ ...content, site_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Water-Wise Project"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Hero Subtitle
            </label>
            <input
              type="text"
              value={content.hero_subtitle}
              onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Save the Water"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Project Description
            </label>
            <textarea
              value={content.site_description}
              onChange={(e) => setContent({ ...content, site_description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Empowering communities across East Africa..."
            />
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleContentSave}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <Save size={18} />
              Save Content
            </button>
            {contentSaved && (
              <span className="text-green-600 font-medium">✓ Content saved!</span>
            )}
          </div>
        </div>
      </div>

      {/* Problem Section Content Management */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Settings size={20} />
          Problem Section Content Management
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={problemContent.title}
              onChange={(e) => setProblemContent({ ...problemContent, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Water Resource Challenge"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={problemContent.subtitle}
              onChange={(e) => setProblemContent({ ...problemContent, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Critical Challenge"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={problemContent.description}
              onChange={(e) => setProblemContent({ ...problemContent, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="All over the world, the issue of climate change..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={problemContent.image_url}
              onChange={(e) => setProblemContent({ ...problemContent, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Problem Points
            </label>
            <div className="space-y-2">
              {problemContent.points.map((point, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => updatePoint(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder={`Point ${index + 1}`}
                  />
                  <button
                    onClick={() => removePoint(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addPoint}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Point
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleProblemContentSave}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <Save size={18} />
              Save Problem Content
            </button>
            {problemContentSaved && (
              <span className="text-green-600 font-medium">✓ Problem content saved!</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Content Management */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Settings size={20} />
          Footer Content Management
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Facebook URL
              </label>
              <input
                type="text"
                value={footerContent.facebook_url}
                onChange={(e) => setFooterContent({ ...footerContent, facebook_url: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Twitter URL
              </label>
              <input
                type="text"
                value={footerContent.twitter_url}
                onChange={(e) => setFooterContent({ ...footerContent, twitter_url: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="https://twitter.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Github URL
              </label>
              <input
                type="text"
                value={footerContent.github_url}
                onChange={(e) => setFooterContent({ ...footerContent, github_url: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={footerContent.contact_email}
                onChange={(e) => setFooterContent({ ...footerContent, contact_email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="info@waterwise.org"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Locations (pipe separated)
            </label>
            <input
              type="text"
              value={footerContent.locations}
              onChange={(e) => setFooterContent({ ...footerContent, locations: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Kigali, Rwanda | Bujumbura, Burundi | Dar es Salaam, Tanzania"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Copyright Text
            </label>
            <input
              type="text"
              value={footerContent.copyright_text}
              onChange={(e) => setFooterContent({ ...footerContent, copyright_text: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="WATER-WISE PROJECT. SUSTAINING LIFE."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Programs
            </label>
            <div className="space-y-2">
              {footerContent.programs.map((program, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => updateProgram(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder={`Program ${index + 1}`}
                  />
                  <button
                    onClick={() => removeProgram(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addProgram}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Program
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Quick Links
            </label>
            <div className="space-y-2">
              {footerContent.quick_links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateQuickLink(index, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Label"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => updateQuickLink(index, 'href', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Href (e.g. #problem)"
                  />
                  <button
                    onClick={() => removeQuickLink(index)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={addQuickLink}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Quick Link
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleFooterSave}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <Save size={18} />
              Save Footer Content
            </button>
            {footerSaved && (
              <span className="text-green-600 font-medium">✓ Footer content saved!</span>
            )}
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <motion.div
        className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-orange-600" size={24} />
            <div>
              <h3 className="font-semibold text-slate-900">Maintenance Mode</h3>
              <p className="text-sm text-slate-600">
                Enable to show maintenance message to users
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('maintenanceMode')}
            className="transition-all"
          >
            {settings.maintenanceMode ? (
              <ToggleRight className="text-orange-600" size={32} />
            ) : (
              <ToggleLeft className="text-slate-300" size={32} />
            )}
          </button>
        </div>
      </motion.div>

      {/* Dark Mode */}
      <motion.div
        className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 border border-purple-200 dark:border-purple-700 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.darkMode ? (
              <Moon className="text-purple-600" size={24} />
            ) : (
              <Sun className="text-yellow-600" size={24} />
            )}
            <div>
              <h3 className="font-semibold text-slate-900">Dark Mode</h3>
              <p className="text-sm text-slate-600">
                Enable dark theme for the frontend
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('darkMode')}
            className="transition-all"
          >
            {settings.darkMode ? (
              <ToggleRight className="text-purple-600" size={32} />
            ) : (
              <ToggleLeft className="text-slate-300" size={32} />
            )}
          </button>
        </div>
      </motion.div>

      {/* Frontend Sections */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Settings size={20} />
          Frontend Sections Control
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => {
            const key = section.key as keyof FrontendSettings;
            const isEnabled = settings[key];

            return (
              <motion.div
                key={section.key}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isEnabled
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
                onClick={() => handleToggle(key)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{section.icon}</span>
                    <div>
                      <p className="font-medium text-slate-900">
                        {section.label}
                      </p>
                      <p className="text-xs text-slate-600">
                        {isEnabled ? 'Visible' : 'Hidden'}
                      </p>
                    </div>
                  </div>
                  {isEnabled ? (
                    <Eye className="text-blue-600" size={20} />
                  ) : (
                    <EyeOff className="text-slate-400" size={20} />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Success Message */}
      {saved && (
        <motion.div
          className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          ✓ Settings saved successfully!
        </motion.div>
      )}

      {/* Save Button */}
      <div className="flex gap-3">
        <motion.button
          onClick={handleSave}
          className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Save size={18} />
          Save Settings
        </motion.button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> Toggle sections to show or hide them from the frontend. 
          Changes will be saved to the server and applied across all user sessions.
        </p>
      </div>
    </div>
  );
};

export default FrontendControls;
