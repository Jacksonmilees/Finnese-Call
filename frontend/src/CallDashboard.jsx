import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff, Users, Clock, Recording, Settings, BarChart3, MessageCircle, Activity, Building2, ListChecks, Tag, Bell, Globe2 } from 'lucide-react';
import Chart from 'chart.js/auto';

// --- Screen Pop Modal ---
const ScreenPopModal = ({ open, call, contact, onClose, onTag, onNotes, onCallback, ringtoneUrl, language, i18n }) => {
  const [tag, setTag] = useState(call?.tag || '');
  const [notes, setNotes] = useState(call?.notes || '');
  const [callbackTime, setCallbackTime] = useState(call?.callback_time || '');
  const audioRef = useRef(null);

  useEffect(() => {
    if (open && ringtoneUrl && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [open, ringtoneUrl]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
        <audio ref={audioRef} src={ringtoneUrl} loop />
        <h2 className="text-xl font-bold mb-2 flex items-center"><PhoneCall className="mr-2" /> {i18n('Incoming Call')}</h2>
        <div className="mb-2">
          <b>{i18n('From')}:</b> {call?.phone_number || contact?.phoneNumber}<br />
          <b>{i18n('Contact')}:</b> {contact?.name || '-'}<br />
          <b>{i18n('Company')}:</b> {contact?.company || '-'}
        </div>
        <div className="mb-2 flex space-x-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded">{i18n('Answer')}</button>
          <button className="bg-red-600 text-white px-4 py-2 rounded">{i18n('Hang Up')}</button>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1"><Tag className="inline mr-1" />{i18n('Tag')}</label>
          <input type="text" value={tag} onChange={e => setTag(e.target.value)} className="w-full border rounded p-2" onBlur={() => onTag(tag)} />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">{i18n('Notes')}</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border rounded p-2" onBlur={() => onNotes(notes)} />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">{i18n('Schedule Callback')}</label>
          <input type="datetime-local" value={callbackTime} onChange={e => setCallbackTime(e.target.value)} className="w-full border rounded p-2" onBlur={() => onCallback(callbackTime)} />
        </div>
      </div>
    </div>
  );
};

// --- Wallboard View ---
const WallboardView = ({ stats }) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
    <h2 className="text-2xl font-bold mb-4">Wallboard</h2>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
      <div className="flex flex-col items-center"><PhoneCall className="h-8 w-8 text-blue-600" /><span className="text-lg font-bold">{stats.active_calls || 0}</span><span>Active</span></div>
      <div className="flex flex-col items-center"><Phone className="h-8 w-8 text-green-600" /><span className="text-lg font-bold">{stats.ringing_calls || 0}</span><span>Ringing</span></div>
      <div className="flex flex-col items-center"><Clock className="h-8 w-8 text-yellow-600" /><span className="text-lg font-bold">{stats.on_hold_calls || 0}</span><span>On Hold</span></div>
      <div className="flex flex-col items-center"><Users className="h-8 w-8 text-purple-600" /><span className="text-lg font-bold">{stats.queued_calls || 0}</span><span>Queued</span></div>
      <div className="flex flex-col items-center"><Recording className="h-8 w-8 text-red-600" /><span className="text-lg font-bold">{stats.answered_last_hour || 0}</span><span>Answered (1h)</span></div>
    </div>
  </div>
);

// --- i18n stub ---
const translations = {
  en: {
    'Incoming Call': 'Incoming Call', 'From': 'From', 'Contact': 'Contact', 'Company': 'Company', 'Answer': 'Answer', 'Hang Up': 'Hang Up', 'Tag': 'Tag', 'Notes': 'Notes', 'Schedule Callback': 'Schedule Callback'
  },
  // Add more languages here
};
function i18nFactory(lang) {
  return (key) => translations[lang]?.[key] || key;
}

const CallDashboard = ({ token, user }) => {
  const [agents, setAgents] = useState([]);
  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState({ callsPerDay: [], agentLeaderboard: [], queueStats: [] });
  const [pbxEvents, setPbxEvents] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [callNumber, setCallNumber] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [search, setSearch] = useState({ phone: '', agentId: '', from: '', to: '' });
  const [searchResults, setSearchResults] = useState([]);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [agentForm, setAgentForm] = useState({ name: '', email: '', extension: '', password: '', role: 'agent' });
  const wsRef = useRef(null);
  const [screenPop, setScreenPop] = useState({ open: false, call: null, contact: null, ringtoneUrl: '' });
  const [wallboardStats, setWallboardStats] = useState({});
  const [language, setLanguage] = useState(user.language || 'en');
  const i18n = i18nFactory(language);

  const fetchWithAuth = (url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  // Notification and presence logic
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') Notification.requestPermission();
  }, []);

  // WebSocket connection
  useEffect(() => {
    wsRef.current = new window.WebSocket('ws://localhost:3000');
    wsRef.current.onopen = () => setIsConnected(true);
    wsRef.current.onclose = () => setIsConnected(false);
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'pbx_event') {
        setPbxEvents(events => [data, ...events].slice(0, 100));
      } else if (data.type === 'screen_pop') {
        setScreenPop({ open: true, call: data.data.call, contact: data.data.contact, ringtoneUrl: data.data.ringtoneUrl });
        if (Notification.permission === 'granted') {
          new Notification('Incoming Call', { body: `From: ${data.data.call?.phone_number}` });
        }
      } else if (data.type === 'notification') {
        if (Notification.permission === 'granted') {
          new Notification(data.data.title, { body: data.data.body });
        }
      } else if (data.type === 'presence') {
        // handle presence update (stub)
      } else if (data.type === 'wallboard') {
        setWallboardStats(data.data);
      } else {
        handleWebSocketMessage(data);
      }
    };
    return () => wsRef.current && wsRef.current.close();
  }, []);

  // Load initial data
  useEffect(() => {
    loadAgents();
    loadCalls();
    loadStats();
  }, []);

  // Analytics fetch
  useEffect(() => {
    if (user.role === 'admin') {
      fetchWithAuth('/api/analytics/calls-per-day').then(r => r.json()).then(d => setAnalytics(a => ({ ...a, callsPerDay: d.data || [] })));
      fetchWithAuth('/api/analytics/agent-leaderboard').then(r => r.json()).then(d => setAnalytics(a => ({ ...a, agentLeaderboard: d.data || [] })));
      fetchWithAuth('/api/analytics/queue-stats').then(r => r.json()).then(d => setAnalytics(a => ({ ...a, queueStats: d.data || [] })));
      fetchWithAuth('/api/organizations').then(r => r.json()).then(d => setOrganizations(d.data || []));
      fetchWithAuth('/api/audit-log').then(r => r.json()).then(d => setAuditLog(d.data || []));
    }
  }, [user, token]);

  // Chart rendering
  const chartRef = useRef(null);
  useEffect(() => {
    if (activeTab === 'analytics' && analytics.callsPerDay.length && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (window.callsChart) window.callsChart.destroy();
      window.callsChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: analytics.callsPerDay.map(d => d.day),
          datasets: [{
            label: 'Total Calls',
            data: analytics.callsPerDay.map(d => d.total_calls),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37,99,235,0.1)',
            fill: true
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    }
  }, [activeTab, analytics.callsPerDay]);

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'agent_status_update':
        setAgents(prev => prev.map(agent =>
          agent.id === data.data.agentId
            ? { ...agent, status: data.data.status }
            : agent
        ));
        break;
      case 'call_update':
        loadCalls();
        loadStats();
        break;
      default:
        break;
    }
  };

  const loadAgents = async () => {
    try {
      const response = await fetchWithAuth('/api/agents');
      const data = await response.json();
      setAgents(data.data || []);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadCalls = async () => {
    try {
      const response = await fetchWithAuth('/api/calls/recent');
      const data = await response.json();
      setCalls(data.data || []);
    } catch (error) {
      console.error('Error loading calls:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetchWithAuth('/api/stats/dashboard');
      const data = await response.json();
      setStats(data.data || {});
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const makeCall = async (phoneNumber, agentId) => {
    try {
      const response = await fetchWithAuth('/api/call/make', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          agentId: agentId
        })
      });
      const result = await response.json();
      if (result.success) {
        alert('Call initiated successfully!');
        setCallNumber('');
        loadCalls();
      } else {
        alert(result.error || 'Failed to make call');
      }
    } catch (error) {
      console.error('Error making call:', error);
      alert('Failed to make call');
    }
  };

  const updateAgentStatus = async (agentId, status) => {
    try {
      const response = await fetchWithAuth('/api/agent/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, status })
      });
      const result = await response.json();
      if (result.success) {
        loadAgents();
      }
    } catch (error) {
      console.error('Error updating agent status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-red-100 text-red-800';
      case 'away': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">System Status</h2>
          <div className={`flex items-center space-x-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <PhoneCall className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.recordedCalls || 0}</h3>
              <p className="text-sm text-gray-500">Recorded Calls</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.availableAgents || 0}</h3>
              <p className="text-sm text-gray-500">Available Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.avgCallDuration || 0}s</h3>
              <p className="text-sm text-gray-500">Avg Call Duration</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Recording className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{stats.totalCalls || 0}</h3>
              <p className="text-sm text-gray-500">Total Calls Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex space-x-2">
            <input
              type="tel"
              value={callNumber}
              onChange={(e) => setCallNumber(e.target.value)}
              placeholder="Phone number"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedAgent || ''}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Agent</option>
              {agents.filter(a => a.status === 'available').map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} (Ext: {agent.extension})
                </option>
              ))}
            </select>
            <button
              onClick={() => makeCall(callNumber, selectedAgent)}
              disabled={!callNumber || !selectedAgent}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Make Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agents Status */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Agents Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(agent => (
              <div key={agent.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{agent.name}</h4>
                    <p className="text-sm text-gray-500">Ext: {agent.extension}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => updateAgentStatus(agent.id, 'available')}
                    className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Available
                  </button>
                  <button
                    onClick={() => updateAgentStatus(agent.id, 'away')}
                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                  >
                    Away
                  </button>
                  <button
                    onClick={() => updateAgentStatus(agent.id, 'offline')}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                  >
                    Offline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const searchCalls = async () => {
    const params = new URLSearchParams();
    if (search.phone) params.append('phone', search.phone);
    if (search.agentId) params.append('agentId', search.agentId);
    if (search.from) params.append('from', search.from);
    if (search.to) params.append('to', search.to);
    const response = await fetchWithAuth(`/api/calls/search?${params.toString()}`);
    const data = await response.json();
    setSearchResults(data.data || []);
  };

  const handleAgentFormSubmit = async (e) => {
    e.preventDefault();
    if (editAgent) {
      await fetchWithAuth(`/api/agents/${editAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentForm)
      });
    } else {
      await fetchWithAuth('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentForm)
      });
    }
    setShowAgentForm(false);
    setEditAgent(null);
    setAgentForm({ name: '', email: '', extension: '', password: '', role: 'agent' });
    loadAgents();
  };

  const handleEditAgent = (agent) => {
    setEditAgent(agent);
    setAgentForm({ ...agent, password: '' });
    setShowAgentForm(true);
  };

  const handleDeleteAgent = async (id) => {
    if (window.confirm('Delete this agent?')) {
      await fetchWithAuth(`/api/agents/${id}`, { method: 'DELETE' });
      loadAgents();
    }
  };

  const renderCalls = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold">Recent Calls</h3>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          <input type="text" placeholder="Phone" value={search.phone} onChange={e => setSearch({ ...search, phone: e.target.value })} className="border rounded px-2 py-1" />
          <select value={search.agentId} onChange={e => setSearch({ ...search, agentId: e.target.value })} className="border rounded px-2 py-1">
            <option value="">All Agents</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <input type="date" value={search.from} onChange={e => setSearch({ ...search, from: e.target.value })} className="border rounded px-2 py-1" />
          <input type="date" value={search.to} onChange={e => setSearch({ ...search, to: e.target.value })} className="border rounded px-2 py-1" />
          <button onClick={searchCalls} className="bg-blue-600 text-white px-3 py-1 rounded">Search</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(searchResults.length ? searchResults : calls).map(call => (
              <tr key={call.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{call.phone_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.agent_id || 'Unassigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${call.direction === 'inbound' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{call.direction}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${call.status === 'answered' ? 'bg-green-100 text-green-800' : call.status === 'missed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{call.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.duration ? `${call.duration}s` : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(call.created_at).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{call.recording_url && (<a href={`/api/recording/${call.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800"><Recording className="h-4 w-4" /></a>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAgents = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Agents</h3>
        {user.role === 'admin' && (
          <button onClick={() => { setShowAgentForm(true); setEditAgent(null); }} className="bg-blue-600 text-white px-3 py-1 rounded">Add Agent</button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <div key={agent.id} className="border rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{agent.name}</h4>
                <p className="text-sm text-gray-500">Ext: {agent.extension}</p>
                <p className="text-xs text-gray-400">{agent.email}</p>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agent.status)}`}>{agent.status}</span>
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">{agent.role}</span>
              </div>
              {user.role === 'admin' && (
                <div className="flex flex-col space-y-1">
                  <button onClick={() => handleEditAgent(agent)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDeleteAgent(agent.id)} className="text-red-600 hover:underline text-xs">Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {showAgentForm && (
        <form onSubmit={handleAgentFormSubmit} className="mt-6 bg-blue-50 p-4 rounded shadow max-w-md mx-auto">
          <h4 className="font-semibold mb-2">{editAgent ? 'Edit Agent' : 'Add Agent'}</h4>
          <input type="text" placeholder="Name" value={agentForm.name} onChange={e => setAgentForm({ ...agentForm, name: e.target.value })} className="mb-2 w-full border rounded p-2" required />
          <input type="email" placeholder="Email" value={agentForm.email} onChange={e => setAgentForm({ ...agentForm, email: e.target.value })} className="mb-2 w-full border rounded p-2" required />
          <input type="text" placeholder="Extension" value={agentForm.extension} onChange={e => setAgentForm({ ...agentForm, extension: e.target.value })} className="mb-2 w-full border rounded p-2" required />
          <input type="password" placeholder="Password" value={agentForm.password} onChange={e => setAgentForm({ ...agentForm, password: e.target.value })} className="mb-2 w-full border rounded p-2" required={!editAgent} />
          <select value={agentForm.role} onChange={e => setAgentForm({ ...agentForm, role: e.target.value })} className="mb-2 w-full border rounded p-2">
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex space-x-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={() => { setShowAgentForm(false); setEditAgent(null); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Custom Messages</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Welcome Message</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows="3"
              placeholder="Enter your welcome message..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hold Message</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows="3"
              placeholder="Enter your hold message..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Voicemail Message</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows="3"
              placeholder="Enter your voicemail message..."
            />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Save Messages
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">System Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Max Call Duration (seconds)</label>
            <input
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="3600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Hours Start</label>
            <input
              type="time"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="09:00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Hours End</label>
            <input
              type="time"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="18:00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Default Caller ID</label>
            <input
              type="tel"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="+254XXXXXXXXX"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
            <span className="ml-2 text-sm text-gray-700">Enable Call Recording</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
            <span className="ml-2 text-sm text-gray-700">Enable Voicemail</span>
          </label>
        </div>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Save Settings
        </button>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Analytics</h3>
      <div className="mb-6">
        <canvas ref={chartRef} height={100}></canvas>
      </div>
      <div className="mb-6">
        <h4 className="font-semibold mb-2">Agent Leaderboard</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Agent</th>
              <th className="px-4 py-2">Total Calls</th>
              <th className="px-4 py-2">Answered</th>
              <th className="px-4 py-2">Avg Duration</th>
            </tr>
          </thead>
          <tbody>
            {analytics.agentLeaderboard.map(row => (
              <tr key={row.agent_id}>
                <td className="px-4 py-2">{row.agent_id}</td>
                <td className="px-4 py-2">{row.total_calls}</td>
                <td className="px-4 py-2">{row.answered}</td>
                <td className="px-4 py-2">{Math.round(row.avg_duration || 0)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Queue Stats</h4>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Queue</th>
              <th className="px-4 py-2">Total Calls</th>
              <th className="px-4 py-2">Avg Duration</th>
              <th className="px-4 py-2">Avg Wait Time</th>
            </tr>
          </thead>
          <tbody>
            {analytics.queueStats.map(row => (
              <tr key={row.queue_id}>
                <td className="px-4 py-2">{row.queue_id}</td>
                <td className="px-4 py-2">{row.total_calls}</td>
                <td className="px-4 py-2">{Math.round(row.avg_duration || 0)}s</td>
                <td className="px-4 py-2">{Math.round(row.avg_wait_time || 0)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLiveEvents = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Live PBX Events</h3>
      <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded">
        {pbxEvents.map((e, i) => (
          <div key={i} className="text-xs text-gray-700 border-b py-1">
            <pre>{JSON.stringify(e, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrganizations = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Organizations</h3>
      <table className="min-w-full divide-y divide-gray-200 mb-4">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Created</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map(org => (
            <tr key={org.id}>
              <td className="px-4 py-2">{org.id}</td>
              <td className="px-4 py-2">{org.name}</td>
              <td className="px-4 py-2">{new Date(org.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add org form could go here */}
    </div>
  );

  const renderAuditLog = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Audit Log</h3>
      <div className="h-64 overflow-y-auto bg-gray-50 p-2 rounded">
        {auditLog.map((log, i) => (
          <div key={i} className="text-xs text-gray-700 border-b py-1">
            <b>{log.action}</b> by user {log.user_id} at {new Date(log.created_at).toLocaleString()}<br />
            <pre>{JSON.stringify(log.details, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Screen Pop Modal */}
      <ScreenPopModal open={screenPop.open} call={screenPop.call} contact={screenPop.contact} onClose={() => setScreenPop({ ...screenPop, open: false })} onTag={handleTag} onNotes={handleNotes} onCallback={handleCallback} ringtoneUrl={screenPop.ringtoneUrl} language={language} i18n={i18n} />
      {/* Header */}
      <header className="bg-blue-700 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-6">
          {/* Logo placeholder */}
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-700 font-bold text-xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-white flex-1">Finnese-call Management System</h1>
          <div className="flex items-center space-x-4">
            <Globe2 className="h-5 w-5 text-white" />
            <select value={language} onChange={handleLanguageChange} className="bg-blue-700 text-white border-none focus:ring-0">
              <option value="en">EN</option>
              {/* Add more languages here */}
            </select>
            <Bell className="h-5 w-5 text-white" title="Notifications" />
          </div>
        </div>
      </header>
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'calls', label: 'Calls', icon: Phone },
              { id: 'agents', label: 'Agents', icon: Users },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'wallboard', label: 'Wallboard', icon: Activity },
              ...(user.role === 'admin' ? [
                { id: 'analytics', label: 'Analytics', icon: Activity },
                { id: 'live', label: 'Live Events', icon: MessageCircle },
                { id: 'orgs', label: 'Organizations', icon: Building2 },
                { id: 'audit', label: 'Audit Log', icon: ListChecks }
              ] : [])
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'calls' && renderCalls()}
          {activeTab === 'agents' && renderAgents()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'wallboard' && <WallboardView stats={wallboardStats} />}
          {activeTab === 'analytics' && user.role === 'admin' && renderAnalytics()}
          {activeTab === 'live' && user.role === 'admin' && renderLiveEvents()}
          {activeTab === 'orgs' && user.role === 'admin' && renderOrganizations()}
          {activeTab === 'audit' && user.role === 'admin' && renderAuditLog()}
        </div>
      </main>
    </div>
  );
};

export default CallDashboard; 