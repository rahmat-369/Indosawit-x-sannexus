import { useEffect, useState } from "react";
import { Menu, X, Filter, ExternalLink, Github, Send, Instagram, CheckCircle2, ChevronUp, MessageCircle, Sparkles, Megaphone, TrendingUp, Scale, ShieldAlert, HeartPulse, Cpu, Globe, Palette, GraduationCap, Share2 } from "lucide-react";
import SanexusChat from "./components/SanexusChat";

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);
const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
);

export default function App() {
  const [viewMode, setViewMode] = useState("news"); 
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [activeSanexusQuery, setActiveSanexusQuery] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  const megaFilters = [
    { label: "Politik", icon: <Megaphone size={14}/>, query: "Cari berita politik dan kebijakan terbaru di Indonesia" },
    { label: "Ekonomi", icon: <TrendingUp size={14}/>, query: "Cari update ekonomi, bursa saham, dan harga sawit hari ini" },
    { label: "Hukum", icon: <Scale size={14}/>, query: "Cari berita kasus hukum dan regulasi terbaru" }, 
    { label: "Kriminal", icon: <ShieldAlert size={14}/>, query: "Cari update kriminalitas dan keamanan nasional" },
    { label: "Kesehatan", icon: <HeartPulse size={14}/>, query: "Cari info kesehatan, medis, dan BPJS terbaru" },
    { label: "Teknologi", icon: <Cpu size={14}/>, query: "Cari tren AI, gadget, dan software terbaru" },
  ];

  const sources = ["Semua", "CNBC", "CNN", "Kompas", "Sindo", "Suara"];

  useEffect(() => {
    // 🔥 POPUP BERANDA LOGIC 🔥
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasSeenPopup = localStorage.getItem("hasSeenInstallPopup");
    
    if (isMobile && !hasSeenPopup) {
      const timer = setTimeout(() => setShowInstallPopup(true), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page === 'ai') setViewMode('ai');
    
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Selamat Pagi, Sir");
    else if (hours < 17) setGreeting("Selamat Siang, Sir");
    else setGreeting("Selamat Malam, Sir");

    const handleScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeInstallPopup = () => {
    setShowInstallPopup(false);
    localStorage.setItem("hasSeenInstallPopup", "true");
  };

  const fetchNews = async () => {
    const APIS = [
      { name: 'CNBC', url: 'https://api.nexray.web.id/berita/cnbcindonesia' },
      { name: 'CNN', url: 'https://api.nexray.web.id/berita/cnn' },
      { name: 'Kompas', url: 'https://api.nexray.web.id/berita/kompas' },
      { name: 'Sindo', url: 'https://api.nexray.web.id/berita/sindonews' },
      { name: 'Suara', url: 'https://api.nexray.web.id/berita/suara' }
    ];
    try {
      const fetchPromises = APIS.map(async (api) => {
        try {
          const res = await fetch(api.url);
          const data = await res.json();
          return (data.result || []).map((item) => ({
            title: item.title || 'Tanpa Judul',
            link: item.link || '#',
            image: item.image || item.image_thumbnail || item.imageUrl || 'https://via.placeholder.com/500x300?text=No+Image',
            source: api.name,
            time: item.date || item.timestamp || item.time || 'Baru saja',
          }));
        } catch (err) { return []; }
      });
      const allResults = await Promise.all(fetchPromises);
      const mergedNews = allResults.flat().sort(() => Math.random() - 0.5);
      setNews(mergedNews);
      setFilteredNews(mergedNews);
    } catch (error) { console.error('Gagal memuat berita terkini'); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNews(); }, []);

  const handleFilter = (source) => {
    setActiveFilter(source);
    setFilteredNews(source === "Semua" ? news : news.filter(item => item.source === source));
  };

  if (viewMode === 'ai') {
    return (
      <div className="w-full h-screen bg-[#050705]">
        <SanexusChat initialQuery="" onClose={() => { setViewMode('news'); window.history.pushState({}, '', '/'); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-white bg-[#050705]">
      
      {/* MODAL POPUP TAMBAH KE BERANDA - ANTI CRASH */}
      {showInstallPopup && (
        <div className="fixed bottom-6 left-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-10">
          <div className="bg-[#1a201d] border border-[#b8cbb8]/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative">
            <button onClick={closeInstallPopup} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
            
            <div className="mb-4">
              <h4 className="font-black text-sm text-[#b8cbb8]">Jadikan Web App</h4>
              <p className="text-[10px] text-gray-400">Akses IndoSawit lebih cepat dari layar utama.</p>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 text-[11px] text-gray-300 space-y-3 leading-relaxed border border-white/5">
              <p className="flex items-center gap-2 italic"><Globe size={14} className="text-blue-400"/> Gunakan browser HP untuk hasil terbaik.</p>
              <p className="flex items-center gap-2 underline underline-offset-4 decoration-blue-500/50">
                <Menu size={14} className="text-blue-400"/> Android: Klik titik tiga (⋮) dan pilih Tambah ke layar utama.
              </p>
              <p className="flex items-center gap-2 underline underline-offset-4 decoration-pink-500/50">
                <Share2 size={14} className="text-pink-400"/> iOS: Klik ikon Share dan pilih Add to Home Screen.
              </p>
            </div>
            <button onClick={closeInstallPopup} className="w-full mt-4 py-3 bg-[#b8cbb8] text-[#050705] rounded-xl text-[11px] font-black uppercase tracking-widest">Siap, Mengerti Sir!</button>
          </div>
        </div>
      )}

      {activeSanexusQuery !== null && (
        <SanexusChat initialQuery={activeSanexusQuery} onClose={() => setActiveSanexusQuery(null)} />
      )}

      <header className="sticky top-4 z-40 mx-4 md:mx-8 mb-8">
        <nav className="p-5 rounded-[28px] flex justify-between items-center bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-2xl relative">
          <div className="flex flex-col cursor-pointer" onClick={() => { setViewMode('news'); window.history.pushState({}, '', '/'); }}>
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter flex items-center gap-1 group">
              <span className="text-white group-hover:text-blue-400 transition-colors">Indo</span>
              <span className="text-green-500 drop-shadow-[0_0_5px_rgba(34,197,94,0.4)]">Sawi</span>
              <div className="relative w-8 h-8 -ml-1">
                <div className="absolute inset-0 bg-orange-500/30 blur-[6px] rounded-full animate-pulse"></div>
                <img src="https://j.top4top.io/p_37192jn0n0.png" alt="logo" className="relative z-10 w-full h-full object-contain" />
              </div>
              <span className="text-gray-300 drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]">.news</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{greeting}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-bold text-green-400 uppercase tracking-widest">
               <CheckCircle2 size={14}/> Server Optimal
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-white/5 rounded-xl border border-white/10 text-blue-400 hover:bg-white/10 transition-colors">
              {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
          </div>
        </nav>

        {isMenuOpen && (
          <div className="absolute top-[110%] left-0 w-full glass-card rounded-3xl p-6 animate-in slide-in-from-top duration-300 border border-white/5 bg-white/[0.02] backdrop-blur-xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Status Sistem</h3>
              <span className="flex items-center gap-1 text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full"><CheckCircle2 size={10}/> Link Aktif</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={() => { setIsMenuOpen(false); setViewMode('ai'); window.history.pushState({}, '', '?page=ai'); }} className="col-span-2 p-4 bg-gradient-to-r from-[#0d1110] to-[#1a201d] border border-[#b8cbb8]/30 rounded-2xl text-xs font-bold text-[#b8cbb8] flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(184,203,184,0.1)] hover:border-[#b8cbb8] transition-all">
                <Sparkles size={16} /> Buka Full Sanexus AI
              </button>
              <button onClick={() => { setIsMenuOpen(false); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="p-3 bg-white/5 rounded-2xl text-[11px] font-bold border border-white/5 text-center text-gray-300 hover:bg-white/10 transition-colors">Berita Terbaru</button>
              <button onClick={() => { setIsMenuOpen(false); window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'}); }} className="p-3 bg-white/5 rounded-2xl text-[11px] font-bold border border-white/5 text-center text-gray-300 hover:bg-white/10 transition-colors">Kontak Developer</button>
            </div>
          </div>
        )}
      </header>

      <div className="flex gap-2 overflow-x-auto px-4 md:px-8 pb-6 no-scrollbar mb-4 items-center">
        <Filter size={16} className="text-gray-500 shrink-0"/>
        
        {megaFilters.map((pill, idx) => (
          <button key={idx} onClick={() => setActiveSanexusQuery(pill.query)}
            className="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#b8cbb8]/10 border border-[#b8cbb8]/20 text-[#b8cbb8] flex items-center gap-2 shrink-0 hover:bg-[#b8cbb8] hover:text-[#050705] transition-all duration-300">
            {pill.icon} {pill.label}
          </button>
        ))}

        <div className="w-[1px] h-8 bg-white/10 mx-2 shrink-0"></div>

        {sources.map((source) => (
          <button key={source} onClick={() => handleFilter(source)}
            className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
              activeFilter === source ? "bg-blue-500/10 border-blue-400 text-blue-400" : "bg-white/5 border-white/5 text-gray-400"
            }`}>
            {source}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-72 bg-white/[0.02] border border-white/5 rounded-[32px] animate-pulse"></div>)
        ) : filteredNews.map((item, i) => (
          <div key={i} className="bg-white/[0.02] backdrop-blur-xl rounded-[32px] overflow-hidden group hover:border-blue-500/30 transition-all duration-500 flex flex-col border border-white/5 shadow-xl">
            <div className="relative h-48 overflow-hidden">
              <img src={item.image} alt="News" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050705] via-[#050705]/40 to-transparent"></div>
              <span className="absolute top-4 left-4 text-[9px] bg-blue-500/20 backdrop-blur-md px-3 py-1 rounded-full text-blue-300 font-bold uppercase border border-blue-500/30">{item.source}</span>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="inline-block group-hover:border-b group-hover:border-blue-500/50 transition-all duration-300 pb-1">
                  <h3 className="text-sm font-bold leading-relaxed text-gray-100 inline">{item.title}</h3>
                </div>
                <p className="text-[10px] text-gray-500 mt-3 font-mono opacity-60">{item.time}</p>
              </div>
              
              <div className="mt-5 pt-5 border-t border-white/5 flex justify-between items-center">
                <a href={item.link} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-all">
                  BACA FULL <ExternalLink size={10}/>
                </a>
                
                <button 
                  onClick={() => setActiveSanexusQuery({ type: 'news', title: item.title, link: item.link, image: item.image })} 
                  className="text-[10px] px-4 py-2 rounded-full border border-[#b8cbb8]/30 bg-[#b8cbb8]/10 text-[#b8cbb8] hover:bg-[#b8cbb8]/20 transition-all font-bold flex items-center gap-1">
                  <Sparkles size={12} /> Tanya Sanexus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-20 border-t border-white/5 bg-white/[0.01] backdrop-blur-sm p-10 md:p-16">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-xl md:text-2xl font-black tracking-tighter text-white mb-2">INDOSAWIT NEXUS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
            <div className="flex flex-col items-center bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:border-blue-500/30 transition-colors">
              <img src="https://res.cloudinary.com/dwiozm4vz/image/upload/v1772959730/ootglrvfmykn6xsto7rq.png" alt="R_hmt" className="w-20 h-20 rounded-full border-2 border-blue-500/30 object-cover mb-4" />
              <h3 className="text-lg font-black text-white">R_hmt ofc</h3>
              <p className="text-blue-400 font-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Lead Frontend & AI Prompting</p>
              <div className="flex gap-3 mb-4">
                <a href="https://github.com/rahmat-369" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-xl hover:text-white text-gray-400"><Github size={16}/></a>
                <a href="https://t.me/rAi_engine" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-xl hover:text-blue-400 text-gray-400"><Send size={16}/></a>
                <a href="https://www.instagram.com/rahmt_nhw?igsh=MWQwcnB3bTA2ZnVidg==" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-xl hover:text-pink-500 text-gray-400"><Instagram size={16}/></a>
                <a href="https://www.tiktok.com/@r_hmtofc?_r=1&_t=ZS-94KRfWQjeUu" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-xl hover:text-white text-gray-400"><TikTokIcon size={16} /></a>
              </div>
              <a href="https://whatsapp.com/channel/0029VbBjyjlJ93wa6hwSWa0p" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#25D366]/10 px-4 py-2 rounded-full text-[10px] font-bold text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20">
                <WhatsAppIcon size={14} /> [𝙍]𝙝𝙢𝙏 | 𝘾𝙤𝙙𝙚⚙️𝘼𝙄 𝙡
              </a>
            </div>

            <div className="flex flex-col items-center bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:border-[#b8cbb8]/30 transition-colors">
              <img src="https://e.top4top.io/p_3721610g20.jpg" alt="San" className="w-20 h-20 rounded-full border-2 border-[#b8cbb8]/30 object-cover mb-4" />
              <h3 className="text-lg font-black text-white">SANN404</h3>
              <p className="text-[#b8cbb8] font-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Node.js Expert & Master Coder</p>
              <div className="flex gap-3 mb-4">
                <a href="#" className="p-2 bg-white/5 rounded-xl hover:text-[#25D366] text-gray-400"><WhatsAppIcon size={16}/></a>
                <a href="#" className="p-2 bg-white/5 rounded-xl hover:text-[#25D366] text-gray-400"><WhatsAppIcon size={16}/></a>
                <a href="#" className="p-2 bg-white/5 rounded-xl hover:text-[#25D366] text-gray-400"><WhatsAppIcon size={16} /></a>
              </div>
              <a href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#25D366]/10 px-4 py-2 rounded-full text-[10px] font-bold text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20">
                <WhatsAppIcon size={14} /> SANN404 FORUM | GROUP
              </a>
            </div>
          </div>
          <p className="text-[10px] font-mono opacity-40 uppercase">© 2026 INDOSAWIT NEXUS - ALL RIGHTS RESERVED</p>
        </div>
      </footer>

      {showTopBtn && (
        <button onClick={scrollToTop} className="fixed bottom-8 right-6 z-30 p-3 bg-blue-600/20 backdrop-blur-xl border border-blue-500/50 rounded-full text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-in fade-in zoom-in">
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
}