import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FrontendControls from './FrontendControls';
import {
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  LogOut,
  Shield,
  AlertCircle,
  Loader,
  Trash2,
  Edit,
  Plus,
  Settings,
  Database,
  RotateCcw,
  Star,
  Video,
  Megaphone,
  Menu,
  X,
  ClipboardList,
  ExternalLink,
  Info
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  type: string;
  file_url: string;
  thumbnail_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  category: string | null;
  tags: string | null;
  language: string;
  is_featured: boolean;
  is_public: boolean;
  download_count: number;
  view_count: number;
  created_at: string;
  deleted_at: string | null;
  uploaded_by_name: string | null;
  translated_title: string;
  translated_description: string;
}

interface ChatMessage {
  id: number;
  user_id: number;
  user_name: string;
  message: string;
  timestamp: string;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  category: string | null;
  difficulty: string;
  language: string;
  is_active: boolean;
  created_at: string;
}

interface Training {
  id: number;
  title: string;
  description: string;
  document_url: string;
  thumbnail_url: string | null;
  category: string | null;
  difficulty: string;
  language: string;
  is_active: boolean;
  created_at: string;
}

interface Testimony {
  id: number;
  name: string;
  location: string | null;
  text: string;
  likes: number;
  is_active: boolean;
  created_at: string;
}

