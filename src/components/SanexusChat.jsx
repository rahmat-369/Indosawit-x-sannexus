import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Send, MessageCircle, PlusCircle, Trash2, Copy, RefreshCw, Edit2, Share2, ChevronUp, ChevronDown, HelpCircle, Globe, Link as LinkIcon, Zap, BrainCircuit } from 'lucide-react';

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);
const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
);

// MARKDOWN RENDERER DENGAN SUPERSCRIPT CITATIONS
const formatMarkdown = (text) => {
  if (!text) return "";
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-extrabold">$1</strong>');
  formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="font-bold text-lg mt-5 mb-2 text-gray-700">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="font-black text-xl mt-6 mb-3 text-[#a3b8a3] border-b border-black/5 pb-2">$1</h2>');
  formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="font-black text-2xl mt-6 mb-4 text-[#b8cbb8]">$1</h1>');
  formatted = formatted.replace(/^\d+\.\s(.*$)/gim, '<div class="ml-4 mb-2 flex"><span class="mr-2 font-bold text-[#a3b8a3]">•</span><span>$1</span></div>');
  formatted = formatted.replace(/\[(\d+)\]/g, '<sup class="text-[#a3b8a3] font-bold ml-0.5 px-0.5 cursor-pointer hover:text-green-600 transition-colors" title="Lihat Sumber di Bawah">$1</sup>');
  formatted = formatted.replace(/\n/g, '<br />');
  return { __html: formatted };
};

