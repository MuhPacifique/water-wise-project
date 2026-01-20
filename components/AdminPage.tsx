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
  Star
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
  const [showArchived, setShowArchived] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'document',
    category: '',
    tags: '',
    language: 'en',
    isPublic: true,
    isFeatured: false,
    file: null as File | null
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
          setError('Failed to parse resources data');
          setResources([]);
        }
      } else {
        setError('Failed to fetch resources');
        setResources([]);
      }
    } catch (err) {
      console.error('Fetch resources error:', err);
      setError('Failed to fetch resources');
      setResources([]);
    } finally {
      setLoading(false);
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
        file: null
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
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Shield className="text-blue-600" size={24} />
              <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
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
                      File {newResource.type !== 'link' ? '*' : '(optional for links)'}
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setNewResource({ ...newResource, file: e.target.files?.[0] || null })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.doc,.docx,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif"
                      required={newResource.type !== 'link'}
                    />
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
                      Change File (Optional)
                    </label>
                    <input
                      type="file"
                      name="file"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.doc,.docx,.mp4,.mov,.avi,.jpg,.jpeg,.png,.gif"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave empty to keep existing file</p>
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
      </div>
    </div>
  );
};

export default AdminPage;
