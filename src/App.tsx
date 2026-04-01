import { useState, useEffect } from 'react'
import { 
  Download, 
  Zap, 
  Shield, 
  Settings, 
  ChevronDown,
  Menu,
  X,
  Folder,
  Play,
  Users,
  Hand,
  UserX,
  Heart,
  MousePointer,
  Mountain,
  Bug,
  ShieldOff,
  LogOut,
  ArrowUp,
  FileSignature,
  Crosshair,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Swords,
  Check,
  Lock,
  ExternalLink,
  Cpu,
  Eye,
  Gamepad2,
  Clock,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  Wrench,
  BarChart3,
  Loader2
} from 'lucide-react'
import AdminPanel from './AdminPanel'
import PollCard from './PollCard'
import { SiteConfig } from './types'
import { defaultConfig } from './config'
import { getConfig, saveConfig, subscribeToConfig, voteInPoll, initializeDatabase } from './supabase'

const LOGO_URL = "https://i.imgur.com/3eBySol.png"
const GUI_LEGIT_URL = "https://i.imgur.com/h5NxKtI.png"
const GUI_NOLEGIT_URL = "https://i.imgur.com/pqUsg5f.png"

const iconMap: { [key: string]: any } = {
  Users, Hand, Crosshair, FileSignature, MousePointer, UserX, Heart, Zap, Mountain, Bug, ShieldOff, LogOut, ArrowUp
}