export default function SanexusChat({ initialQuery, onClose }) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentProcessingModel, setCurrentProcessingModel] = useState('fast'); // Tracker buat milih animasi loader
  const [loadingText, setLoadingText] = useState("Sanexus sedang memproses...");
  const [pendingNews, setPendingNews] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(Date.now().toString());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  const [activeModel, setActiveModel] = useState('auto');
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const messagesEndRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); 
  }, [messages, isLoading, loadingText]);

  // ADAPTIVE LOADER: Animasi beda antara Fast dan Deep
  useEffect(() => {
    let timer;
    if (isLoading) {
      if (currentProcessingModel === 'deep') {
        const texts = [
          "Menyinkronkan memori obrolan...", 
          "Mencari data terbaru di internet...", 
          "Membaca & memvalidasi sumber...", 
          "Menyusun rangkuman komprehensif...", 
          "Menulis jawaban final..."
        ];
        let step = 0;
        const updateLoadingText = () => {
          setLoadingText(texts[step % texts.length]);
          step++;
          timer = setTimeout(updateLoadingText, Math.floor(Math.random() * 1500) + 1000);
        };
        timer = setTimeout(updateLoadingText, 300);
      } else {
        // Mode Fast: Teks statis/cepat
        setLoadingText("Mencari jawaban kilat...");
      }
    } else {
      setLoadingText("Sanexus sedang memproses...");
    }
    return () => clearTimeout(timer);
  }, [isLoading, currentProcessingModel]);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const saved = JSON.parse(localStorage.getItem('sanexus_sessions')) || [];
      setSessions(saved);
      if (initialQuery?.type === 'news') setPendingNews(initialQuery);
      else if (typeof initialQuery === 'string' && initialQuery.trim() !== "") performSearch(initialQuery);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const saved = JSON.parse(localStorage.getItem('sanexus_sessions')) || [];
      let title = "Obrolan Baru";
      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg) {
         title = firstUserMsg.isNewsCard ? firstUserMsg.newsData.title : firstUserMsg.content;
         if (title.length > 30) title = title.substring(0, 30) + '...';
      }
      const updated = { id: currentSessionId, messages, title };
      const index = saved.findIndex(s => s.id === currentSessionId);
      if (index >= 0) saved[index] = updated; else saved.unshift(updated);
      localStorage.setItem('sanexus_sessions', JSON.stringify(saved));
      setSessions(saved);
    }
  }, [messages, currentSessionId]);

  // CENTRAL MEMORY INJECTOR & SMART AUTO-MODEL
  const performSearch = async (queryText, forceModel = null) => {
      if (!queryText.trim()) return;

      // 1. Logika Deteksi Niat (Auto Model)
      const needsInternet = /berita|cari|internet|deep|detil|analisis|kabarnya|tadi|siapa|info|lanjut|bagaimana|mengapa|kenapa|kasus/i.test(queryText);
      const targetModel = forceModel || (activeModel === 'auto' ? (needsInternet ? 'deep' : 'fast') : activeModel);
      
      setCurrentProcessingModel(targetModel); // Beritahu loader ini pake mode apa

      // 2. Jahit Memori Universal (Dari Fast/Deep disatukan)
      let contextQuery = queryText;
      if (messages.length > 0) {
        // Ambil 3 pesan terakhir biar konteksnya kuat
        const history = messages.slice(-3).map(m => {
          const sender = m.role === 'user' ? 'User' : 'AI';
          const text = m.content ? m.content.substring(0, 150) : 'Membagikan Berita';
          return `${sender}: ${text}`;
        }).join("\n");
        contextQuery = `RIWAYAT OBROLAN SEBELUMNYA:\n${history}\n\nPERTANYAAN USER SAAT INI (Jawab berdasarkan riwayat jika berkaitan): ${queryText}`;
      }

      setMessages(prev => [...prev, { role: 'user', content: queryText }]);
      setIsLoading(true);
      setInputValue('');
      setIsSidebarOpen(false);

      const endpoint = targetModel === 'deep' ? '/api/ngobrol' : '/api';

      try {
        const response = await fetch(`${endpoint}?question=${encodeURIComponent(contextQuery)}`);
        const data = await response.json();
        
        if (response.ok && !data.error) {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            content: data.answer || data, 
            model: targetModel,
            sources: data.sources || [] 
          }]);
        } else {
          throw new Error("API Error");
        }
      } catch (error) {
        // Fallback otomatis
        if (targetModel === 'deep') {
           try {
             setCurrentProcessingModel('fast'); // Ganti loader fallback
             const resTurbo = await fetch(`/api?question=${encodeURIComponent(contextQuery)}`);
             const dataTurbo = await resTurbo.json();
             setMessages(prev => [...prev, { role: 'ai', content: dataTurbo.answer, model: 'fast', sources: dataTurbo.sources || [] }]);
           } catch(err) {
             setMessages(prev => [...prev, { role: 'ai', content: 'Gagal menyambung ke Sanexus.' }]);
           }
        } else {
           setMessages(prev => [...prev, { role: 'ai', content: 'Gagal menyambung ke otak Sanexus.' }]);
        }
      } finally { setIsLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return; 

    if (pendingNews) {
      const customText = inputValue.trim();
      const newMsg = {
          role: 'user',
          isNewsCard: true,
          newsData: pendingNews,
          content: customText || `Tolong analisis berita ini: ${pendingNews.title}`
      };
      
      setMessages(prev => [...prev, newMsg]);
      setIsLoading(true); setInputValue(''); setPendingNews(null);
      setCurrentProcessingModel('deep'); // Wajib Deep buat baca link
      
      const contextPrompt = `Tolong baca dan analisis berita ini. Judul: '${pendingNews.title}'. Link: ${pendingNews.link}. Instruksi Tambahan: ${customText ? customText : 'Berikan rangkuman komprehensif.'}`;
      
      fetch(`/api/ngobrol?question=${encodeURIComponent(contextPrompt)}`)
        .then(res => res.json())
        .then(data => {
          if(!data.error) {
            setMessages(prev => [...prev, { role: 'ai', content: data.answer || data, model: 'deep', sources: data.sources || [] }]);
          } else { throw new Error('Perplexity error'); }
          setIsLoading(false);
        }).catch(() => {
          setCurrentProcessingModel('fast');
          fetch(`/api?question=${encodeURIComponent(`Analisis fakta berita: ${pendingNews.title}`)}`)
            .then(r => r.json())
            .then(d => {
               setMessages(prev => [...prev, { role: 'ai', content: d.answer, model: 'fast', sources: d.sources || [] }]);
               setIsLoading(false);
            }).catch(() => { setIsLoading(false); });
        });
    } else {
      performSearch(inputValue);
    }
  };

  const handleCopy = (t) => { navigator.clipboard.writeText(t); setToastMsg("Tersalin!"); setTimeout(()=>setToastMsg(""), 2000); };
  const handleEdit = (text) => { setInputValue(text); setToastMsg("Pesan dimasukkan ke kolom ketik"); setTimeout(()=>setToastMsg(""), 2000); };
  const handleShare = async (userText, aiText) => {
    const shareText = `*Tanya:* ${userText}\n\n*SanexusAI:*\n${aiText || 'Sedang memproses...'}\n\n_Baca berita selengkapnya di IndoSawit.news_`;
    if (navigator.share) { try { await navigator.share({ title: 'Sanexus AI', text: shareText }); } catch (err) {} } 
    else { handleCopy(shareText); setToastMsg("Teks disalin"); setTimeout(()=>setToastMsg(""), 2000); }
  };

  const createNewSession = () => { setMessages([]); setCurrentSessionId(Date.now().toString()); setIsSidebarOpen(false); setPendingNews(null); };
  const loadSession = (id) => { const session = sessions.find(s => s.id === id); if(session) { setMessages(session.messages); setCurrentSessionId(session.id); } setIsSidebarOpen(false); setPendingNews(null); };
  const clearAllHistory = () => { setSessions([]); setMessages([]); setCurrentSessionId(Date.now().toString()); localStorage.removeItem('sanexus_sessions'); setIsSidebarOpen(false); };

  const MaterialIcon = ({ name }) => <span className="material-icons-round" style={{ fontFamily: '"Material Icons Round"', fontSize: '24px' }}>{name}</span>;

  return (
    <div className="sanexus-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Playfair+Display:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
        .sanexus-wrapper {
            position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column;
            background: #050705; color: white; font-family: 'Manrope', sans-serif;
        }
        .s-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); background: #050705; z-index: 50; }
        .s-chat-area { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 220px; scroll-behavior: smooth; }
        
        .s-bubble-user { background: #1e293b; border: 1px solid #334155; color: #f8fafc; text-align: left; margin-left: auto; max-width: 85%; border-radius: 20px 20px 0 20px; padding: 15px 20px; margin-bottom: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); word-wrap: break-word; font-weight: 500; }
        .s-bubble-ai { background: white; color: #1a201d; border-radius: 20px 20px 20px 0; max-width: 95%; padding: 22px; margin-bottom: 5px; line-height: 1.7; box-shadow: 0 10px 30px rgba(0,0,0,0.4); word-wrap: break-word; }
        .s-model-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #a3b8a3; margin-bottom: 10px; display: block; opacity: 0.9; letter-spacing: 0.5px; }
        
        /* SOURCE CARDS IDENTITY */
        .s-sources-grid { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; margin-bottom: 20px; }
        .s-source-card { background: #151a18; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 10px 15px; display: flex; align-items: center; gap: 12px; text-decoration: none; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .s-source-card:hover { background: #1a221f; border-color: #b8cbb8; transform: translateY(-2px); }
        .s-source-domain { font-size: 12px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .s-action-icon { background: transparent; border: none; color: #8e9b95; cursor: pointer; opacity: 0.6; display: flex; align-items: center; transition: 0.2s; padding: 5px; }
        .s-action-icon:hover { opacity: 1; color: #b8cbb8; }

        .s-input-container { position: absolute; bottom: 0; left: 0; width: 100%; padding: 0 20px 25px 20px; background: linear-gradient(0deg, #050705 85%, transparent); z-index: 100; }
        .s-search-bar { display: flex; align-items: center; background: #1a221f; border-radius: 50px; padding: 8px 8px 8px 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 5px 20px rgba(0,0,0,0.5); }
        .s-search-bar input { flex: 1; background: transparent; border: none; color: white; outline: none; font-size: 0.95rem; }
        .s-submit-btn { width: 45px; height: 45px; border-radius: 50%; background: #b8cbb8; color: #000; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .s-submit-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .s-model-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; position: relative; }
        .s-model-trigger { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #8e9b95; cursor: pointer; text-transform: uppercase; font-weight: 800; }
        .s-model-info-pop { position: absolute; bottom: 35px; left: 0; background: #1a221f; border: 1px solid #334155; padding: 15px; border-radius: 15px; width: 280px; z-index: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.6); animation: slideUpPop 0.2s ease-out; }
        @keyframes slideUpPop { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .s-model-opt { font-size: 10px; color: #8e9b95; cursor: pointer; padding: 5px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); font-weight: 700; }
        .s-model-opt.active { background: #b8cbb8; color: #000; border-color: #b8cbb8; }

        .s-sidebar { position: fixed; top: 0; left: -100%; width: 100%; height: 100%; z-index: 200; background: rgba(0,0,0,0.6); transition: 0.3s; }
        .s-sidebar.visible { left: 0; }
        .s-sidebar-content { width: 80%; max-width: 300px; height: 100%; background: #0a0d0c; padding: 25px 20px; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.05); }

        .s-toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #a3b8a3; color: #050705; padding: 8px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; z-index: 1000; box-shadow: 0 4px 15px rgba(163,184,163,0.3); }
        .s-loader-pulse { width: 30px; height: 30px; background: #b8cbb8; border-radius: 50%; margin: 0 auto 10px; animation: s-pulse-ring 1.2s infinite; }
        @keyframes s-pulse-ring { 0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(184, 203, 184, 0); } 100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0); } }
      `}} />

      {toastMsg && <div className="s-toast">{toastMsg}</div>}

      <header className="s-header">
        <button className="s-btn" onClick={() => setIsSidebarOpen(true)} style={{background: 'none', border: 'none', color: '#fff'}}><MaterialIcon name="grid_view" /></button>
        <span style={{fontFamily: "'Playfair Display', serif", color: '#b8cbb8', fontWeight: 'bold'}}>SanexusAI</span>
        <button className="s-btn" onClick={onClose} style={{background: 'none', border: 'none', color: '#ff6b6b'}}><MaterialIcon name="close" /></button>
      </header>

      {/* SIDEBAR HISTORY */}
      <aside className={`s-sidebar ${isSidebarOpen ? 'visible' : ''}`} onClick={() => setIsSidebarOpen(false)}>
        <div className="s-sidebar-content" onClick={e => e.stopPropagation()}>
           <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
             <h3 className="font-bold text-lg">Riwayat Obrolan</h3>
             <MaterialIcon name="close" onClick={() => setIsSidebarOpen(false)} style={{cursor: 'pointer'}} />
           </div>
           <button onClick={createNewSession} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(184, 203, 184, 0.1)', border: '1px solid rgba(184,203,184,0.3)', borderRadius: '12px', color: '#b8cbb8', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer'}}>
             <PlusCircle size={16}/> Obrolan Baru
           </button>
           <div style={{flex: 1, overflowY: 'auto'}}>
             {sessions.map(s => (
               <div key={s.id} onClick={() => loadSession(s.id)} style={{padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', color: '#8e9b95', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '8px'}}>
                 <MessageCircle size={14} style={{opacity: 0.5}}/> {s.title}
               </div>
             ))}
           </div>
           {sessions.length > 0 && <button onClick={clearAllHistory} style={{padding: '12px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '12px', color: '#ff6b6b', fontWeight: 'bold', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'}}><Trash2 size={16}/> Bersihkan Semua</button>}
        </div>
      </aside>

      <main className="s-chat-area">
        {messages.map((msg, i) => {
          const nextAiMsg = messages[i + 1]?.role === 'ai' ? messages[i + 1].content : null;

          return (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
            {msg.role === 'user' ? (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '25px'}}>
                <div className="s-bubble-user">
                  {msg.isNewsCard && (
                    <div style={{background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '12px', marginBottom: msg.content ? '10px' : '0'}}>
                      <img src={msg.newsData.image} alt="news" style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px'}} />
                      <h4 style={{fontSize: '0.85rem', color: '#fff', margin: 0, lineHeight: '1.4'}}>{msg.newsData.title}</h4>
                    </div>
                  )}
                  {msg.content}
                </div>
                <div style={{display: 'flex', gap: '15px', marginRight: '5px', marginTop: '5px'}}>
                   <button className="s-action-icon" onClick={() => handleEdit(msg.content)} title="Edit"><Edit2 size={14}/></button>
                   <button className="s-action-icon" onClick={() => handleCopy(msg.content)} title="Salin"><Copy size={14}/></button>
                   <button className="s-action-icon" onClick={() => handleShare(msg.content, nextAiMsg)} title="Bagikan"><Share2 size={14}/></button>
                </div>
              </div>
            ) : (
              <div style={{marginBottom: '35px'}}>
                <div className="s-bubble-ai">
                  <span className="s-model-tag">⚡ {msg.model === 'deep' ? 'Deep Search' : 'Fast Chat'}</span>
                  <div dangerouslySetInnerHTML={formatMarkdown(msg.content)} />
                </div>
                <div style={{display: 'flex', gap: '15px', marginLeft: '5px', marginTop: '5px'}}>
                   <button className="s-action-icon" onClick={() => handleCopy(msg.content)} title="Salin"><Copy size={14}/></button>
                   <button className="s-action-icon" onClick={() => performSearch(messages[i-1]?.content)} title="Regenerate"><RefreshCw size={14}/></button>
                </div>

                {/* THE RETURN OF SOURCE CARDS (BANG SAN STYLE) */}
                {msg.sources?.length > 0 && (
                  <div className="s-sources-grid">
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#8e9b95', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px', marginLeft: '5px'}}>
                      <Globe size={12}/> Sumber Terpercaya (Klik untuk membaca)
                    </div>
                    {msg.sources.slice(0, 5).map((url, index) => {
                      let domain = url; try { domain = new URL(url).hostname; } catch(e){}
                      return (
                        <a key={index} href={url} target="_blank" rel="noreferrer" className="s-source-card">
                          <div style={{background: 'rgba(184, 203, 184, 0.1)', padding: '8px', borderRadius: '8px', color: '#b8cbb8', display: 'flex'}}><LinkIcon size={14}/></div>
                          <span className="s-source-domain">{domain}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )})}

        {/* ADAPTIVE LOADING ANIMATION */}
        {isLoading && (
          <div style={{textAlign: 'center', padding: '30px 0', opacity: 0.8}}>
            <div className="s-loader-pulse"></div>
            <p className="text-[10px] uppercase tracking-widest text-[#b8cbb8] font-bold mt-4 transition-all duration-300">
              {loadingText}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="s-input-container">
        {pendingNews && (
          <div style={{background: '#0d1110', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
            <img src={pendingNews.image} alt="preview" style={{width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover'}} />
            <div style={{flex: 1, overflow: 'hidden'}}>
              <h4 style={{fontSize: '0.8rem', color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{pendingNews.title}</h4>
              <p style={{color: '#8e9b95', fontSize: '10px', margin: 0}}>Tambahkan instruksi (opsional)...</p>
            </div>
            <button type="button" onClick={() => setPendingNews(null)} style={{background: 'none', border: 'none', color: '#ff6b6b'}}><MaterialIcon name="close" /></button>
          </div>
        )}

        <div className="s-model-bar">
          <div className="s-model-trigger" onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}>
            {isModelSelectorOpen ? <ChevronDown size={12}/> : <ChevronUp size={12}/>}
            Pilih Model: <span className="text-[#b8cbb8] ml-1">{activeModel.toUpperCase()}</span>
          </div>
          
          <div style={{cursor: 'pointer', color: '#8e9b95'}} onClick={() => setShowInfo(!showInfo)}>
            <HelpCircle size={12}/>
          </div>

          {showInfo && (
            <div className="s-model-info-pop">
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center'}}>
                <span className="font-bold text-[12px] text-[#b8cbb8] uppercase tracking-widest flex items-center gap-2"><BrainCircuit size={14}/> Sanexus Engine</span>
                <Trash2 size={12} color="#ff6b6b" style={{cursor: 'pointer'}} onClick={() => setShowInfo(false)}/>
              </div>
              <div className="text-[11px] space-y-3 leading-relaxed text-[#e2e8f0]">
                <p><span className="text-[#5de2ff] font-bold">AUTO:</span> Sistem mendeteksi otomatis. Nanya santai pakai Fast, nanya berita/riset pakai Deep.</p>
                <p><span className="text-[#60a5fa] font-bold">FAST:</span> Respons kilat. Cocok untuk ngobrol, tanya jawab umum, dan meringkas info cepat.</p>
                <p><span className="text-[#a3b8a3] font-bold">DEEP:</span> Analisis mendalam. Membaca internet secara real-time untuk riset, berita, & validasi fakta.</p>
              </div>
            </div>
          )}

          {isModelSelectorOpen && (
            <div style={{display: 'flex', gap: '8px', marginLeft: '10px'}}>
              {['auto', 'fast', 'deep'].map(m => (
                <div key={m} className={`s-model-opt ${activeModel === m ? 'active' : ''}`} onClick={() => {setActiveModel(m); setIsModelSelectorOpen(false);}}>
                  {m.toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="s-search-bar">
          <input 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            placeholder={isLoading ? "Mohon tunggu sebentar..." : "Tanya atau cari berita..."} 
            disabled={false} 
            required={!pendingNews}
          />
          <button type="submit" className="s-submit-btn" disabled={isLoading}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}