interface Campaign {
  id: number;
  title: string;
  location: string | null;
  date: string | null;
  participants: number;
  status: string;
  campaign_type: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface TeamMember {
  id: number;
  name: string;
  country: string;
  role: string | null;
  image_url: string | null;
  bio: string | null;
  social_links: any;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface Registration {
  id: number;
  campaign_id: number;
  campaign_title: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  experience: string | null;
  created_at: string;
}

interface AnalyticsData {
  totalUsers: number;
  totalResources: number;
  totalMessages: number;
  activeUsers: number;
}

interface DatabaseTable {
  name: string;
  rowCount: number | null;
}

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  key: string;
  default: any;
  extra: string;
}

interface TableData {
  tableName: string;
  rows: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const AdminPage: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalResources: 0,
    totalMessages: 0,
    activeUsers: 0
  });
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([]);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [primaryKey, setPrimaryKey] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [showTableModal, setShowTableModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showEditResourceModal, setShowEditResourceModal] = useState(false);
  const [showAddTutorialModal, setShowAddTutorialModal] = useState(false);
  const [showEditTutorialModal, setShowEditTutorialModal] = useState(false);
  const [showAddTrainingModal, setShowAddTrainingModal] = useState(false);
  const [showEditTrainingModal, setShowEditTrainingModal] = useState(false);
  const [showAddTestimonyModal, setShowAddTestimonyModal] = useState(false);
  const [showEditTestimonyModal, setShowEditTestimonyModal] = useState(false);
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [showEditCampaignModal, setShowEditCampaignModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [editingTestimony, setEditingTestimony] = useState<Testimony | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'document',
    category: '',
    tags: '',
    language: 'en',
    isPublic: true,
    isFeatured: false,
    file: null as File | null,
    thumbnail: null as File | null,
    file_url: '',
    thumbnail_url: ''
  });
  const [newTutorial, setNewTutorial] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: 0,
    category: '',
    difficulty: 'beginner',
    language: 'en',
    video: null as File | null,
    thumbnail: null as File | null
  });
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    language: 'en',
    document: null as File | null,
    thumbnail: null as File | null,
    document_url: '',
    thumbnail_url: ''
  });
  const [newTestimony, setNewTestimony] = useState({
    name: '',
    location: '',
    text: '',
    is_active: true
  });
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    location: '',
    date: '',
    participants: 0,
    status: 'Planned',
    campaign_type: 'Awareness',
    image_url: '',
    image: null as File | null,
    is_active: true
  });
  const [newTeamMember, setNewTeamMember] = useState({
    name: '',
    country: '',
    role: '',
    bio: '',
    display_order: 0,
    image_url: '',
    image: null as File | null
  });
  const [editingCampaignFiles, setEditingCampaignFiles] = useState({
    image: null as File | null
  });
  const [editingResourceFiles, setEditingResourceFiles] = useState({
    file: null as File | null,
    thumbnail: null as File | null
  });
  const [editingTutorialFiles, setEditingTutorialFiles] = useState({
    video: null as File | null,
    thumbnail: null as File | null
  });
  const [editingTrainingFiles, setEditingTrainingFiles] = useState({
    document: null as File | null,
    thumbnail: null as File | null
  });
  const [editingTeamFiles, setEditingTeamFiles] = useState({
    image: null as File | null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login', { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Load dashboard data when user is authenticated
  useEffect(() => {
    if (user && activeTab === 'dashboard') {
      fetchAnalytics();
    } else if (user && activeTab === 'users') {
      fetchUsers();
    } else if (user && activeTab === 'resources') {
      fetchResources();
    } else if (user && activeTab === 'tutorials') {
      fetchTutorials();
    } else if (user && activeTab === 'trainings') {
      fetchTrainings();
    } else if (user && activeTab === 'testimonies') {
      fetchTestimonies();
    } else if (user && activeTab === 'campaigns') {
      fetchCampaigns();
    } else if (user && activeTab === 'team') {
      fetchTeamMembers();
    } else if (user && activeTab === 'registrations') {
      fetchRegistrations();
    } else if (user && activeTab === 'chat') {
      fetchMessages();
    } else if (user && activeTab === 'database') {
      fetchDatabaseTables();
    }
  }, [user, activeTab, showArchived]);

  // If not authenticated, redirect immediately
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-slate-600">Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'tutorials', label: 'Tutorials', icon: Video },
    { id: 'trainings', label: 'Trainings', icon: FileText },
    { id: 'testimonies', label: 'Testimonies', icon: MessageSquare },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'registrations', label: 'Volunteer Registration', icon: ClipboardList },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'frontend', label: 'Frontend Controls', icon: Settings },
  ];

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        try {
          const data = await response.json();
          setAnalytics(data.data);
        } catch (jsonError) {
          console.error('Failed to parse JSON response from analytics:', jsonError);
          setError('Failed to parse analytics data');
        }
      } else {
        // If endpoint doesn't exist, show demo data
        console.warn('Analytics endpoint not available, using demo data');
        setAnalytics({
          totalUsers: 5,
          totalResources: 12,
          totalMessages: 48,
          activeUsers: 3
        });
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setAnalytics({
        totalUsers: 5,
        totalResources: 12,
        totalMessages: 48,
        activeUsers: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users || []);
      } else {
        setError('Failed to fetch users');
        setUsers([]);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resources/admin?includeDeleted=${showArchived}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        try {
          const data = await response.json();
          setResources(data.data.resources || []);
        } catch (jsonError) {
          console.error('Failed to parse JSON response from resources:', jsonError);
          setResources([
            {
              id: 1,
              title: "Water Conservation Guide",
              description: "Essential tips for saving water.",
              type: "document",
              file_url: "#",
              thumbnail_url: null,
              file_size: 1024,
              mime_type: "application/pdf",
              category: "Guides",
              tags: "water, conservation",
              language: "en",
              is_featured: true,
              is_public: true,
              download_count: 5,
              view_count: 10,
              created_at: new Date().toISOString(),
              deleted_at: null,
              uploaded_by_name: "Admin",
              translated_title: "Water Conservation Guide",
              translated_description: "Essential tips for saving water."
            }
          ]);
        }
      } else {
        console.warn('Resources endpoint failed, using mock data');
        setResources([
          {
            id: 1,
            title: "Water Conservation Guide",
            description: "Essential tips for saving water.",
            type: "document",
            file_url: "#",
            thumbnail_url: null,
            file_size: 1024,
            mime_type: "application/pdf",
            category: "Guides",
            tags: "water, conservation",
            language: "en",
            is_featured: true,
            is_public: true,
            download_count: 5,
            view_count: 10,
            created_at: new Date().toISOString(),
            deleted_at: null,
            uploaded_by_name: "Admin",
            translated_title: "Water Conservation Guide",
            translated_description: "Essential tips for saving water."
          }
        ]);
      }
    } catch (err) {
      console.error('Fetch resources error:', err);
      setResources([
        {
          id: 1,
          title: "Water Conservation Guide",
          description: "Essential tips for saving water.",
          type: "document",
          file_url: "#",
          thumbnail_url: null,
          file_size: 1024,
          mime_type: "application/pdf",
          category: "Guides",
          tags: "water, conservation",
          language: "en",
          is_featured: true,
          is_public: true,
          download_count: 5,
          view_count: 10,
          created_at: new Date().toISOString(),
          deleted_at: null,
          uploaded_by_name: "Admin",
          translated_title: "Water Conservation Guide",
          translated_description: "Essential tips for saving water."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorials = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tutorials', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTutorials(data.data.tutorials || []);
      } else {
        setError('Failed to fetch tutorials');
      }
    } catch (err) {
      console.error('Fetch tutorials error:', err);
      setError('Failed to fetch tutorials');
    } finally {
      setLoading(false);
    }
  };

  const addTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      // Append all fields to FormData
      formData.append('title', newTutorial.title);
      formData.append('description', newTutorial.description);
      formData.append('difficulty', newTutorial.difficulty);
      formData.append('language', newTutorial.language);
      formData.append('duration', newTutorial.duration.toString());
      formData.append('category', newTutorial.category);
      
      if (newTutorial.video_url) formData.append('video_url', newTutorial.video_url);
      if (newTutorial.thumbnail_url) formData.append('thumbnail_url', newTutorial.thumbnail_url);
      
      if (newTutorial.video) formData.append('video', newTutorial.video);
      if (newTutorial.thumbnail) formData.append('thumbnail', newTutorial.thumbnail);

      const response = await fetch('/api/tutorials', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        setShowAddTutorialModal(false);
        setNewTutorial({
          title: '',
          description: '',
          video_url: '',
          thumbnail_url: '',
          duration: 0,
          category: '',
          difficulty: 'beginner',
          language: 'en',
          video: null,
          thumbnail: null
        });
        fetchTutorials();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add tutorial');
      }
    } catch (err) {
      setError('Failed to add tutorial');
    } finally {
      setLoading(false);
    }
  };

  const updateTutorial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTutorial) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('title', editingTutorial.title);
      formData.append('description', editingTutorial.description);
      formData.append('difficulty', editingTutorial.difficulty);
      formData.append('language', editingTutorial.language);
      formData.append('duration', (editingTutorial.duration || 0).toString());
      formData.append('category', editingTutorial.category || '');
      formData.append('is_active', editingTutorial.is_active.toString());
      
      if (editingTutorial.video_url) formData.append('video_url', editingTutorial.video_url);
      if (editingTutorial.thumbnail_url) formData.append('thumbnail_url', editingTutorial.thumbnail_url);
      
      if (editingTutorialFiles.video) formData.append('video', editingTutorialFiles.video);
      if (editingTutorialFiles.thumbnail) formData.append('thumbnail', editingTutorialFiles.thumbnail);

      const response = await fetch(`/api/tutorials/${editingTutorial.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        setShowEditTutorialModal(false);
        setEditingTutorial(null);
        setEditingTutorialFiles({ video: null, thumbnail: null });
        fetchTutorials();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update tutorial');
      }
    } catch (err) {
      setError('Failed to update tutorial');
    } finally {
      setLoading(false);
    }
  };

  const deleteTutorial = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tutorial?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tutorials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchTutorials();
      } else {
        setError('Failed to delete tutorial');
      }
    } catch (err) {
      setError('Failed to delete tutorial');
    }
  };

  const fetchTrainings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/professional-trainings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTrainings(data.data.trainings || []);
      } else {
        setError('Failed to fetch trainings');
      }
    } catch (err) {
      console.error('Fetch trainings error:', err);
      setError('Failed to fetch trainings');
    } finally {
      setLoading(false);
    }
  };

  const addTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('title', newTraining.title);
      formData.append('description', newTraining.description);
      formData.append('difficulty', newTraining.difficulty);
      formData.append('language', newTraining.language);
      formData.append('category', newTraining.category);
      
      if (newTraining.document) formData.append('document', newTraining.document);
      if (newTraining.thumbnail) formData.append('thumbnail', newTraining.thumbnail);
      
      if (newTraining.document_url) formData.append('document_url', newTraining.document_url);
      if (newTraining.thumbnail_url) formData.append('thumbnail_url', newTraining.thumbnail_url);

      const response = await fetch('/api/professional-trainings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        setShowAddTrainingModal(false);
        setNewTraining({
          title: '',
          description: '',
          category: '',
          difficulty: 'beginner',
          language: 'en',
          document: null,
          thumbnail: null,
          document_url: '',
          thumbnail_url: ''
        });
        fetchTrainings();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add training');
      }
    } catch (err) {
      setError('Failed to add training');
    } finally {
      setLoading(false);
    }
  };

  const updateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTraining) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('title', editingTraining.title);
      formData.append('description', editingTraining.description);
      formData.append('difficulty', editingTraining.difficulty);
      formData.append('language', editingTraining.language);
      formData.append('category', editingTraining.category || '');
      formData.append('is_active', editingTraining.is_active.toString());
      
      if (editingTrainingFiles.document) formData.append('document', editingTrainingFiles.document);
      if (editingTrainingFiles.thumbnail) formData.append('thumbnail', editingTrainingFiles.thumbnail);

      if (editingTraining.document_url) formData.append('document_url', editingTraining.document_url);
      if (editingTraining.thumbnail_url) formData.append('thumbnail_url', editingTraining.thumbnail_url || '');

      const response = await fetch(`/api/professional-trainings/${editingTraining.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        setShowEditTrainingModal(false);
        setEditingTraining(null);
        setEditingTrainingFiles({ document: null, thumbnail: null });
        fetchTrainings();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update training');
      }
    } catch (err) {
      setError('Failed to update training');
    } finally {
      setLoading(false);
    }
  };

  const deleteTraining = async (id: number) => {
    if (!confirm('Are you sure you want to delete this training?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/professional-trainings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchTrainings();
      } else {
        setError('Failed to delete training');
      }
    } catch (err) {
      setError('Failed to delete training');
    }
  };

  const fetchTestimonies = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/community/testimonies/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTestimonies(data.data || []);
      } else {
        setError('Failed to fetch testimonies');
      }
    } catch (err) {
      console.error('Fetch testimonies error:', err);
      setError('Failed to fetch testimonies');
    } finally {
      setLoading(false);
    }
  };

  const addTestimony = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/community/testimonies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTestimony)
      });
      if (response.ok) {
        setShowAddTestimonyModal(false);
        setNewTestimony({ name: '', location: '', text: '', is_active: true });
        fetchTestimonies();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add testimony');
      }
    } catch (err) {
      setError('Failed to add testimony');
    } finally {
      setLoading(false);
    }
  };

  const updateTestimony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimony) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/community/testimonies/${editingTestimony.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingTestimony)
      });
      if (response.ok) {
        setShowEditTestimonyModal(false);
        setEditingTestimony(null);
        fetchTestimonies();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update testimony');
      }
    } catch (err) {
      setError('Failed to update testimony');
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimony = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimony?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/community/testimonies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchTestimonies();
      } else {
        setError('Failed to delete testimony');
      }
    } catch (err) {
      setError('Failed to delete testimony');
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/community/campaigns/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.data || []);
      } else {
        console.warn('Campaigns endpoint failed, using mock data');
        setCampaigns([
          {
            id: 1,
            title: "Clean River Mara Initiative",
            location: "Bomet, Kenya",
            date: "Feb 15, 2026",
            participants: 150,
            status: "Upcoming",
            campaign_type: "Plastic Collection",
            image_url: "https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?auto=format&fit=crop&q=80&w=800",
            is_active: true
          }
        ]);
      }
    } catch (err) {
      console.error('Fetch campaigns error:', err);
      setCampaigns([
        {
          id: 1,
          title: "Clean River Mara Initiative",
          location: "Bomet, Kenya",
          date: "Feb 15, 2026",
          participants: 150,
          status: "Upcoming",
          campaign_type: "Plastic Collection",
          image_url: "https://images.unsplash.com/photo-1541675154750-0444c7d51e8e?auto=format&fit=crop&q=80&w=800",
          is_active: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/team', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.data || []);
      } else {
        console.warn('Team endpoint failed, using mock data');
        setTeamMembers([
          {
            id: 1,
            name: "Dr. Sarah Johnson",
            country: "Kenya",
            role: "Water Conservation Specialist",
            image_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
            bio: "Leading expert in sustainable water management.",
            display_order: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            social_links: {}
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/community/registrations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.data || []);
      } else {
        setError('Failed to fetch registrations');
      }
    } catch (err) {
      console.error('Fetch registrations error:', err);
      setError('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const addTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('name', newTeamMember.name);
      formData.append('country', newTeamMember.country);
      formData.append('role', newTeamMember.role);
      formData.append('bio', newTeamMember.bio);
      formData.append('display_order', newTeamMember.display_order.toString());
      
      if (newTeamMember.image_url) formData.append('image_url', newTeamMember.image_url);
      if (newTeamMember.image) formData.append('image', newTeamMember.image);

      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        setShowAddTeamModal(false);
        setNewTeamMember({
          name: '',
          country: '',
          role: '',
          bio: '',
          display_order: 0,
          image_url: '',
          image: null
        });
        fetchTeamMembers();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add team member');
      }
    } catch (err) {
      setError('Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const updateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('name', editingRecord.name);
      formData.append('country', editingRecord.country);
      formData.append('role', editingRecord.role || '');
      formData.append('bio', editingRecord.bio || '');
      formData.append('display_order', (editingRecord.display_order || 0).toString());
      formData.append('is_active', editingRecord.is_active.toString());
      
      if (editingRecord.image_url) formData.append('image_url', editingRecord.image_url);
      if (editingTeamFiles.image) formData.append('image', editingTeamFiles.image);

      const response = await fetch(`/api/team/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        setShowEditTeamModal(false);
        setEditingRecord(null);
        setEditingTeamFiles({ image: null });
        fetchTeamMembers();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update team member');
      }
    } catch (err) {
      setError('Failed to update team member');
    } finally {
      setLoading(false);
    }
  };

  const deleteTeamMember = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchTeamMembers();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete team member');
      }
    } catch (err) {
      setError('Failed to delete team member');
    } finally {
      setLoading(false);
    }
  };

  const addCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('title', newCampaign.title);
      formData.append('location', newCampaign.location);
      formData.append('date', newCampaign.date);
      formData.append('participants', newCampaign.participants.toString());
      formData.append('status', newCampaign.status);
      
      if (newCampaign.image_url) formData.append('image_url', newCampaign.image_url);
      if (newCampaign.image) formData.append('image', newCampaign.image);

      const response = await fetch('/api/community/campaigns', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        setShowAddCampaignModal(false);
        setNewCampaign({
          title: '',
          location: '',
          date: '',
          participants: 0,
          status: 'Planned',
          image_url: '',
          image: null,
          is_active: true
        });
        fetchCampaigns();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add campaign');
      }
    } catch (err) {
      setError('Failed to add campaign');
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('title', editingCampaign.title);
      formData.append('location', editingCampaign.location || '');
      formData.append('date', editingCampaign.date || '');
      formData.append('participants', (editingCampaign.participants || 0).toString());
      formData.append('status', editingCampaign.status);
      formData.append('is_active', editingCampaign.is_active.toString());
      
      if (editingCampaign.image_url) formData.append('image_url', editingCampaign.image_url);
      if (editingCampaignFiles.image) formData.append('image', editingCampaignFiles.image);

      const response = await fetch(`/api/community/campaigns/${editingCampaign.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      if (response.ok) {
        setShowEditCampaignModal(false);
        setEditingCampaign(null);
        setEditingCampaignFiles({ image: null });
        fetchCampaigns();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update campaign');
      }
    } catch (err) {
      setError('Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: number) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/community/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchCampaigns();
      } else {
        setError('Failed to delete campaign');
      }
    } catch (err) {
      setError('Failed to delete campaign');
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/messages', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      } else {
        console.warn('Failed to fetch messages:', response.status);
        setMessages([]);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteRegistration = async (id: number) => {
    if (!confirm('Are you sure you want to delete this registration?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/community/registrations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchRegistrations();
      } else {
        setError('Failed to delete registration');
      }
    } catch (err) {
      setError('Failed to delete registration');
    }
  };

  const fetchDatabaseTables = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analytics/tables', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDatabaseTables(data.data || []);
      } else {
        setError('Failed to fetch database tables');
        setDatabaseTables([]);
      }
    } catch (err) {
      console.error('Fetch database tables error:', err);
      setError('Failed to fetch database tables');
      setDatabaseTables([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const deleteResource = async (resourceId: number) => {
    if (!confirm('Are you sure you want to archive this resource? It will be hidden from the public but kept in the database.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        // Refresh resources list to show updated status
        fetchResources();
      }
    } catch (err) {
      setError('Failed to archive resource');
    }
  };

  const restoreResource = async (resourceId: number) => {
    if (!confirm('Are you sure you want to restore this resource? It will become public again.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resources/${resourceId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchResources();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to restore resource');
      }
    } catch (err) {
      setError('Failed to restore resource');
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setMessages(messages.filter(m => m.id !== messageId));
      }
    } catch (err) {
      setError('Failed to delete message');
    }
  };

  const viewTableData = async (tableName: string, page: number = 1) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/tables/${tableName}?page=${page}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTableData(data.data);
        setSelectedTable(tableName);
        setShowTableModal(true);

        // Fetch schema to get primary key
        await fetchTableSchema(tableName);
      } else {
        setError('Failed to fetch table data');
      }
    } catch (err) {
      console.error('Fetch table data error:', err);
      setError('Failed to fetch table data');
    } finally {
      setLoading(false);
    }
  };

  const fetchTableSchema = async (tableName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/tables/${tableName}/schema`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTableColumns(data.data.columns);
        // Find primary key
        const pkColumn = data.data.columns.find((col: TableColumn) => col.key === 'PRI');
        if (pkColumn) {
          setPrimaryKey(pkColumn.name);
        }
      }
    } catch (err) {
      console.error('Fetch table schema error:', err);
    }
  };

  const deleteTableRecord = async (tableName: string, recordId: any) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/tables/${tableName}/${recordId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        // Refresh table data
        if (tableData) {
          viewTableData(tableName, tableData.pagination.page);
        }
      } else {
        // Try to get error message from response
        try {
          const errorData = await response.json();
          setError(errorData.error?.message || 'Failed to delete record');
        } catch {
          setError('Failed to delete record');
        }
      }
    } catch (err) {
      setError('Failed to delete record');
    }
  };

  const updateTableRecord = async (tableName: string, recordId: any, updateData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/tables/${tableName}/${recordId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData),
      });
      if (response.ok) {
        setShowEditModal(false);
        setEditingRecord(null);
        // Refresh table data
        if (tableData) {
          viewTableData(tableName, tableData.pagination.page);
        }
      } else {
        setError('Failed to update record');
      }
    } catch (err) {
      setError('Failed to update record');
    }
  };

  const insertTableRecord = async (tableName: string, insertData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics/tables/${tableName}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(insertData),
      });
      if (response.ok) {
        setShowAddModal(false);
        // Refresh table data
        if (tableData) {
          viewTableData(tableName, tableData.pagination.page);
        }
      } else {
        setError('Failed to insert record');
      }
    } catch (err) {
      setError('Failed to insert record');
    }
  };

  const openEditModal = (record: any) => {
    setEditingRecord(record);
    setShowEditModal(true);
  };

  const openAddModal = async () => {
    await fetchTableSchema(selectedTable);
    setShowAddModal(true);
  };

  const openUserEditModal = (user: User) => {
    setEditingUser(user);
    setShowUserEditModal(true);
  };

  const updateUser = async (userId: number, updateData: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData),
      });
      if (response.ok) {
        setShowUserEditModal(false);
        setEditingUser(null);
        // Refresh users list
        fetchUsers();
      } else {
        setError('Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const addResource = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newResource.type !== 'link' && !newResource.file) {
      setError('File is required for document, video, and image resources');
      return;
    }

    const formData = new FormData();
    formData.append('title', newResource.title);
    formData.append('description', newResource.description);
    formData.append('type', newResource.type);
    formData.append('category', newResource.category);
    formData.append('tags', newResource.tags);
    formData.append('language', newResource.language);
    formData.append('isPublic', newResource.isPublic.toString());
    formData.append('isFeatured', newResource.isFeatured.toString());
    if (newResource.file) {
      formData.append('file', newResource.file);
    }
    if (newResource.thumbnail) {
      formData.append('thumbnail', newResource.thumbnail);
    }
    if (newResource.file_url) {
      formData.append('file_url', newResource.file_url);
    }
    if (newResource.thumbnail_url) {
      formData.append('thumbnail_url', newResource.thumbnail_url);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // IMPORTANT: No 'Content-Type' header here
        },
        body: formData,
      });

      if (!response.ok) {
        // Try to get error details from the server response
        let errorMessage = 'Failed to add resource';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors && Array.isArray(errorData.errors)) {
            // Handle validation errors
            errorMessage = errorData.errors.map((err: any) => err.msg || err.message).join(', ');
          }
        } catch (parseError) {
          // If JSON parsing fails, try to get text
          try {
            const errorText = await response.text();
            console.error('Server Error Details:', errorText);
            errorMessage = `Server error (${response.status}): ${errorText}`;
          } catch (textError) {
            errorMessage = `Server error (${response.status}): ${response.statusText || 'Unknown error'}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Success:', data);
      setError('');
      setShowAddResourceModal(false);
      setNewResource({
        title: '',
        description: '',
        type: 'document',
        category: '',
        tags: '',
        language: 'en',
        isPublic: true,
        isFeatured: false,
        file: null,
        thumbnail: null,
        file_url: '',
        thumbnail_url: ''
      });
      // Refresh resources list
      fetchResources();
    } catch (err) {
      console.error('Add resource error:', err);
      setError(err instanceof Error ? err.message : 'Failed to add resource');
    }
  };

  const openEditResourceModal = (resource: Resource) => {
    setError('');
    setEditingResource(resource);
    setShowEditResourceModal(true);
  };

  const updateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Ensure boolean values are correctly sent
    const isPublic = form.querySelector('input[name="isPublic"][type="checkbox"]') as HTMLInputElement;
    if (isPublic) {
      formData.set('isPublic', isPublic.checked ? 'true' : 'false');
    }
    const isFeatured = form.querySelector('input[name="isFeatured"][type="checkbox"]') as HTMLInputElement;
    if (isFeatured) {
      formData.set('isFeatured', isFeatured.checked ? 'true' : 'false');
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/resources/${editingResource.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // IMPORTANT: No 'Content-Type' header here for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to update resource';
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Handle validation errors
            errorMessage = errorData.errors.map((err: any) => err.msg || err.message).join(', ');
          }
        } catch (parseError) {
          errorMessage = `Server error (${response.status}): ${response.statusText || 'Unknown error'}`;
        }
        throw new Error(errorMessage);
      }

      setError('');
      setShowEditResourceModal(false);
      setEditingResource(null);
      // Refresh resources list
      fetchResources();
    } catch (err) {
      console.error('Update resource error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update resource');
    }
  };



  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-600">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">
              {analytics?.totalUsers || 0}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FileText className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-600">Resources</p>
            <p className="text-2xl font-bold text-slate-900">
              {analytics?.totalResources || 0}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-600">Chat Messages</p>
            <p className="text-2xl font-bold text-slate-900">
              {analytics?.totalMessages || 0}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Shield className="text-orange-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-600">Active Users</p>
            <p className="text-2xl font-bold text-slate-900">
              {analytics?.activeUsers || 0}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">User Management</h3>
      </div>
      {users.length === 0 ? (
        <div className="p-12 text-center">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-600 mb-2">No users found</p>
          <p className="text-sm text-slate-500">Users will appear here when they register</p>
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button
                    onClick={() => openUserEditModal(user)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );

  const renderResources = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-slate-900">Resource Management</h3>
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600 font-medium">Show Archived</span>
          </label>
        </div>
        <button
          onClick={() => {
            setError('');
            setShowAddResourceModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Resource
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                File URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {resources.map((resource) => (
              <tr key={resource.id} className={resource.deleted_at ? 'bg-slate-50/50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {resource.translated_title || resource.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {resource.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {resource.category || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {resource.is_featured ? (
                    <span className="flex items-center gap-1 text-yellow-600 font-bold">
                      <Star size={14} fill="currentColor" />
                      Yes
                    </span>
                  ) : (
                    'No'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {resource.deleted_at ? (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Archived</span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {resource.file_url ? (
                    <a href={`/api/resources/${resource.id}/view`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View File
                    </a>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button
                    onClick={() => openEditResourceModal(resource)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                    title="Edit Resource"
                  >
                    <Edit size={16} />
                  </button>
                  {resource.deleted_at ? (
                    <button
                      onClick={() => restoreResource(resource.id)}
                      className="text-green-600 hover:text-green-900 transition-colors"
                      title="Restore Resource"
                    >
                      <RotateCcw size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => deleteResource(resource.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Archive Resource"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {resources.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  No resources found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTutorials = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Tutorial Management</h3>
        <button
          onClick={() => {
            setError('');
            setShowAddTutorialModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Tutorial
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Language</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {tutorials.map((tutorial) => (
              <tr key={tutorial.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{tutorial.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{tutorial.category || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{tutorial.difficulty}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{tutorial.language}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${tutorial.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {tutorial.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button
                    onClick={() => {
                      setEditingTutorial(tutorial);
                      setShowEditTutorialModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteTutorial(tutorial.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTrainings = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Professional Training Management</h3>
        <button
          onClick={() => {
            setError('');
            setShowAddTrainingModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Training
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Language</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {trainings.map((training) => (
              <tr key={training.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{training.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{training.category || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{training.difficulty}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{training.language}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${training.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {training.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button
                    onClick={() => {
                      setEditingTraining(training);
                      setShowEditTrainingModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteTraining(training.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTestimonies = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Community Testimony Management</h3>
        <button
          onClick={() => {
            setError('');
            setShowAddTestimonyModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Testimony
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Text</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {testimonies.map((testimony) => (
              <tr key={testimony.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{testimony.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{testimony.location || 'N/A'}</td>
                <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{testimony.text}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${testimony.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {testimony.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button
                    onClick={() => {
                      setEditingTestimony(testimony);
                      setShowEditTestimonyModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteTestimony(testimony.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Water Campaign Management</h3>
        <button
          onClick={() => {
            setError('');
            setShowAddCampaignModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Campaign
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{campaign.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{campaign.location || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{campaign.date || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <a
                    href={`/join-campaign/${campaign.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-900"
                    title="View Registration Form"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => {
                      setEditingCampaign(campaign);
                      setShowEditCampaignModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Visionary Team Management</h3>
        <button
          onClick={() => {
            setError('');
            setShowAddTeamModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Country</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {teamMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{member.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{member.country}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{member.role || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{member.display_order}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button
                    onClick={() => {
                      setEditingRecord(member);
                      setShowEditTeamModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => deleteTeamMember(member.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRegistrations = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Volunteer Registration</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Full Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Volunteer Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-slate-500">No registrations found</td>
              </tr>
            ) : (
              registrations.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{registration.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{registration.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {registration.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      {registration.campaign_title}
                      <a 
                        href={`/join-campaign/${registration.campaign_id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="View Registration Form"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(registration.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRegistration(registration);
                        setShowRegistrationModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      onClick={() => deleteRegistration(registration.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Registration"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Chat Message Management</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="p-4 border-b border-slate-100 hover:bg-slate-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900">{message.user_name}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-700">{message.message}</p>
              </div>
              <button
                onClick={() => deleteMessage(message.id)}
                className="text-red-600 hover:text-red-900 ml-4"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDatabase = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Database Tables</h3>
        <p className="text-sm text-slate-600 mt-1">Overview of all tables in the database with their row counts</p>
      </div>
      {databaseTables.length === 0 ? (
        <div className="p-12 text-center">
          <Database size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-600 mb-2">No tables found</p>
          <p className="text-sm text-slate-500">Database tables will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Table Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Row Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {databaseTables.map((table) => (
                <tr key={table.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {table.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {table.rowCount !== null ? table.rowCount.toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewTableData(table.name)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                    >
                      View Data
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-500 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Shield className="text-blue-600" size={24} />
              <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden md:block">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="bg-white border-t border-slate-200 absolute w-full shadow-lg overflow-y-auto max-h-[calc(100vh-64px)]">
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Tab Indicator */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={24} />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'resources' && renderResources()}
            {activeTab === 'tutorials' && renderTutorials()}
            {activeTab === 'trainings' && renderTrainings()}
            {activeTab === 'testimonies' && renderTestimonies()}
            {activeTab === 'campaigns' && renderCampaigns()}
            {activeTab === 'team' && renderTeam()}
            {activeTab === 'registrations' && renderRegistrations()}
            {activeTab === 'chat' && renderChat()}
            {activeTab === 'database' && renderDatabase()}
            {activeTab === 'frontend' && <FrontendControls />}
          </>
        )}

        {/* Table Data Modal */}
        {showTableModal && tableData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">
                  Table: {tableData.tableName}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={openAddModal}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Record
                  </button>
                  <button
                    onClick={() => setShowTableModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <div className="mb-4 flex justify-between items-center">
                  <div className="text-sm text-slate-600">
                    Showing {tableData.rows.length} of {tableData.pagination.total} records
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewTableData(tableData.tableName, tableData.pagination.page - 1)}
                      disabled={tableData.pagination.page <= 1}
                      className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1">
                      Page {tableData.pagination.page} of {tableData.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => viewTableData(tableData.tableName, tableData.pagination.page + 1)}
                      disabled={tableData.pagination.page >= tableData.pagination.totalPages}
                      className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        {Object.keys(tableData.rows[0] || {}).map((column) => (
                          <th key={column} className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {column}
                          </th>
                        ))}
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {tableData.rows.map((row, index) => (
                        <tr key={index}>
                          {Object.entries(row).map(([key, value]) => (
                            <td key={key} className="px-4 py-2 whitespace-nowrap text-sm text-slate-900">
                              {value === null ? 'NULL' : String(value).length > 50 ? String(value).substring(0, 50) + '...' : String(value)}
                            </td>
                          ))}
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium flex gap-2">
                            <button
                              onClick={() => openEditModal(row)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                const pkName = primaryKey || (row.id !== undefined ? 'id' : Object.keys(row)[0]);
                                const recordId = row[pkName];
                                deleteTableRecord(tableData.tableName, recordId);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Edit Record</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const updateData: any = {};
                  for (let [key, value] of formData.entries()) {
                    updateData[key] = value;
                  }
                  const pkName = primaryKey || (editingRecord.id !== undefined ? 'id' : Object.keys(editingRecord)[0]);
                  const recordId = editingRecord[pkName];
                  updateTableRecord(selectedTable, recordId, updateData);
                }}>
                  {Object.entries(editingRecord).map(([key, value]) => (
                    <div key={key} className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {key}
                      </label>
                      <input
                        type="text"
                        name={key}
                        defaultValue={value as string}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Add New Record</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const insertData: any = {};
                  for (let [key, value] of formData.entries()) {
                    insertData[key] = value;
                  }
                  insertTableRecord(selectedTable, insertData);
                }}>
                  {tableColumns.map((column) => (
                    <div key={column.name} className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {column.name} {column.nullable ? '(optional)' : '(required)'}
                      </label>
                      <input
                        type="text"
                        name={column.name}
                        placeholder={column.default ? `Default: ${column.default}` : ''}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={!column.nullable}
                      />
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Add Record
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* User Edit Modal */}
        {showUserEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Edit User: {editingUser.name}</h3>
              </div>
              <div className="p-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const updateData: any = {};
                  for (let [key, value] of formData.entries()) {
                    updateData[key] = value;
                  }
                  updateUser(editingUser.id, updateData);
                }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      defaultValue={editingUser.role}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status
                    </label>
                    <select
                      name="is_active"
                      defaultValue={editingUser.is_active ? 'true' : 'false'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Update User
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserEditModal(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Resource Modal */}
        {showAddResourceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Add New Resource</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={addResource}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={newResource.type}
                      onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="document">Document</option>
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="link">Link</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={newResource.category}
                      onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newResource.tags}
                      onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Language
                    </label>
                    <select
                      value={newResource.language}
                      onChange={(e) => setNewResource({ ...newResource, language: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                      <option value="rw">Kinyarwanda</option>
                      <option value="rn">Kirundi</option>
                      <option value="lg">Luganda</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Resource File/URL {newResource.type !== 'link' ? '*' : '(optional for links)'}
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Upload from PC</label>
                        <input
                          type="file"
                          onChange={(e) => setNewResource({ ...newResource, file: e.target.files?.[0] || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                          accept=".pdf,.doc,.docx,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif"
                          required={newResource.type !== 'link' && !newResource.file_url}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use External URL</label>
                        <input
                          type="text"
                          value={newResource.file_url}
                          onChange={(e) => setNewResource({ ...newResource, file_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/document.pdf"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Thumbnail Image
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Upload from PC</label>
                        <input
                          type="file"
                          onChange={(e) => setNewResource({ ...newResource, thumbnail: e.target.files?.[0] || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                          accept="image/*"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Image URL</label>
                        <input
                          type="text"
                          value={newResource.thumbnail_url}
                          onChange={(e) => setNewResource({ ...newResource, thumbnail_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/thumb.jpg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newResource.isPublic}
                        onChange={(e) => setNewResource({ ...newResource, isPublic: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700">Make resource public</span>
                    </label>
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newResource.isFeatured}
                        onChange={(e) => setNewResource({ ...newResource, isFeatured: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700">Feature this resource</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Add Resource
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddResourceModal(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showEditResourceModal && editingResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">Edit Resource: {editingResource.title}</h3>
                <button 
                  onClick={() => {
                    setShowEditResourceModal(false);
                    setEditingResource(null);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <LogOut size={20} className="rotate-180" />
                </button>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={updateResource}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingResource.title}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingResource.description}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Type *
                    </label>
                    <select
                      name="type"
                      defaultValue={editingResource.type}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="document">Document</option>
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="link">Link</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      defaultValue={editingResource.category || ''}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      defaultValue={editingResource.tags || ''}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Language
                    </label>
                    <select
                      name="language"
                      defaultValue={editingResource.language}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                      <option value="rw">Kinyarwanda</option>
                      <option value="rn">Kirundi</option>
                      <option value="lg">Luganda</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Resource File/URL
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Change File (Upload from PC)</label>
                        <input
                          type="file"
                          name="file"
                          onChange={(e) => setEditingResourceFiles({ ...editingResourceFiles, file: e.target.files?.[0] || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                          accept=".pdf,.doc,.docx,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use External URL</label>
                        <input
                          type="text"
                          name="file_url"
                          defaultValue={editingResource.file_url}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/document.pdf"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Thumbnail Image
                    </label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Change Thumbnail (Upload from PC)</label>
                        <input
                          type="file"
                          name="thumbnail"
                          onChange={(e) => setEditingResourceFiles({ ...editingResourceFiles, thumbnail: e.target.files?.[0] || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                          accept="image/*"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Image URL</label>
                        <input
                          type="text"
                          name="thumbnail_url"
                          defaultValue={editingResource.thumbnail_url || ''}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/thumb.jpg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input type="hidden" name="isPublic" value="false" />
                      <input
                        type="checkbox"
                        name="isPublic"
                        value="true"
                        defaultChecked={editingResource.is_public}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700">Make resource public</span>
                    </label>
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input type="hidden" name="isFeatured" value="false" />
                      <input
                        type="checkbox"
                        name="isFeatured"
                        value="true"
                        defaultChecked={editingResource.is_featured}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700">Feature this resource</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Update Resource
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditResourceModal(false);
                        setEditingResource(null);
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Tutorial Modal */}
        {showAddTutorialModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Add New Tutorial</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={addTutorial}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={newTutorial.title}
                      onChange={(e) => setNewTutorial({ ...newTutorial, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={newTutorial.description}
                      onChange={(e) => setNewTutorial({ ...newTutorial, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Video File/URL *</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Upload from PC</label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setNewTutorial({ ...newTutorial, video: e.target.files ? e.target.files[0] : null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                          required={!newTutorial.video_url}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Video URL</label>
                        <input
                          type="url"
                          value={newTutorial.video_url}
                          onChange={(e) => setNewTutorial({ ...newTutorial, video_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/video.mp4"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Thumbnail Image</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Upload from PC</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewTutorial({ ...newTutorial, thumbnail: e.target.files ? e.target.files[0] : null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Thumbnail URL</label>
                        <input
                          type="url"
                          value={newTutorial.thumbnail_url}
                          onChange={(e) => setNewTutorial({ ...newTutorial, thumbnail_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/thumb.jpg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Duration (sec)</label>
                      <input
                        type="number"
                        value={newTutorial.duration}
                        onChange={(e) => setNewTutorial({ ...newTutorial, duration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                      <select
                        value={newTutorial.difficulty}
                        onChange={(e) => setNewTutorial({ ...newTutorial, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                      <input
                        type="text"
                        value={newTutorial.category}
                        onChange={(e) => setNewTutorial({ ...newTutorial, category: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        placeholder="e.g. Conservation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                      <select
                        value={newTutorial.language}
                        onChange={(e) => setNewTutorial({ ...newTutorial, language: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="en">English</option>
                        <option value="sw">Swahili</option>
                        <option value="rw">Kinyarwanda</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Tutorial</button>
                    <button type="button" onClick={() => setShowAddTutorialModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Tutorial Modal */}
        {showEditTutorialModal && editingTutorial && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Edit Tutorial: {editingTutorial.title}</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={updateTutorial}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editingTutorial.title}
                      onChange={(e) => setEditingTutorial({ ...editingTutorial, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={editingTutorial.description}
                      onChange={(e) => setEditingTutorial({ ...editingTutorial, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Video File/URL</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Change Video (Upload from PC)</label>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setEditingTutorialFiles({ ...editingTutorialFiles, video: e.target.files ? e.target.files[0] : null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Video URL</label>
                        <input
                          type="url"
                          value={editingTutorial.video_url}
                          onChange={(e) => setEditingTutorial({ ...editingTutorial, video_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/video.mp4"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Thumbnail Image</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Change Thumbnail (Upload from PC)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditingTutorialFiles({ ...editingTutorialFiles, thumbnail: e.target.files ? e.target.files[0] : null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Thumbnail URL</label>
                        <input
                          type="url"
                          value={editingTutorial.thumbnail_url || ''}
                          onChange={(e) => setEditingTutorial({ ...editingTutorial, thumbnail_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/thumb.jpg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                      <select
                        value={editingTutorial.difficulty}
                        onChange={(e) => setEditingTutorial({ ...editingTutorial, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={editingTutorial.is_active ? 'true' : 'false'}
                        onChange={(e) => setEditingTutorial({ ...editingTutorial, is_active: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Tutorial</button>
                    <button type="button" onClick={() => setShowEditTutorialModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {/* Add Training Modal */}
        {showAddTrainingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Add New Training</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={addTraining}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={newTraining.title}
                      onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={newTraining.description}
                      onChange={(e) => setNewTraining({ ...newTraining, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Document File/URL *</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Upload from PC</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setNewTraining({ ...newTraining, document: e.target.files ? e.target.files[0] : null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                          required={!newTraining.document_url}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Document URL</label>
                        <input
                          type="url"
                          value={newTraining.document_url}
                          onChange={(e) => setNewTraining({ ...newTraining, document_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/document.pdf"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Thumbnail Image</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Upload from PC</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewTraining({ ...newTraining, thumbnail: e.target.files ? e.target.files[0] : null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Thumbnail URL</label>
                        <input
                          type="url"
                          value={newTraining.thumbnail_url}
                          onChange={(e) => setNewTraining({ ...newTraining, thumbnail_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/thumb.jpg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                      <select
                        value={newTraining.difficulty}
                        onChange={(e) => setNewTraining({ ...newTraining, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                      <select
                        value={newTraining.language}
                        onChange={(e) => setNewTraining({ ...newTraining, language: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="en">English</option>
                        <option value="sw">Swahili</option>
                        <option value="rw">Kinyarwanda</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={newTraining.category}
                      onChange={(e) => setNewTraining({ ...newTraining, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="e.g. Policy Development"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add Training</button>
                    <button type="button" onClick={() => setShowAddTrainingModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Training Modal */}
        {showEditTrainingModal && editingTraining && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Edit Training: {editingTraining.title}</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={updateTraining}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editingTraining.title}
                      onChange={(e) => setEditingTraining({ ...editingTraining, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      value={editingTraining.description}
                      onChange={(e) => setEditingTraining({ ...editingTraining, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Document File/URL</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Change Document (Upload from PC)</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setEditingTrainingFiles({ ...editingTrainingFiles, document: e.target.files ? e.target.files[0] : null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Document URL</label>
                        <input
                          type="url"
                          value={editingTraining.document_url}
                          onChange={(e) => setEditingTraining({ ...editingTraining, document_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/document.pdf"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Thumbnail Image</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Change Thumbnail (Upload from PC)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditingTrainingFiles({ ...editingTrainingFiles, thumbnail: e.target.files ? e.target.files[0] : null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Thumbnail URL</label>
                        <input
                          type="url"
                          value={editingTraining.thumbnail_url || ''}
                          onChange={(e) => setEditingTraining({ ...editingTraining, thumbnail_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://example.com/thumb.jpg"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Difficulty</label>
                      <select
                        value={editingTraining.difficulty}
                        onChange={(e) => setEditingTraining({ ...editingTraining, difficulty: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={editingTraining.is_active ? 'true' : 'false'}
                        onChange={(e) => setEditingTraining({ ...editingTraining, is_active: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Update Training</button>
                    <button type="button" onClick={() => setShowEditTrainingModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showAddTestimonyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Add New Testimony</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={addTestimony}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={newTestimony.name}
                      onChange={(e) => setNewTestimony({ ...newTestimony, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={newTestimony.location}
                      onChange={(e) => setNewTestimony({ ...newTestimony, location: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="e.g. Kenya"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Testimony Text *</label>
                    <textarea
                      value={newTestimony.text}
                      onChange={(e) => setNewTestimony({ ...newTestimony, text: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      rows={5}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Testimony</button>
                    <button type="button" onClick={() => setShowAddTestimonyModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showEditTestimonyModal && editingTestimony && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Edit Testimony</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={updateTestimony}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={editingTestimony.name}
                      onChange={(e) => setEditingTestimony({ ...editingTestimony, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editingTestimony.location || ''}
                      onChange={(e) => setEditingTestimony({ ...editingTestimony, location: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Testimony Text *</label>
                    <textarea
                      value={editingTestimony.text}
                      onChange={(e) => setEditingTestimony({ ...editingTestimony, text: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      rows={5}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingTestimony.is_active}
                        onChange={(e) => setEditingTestimony({ ...editingTestimony, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-slate-700">Active</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Testimony</button>
                    <button type="button" onClick={() => setShowEditTestimonyModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showAddCampaignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Add New Campaign</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={addCampaign}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={newCampaign.title}
                      onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={newCampaign.location}
                      onChange={(e) => setNewCampaign({ ...newCampaign, location: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="e.g. Bomet, Kenya"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                      <input
                        type="text"
                        value={newCampaign.date}
                        onChange={(e) => setNewCampaign({ ...newCampaign, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        placeholder="e.g. Feb 15, 2026"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Participants</label>
                      <input
                        type="number"
                        value={newCampaign.participants}
                        onChange={(e) => setNewCampaign({ ...newCampaign, participants: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={newCampaign.status}
                        onChange={(e) => setNewCampaign({ ...newCampaign, status: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="Planned">Planned</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Project Type</label>
                      <select
                        value={newCampaign.campaign_type}
                        onChange={(e) => setNewCampaign({ ...newCampaign, campaign_type: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="Awareness">Awareness</option>
                        <option value="Tree Planting">Tree Planting</option>
                        <option value="Plastic Collection">Plastic Collection</option>
                        <option value="Agroforestry">Agroforestry</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Image</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Upload from PC</label>
                        <input
                          type="file"
                          onChange={(e) => setNewCampaign({ ...newCampaign, image: e.target.files?.[0] || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                          accept="image/*"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Image URL</label>
                        <input
                          type="text"
                          value={newCampaign.image_url}
                          onChange={(e) => setNewCampaign({ ...newCampaign, image_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Campaign</button>
                    <button type="button" onClick={() => setShowAddCampaignModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showEditCampaignModal && editingCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Edit Campaign</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={updateCampaign}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={editingCampaign.title}
                      onChange={(e) => setEditingCampaign({ ...editingCampaign, title: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editingCampaign.location || ''}
                      onChange={(e) => setEditingCampaign({ ...editingCampaign, location: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                      <input
                        type="text"
                        value={editingCampaign.date || ''}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, date: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Participants</label>
                      <input
                        type="number"
                        value={editingCampaign.participants}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, participants: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                      <select
                        value={editingCampaign.status}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, status: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="Planned">Planned</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Project Type</label>
                      <select
                        value={editingCampaign.campaign_type}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, campaign_type: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="Awareness">Awareness</option>
                        <option value="Tree Planting">Tree Planting</option>
                        <option value="Plastic Collection">Plastic Collection</option>
                        <option value="Agroforestry">Agroforestry</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Is Active</label>
                      <select
                        value={editingCampaign.is_active ? 'true' : 'false'}
                        onChange={(e) => setEditingCampaign({ ...editingCampaign, is_active: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Image</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Upload from PC (replaces current)</label>
                        <input
                          type="file"
                          onChange={(e) => setEditingCampaignFiles({ ...editingCampaignFiles, image: e.target.files?.[0] || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                          accept="image/*"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Image URL</label>
                        <input
                          type="text"
                          value={editingCampaign.image_url || ''}
                          onChange={(e) => setEditingCampaign({ ...editingCampaign, image_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Campaign</button>
                    <button type="button" onClick={() => setShowEditCampaignModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Team Member Modal */}
        {showAddTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Add New Team Member</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={addTeamMember}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                      <input
                        type="text"
                        value={newTeamMember.name}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Country *</label>
                      <input
                        type="text"
                        value={newTeamMember.country}
                        onChange={(e) => setNewTeamMember({ ...newTeamMember, country: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <input
                      type="text"
                      value={newTeamMember.role}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      placeholder="e.g. Founder & CEO"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                    <textarea
                      value={newTeamMember.bio}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      rows={3}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={newTeamMember.display_order}
                      onChange={(e) => setNewTeamMember({ ...newTeamMember, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Member Image</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Upload from PC</label>
                        <input
                          type="file"
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, image: e.target.files?.[0] || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                          accept="image/*"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Image URL</label>
                        <input
                          type="text"
                          value={newTeamMember.image_url}
                          onChange={(e) => setNewTeamMember({ ...newTeamMember, image_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Add Member</button>
                    <button type="button" onClick={() => setShowAddTeamModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Team Member Modal */}
        {showEditTeamModal && editingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Edit Team Member</h3>
              </div>
              <div className="p-6 overflow-auto max-h-[70vh]">
                <form onSubmit={updateTeamMember}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                      <input
                        type="text"
                        value={editingRecord.name}
                        onChange={(e) => setEditingRecord({ ...editingRecord, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Country *</label>
                      <input
                        type="text"
                        value={editingRecord.country}
                        onChange={(e) => setEditingRecord({ ...editingRecord, country: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <input
                      type="text"
                      value={editingRecord.role || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                    <textarea
                      value={editingRecord.bio || ''}
                      onChange={(e) => setEditingRecord({ ...editingRecord, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Display Order</label>
                      <input
                        type="number"
                        value={editingRecord.display_order || 0}
                        onChange={(e) => setEditingRecord({ ...editingRecord, display_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Is Active</label>
                      <select
                        value={editingRecord.is_active ? 'true' : 'false'}
                        onChange={(e) => setEditingRecord({ ...editingRecord, is_active: e.target.value === 'true' })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Member Image</label>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Upload from PC (replaces current)</label>
                        <input
                          type="file"
                          onChange={(e) => setEditingTeamFiles({ ...editingTeamFiles, image: e.target.files?.[0] || null })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                          accept="image/*"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Or use Image URL</label>
                        <input
                          type="text"
                          value={editingRecord.image_url || ''}
                          onChange={(e) => setEditingRecord({ ...editingRecord, image_url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update Member</button>
                    <button type="button" onClick={() => setShowEditTeamModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showRegistrationModal && selectedRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Registration Details</h3>
                    <p className="text-blue-100 text-xs uppercase tracking-widest font-semibold">Volunteer Application</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRegistrationModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</p>
                    <p className="font-bold text-slate-900">{selectedRegistration.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</p>
                    <p className="font-bold text-slate-900">{selectedRegistration.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Number</p>
                    <p className="font-bold text-slate-900">{selectedRegistration.phone || 'Not Provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Volunteer Role</p>
                    <span className="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                      {selectedRegistration.role}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign</p>
                  <p className="font-bold text-slate-900">{selectedRegistration.campaign_title}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Experience / Message</p>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                    {selectedRegistration.experience || 'No additional information provided.'}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Applied on {new Date(selectedRegistration.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => setShowRegistrationModal(false)}
                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