const FloatingParticles = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-violet-500/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  )
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentGuiIndex, setCurrentGuiIndex] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [activeCategory, setActiveCategory] = useState('all')
  const [adminPanelOpen, setAdminPanelOpen] = useState(false)
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [isLoading, setIsLoading] = useState(true)

  // Załaduj konfigurację z Supabase i nasłuchuj zmian
  useEffect(() => {
    const loadData = async () => {
      // Inicjalizuj bazę jeśli pusta
      await initializeDatabase();
      
      // Pobierz konfigurację
      const savedConfig = await getConfig();
      if (savedConfig) {
        setConfig(savedConfig);
      }
      setIsLoading(false);
    };

    loadData();

    // Nasłuchuj zmian w czasie rzeczywistym
    const unsubscribe = subscribeToConfig((newConfig) => {
      console.log('📡 Otrzymano aktualizację z bazy');
      setConfig(newConfig);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Skrót klawiszowy do panelu admina (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        setAdminPanelOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Głosowanie - zapisuje do Supabase
  const handlePollVote = async (pollId: string) => {
    await voteInPoll(pollId);
  };

  // Zapisz konfigurację - z panelu admina
  const handleConfigChange = async (newConfig: SiteConfig) => {
    const success = await saveConfig(newConfig);
    if (success) {
      setConfig(newConfig);
    }
  };

  const guiImages = [
    { url: GUI_LEGIT_URL, label: "Ksyxis Client (Legit)" },
    { url: GUI_NOLEGIT_URL, label: "Astro Client (HVH)" }
  ]

  const nextGui = () => setCurrentGuiIndex((prev) => (prev + 1) % guiImages.length)
  const prevGui = () => setCurrentGuiIndex((prev) => (prev - 1 + guiImages.length) % guiImages.length)

  const categories = [
    { id: 'all', name: 'Wszystkie', count: config.modules?.length || 0 },
    { id: 'combat', name: 'Combat', count: config.modules?.filter(m => m.category === 'combat').length || 0 },
    { id: 'render', name: 'Render', count: config.modules?.filter(m => m.category === 'render').length || 0 },
    { id: 'movement', name: 'Movement', count: config.modules?.filter(m => m.category === 'movement').length || 0 },
    { id: 'misc', name: 'Misc', count: config.modules?.filter(m => m.category === 'misc').length || 0 },
  ]

  const filteredModules = activeCategory === 'all' 
    ? (config.modules || [])
    : (config.modules || []).filter(m => m.category === activeCategory)

  const features = [
    { icon: Cpu, title: 'Zoptymalizowany', description: 'Minimalny wpływ na FPS dzięki zoptymalizowanemu kodowi', gradient: 'from-emerald-500 to-teal-500' },
    { icon: Eye, title: 'Undetected', description: 'Wszystkie moduły działają niewykrywalnie na anarchia.gg', gradient: 'from-violet-500 to-purple-500' },
    { icon: Gamepad2, title: 'Łatwa obsługa', description: 'Intuicyjne GUI z pełną personalizacją', gradient: 'from-orange-500 to-red-500' },
    { icon: Clock, title: 'Aktualizacje', description: 'Regularne aktualizacje po każdej zmianie na serwerze', gradient: 'from-blue-500 to-cyan-500' },
  ]

  const stats = [
    { value: `${config.modules?.filter(m => m.available).length || 0}+`, label: 'Modułów' },
    { value: config.clients?.[0]?.version || '1.21.4', label: 'Wersja MC' },
    { value: '100%', label: 'Darmowy' },
    { value: '24/7', label: 'Support' },
  ]

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default: return <Info className="w-4 h-4" />;
    }
  }

  const getAnnouncementStyle = (type: string) => {
    switch (type) {
      case 'info': return 'from-blue-600 via-blue-500 to-blue-600';
      case 'warning': return 'from-amber-600 via-amber-500 to-amber-600';
      case 'error': return 'from-red-600 via-red-500 to-red-600';
      case 'success': return 'from-emerald-600 via-emerald-500 to-emerald-600';
      default: return 'from-violet-600 via-purple-600 to-violet-600';
    }
  }

  const activeAnnouncements = config.announcements?.filter(a => a.active) || []
  const activePolls = config.polls?.filter(p => p.active || p.yesVotes >= p.maxVotes) || []
  const hasHvhNew = config.clients?.find(c => c.type === 'hvh')?.isNew
  const hasBanner = activeAnnouncements.length > 0 || hasHvhNew

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center font-sf">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Ładowanie Astro Client...</p>
        </div>
      </div>
    );
  }

  // Maintenance mode
  if (config.maintenanceMode) {
    return (
      <div className="min-h-screen bg-[#030305] flex items-center justify-center p-6 font-sf">
        <div className="text-center">
          <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Wrench className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Tryb konserwacji</h1>
          <p className="text-zinc-400 max-w-md">{config.maintenanceMessage}</p>
          
          <button 
            onClick={() => setAdminPanelOpen(true)}
            className="mt-8 text-zinc-700 hover:text-zinc-500 text-sm"
          >
            Panel admina
          </button>
        </div>
        
        <AdminPanel 
          isOpen={adminPanelOpen}
          onClose={() => setAdminPanelOpen(false)}
          onConfigChange={handleConfigChange}
          currentConfig={config}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sf antialiased">
      <FloatingParticles />
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-40px) translateX(-10px); opacity: 0.3; }
          75% { transform: translateY(-20px) translateX(15px); opacity: 0.6; }
        }
        .animate-float { animation: float linear infinite; }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient { background-size: 200% 200%; animation: gradient-shift 3s ease infinite; }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
        }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }

        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti 2s ease-out forwards; }
      `}</style>

      {/* Admin Panel */}
      <AdminPanel 
        isOpen={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        onConfigChange={handleConfigChange}
        currentConfig={config}
      />

      {/* Announcements Banner */}
      {activeAnnouncements.length > 0 && (
        <div className={`fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r ${getAnnouncementStyle(activeAnnouncements[0].type)} animate-gradient py-2.5 px-4`}>
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
            {getAnnouncementIcon(activeAnnouncements[0].type)}
            <span className="text-sm font-semibold text-white tracking-wide">
              {activeAnnouncements[0].title}: {activeAnnouncements[0].message}
            </span>
          </div>
        </div>
      )}

      {/* HVH Banner */}
      {activeAnnouncements.length === 0 && hasHvhNew && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 animate-gradient py-2.5 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
            <Flame className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white tracking-wide">ASTRO HVH DOSTĘPNY</span>
            <Flame className="w-4 h-4 text-white" />
            <button 
              onClick={() => scrollToSection('pobierz')}
              className="hidden sm:flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-medium transition-all"
            >
              Pobierz teraz
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className={`fixed ${hasBanner ? 'top-10' : 'top-0'} left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-[#030305]/90 backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/50 rounded-xl blur-lg opacity-50"></div>
              <img src={LOGO_URL} alt="Astro" className="w-10 h-10 rounded-xl relative" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight">Astro</span>
              <span className="text-violet-400 font-light ml-1">Client</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-full px-2 py-1.5">
            {['Funkcje', 'Moduły', 'Pobierz'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())} 
                className="px-5 py-2 rounded-full text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="hidden md:block">
            <button 
              onClick={() => scrollToSection('pobierz')}
              className="group relative flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Pobierz</span>
            </button>
          </div>

          <button 
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#030305]/98 backdrop-blur-2xl border-b border-white/5">
            <div className="px-6 py-6 flex flex-col gap-2">
              {['Funkcje', 'Moduły', 'Pobierz'].map((item) => (
                <button 
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())} 
                  className="py-3 px-4 text-left text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className={`min-h-screen flex items-center justify-center px-6 relative overflow-hidden ${hasBanner ? 'pt-40' : 'pt-32'}`}>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[200px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                <span className="text-violet-300 text-sm font-medium">Wersja {config.clients?.[0]?.version || '1.21.4'}</span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 text-sm font-medium">Undetected</span>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-none tracking-tight">
              <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">Astro</span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl font-light text-zinc-500">Client dla anarchia.gg</span>
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Darmowy client Minecraft z <span className="text-white font-normal">{config.modules?.filter(m => m.available).length || 0}+ modułami</span> stworzony specjalnie pod serwer anarchia.gg.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button 
                onClick={() => scrollToSection('pobierz')}
                className="group relative w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-105 active:scale-95 animate-pulse-glow"
              >
                <Download className="w-5 h-5" />
                Pobierz teraz
              </button>
              <button 
                onClick={() => scrollToSection('moduły')}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:bg-white/10"
              >
                <Eye className="w-5 h-5" />
                Zobacz moduły
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{stat.value}</div>
                  <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <button onClick={() => scrollToSection('preview')} className="flex flex-col items-center gap-2 text-zinc-600 hover:text-zinc-400 transition-colors">
            <span className="text-xs tracking-widest uppercase">Przewiń</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Polls Section */}
      {activePolls.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-4">
                <BarChart3 className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium">Ankiety</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Twój głos ma znaczenie</h2>
              <p className="text-zinc-500">Pomóż nam rozwijać Astro Client</p>
            </div>

            <div className="grid gap-6">
              {activePolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} onVote={handlePollVote} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GUI Preview */}
      <section id="preview" className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Podgląd interfejsu</h2>
            <p className="text-zinc-500 text-lg">Przejrzysty i funkcjonalny design GUI</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-violet-600/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            
            <div className="relative bg-[#0a0a0c] rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white/5 rounded-lg px-4 py-1.5 text-xs text-zinc-500">{guiImages[currentGuiIndex].label}</div>
                </div>
              </div>

              <img src={guiImages[currentGuiIndex].url} alt={guiImages[currentGuiIndex].label} className="w-full" />

              <button onClick={prevGui} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextGui} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {guiImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGuiIndex(index)}
                  className={`h-2 rounded-full transition-all ${index === currentGuiIndex ? 'bg-violet-400 w-8' : 'bg-white/20 hover:bg-white/40 w-2'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="funkcje" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium">Dlaczego my?</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Stworzony do <span className="text-violet-400">dominacji</span></h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="moduły" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6">
              <Settings className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium">Moduły</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Wszystko czego <span className="text-violet-400">potrzebujesz</span></h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {cat.name} <span className="ml-2 text-xs opacity-60">{cat.count}</span>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module, index) => {
              const IconComponent = iconMap[module.icon] || Settings
              return (
                <div key={index} className={`group bg-white/[0.02] border rounded-2xl p-5 transition-all ${
                  module.available ? 'border-white/5 hover:border-violet-500/30' : 'border-red-500/20 bg-red-500/5'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      module.available ? 'bg-gradient-to-br from-violet-600/20 to-purple-600/10' : 'bg-red-500/10'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${module.available ? 'text-violet-400' : 'text-red-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold">{module.name}</h3>
                        {module.available ? (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        ) : (
                          <div className="flex items-center gap-1 bg-red-500/20 rounded-full px-2 py-0.5">
                            <Lock className="w-3 h-3 text-red-400" />
                            <span className="text-xs text-red-400">{module.unavailableReason || 'Niedostępny'}</span>
                          </div>
                        )}
                      </div>
                      <p className={`text-sm ${module.available ? 'text-zinc-500' : 'text-red-400/70'}`}>{module.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="pobierz" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"></div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6">
              <Download className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium">Pobierz</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Wybierz swoją <span className="text-violet-400">wersję</span></h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {(config.clients || []).map((client) => (
              <div key={client.id} className="group relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${client.type === 'legit' ? 'from-violet-600 to-purple-600' : 'from-red-600 to-orange-600'} rounded-3xl opacity-20 group-hover:opacity-40 blur transition-opacity`}></div>
                
                <div className={`relative bg-[#0a0a0c] border border-white/10 rounded-3xl p-8 h-full ${!client.available ? 'opacity-60' : ''}`}>
                  {client.isNew && client.available && (
                    <div className="absolute -top-3 -right-3">
                      <div className={`bg-gradient-to-r ${client.type === 'legit' ? 'from-violet-600 to-purple-600' : 'from-red-600 to-orange-600'} rounded-full px-4 py-1.5 flex items-center gap-1.5`}>
                        <Flame className="w-4 h-4 text-white" />
                        <span className="text-sm font-bold text-white">NOWOŚĆ</span>
                      </div>
                    </div>
                  )}

                  {!client.available && (
                    <div className="absolute -top-3 -right-3">
                      <div className="bg-red-600 rounded-full px-4 py-1.5 flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-white" />
                        <span className="text-sm font-bold text-white">NIEDOSTĘPNY</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                      <div className={`absolute inset-0 ${client.type === 'legit' ? 'bg-violet-500/50' : 'bg-red-500/50'} rounded-2xl blur-lg`}></div>
                      <img src={LOGO_URL} alt={client.name} className="w-20 h-20 rounded-2xl relative" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{client.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        {client.type === 'legit' ? (
                          <><Shield className="w-4 h-4 text-violet-400" /><span className="text-violet-400 font-medium">Wersja Legit</span></>
                        ) : (
                          <><Swords className="w-4 h-4 text-red-400" /><span className="text-red-400 font-medium">Wersja HVH</span></>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-zinc-400 mb-8">
                    {client.type === 'legit' 
                      ? 'Idealna dla graczy szukających przewagi bez ryzyka. Wszystkie moduły działają niewykrywalnie.'
                      : 'Stworzona dla zaawansowanych graczy. Zawiera dodatkowe funkcje combat.'
                    }
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between py-3 border-b border-white/5">
                      <span className="text-zinc-500">Status</span>
                      <span className={client.available ? (client.type === 'legit' ? 'text-emerald-400' : 'text-red-400') : 'text-zinc-500'}>
                        {client.available ? (client.type === 'legit' ? 'Undetected' : 'HVH Ready') : (client.unavailableReason || 'Niedostępny')}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-white/5">
                      <span className="text-zinc-500">Wersja MC</span>
                      <span className="text-white">{client.version}</span>
                    </div>
                  </div>

                  {client.available ? (
                    <a href={client.downloadUrl} className={`flex items-center justify-center gap-3 w-full bg-gradient-to-r ${
                      client.type === 'legit' ? 'from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500' : 'from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
                    } py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-[1.02]`}>
                      <Download className="w-5 h-5" />
                      Pobierz {client.type === 'legit' ? 'Legit' : 'HVH'}
                    </a>
                  ) : (
                    <button disabled className="flex items-center justify-center gap-3 w-full bg-zinc-800 py-4 rounded-2xl font-semibold text-lg cursor-not-allowed text-zinc-500">
                      <Lock className="w-5 h-5" />
                      {client.unavailableReason || 'Niedostępny'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Installation */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-10">
            <h3 className="text-2xl font-bold mb-10 text-center">Jak zainstalować?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: Download, title: 'Pobierz', desc: 'Wybierz wersję i pobierz plik .jar' },
                { step: '02', icon: Folder, title: 'Przenieś', desc: 'Skopiuj do folderu .minecraft/mods' },
                { step: '03', icon: Play, title: 'Graj', desc: `Uruchom Minecraft z Fabric ${config.clients?.[0]?.version || '1.21.4'}` },
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="relative inline-block mb-6">
                    <div className="relative w-16 h-16 bg-gradient-to-br from-violet-600/20 to-purple-600/10 rounded-2xl flex items-center justify-center">
                      <item.icon className="w-7 h-7 text-violet-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center text-xs font-bold">{item.step}</div>
                  </div>
                  <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                  <p className="text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={LOGO_URL} alt="Astro" className="w-8 h-8 rounded-lg" />
            <div>
              <span className="font-semibold">Astro Client</span>
              <p className="text-zinc-600 text-sm">© 2025 • Stworzony dla anarchia.gg</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Discord</a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">GitHub</a>
            <button onClick={() => setAdminPanelOpen(true)} className="text-zinc-800 hover:text-zinc-600 text-sm" title="Panel Admina">•</button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
