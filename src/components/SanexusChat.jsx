import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Send, MessageCircle, PlusCircle, Trash2, Copy, RefreshCw, Edit2, Share2, Zap } from 'lucide-react';

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);
const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
);

// FUNGSI FORMAT MARKDOWN (Hijau Sanexus Cerah)
const formatMarkdown = (text) => {
  if (!text) return "";
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-extrabold">$1</strong>');
  formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="font-bold text-lg mt-5 mb-2 text-gray-800">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="font-black text-xl mt-6 mb-3 text-[#a3b8a3] border-b border-gray-200 pb-2">$1</h2>');
  formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="font-black text-2xl mt-6 mb-4 text-[#b8cbb8]">$1</h1>');
  formatted = formatted.replace(/^\d+\.\s(.*$)/gim, '<div class="ml-4 mb-2 flex"><span class="mr-2 font-bold text-[#a3b8a3]">•</span><span>$1</span></div>');
  formatted = formatted.replace(/^-\s(.*$)/gim, '<div class="ml-4 mb-2 flex"><span class="mr-2 font-bold text-gray-500">-</span><span>$1</span></div>');
  formatted = formatted.replace(/\n/g, '<br />');
  return { __html: formatted };
};

export default function SanexusChat({ initialQuery, onClose }) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingNews, setPendingNews] = useState(null);
  
  // STATE: Manajemen Sesi & UI
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(Date.now().toString());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [messages, setMessages] = useState([]);
  const [toastMsg, setToastMsg] = useState("");
  
  // MODEL STATE: 'auto', 'fast', 'deep'
  const [activeModel, setActiveModel] = useState('auto');
  
  const messagesEndRef = useRef(null);
  const hasInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, pendingNews]);

  // LOAD SESI DARI LOCAL STORAGE
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const savedSessions = JSON.parse(localStorage.getItem('sanexus_sessions')) || [];
      setSessions(savedSessions);
      
      if (initialQuery) {
        if (typeof initialQuery === 'object' && initialQuery.type === 'news') {
          setPendingNews(initialQuery);
        } else if (typeof initialQuery === 'string' && initialQuery.trim() !== "") {
          performSearch(initialQuery);
        }
      }
    }
  }, []);

  // SIMPAN SESI OTOMATIS
  useEffect(() => {
    if (messages.length > 0) {
      setSessions(prevSessions => {
        const existingSessionIndex = prevSessions.findIndex(s => s.id === currentSessionId);
        let title = "Obrolan Baru";
        const firstUserMsg = messages.find(m => m.role === 'user');
        if (firstUserMsg) {
           title = firstUserMsg.isNewsCard ? firstUserMsg.newsData.title : firstUserMsg.content;
           if (title.length > 30) title = title.substring(0, 30) + '...';
        }

        const updatedSession = { id: currentSessionId, title, messages };
        let newSessions;
        
        if (existingSessionIndex >= 0) {
          newSessions = [...prevSessions];
          newSessions[existingSessionIndex] = updatedSession;
        } else {
          newSessions = [updatedSession, ...prevSessions];
        }
        
        localStorage.setItem('sanexus_sessions', JSON.stringify(newSessions));
        return newSessions;
      });
    }
  }, [messages, currentSessionId]);

  // FUNGSI HISTORY & SESSION
  const createNewSession = () => {
    setMessages([]);
    setCurrentSessionId(Date.now().toString());
    setIsSidebarOpen(false);
    setPendingNews(null);
  };

  const loadSession = (id) => {
    const sessionToLoad = sessions.find(s => s.id === id);
    if (sessionToLoad) {
      setMessages(sessionToLoad.messages);
      setCurrentSessionId(sessionToLoad.id);
    }
    setIsSidebarOpen(false);
    setPendingNews(null);
  };

  const clearAllHistory = () => {
    setSessions([]);
    setMessages([]);
    setCurrentSessionId(Date.now().toString());
    localStorage.removeItem('sanexus_sessions');
  };

  // FUNGSI AKSI: Toast, Copy, Edit, Share, Toggle Model
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Teks Berhasil Disalin!");
  };

  const handleEdit = (text) => {
    setInputValue(text);
    showToast("Pesan dimasukkan ke kolom ketik");
  };

  const handleShare = async (userText, aiText) => {
    const shareText = `*Tanya:* ${userText}\n\n*SanexusAI:*\n${aiText || 'Sedang memproses...'}\n\n_Baca berita selengkapnya di IndoSawit.news_`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Sanexus AI', text: shareText }); } 
      catch (err) { console.log('Share dibatalkan'); }
    } else {
      handleCopy(shareText);
      showToast("Teks disalin (Browser tidak support Share)");
    }
  };

  const toggleModel = () => {
    const modes = ['auto', 'fast', 'deep'];
    const next = modes[(modes.indexOf(activeModel) + 1) % 3];
    setActiveModel(next);
    showToast(`Model diubah ke: ${next.toUpperCase()}`);
  };

  // LOGIKA PENCARIAN (DUAL ENGINE + SMART INTENT)
  const performSearch = async (queryText, forceModel = null) => {
    if (!queryText.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: queryText }]);
    setIsLoading(true);
    setInputValue('');
    setIsSidebarOpen(false);

    // Context Injection
    let queryToSend = queryText;
    if (messages.length > 0) {
      const lastTopic = messages.filter(m => m.role === 'user').pop();
      if (lastTopic) {
         const contextText = lastTopic.isNewsCard ? lastTopic.newsData.title : lastTopic.content;
         queryToSend = `Berdasarkan topik kita sebelumnya tentang "${contextText}", tolong jawab pertanyaan ini: ${queryText}`;
      }
    }

    // Intent Detection
    const needsDeepSearch = /cari di internet|berita|jelaskan mendalam|analisis/i.test(queryText);
    const targetModel = forceModel || (activeModel === 'auto' ? (needsDeepSearch ? 'deep' : 'fast') : activeModel);
    const endpoint = targetModel === 'deep' ? '/api/ngobrol' : '/api';

    try {
      const response = await fetch(`${endpoint}?question=${encodeURIComponent(queryToSend)}`);
      const data = await response.json();
      
      if (response.ok && !data.error) {
        setMessages(prev => [...prev, { role: 'ai', content: data.answer || data, model: targetModel, sources: data.sources || [], similar: data.similarQuestions || [] }]);
      } else {
        throw new Error(data.error || "Gagal mengambil data");
      }
    } catch (error) {
      // Auto-Fallback dari Perplexity ke Turboseek jika error/timeout
      if (targetModel === 'deep') {
        console.warn("Fallback ke Turboseek...");
        try {
          const resTurbo = await fetch(`/api?question=${encodeURIComponent(queryToSend)}`);
          const dataTurbo = await resTurbo.json();
          setMessages(prev => [...prev, { role: 'ai', content: dataTurbo.answer, model: 'fast', sources: dataTurbo.sources || [] }]);
        } catch (errTurbo) {
          setMessages(prev => [...prev, { role: 'ai', content: 'Kedua mesin pencari sedang sibuk. Coba lagi Mat 🗿' }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Gagal menyambung ke otak Sanexus. Pastikan API stabil.' }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pendingNews) {
      const customText = inputValue.trim();
      const newsObj = pendingNews;
      
      const newMsg = {
          role: 'user',
          isNewsCard: true,
          newsData: newsObj,
          content: customText || `Tolong analisis berita ini: ${newsObj.title}`
      };
      
      setMessages(prev => [...prev, newMsg]);
      setIsLoading(true);
      setInputValue('');
      setPendingNews(null);

      const perplexityPrompt = `Tolong baca dan analisis berita dengan judul '${newsObj.title}'. Referensi link: ${newsObj.link}. ${customText ? `Instruksi tambahan dari user: '${customText}'. Pastikan merespon sesuai instruksi tersebut.` : 'Berikan ringkasan detail dari isi berita tersebut agar kita bisa mendiskusikannya lebih lanjut.'}`;
      
      // Paksa pakai mode Deep Search untuk berita
      performSearch(perplexityPrompt, 'deep');
    } else {
      performSearch(inputValue);
    }
  };

  const MaterialIcon = ({ name }) => <span className="material-icons-round" style={{ fontFamily: '"Material Icons Round"', fontWeight: 'normal', fontStyle: 'normal', fontSize: '24px', lineHeight: 1, letterSpacing: 'normal', textTransform: 'none', display: 'inline-block', whiteSpace: 'nowrap', wordWrap: 'normal', direction: 'ltr', fontFeatureSettings: '"liga"', WebkitFontSmoothing: 'antialiased' }}>{name}</span>;

  return (
    <div className="sanexus-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
        
        .sanexus-wrapper {
            --bg-dark: #050705; --bg-card: #0d1110; --border-glass: rgba(255, 255, 255, 0.08); 
            --text-main: #ffffff; --text-muted: #8e9b95; --text-highlight: #b8cbb8; 
            --font-serif: 'Playfair Display', serif; --font-sans: 'Manrope', sans-serif;
            position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column;
            background: var(--bg-dark); color: var(--text-main); font-family: var(--font-sans);
            overflow: hidden; animation: slideUp 0.3s ease-out forwards;
        }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .sanexus-wrapper * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        
        .s-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(5,7,5,0.95); backdrop-filter: blur(10px); z-index: 10; border-bottom: 1px solid var(--border-glass);}
        .s-title { font-family: var(--font-serif); font-size: 1.2rem; color: var(--text-highlight); }
        .s-btn { background: none; border: none; color: var(--text-main); cursor: pointer; padding: 5px; }
        
        /* TOAST NOTIF */
        .s-toast { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); background: #a3b8a3; color: #050705; padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 800; z-index: 500; animation: fadeToast 0.3s forwards; box-shadow: 0 4px 15px rgba(163,184,163,0.3); }
        @keyframes fadeToast { from { opacity: 0; transform: translate(-50%, -10px); } to { opacity: 1; transform: translate(-50%, 0); } }

        /* SIDEBAR */
        .s-sidebar { position: fixed; top: 0; left: -100%; width: 100%; height: 100%; z-index: 200; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); transition: 0.3s; }
        .s-sidebar.visible { left: 0; }
        .s-sidebar-content { width: 80%; max-width: 320px; height: 100%; background: #0a0d0c; border-right: 1px solid var(--border-glass); padding: 25px 20px; display: flex; flex-direction: column; box-shadow: 5px 0 20px rgba(0,0,0,0.5); }
        
        .s-new-chat-btn { display: flex; align-items: center; gap: 10px; padding: 12px 15px; background: rgba(184, 203, 184, 0.1); border: 1px solid rgba(184, 203, 184, 0.3); color: var(--text-highlight); border-radius: 12px; cursor: pointer; font-weight: 600; margin-bottom: 20px; transition: 0.2s; }
        .s-history-list { flex: 1; overflow-y: auto; list-style: none; padding:0; margin:0; }
        .s-history-item { padding: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border-glass); cursor: pointer; font-size:0.85rem; display: flex; align-items: center; gap: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .s-history-item:hover, .s-history-item.active { background: rgba(255,255,255,0.05); color: #fff; }
        .s-clear-btn { background: rgba(255,0,0,0.05); color: #ff6b6b; border: 1px solid rgba(255,0,0,0.2); padding: 10px; border-radius: 8px; cursor: pointer; display:flex; align-items:center; justify-content:center; gap:5px; margin-top:10px; margin-bottom: 20px; font-size: 0.85rem;}
        
        /* PROFIL BANG SAN */
        .s-mini-profile { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(184, 203, 184, 0.05); border: 1px solid rgba(184, 203, 184, 0.2); border-radius: 12px; cursor: pointer; transition: 0.2s; margin-top: auto; }
        .s-mini-profile img { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--text-highlight); object-fit: cover; }
        .s-mini-profile-info h4 { font-size: 0.9rem; color: #fff; margin: 0; }
        .s-mini-profile-info p { font-size: 0.7rem; color: var(--text-muted); margin: 0; }

        .s-full-profile-overlay { position: fixed; inset: 0; background: var(--bg-dark); z-index: 300; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 60px 20px 40px 20px; text-align: center; overflow-y: auto; }
        .s-close-full-profile { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 310; }
        .s-collab-badge { background: linear-gradient(90deg, rgba(34,197,94,0.1) 0%, rgba(184,203,184,0.1) 100%); border: 1px solid rgba(184,203,184,0.3); padding: 8px 15px; border-radius: 20px; font-size: 0.75rem; color: var(--text-highlight); margin-bottom: 30px; letter-spacing: 0.5px; }

        /* AREA CHAT UTAMA */
        .s-chat-area { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 180px; scroll-behavior: smooth; position: relative; }
        .s-greeting { font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-highlight); margin-bottom: 30px; }
        .s-action-pill { background: var(--bg-card); border: 1px solid var(--border-glass); padding: 10px 16px; border-radius: 20px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px; color: var(--text-main); margin-right: 10px; cursor: pointer; }
        
        /* BUBBLE USER CONTRAST */
        .s-bubble-user { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; color: #f8fafc; text-align: left; margin-left: auto; max-width: 85%; border-radius: 20px 20px 0 20px; padding: 15px 20px; margin-bottom: 5px; line-height: 1.6; font-size: 0.95rem; font-weight: 500; box-shadow: 0 4px 15px rgba(0,0,0,0.2); user-select: text; }
        
        /* BUBBLE AI CLEAN */
        .s-bubble-ai { background: #ffffff; color: #1a201d; border-radius: 20px 20px 20px 0; max-width: 95%; padding: 22px; margin-bottom: 5px; line-height: 1.7; font-size: 0.95rem; box-shadow: 0 10px 25px rgba(255,255,255,0.05); user-select: text; }
        .s-model-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #a3b8a3; margin-bottom: 8px; display: block; letter-spacing: 1px; }
        
        /* ACTION BAR (Bawah Pesan, TANPA TEKS) */
        .s-action-bar { display: flex; gap: 15px; margin-bottom: 25px; padding: 0 10px; }
        .s-action-bar.right { justify-content: flex-end; }
        .s-action-icon { display: flex; align-items: center; justify-content: center; background: transparent; border: none; color: var(--text-muted); cursor: pointer; opacity: 0.6; transition: 0.2s; }
        .s-action-icon:hover { opacity: 1; color: var(--text-highlight); }

        .s-smooth-appear { animation: smoothPop 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(15px); }
        @keyframes smoothPop { to { opacity: 1; transform: translateY(0); } }

        /* INFO & LINK CONTAINER */
        .s-info-container { display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; margin-top: -10px;}
        .s-info-card { background: var(--bg-card); border-radius: 16px; padding: 15px; border: 1px solid var(--border-glass); }
        .s-info-card h4 { display: flex; align-items: center; gap: 8px; color: var(--text-muted); margin-bottom: 10px; font-size: 0.9rem; font-weight:500; }
        .s-list a, .s-list li { display: block; padding: 10px; background: rgba(0,0,0,0.2); margin-bottom: 8px; border-radius: 8px; color: var(--text-main); text-decoration: none; font-size: 0.85rem; cursor: pointer; }
        
        /* INPUT AREA & PREVIEW */
        .s-input-container { position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(0deg, var(--bg-dark) 75%, transparent 100%); z-index: 100; display: flex; flex-direction: column; padding: 0 20px 25px 20px; }
        .s-preview-card { background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: 12px; padding: 10px; display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .s-preview-img { width: 45px; height: 45px; border-radius: 8px; object-fit: cover; }
        .s-preview-text { flex: 1; overflow: hidden; }
        .s-preview-title { font-size: 0.8rem; color: #fff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; }
        
        /* SEARCH BAR & MODEL SWITCHER */
        .s-search-bar-wrap { position: relative; width: 100%; }
        .s-model-toggle { position: absolute; top: -40px; right: 10px; background: #1a221f; border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
        .s-search-bar { display: flex; align-items: center; background: #1a221f; border-radius: 50px; padding: 8px 8px 8px 20px; border: 1px solid var(--border-glass); box-shadow: 0 4px 20px rgba(0,0,0,0.5); width: 100%; }
        .s-search-bar input { flex: 1; background: transparent; border: none; color: var(--text-main); font-size: 1rem; outline: none; }
        .s-submit-btn { width: 45px; height: 45px; border-radius: 50%; background: var(--text-highlight); color: #000; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .s-loader-pulse { width: 40px; height: 40px; background: var(--text-highlight); border-radius: 50%; margin: 0 auto 10px; animation: s-pulse-ring 1s infinite; }
        @keyframes s-pulse-ring { 0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(184, 203, 184, 0); } 100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0); } }
      `}} />

      {/* TOAST NOTIFIKASI */}
      {toastMsg && <div className="s-toast">{toastMsg}</div>}

      <header className="s-header">
        <button className="s-btn" onClick={() => setIsSidebarOpen(true)}><MaterialIcon name="grid_view" /></button>
        <span className="s-title">SanexusAI</span>
        <button className="s-btn" onClick={onClose} style={{color: '#ff6b6b'}}><MaterialIcon name="close" /></button>
      </header>

      {/* SIDEBAR */}
      <aside className={`s-sidebar ${isSidebarOpen ? 'visible' : ''}`} onClick={(e) => {if(e.target === e.currentTarget) setIsSidebarOpen(false)}}>
        <div className="s-sidebar-content">
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
            <h2 style={{fontSize: '1.2rem', fontWeight: 'bold'}}>Riwayat Obrolan</h2>
            <button className="s-btn" onClick={() => setIsSidebarOpen(false)}><MaterialIcon name="close" /></button>
          </div>
          <button className="s-new-chat-btn" onClick={createNewSession}>
            <PlusCircle size={18} /> Obrolan Baru
          </button>
          <ul className="s-history-list">
            {sessions.map((session) => (
              <li key={session.id} className={`s-history-item ${currentSessionId === session.id ? 'active' : ''}`} onClick={() => loadSession(session.id)}>
                <MessageCircle size={14} style={{opacity: 0.7}} /> {session.title}
              </li>
            ))}
          </ul>
          {sessions.length > 0 && (
             <button className="s-clear-btn" onClick={clearAllHistory}><Trash2 size={16} /> Hapus Semua Riwayat</button>
          )}

          <div className="s-mini-profile" onClick={() => { setIsSidebarOpen(false); setShowFullProfile(true); }}>
            <img src="https://e.top4top.io/p_3721610g20.jpg" alt="SANN404" />
            <div className="s-mini-profile-info">
              <h4>SANN404</h4>
              <p>Developer Info</p>
            </div>
          </div>
        </div>
      </aside>

      {/* FULL PROFILE OVERLAY */}
      {showFullProfile && (
        <div className="s-full-profile-overlay">
          <button className="s-close-full-profile" onClick={() => setShowFullProfile(false)}>
            <MaterialIcon name="close" />
          </button>
          <div className="s-collab-badge">
            Official Collaboration: IndoSawit.news x SanexusAI
          </div>
          <img src="https://e.top4top.io/p_3721610g20.jpg" alt="SANN404" style={{width: '120px', height: '120px', borderRadius: '50%', border: '3px solid #b8cbb8', objectFit: 'cover', marginBottom: '20px'}} />
          <h1 style={{fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#b8cbb8', marginBottom: '5px'}}>SANEXUSAI</h1>
          <h3 style={{fontSize: '1.5rem', color: '#ffffff', marginBottom: '20px', letterSpacing: '2px'}}>SANN404</h3>
          <p style={{fontSize: '0.9rem', color: '#8e9b95', marginBottom: '30px', maxWidth: '300px', lineHeight: '1.6'}}>Node.js Expert & AI Engine Developer.</p>
          <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px'}}>
            <a href="#" style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px', color: '#fff'}}><Instagram size={20}/></a>
            <a href="#" style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px', color: '#fff'}}><Send size={20}/></a>
            <a href="#" style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px', color: '#fff'}}><TikTokIcon size={20}/></a>
          </div>
          <a href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L" target="_blank" rel="noreferrer" style={{display: 'flex', alignItems: 'center', gap: '10px', background: '#25D366', color: '#000', padding: '15px 30px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold'}}>
            <WhatsAppIcon size={20}/> JOIN SALURAN SANN404
          </a>
        </div>
      )}

      {/* CHAT AREA */}
      <main className="s-chat-area">
        {messages.length === 0 && (
          <div style={{marginTop: '20px'}}>
            <h2 className="s-greeting">Welcome Sir, <br/><span style={{color: '#fff', fontWeight: '800'}}>User</span></h2>
            <div style={{display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px'}}>
              <div className="s-action-pill" onClick={() => performSearch("Berita Politik Terkini")}><MaterialIcon name="work_outline"/> Politik</div>
              <div className="s-action-pill" onClick={() => performSearch("Perkembangan AI 2026")}><MaterialIcon name="campaign"/> Teknologi AI</div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const nextAiMsg = messages[index + 1]?.role === 'ai' ? messages[index + 1].content : null;
          
          return (
          <div key={index}>
            {msg.role === 'user' ? (
              <div className="s-smooth-appear" style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                <div className="s-bubble-user">
                  {msg.isNewsCard && (
                    <div style={{background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '12px', marginBottom: '10px'}}>
                      <img src={msg.newsData.image} alt="news" style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px'}} />
                      <h4 style={{fontSize: '0.85rem', color: '#fff', marginBottom: '5px'}}>{msg.newsData.title}</h4>
                    </div>
                  )}
                  {msg.content}
                </div>
                {/* ACTION BAR USER (IKON SAJA) */}
                <div className="s-action-bar right">
                  <button className="s-action-icon" onClick={() => handleEdit(msg.content)} title="Edit"><Edit2 size={16}/></button>
                  <button className="s-action-icon" onClick={() => handleCopy(msg.content)} title="Salin"><Copy size={16}/></button>
                  <button className="s-action-icon" onClick={() => handleShare(msg.content, nextAiMsg)} title="Bagikan"><Share2 size={16}/></button>
                </div>
              </div>
            ) : (
              <div className="s-smooth-appear">
                <div className="s-bubble-ai">
                  {/* LABEL MODEL AI */}
                  <span className="s-model-tag">{msg.model === 'deep' ? '⚡ Deep Search Mode' : '⚡ Fast Chat Mode'}</span>
                  <div dangerouslySetInnerHTML={formatMarkdown(msg.content)} className="select-text" />
                </div>
                {/* ACTION BAR AI (IKON SAJA) */}
                <div className="s-action-bar">
                  <button className="s-action-icon" onClick={() => handleCopy(msg.content)} title="Salin"><Copy size={16}/></button>
                  <button className="s-action-icon" onClick={() => performSearch(messages[index-1]?.content || "Ulangi")} title="Regenerate"><RefreshCw size={16}/></button>
                </div>

                <div className="s-info-container">
                  {msg.sources?.length > 0 && (
                    <div className="s-info-card">
                      <h4><MaterialIcon name="link" /> Sources</h4>
                      <ul className="s-list">
                        {msg.sources.map((url, i) => {
                          let domain = url; try { domain = new URL(url).hostname; } catch(e){}
                          return <li key={i}><a href={url} target="_blank" rel="noreferrer">{domain}</a></li>;
                        })}
                      </ul>
                    </div>
                  )}
                  {msg.similar?.length > 0 && (
                    <div className="s-info-card">
                      <h4><MaterialIcon name="manage_search" /> Related</h4>
                      <ul className="s-list">
                        {msg.similar.map((q, i) => {
                          const text = q.question || q;
                          return <li key={i} onClick={() => { setInputValue(text); }}>{text}</li>;
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )})}

        {isLoading && (
          <div style={{textAlign: 'center', color: '#8e9b95', padding: '20px 0'}}>
            <div className="s-loader-pulse"></div>
            <p className="font-bold tracking-widest text-[10px] uppercase mt-4">Sanexus is processing...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* INPUT AREA */}
      <div className="s-input-container">
        {pendingNews && (
          <div className="s-preview-card">
            <img src={pendingNews.image} alt="preview" className="s-preview-img" />
            <div className="s-preview-text">
              <h4 className="s-preview-title">{pendingNews.title}</h4>
              <p style={{color: '#8e9b95', fontSize: '10px', margin: 0}}>Tambahkan instruksi (opsional)...</p>
            </div>
            <button type="button" onClick={() => setPendingNews(null)} style={{background: 'none', border: 'none', color: '#ff6b6b'}}><MaterialIcon name="close" /></button>
          </div>
        )}
        
        <div className="s-search-bar-wrap">
          {/* TOMBOL GANTI MODEL MELAYANG (⚡) */}
          <div className="s-model-toggle" onClick={toggleModel} 
               style={{ color: activeModel === 'auto' ? '#5de2ff' : activeModel === 'deep' ? '#a3b8a3' : '#60a5fa' }}
               title="Ganti Model AI">
            <Zap size={16} fill={activeModel !== 'auto' ? "currentColor" : "none"} />
          </div>

          <form onSubmit={handleSubmit} className="s-search-bar">
            <input 
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder={activeModel === 'deep' ? "Mode Deep Search aktif..." : pendingNews ? "Ketik instruksi analisis..." : "Ketik pesan atau cari berita..."} 
              disabled={isLoading}
              required={!pendingNews}
            />
            <button type="submit" disabled={isLoading} className="s-submit-btn" style={{opacity: isLoading ? 0.5 : 1}}>
              <MaterialIcon name="arrow_upward" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}