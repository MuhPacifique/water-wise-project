import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TranslationProvider } from './contexts/TranslationContext';
import { ContentProvider } from './contexts/ContentContext';
import Home from './components/Home';
import Login from './components/Login';
import AdminPage from './components/AdminPage';
import MaintenanceGuard from './components/MaintenanceGuard';
import EducationalVideos from './components/EducationalVideos';
import InteractiveTutorials from './components/InteractiveTutorials';
import ProfessionalTrainings from './components/ProfessionalTrainings';
import CommunityTestimonies from './components/CommunityTestimonies';
import WaterCampaigns from './components/WaterCampaigns';
import CampaignDetails from './components/CampaignDetails';
import JoinCampaign from './components/JoinCampaign';
import InitiativeDetails from './components/InitiativeDetails';
import VolunteerPage from './components/VolunteerPage';
import DonatePage from './components/DonatePage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TranslationProvider>
          <ContentProvider>
            <ThemeProvider>
              <Routes>
                {/* Public routes outside maintenance mode check (for admins) */}
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<AdminPage />} />
                
                {/* Routes protected by MaintenanceGuard */}
                <Route element={<MaintenanceGuard />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/educational-videos" element={<EducationalVideos />} />
                  <Route path="/interactive-tutorials" element={<InteractiveTutorials />} />
                  <Route path="/professional-trainings" element={<ProfessionalTrainings />} />
                  <Route path="/community-testimonies" element={<CommunityTestimonies />} />
                  <Route path="/water-campaigns" element={<WaterCampaigns />} />
                  <Route path="/join-campaign/:id" element={<JoinCampaign />} />
                  <Route path="/campaign-details/:id" element={<CampaignDetails />} />
                  <Route path="/initiative/:id" element={<InitiativeDetails />} />
                  <Route path="/volunteer" element={<VolunteerPage />} />
                  <Route path="/donate" element={<DonatePage />} />
                </Route>
              </Routes>
            </ThemeProvider>
          </ContentProvider>
        </TranslationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
