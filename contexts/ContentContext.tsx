import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteContent {
  hero_title: string;
  site_name: string;
  hero_subtitle: string;
  site_description: string;
}

interface ContentContextType {
  siteContent: SiteContent;
  setSiteContent: (content: SiteContent) => void;
  isLoading: boolean;
}

const defaultContent: SiteContent = {
  hero_title: "Protecting water resources",
  site_name: "Water-Wise Project",
  hero_subtitle: "Save the Water",
  site_description: "Empowering communities across East Africa to protect, conserve, and sustain our most precious natural resource through education and action."
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/settings/content');
        const data = await response.json();
        if (data.success && data.data) {
          setSiteContent(data.data);
        }
      } catch (error) {
        console.error('Error fetching site content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <ContentContext.Provider value={{ siteContent, setSiteContent, isLoading }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    // Return default content if used outside of provider to prevent crashes
    return {
      siteContent: defaultContent,
      setSiteContent: () => {},
      isLoading: false
    };
  }
  return context;
};
