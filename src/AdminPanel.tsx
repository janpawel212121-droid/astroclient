import { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Bell,
  Package,
  Shield,
  Wrench,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  BarChart3,
  Users,
  Trophy,
  Loader2
} from 'lucide-react';
import { SiteConfig, Announcement, ClientVersion, Poll } from './types';
import { verifyPassword, generateId, defaultConfig } from './config';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChange: (config: SiteConfig) => void;
  currentConfig: SiteConfig;
}

export default function AdminPanel({ isOpen, onClose, onConfigChange, currentConfig }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [config, setConfig] = useState<SiteConfig>(currentConfig);
  const [activeTab, setActiveTab] = useState<'announcements' | 'polls' | 'modules' | 'clients' | 'settings'>('announcements');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const [newAnnouncement, setNewAnnouncement] = useState({
    type: 'info' as 'info' | 'warning' | 'error' | 'success',
    title: '',
    message: ''
  });

  const [newPoll, setNewPoll] = useState({
    question: '',
    maxVotes: 30
  });

  // Aktualizuj config gdy currentConfig się zmieni
  useEffect(() => {
    setConfig(currentConfig);
  }, [currentConfig]);

  // Reset stanu przy zamknięciu
  useEffect(() => {
    if (!isOpen) {
      setSaveStatus('idle');
    }
  }, [isOpen]);

  const handleLogin = () => {
    if (verifyPassword(password)) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Nieprawidłowe hasło');
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await onConfigChange(config);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('Błąd zapisu:', e);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleResetConfig = async () => {
    if (confirm('Czy na pewno chcesz zresetować konfigurację do domyślnej? Wszystkie dane zostaną utracone!')) {
      setSaveStatus('saving');
      try {
        await onConfigChange(defaultConfig);
        setConfig(defaultConfig);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (e) {
        setSaveStatus('error');
      }
    }
  };

  const toggleModuleAvailability = (moduleId: string) => {
    setConfig(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId ? { ...m, available: !m.available } : m
      )
    }));
  };

  const updateModuleReason = (moduleId: string, reason: string) => {
    setConfig(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.id === moduleId ? { ...m, unavailableReason: reason } : m
      )
    }));
  };

  const addAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;
    
    const announcement: Announcement = {
      id: generateId(),
      ...newAnnouncement,
      active: true,
      createdAt: Date.now()
    };
    
    setConfig(prev => ({
      ...prev,
      announcements: [announcement, ...(prev.announcements || [])]
    }));
    
    setNewAnnouncement({ type: 'info', title: '', message: '' });
  };

  const toggleAnnouncement = (id: string) => {
    setConfig(prev => ({
      ...prev,
      announcements: (prev.announcements || []).map(a =>
        a.id === id ? { ...a, active: !a.active } : a
      )
    }));
  };

  const deleteAnnouncement = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) {
      setConfig(prev => ({
        ...prev,
        announcements: (prev.announcements || []).filter(a => a.id !== id)
      }));
    }
  };

  const addPoll = () => {
    if (!newPoll.question || newPoll.maxVotes < 1) return;
    
    const poll: Poll = {
      id: generateId(),
      question: newPoll.question,
      yesVotes: 0,
      maxVotes: newPoll.maxVotes,
      active: true,
      createdAt: Date.now()
    };
    
    setConfig(prev => ({
      ...prev,
      polls: [poll, ...(prev.polls || [])]
    }));
    
    setNewPoll({ question: '', maxVotes: 30 });
  };

  const togglePoll = (id: string) => {
    setConfig(prev => ({
      ...prev,
      polls: (prev.polls || []).map(p =>
        p.id === id ? { ...p, active: !p.active } : p
      )
    }));
  };

  const deletePoll = (id: string) => {
    if (confirm('Czy na pewno chcesz usunąć tę ankietę?')) {
      setConfig(prev => ({
        ...prev,
        polls: (prev.polls || []).filter(p => p.id !== id)
      }));
    }
  };

  const resetPollVotes = (id: string) => {
    if (confirm('Czy na pewno chcesz zresetować głosy tej ankiety?')) {
      setConfig(prev => ({
        ...prev,
        polls: (prev.polls || []).map(p =>
          p.id === id ? { ...p, yesVotes: 0, active: true, endedAt: undefined } : p
        )
      }));
    }
  };

  const toggleClientAvailability = (clientId: string) => {
    setConfig(prev => ({
      ...prev,
      clients: (prev.clients || []).map(c =>
        c.id === clientId ? { ...c, available: !c.available } : c
      )
    }));
  };

  const updateClient = (clientId: string, updates: Partial<ClientVersion>) => {
    setConfig(prev => ({
      ...prev,
      clients: (prev.clients || []).map(c =>
        c.id === clientId ? { ...c, ...updates } : c
      )
    }));
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case 'info': return 'border-blue-500/30 bg-blue-500/10';
      case 'warning': return 'border-amber-500/30 bg-amber-500/10';
      case 'error': return 'border-red-500/30 bg-red-500/10';
      case 'success': return 'border-emerald-500/30 bg-emerald-500/10';
      default: return 'border-white/10 bg-white/5';
    }
  };

  if (!isOpen) return null;

  // Bezpieczne pobieranie danych z config
  const announcements = config.announcements || [];
  const polls = config.polls || [];
  const modules = config.modules || [];
  const clients = config.clients || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Panel Administracyjny</h2>
              <p className="text-zinc-500 text-sm">Astro Client - Zarządzanie</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login Form */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-violet-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Zaloguj się</h3>
                <p className="text-zinc-500 text-sm">Wprowadź hasło administratora</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Hasło..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                  {passwordError && (
                    <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleLogin}
                  className="w-full bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-semibold transition-colors"
                >
                  Zaloguj
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-white/10 px-6 bg-white/[0.01] overflow-x-auto">
              {[
                { id: 'announcements', label: 'Ogłoszenia', icon: Bell },
                { id: 'polls', label: 'Ankiety', icon: BarChart3 },
                { id: 'modules', label: 'Moduły', icon: Package },
                { id: 'clients', label: 'Klienty', icon: Download },
                { id: 'settings', label: 'Ustawienia', icon: Wrench },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-violet-500 text-white'
                      : 'border-transparent text-zinc-500 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'polls' && polls.filter(p => p.active).length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
                      {polls.filter(p => p.active).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Announcements Tab */}
              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  {/* New Announcement Form */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-violet-400" />
                      Nowe ogłoszenie
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <select
                          value={newAnnouncement.type}
                          onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value as any }))}
                          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
                        >
                          <option value="info">ℹ️ Informacja</option>
                          <option value="warning">⚠️ Ostrzeżenie</option>
                          <option value="error">❌ Błąd</option>
                          <option value="success">✅ Sukces</option>
                        </select>
                        
                        <input
                          type="text"
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Tytuł ogłoszenia..."
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50"
                        />
                      </div>
                      
                      <textarea
                        value={newAnnouncement.message}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Treść ogłoszenia..."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 resize-none"
                      />
                      
                      <button
                        onClick={addAnnouncement}
                        disabled={!newAnnouncement.title || !newAnnouncement.message}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Dodaj ogłoszenie
                      </button>
                    </div>
                  </div>

                  {/* Existing Announcements */}
                  <div>
                    <h3 className="font-semibold mb-4">
                      Ogłoszenia ({announcements.length}) • Aktywne: {announcements.filter(a => a.active).length}
                    </h3>
                    
                    {announcements.length === 0 ? (
                      <div className="text-center py-12 text-zinc-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Brak ogłoszeń</p>
                        <p className="text-sm mt-1">Dodaj pierwsze ogłoszenie powyżej</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {announcements.map((announcement) => (
                          <div
                            key={announcement.id}
                            className={`border rounded-xl p-4 ${getAnnouncementColor(announcement.type)} ${
                              !announcement.active ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                {getAnnouncementIcon(announcement.type)}
                                <div>
                                  <h4 className="font-semibold">{announcement.title}</h4>
                                  <p className="text-sm text-zinc-400 mt-1">{announcement.message}</p>
                                  <p className="text-xs text-zinc-600 mt-2">
                                    {new Date(announcement.createdAt).toLocaleString('pl-PL')}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleAnnouncement(announcement.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    announcement.active
                                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                      : 'bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30'
                                  }`}
                                  title={announcement.active ? 'Wyłącz' : 'Włącz'}
                                >
                                  {announcement.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => deleteAnnouncement(announcement.id)}
                                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                  title="Usuń"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Polls Tab */}
              {activeTab === 'polls' && (
                <div className="space-y-6">
                  {/* New Poll Form */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-violet-400" />
                      Nowa ankieta
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-zinc-400 mb-2 block">Pytanie ankiety</label>
                        <input
                          type="text"
                          value={newPoll.question}
                          onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                          placeholder="np. Czy czekacie na Astro Client?"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-zinc-400 mb-2 block">Liczba głosów do zakończenia</label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={newPoll.maxVotes}
                          onChange={(e) => setNewPoll(prev => ({ ...prev, maxVotes: parseInt(e.target.value) || 30 }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50"
                        />
                      </div>
                      
                      <button
                        onClick={addPoll}
                        disabled={!newPoll.question || newPoll.maxVotes < 1}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Utwórz ankietę
                      </button>
                    </div>
                  </div>

                  {/* Existing Polls */}
                  <div>
                    <h3 className="font-semibold mb-4">
                      Ankiety ({polls.length}) • Aktywne: {polls.filter(p => p.active).length}
                    </h3>
                    
                    {polls.length === 0 ? (
                      <div className="text-center py-12 text-zinc-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Brak ankiet</p>
                        <p className="text-sm mt-1">Utwórz pierwszą ankietę powyżej</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {polls.map((poll) => {
                          const isCompleted = poll.yesVotes >= poll.maxVotes;
                          const percentage = Math.min(Math.round((poll.yesVotes / poll.maxVotes) * 100), 100);
                          
                          return (
                            <div
                              key={poll.id}
                              className={`border rounded-xl p-5 transition-all ${
                                isCompleted 
                                  ? 'border-emerald-500/30 bg-emerald-500/5'
                                  : poll.active
                                    ? 'border-violet-500/30 bg-violet-500/5'
                                    : 'border-white/10 bg-white/[0.02] opacity-60'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-start gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    isCompleted ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                                  }`}>
                                    {isCompleted ? (
                                      <Trophy className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                      <BarChart3 className="w-5 h-5 text-violet-400" />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{poll.question}</h4>
                                    <div className="flex items-center gap-3 mt-1 text-sm">
                                      <span className="flex items-center gap-1 text-zinc-400">
                                        <Users className="w-4 h-4" />
                                        {poll.yesVotes} / {poll.maxVotes} głosów
                                      </span>
                                      <span className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-violet-400'}`}>
                                        {percentage}%
                                      </span>
                                      {isCompleted && (
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                          Zakończona
                                        </span>
                                      )}
                                      {!poll.active && !isCompleted && (
                                        <span className="px-2 py-0.5 bg-zinc-500/20 text-zinc-400 text-xs rounded-full">
                                          Wstrzymana
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => resetPollVotes(poll.id)}
                                    className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                                    title="Resetuj głosy"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => togglePoll(poll.id)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      poll.active
                                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                        : 'bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30'
                                    }`}
                                    title={poll.active ? 'Wstrzymaj' : 'Wznów'}
                                  >
                                    {poll.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={() => deletePoll(poll.id)}
                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                    title="Usuń"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isCompleted 
                                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                                      : 'bg-gradient-to-r from-violet-500 to-purple-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>

                              <p className="text-xs text-zinc-600 mt-3">
                                Utworzono: {new Date(poll.createdAt).toLocaleString('pl-PL')}
                                {poll.endedAt && ` • Zakończono: ${new Date(poll.endedAt).toLocaleString('pl-PL')}`}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modules Tab */}
              {activeTab === 'modules' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Moduły ({modules.length})</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Dostępne: {modules.filter(m => m.available).length}
                      </span>
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Wyłączone: {modules.filter(m => !m.available).length}
                      </span>
                    </div>
                  </div>

                  {modules.map((module) => (
                    <div
                      key={module.id}
                      className={`border rounded-xl overflow-hidden transition-all ${
                        module.available 
                          ? 'border-white/10 bg-white/[0.02]' 
                          : 'border-red-500/30 bg-red-500/5'
                      }`}
                    >
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            module.available ? 'bg-violet-600/20' : 'bg-red-500/20'
                          }`}>
                            <Package className={`w-5 h-5 ${module.available ? 'text-violet-400' : 'text-red-400'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{module.name}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                module.available 
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {module.available ? 'Dostępny' : 'Wyłączony'}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-500">{module.category}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModuleAvailability(module.id);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              module.available
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {module.available ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                          {expandedModule === module.id ? (
                            <ChevronUp className="w-5 h-5 text-zinc-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                      </div>
                      
                      {expandedModule === module.id && (
                        <div className="px-4 pb-4 border-t border-white/5 pt-4">
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm text-zinc-400 mb-1 block">Opis modułu</label>
                              <p className="text-sm">{module.description}</p>
                            </div>
                            
                            {!module.available && (
                              <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Powód niedostępności</label>
                                <input
                                  type="text"
                                  value={module.unavailableReason || ''}
                                  onChange={(e) => updateModuleReason(module.id, e.target.value)}
                                  placeholder="np. W trakcie naprawy..."
                                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/50"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Clients Tab */}
              {activeTab === 'clients' && (
                <div className="space-y-4">
                  {clients.map((client) => (
                    <div
                      key={client.id}
                      className={`border rounded-xl overflow-hidden ${
                        client.available 
                          ? 'border-white/10 bg-white/[0.02]' 
                          : 'border-red-500/30 bg-red-500/5'
                      }`}
                    >
                      <div 
                        className="flex items-center justify-between p-5 cursor-pointer"
                        onClick={() => setExpandedClient(expandedClient === client.id ? null : client.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            client.type === 'legit' ? 'bg-violet-600/20' : 'bg-red-500/20'
                          }`}>
                            {client.type === 'legit' ? (
                              <Shield className="w-7 h-7 text-violet-400" />
                            ) : (
                              <Download className="w-7 h-7 text-red-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-lg">{client.name}</h4>
                              {client.isNew && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                                  NOWOŚĆ
                                </span>
                              )}
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                client.available 
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {client.available ? 'Dostępny' : 'Wyłączony'}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-500">Wersja {client.version}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleClientAvailability(client.id);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              client.available
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            {client.available ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                          {expandedClient === client.id ? (
                            <ChevronUp className="w-5 h-5 text-zinc-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                      </div>
                      
                      {expandedClient === client.id && (
                        <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-zinc-400 mb-1 block">Wersja MC</label>
                              <input
                                type="text"
                                value={client.version}
                                onChange={(e) => updateClient(client.id, { version: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/50"
                              />
                            </div>
                            <div>
                              <label className="text-sm text-zinc-400 mb-1 block">Badge "NOWOŚĆ"</label>
                              <button
                                onClick={() => updateClient(client.id, { isNew: !client.isNew })}
                                className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                                  client.isNew
                                    ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                }`}
                              >
                                {client.isNew ? 'Włączony' : 'Wyłączony'}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm text-zinc-400 mb-1 block">Link do pobrania</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={client.downloadUrl}
                                onChange={(e) => updateClient(client.id, { downloadUrl: e.target.value })}
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/50"
                              />
                              <a
                                href={client.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          
                          {!client.available && (
                            <div>
                              <label className="text-sm text-zinc-400 mb-1 block">Powód niedostępności</label>
                              <input
                                type="text"
                                value={client.unavailableReason || ''}
                                onChange={(e) => updateClient(client.id, { unavailableReason: e.target.value })}
                                placeholder="np. W przygotowaniu..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/50"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Maintenance Mode */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Tryb konserwacji</h3>
                          <p className="text-sm text-zinc-500">Wyłącz stronę dla użytkowników</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                        className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                          config.maintenanceMode
                            ? 'bg-amber-500 text-black'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                        }`}
                      >
                        {config.maintenanceMode ? 'Włączony' : 'Wyłączony'}
                      </button>
                    </div>
                    
                    {config.maintenanceMode && (
                      <div>
                        <label className="text-sm text-zinc-400 mb-1 block">Wiadomość konserwacji</label>
                        <textarea
                          value={config.maintenanceMessage || ''}
                          onChange={(e) => setConfig(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                          rows={2}
                          placeholder="Strona jest chwilowo niedostępna..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/50 resize-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Reset Config */}
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-red-400">Resetuj konfigurację</h3>
                          <p className="text-sm text-zinc-500">Przywróć domyślne ustawienia (usuwa wszystkie dane!)</p>
                        </div>
                      </div>
                      <button
                        onClick={handleResetConfig}
                        className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium transition-colors"
                      >
                        Resetuj
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-violet-400 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-violet-400">Informacja</h3>
                        <p className="text-sm text-zinc-400 mt-1">
                          Wszystkie zmiany są zapisywane w bazie danych Supabase i widoczne dla wszystkich użytkowników w czasie rzeczywistym.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                    <span className="text-violet-400">Zapisywanie...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Zapisano pomyślnie!</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">Błąd zapisu - spróbuj ponownie</span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 font-medium transition-colors"
                >
                  Zamknij
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveStatus === 'saving' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saveStatus === 'saving' ? 'Zapisywanie...' : 'Zapisz zmiany'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}