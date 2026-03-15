import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Send, MessageCircle, PlusCircle, Trash2, Copy, RefreshCw, Edit2, Share2, ChevronUp, ChevronDown, HelpCircle, Globe, Link as LinkIcon, Zap, BrainCircuit, Briefcase, Megaphone, TrendingUp } from 'lucide-react';

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);
const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
);

const formatMarkdown = (text) => {
  if (!text) return "";
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-extrabold">$1</strong>');
  formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="font-bold text-lg mt-5 mb-2 text-gray-700">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="font-black text-xl mt-6 mb-3 text-[#a3b8a3] border-b border-black/5 pb-2">$1</h2>');
  formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="font-black text-2xl mt-6 mb-4 text-[#b8cbb8]">$1</h1>');
  formatted = formatted.replace(/^\d+\.\s(.*$)/gim, '<div class="ml-4 mb-2 flex"><span class="mr-2 font-bold text-[#a3b8a3]">•</span><span>$1</span></div>');
  formatted = formatted.replace(/\[(\d+)\]/g, '<sup class="text-[#a3b8a3] font-bold ml-0.5 px-0.5 cursor-help" title="Lihat Sumber di Bawah">$1</sup>');
  formatted = formatted.replace(/\n/g, '<br />');
  return { __html: formatted };
};

export default function SanexusChat({ initialQuery, onClose }) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Sanexus sedang memikirkan...");
  const [pendingNews, setPendingNews] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(Date.now().toString());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  const [activeModel, setActiveModel] = useState('auto');
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const messagesEndRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, isLoading, loadingText]);

  useEffect(() => {
    let timer;
    if (isLoading) {
      const texts = [
        "Sanexus sedang memikirkan...", 
        "Memahami konteks obrolan...", 
        "Mencari & memvalidasi data...", 
        "Menyusun jawaban terbaik..."
      ];
      let step = 0;
      const updateLoadingText = () => {
        setLoadingText(texts[step % texts.length]);
        step++;
        timer = setTimeout(updateLoadingText, Math.floor(Math.random() * 1500) + 1000);
      };
      timer = setTimeout(updateLoadingText, 500);
    } else {
      setLoadingText("Sanexus sedang memikirkan...");
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

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

  // 🔥 TRIO MACAN LOGIC (FIXED: 4 PERTANYAAN PASTI MUNCUL)
  const performSearch = async (queryText, forceModel = null, skipUserMessage = false) => {
      if (!queryText.trim()) return;

      if (!skipUserMessage) {
         setMessages(prev => [...prev, { role: 'user', content: queryText }]);
      }
      setIsLoading(true);
      setInputValue('');
      setIsSidebarOpen(false);

      let targetModel = forceModel || (activeModel === 'auto' ? 'fast' : activeModel);
      let finalApiQuery = queryText;

      // 🧠 PERPLEXITY HANYA SEBAGAI PENERJEMAH (CLEAN QUERY)
      if (targetModel !== 'deep' && messages.length > 0) {
        if (queryText.split(" ").length < 6) {
           setLoadingText("Menganalisis konteks obrolan...");
           const history = messages.slice(-2).map(m => m.content).join(" | ");
           const translatorPrompt = `Berdasarkan riwayat: "${history}". Ubah pertanyaan "${queryText}" menjadi satu kalimat pencarian mandiri yang utuh. Jawab HANYA dengan kalimat pencariannya saja, tanpa tanda kutip.`;
           try {
              const res = await fetch(`/api/ngobrol?question=${encodeURIComponent(translatorPrompt)}`);
              const data = await res.json();
              if (data.answer && data.answer.length < 150) {
                 finalApiQuery = data.answer.replace(/["']/g, '').trim(); 
              }
           } catch(e) {
              console.log("Penerjemah gagal, lanjut dengan query asli");
           } 
        } 
      }

      // Endpoint: selalu pakai /api (Turboseek) agar dapet similar questions, kecuali user set 'deep'
      const endpoint = targetModel === 'deep' ? '/api/ngobrol' : '/api';

      try {
        setLoadingText("Sanexus sedang memvalidasi data...");
        const response = await fetch(`${endpoint}?question=${encodeURIComponent(finalApiQuery)}`);
        const data = await response.json();
        
        if (response.ok && !data.error) {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            content: data.answer || data, 
            model: targetModel,
            sources: data.sources || [],
            similar: data.similarQuestions || []
          }]);
        } else {
          throw new Error("API Error");
        }
      } catch (error) {
        setMessages(prev => [...prev, { role: 'ai', content: 'Gagal menyambung ke jaringan Sanexus.' }]);
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
          content: customText
      };
      setMessages(prev => [...prev, newMsg]);
      setPendingNews(null);
      setInputValue('');
      
      const hiddenPrompt = `Tolong baca dan analisis berita ini. Judul: '${pendingNews.title}'. Link: ${pendingNews.link}. Instruksi Tambahan: ${customText || 'Berikan rangkuman komprehensif.'}`;
      performSearch(hiddenPrompt, 'fast', true); 
    } else {
      performSearch(inputValue);
    }
  };

  const handleCopy = (t) => { navigator.clipboard.writeText(t); setToastMsg("Tersalin!"); setTimeout(()=>setToastMsg(""), 2000); };
  const handleEdit = (text) => { setInputValue(text); setToastMsg("Pesan dimasukkan ke kolom ketik"); setTimeout(()=>setToastMsg(""), 2000); };
  const handleShare = async (userText, aiText) => {
    const shareText = `*Tanya:* ${userText}\n\n*SanexusAI:*\n${aiText || 'Sedang memproses...'}\n\n_Pantau Info Market di IndoSawit.news_`;
    if (navigator.share) { try { await navigator.share({ title: 'Sanexus AI', text: shareText }); } catch (err) {} } 
    else { handleCopy(shareText); setToastMsg("Teks disalin"); setTimeout(()=>setToastMsg(""), 2000); }
  };

  const createNewSession = () => { setMessages([]); setCurrentSessionId(Date.now().toString()); setIsSidebarOpen(false); setPendingNews(null); };
  const loadSession = (id) => { const session = sessions.find(s => s.id === id); if(session) { setMessages(session.messages); setCurrentSessionId(session.id); } setIsSidebarOpen(false); setPendingNews(null); };
  const clearAllHistory = () => { setSessions([]); setMessages([]); setCurrentSessionId(Date.now().toString()); localStorage.removeItem('sanexus_sessions'); setIsSidebarOpen(false); };

  const MaterialIcon = ({ name, onClick, style }) => <span onClick={onClick} className="material-icons-round" style={{ fontFamily: '"Material Icons Round"', fontSize: '24px', ...style }}>{name}</span>;

  return (
    <div className="sanexus-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Playfair+Display:wght@400;700&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
        .sanexus-wrapper {
            position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column;
            background: #050705; color: white; font-family: 'Manrope', sans-serif;
        }
        .s-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); background: #050705; z-index: 50; }
        .s-chat-area { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 220px; scroll-behavior: smooth; }
        
        .s-welcome-container { margin-top: 20px; animation: smoothPop 0.5s ease-out forwards; }
        .s-welcome-title { font-family: 'Playfair Display', serif; font-size: 2.8rem; color: #b8cbb8; margin-bottom: 25px; line-height: 1.1; font-weight: 400; }
        .s-welcome-subtitle { font-family: 'Playfair Display', serif; color: #fff; font-weight: 700; }
        .s-pill-scroll { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 20px; }
        .s-pill-scroll::-webkit-scrollbar { display: none; }
        .s-action-pill { background: #1a221f; border: 1px solid rgba(255,255,255,0.1); padding: 10px 18px; border-radius: 20px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; color: #e2e8f0; white-space: nowrap; cursor: pointer; transition: 0.2s; font-weight: 600; }
        .s-action-pill:hover { background: #b8cbb8; color: #000; }
        
        .s-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .s-big-card { background: #151a18; border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 20px; cursor: pointer; transition: 0.2s; }
        .s-big-card:hover { border-color: #b8cbb8; transform: translateY(-2px); }
        .s-big-card-icon { color: #8e9b95; margin-bottom: 15px; }
        .s-big-card-title { font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: 8px; }
        .s-big-card-desc { font-size: 0.75rem; color: #8e9b95; line-height: 1.4; }

        .s-bubble-user { background: #1e293b; border: 1px solid #334155; color: #f8fafc; text-align: left; margin-left: auto; max-width: 85%; border-radius: 20px 20px 0 20px; padding: 15px 20px; margin-bottom: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); word-wrap: break-word; font-weight: 500; }
        .s-bubble-ai { background: white; color: #1a201d; border-radius: 20px 20px 20px 0; max-width: 95%; padding: 22px; margin-bottom: 5px; line-height: 1.7; box-shadow: 0 10px 30px rgba(0,0,0,0.4); word-wrap: break-word; }
        .s-model-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #a3b8a3; margin-bottom: 10px; display: block; opacity: 0.9; letter-spacing: 0.5px; }
        
        .s-sources-grid { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; margin-bottom: 10px; }
        .s-source-card { background: #151a18; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 10px 15px; display: flex; align-items: center; gap: 12px; text-decoration: none; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
        .s-source-card:hover { background: #1a221f; border-color: #b8cbb8; transform: translateY(-2px); }
        .s-source-domain { font-size: 12px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .s-similar-box { margin-top: 15px; margin-bottom: 25px; padding-left: 5px; }
        .s-similar-title { font-size: 10px; color: #8e9b95; font-weight: 800; margin-bottom: 10px; text-transform: uppercase; display: flex; align-items: center; gap: 5px; }
        .s-similar-item { padding: 12px 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; font-size: 13px; color: #b8cbb8; margin-bottom: 8px; cursor: pointer; transition: 0.2s; font-weight: 600; }
        .s-similar-item:hover { background: rgba(184, 203, 184, 0.1); border-color: #b8cbb8; color: #fff; }

        .s-action-icon { background: transparent; border: none; color: #8e9b95; cursor: pointer; opacity: 0.6; display: flex; align-items: center; transition: 0.2s; padding: 5px; }
        .s-action-icon:hover { opacity: 1; color: #b8cbb8; }

        .s-input-container { position: absolute; bottom: 0; left: 0; width: 100%; padding: 0 20px 25px 20px; background: linear-gradient(0deg, #050705 85%, transparent); z-index: 100; }
        .s-search-bar { display: flex; align-items: center; background: #1a221f; border-radius: 50px; padding: 8px 8px 8px 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 5px 20px rgba(0,0,0,0.5); }
        .s-search-bar input { flex: 1; background: transparent; border: none; color: white; outline: none; font-size: 0.95rem; }
        .s-submit-btn { width: 45px; height: 45px; border-radius: 50%; background: #b8cbb8; color: #000; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .s-submit-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .s-model-bar { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; position: relative; }
        .s-model-trigger { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #8e9b95; cursor: pointer; text-transform: uppercase; font-weight: 800; }
        .s-model-info-pop { position: absolute; bottom: 35px; left: 0; background: #1a221f; border: 1px solid #334155; padding: 15px; border-radius: 15px; width: 280px; z-index: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.6); animation: smoothPop 0.2s ease-out; }
        .s-model-opt { font-size: 10px; color: #8e9b95; cursor: pointer; padding: 5px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); font-weight: 700; }
        .s-model-opt.active { background: #b8cbb8; color: #000; border-color: #b8cbb8; }

        .s-sidebar { position: fixed; top: 0; left: -100%; width: 100%; height: 100%; z-index: 200; background: rgba(0,0,0,0.6); transition: 0.3s; }
        .s-sidebar.visible { left: 0; }
        .s-sidebar-content { width: 80%; max-width: 300px; height: 100%; background: #0a0d0c; padding: 25px 20px; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.05); }
        .s-mini-profile { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(184, 203, 184, 0.05); border: 1px solid rgba(184, 203, 184, 0.2); border-radius: 12px; cursor: pointer; transition: 0.2s; margin-top: auto; }
        .s-mini-profile img { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #b8cbb8; object-fit: cover; }
        .s-mini-profile-info h4 { font-size: 0.9rem; color: #fff; margin: 0; font-weight: 700; }
        .s-mini-profile-info p { font-size: 0.7rem; color: #8e9b95; margin: 0; }

        .s-full-profile-overlay { position: fixed; inset: 0; background: #050705; z-index: 300; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 60px 20px 40px 20px; text-align: center; overflow-y: auto; }
        .s-close-full-profile { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 310; cursor: pointer; }
        .s-collab-badge { background: linear-gradient(90deg, rgba(34,197,94,0.1) 0%, rgba(184,203,184,0.1) 100%); border: 1px solid rgba(184,203,184,0.3); padding: 8px 15px; border-radius: 20px; font-size: 0.75rem; color: #b8cbb8; margin-bottom: 30px; letter-spacing: 0.5px; font-weight: 700; }

        .s-toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #a3b8a3; color: #050705; padding: 8px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; z-index: 1000; box-shadow: 0 4px 15px rgba(163,184,163,0.3); }
        
        .s-loader-pulse { width: 40px; height: 40px; background: #b8cbb8; border-radius: 50%; margin: 0 auto 10px; animation: s-pulse-ring 1.2s infinite; }
        @keyframes s-pulse-ring { 0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(184, 203, 184, 0); } 100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0); } }
        @keyframes smoothPop { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {toastMsg && <div className="s-toast">{toastMsg}</div>}

      <header className="s-header">
        <button className="s-btn" onClick={() => setIsSidebarOpen(true)} style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer'}}><MaterialIcon name="grid_view" /></button>
        <span style={{fontFamily: "'Playfair Display', serif", color: '#b8cbb8', fontWeight: 'bold', fontSize: '1.2rem'}}>SanexusAI</span>
        <button className="s-btn" onClick={onClose} style={{background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer'}}><MaterialIcon name="close" /></button>
      </header>

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
           
           {sessions.length > 0 && <button onClick={clearAllHistory} style={{padding: '8px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '12px', color: '#ff6b6b', fontWeight: 'bold', marginTop: '10px', marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer'}}><Trash2 size={16}/> Bersihkan Semua</button>}
           
           <div className="s-mini-profile" onClick={() => { setIsSidebarOpen(false); setShowFullProfile(true); }}>
             <img src="https://e.top4top.io/p_3721610g20.jpg" alt="SANN404" />
             <div className="s-mini-profile-info">
               <h4>SANN404</h4>
               <p>Master Coder</p>
             </div>
           </div>
        </div>
      </aside>

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
          
          <p style={{fontSize: '0.9rem', color: '#8e9b95', marginBottom: '30px', maxWidth: '300px', lineHeight: '1.6'}}>Node.js Expert & Master Coder</p>
          
          <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px'}}>
            <a href="#" style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px', color: '#fff'}}><WhatsAppIcon size={20}/></a>
            <a href="#" style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px', color: '#fff'}}><WhatsAppIcon size={20}/></a>
            <a href="#" style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px', color: '#fff'}}><WhatsAppIcon size={20}/></a>
          </div>
          <a href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L" target="_blank" rel="noreferrer" style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'white', color: '#000', padding: '15px 30px', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold'}}>
            <WhatsAppIcon size={20}/> JOIN SALURAN SANN404
          </a>
        </div>
      )}

      <main className="s-chat-area">
        {messages.length === 0 && !isLoading && (
          <div className="s-welcome-container">
            <h2 className="s-welcome-title">Welcome Sir, <br/><span className="s-welcome-subtitle">User</span></h2>
            
            <div className="s-pill-scroll">
              <div className="s-action-pill" onClick={() => performSearch("Berita Politik Terkini")}><Briefcase size={16}/> Job Finder UX</div>
              <div className="s-action-pill" onClick={() => performSearch("Perkembangan AI")}><Megaphone size={16}/> Marketing Strategy</div>
            </div>

            <div className="s-card-grid">
              <div className="s-big-card" onClick={() => performSearch("Analisis strategi bisnis terbaru")}>
                <Briefcase size={26} className="s-big-card-icon" />
                <h3 className="s-big-card-title">Business</h3>
                <p className="s-big-card-desc">Analyze market trends and business strategies.</p>
              </div>
              <div className="s-big-card" onClick={() => performSearch("Update IHSG, emas, dan crypto hari ini")}>
                <TrendingUp size={26} className="s-big-card-icon" />
                <h3 className="s-big-card-title">Info Market</h3>
                <p className="s-big-card-desc">Pantau pergerakan IHSG, harga emas, dan crypto.</p>
              </div>
            </div>
          </div>
        )}

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
                  {msg.content && <span>{msg.content}</span>}
                </div>
                <div style={{display: 'flex', gap: '15px', marginRight: '5px', marginTop: '5px'}}>
                   <button className="s-action-icon" onClick={() => handleEdit(msg.content)} title="Edit"><Edit2 size={16}/></button>
                   <button className="s-action-icon" onClick={() => handleCopy(msg.content)} title="Salin"><Copy size={16}/></button>
                   <button className="s-action-icon" onClick={() => handleShare(msg.content, nextAiMsg)} title="Bagikan"><Share2 size={16}/></button>
                </div>
              </div>
            ) : (
              <div style={{marginBottom: '35px'}}>
                <div className="s-bubble-ai">
                  <span className="s-model-tag">⚡ {msg.model === 'deep' ? 'Deep Search' : 'Fast Chat'}</span>
                  <div dangerouslySetInnerHTML={formatMarkdown(msg.content)} />
                </div>
                <div style={{display: 'flex', gap: '15px', marginLeft: '5px', marginTop: '5px'}}>
                   <button className="s-action-icon" onClick={() => handleCopy(msg.content)} title="Salin"><Copy size={16}/></button>
                   <button className="s-action-icon" onClick={() => performSearch(messages[i-1]?.content)} title="Regenerate"><RefreshCw size={16}/></button>
                </div>

                {msg.sources?.length > 0 && (
                  <div className="s-sources-grid">
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#8e9b95', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px', marginLeft: '5px'}}>
                      <Globe size={14}/> Sumber Terpercaya
                    </div>
                    {msg.sources.slice(0, 5).map((url, index) => {
                      let domain = url; try { domain = new URL(url).hostname; } catch(e){}
                      return (
                        <a key={index} href={url} target="_blank" rel="noreferrer" className="s-source-card">
                          <div style={{background: 'rgba(184, 203, 184, 0.1)', padding: '8px', borderRadius: '8px', color: '#b8cbb8', display: 'flex'}}><LinkIcon size={16}/></div>
                          <span className="s-source-domain">{domain}</span>
                        </a>
                      );
                    })}
                  </div>
                )}

                {msg.similar?.length > 0 && (
                  <div className="s-similar-box">
                    <div className="s-similar-title"><MessageCircle size={14}/> Pertanyaan Terkait</div>
                    {msg.similar.map((q, idx) => {
                      const textQ = typeof q === 'string' ? q : q.question;
                      return (
                        <div key={idx} className="s-similar-item" onClick={() => performSearch(textQ)}>
                          {textQ}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )})}

        {isLoading && (
          <div style={{textAlign: 'center', padding: '30px 0', opacity: 0.9}}>
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
            {isModelSelectorOpen ? <ChevronDown size={14}/> : <ChevronUp size={14}/>}
            Pilih Model: <span className="text-[#b8cbb8] ml-1" style={{fontSize: '11px'}}>{activeModel.toUpperCase()}</span>
          </div>
          
          <div style={{cursor: 'pointer', color: '#8e9b95'}} onClick={() => setShowInfo(!showInfo)}>
            <HelpCircle size={14}/>
          </div>

          {showInfo && (
            <div className="s-model-info-pop">
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center'}}>
                <span className="font-bold text-[12px] text-[#b8cbb8] uppercase tracking-widest flex items-center gap-2"><BrainCircuit size={16}/> Sanexus Engine</span>
                <Trash2 size={14} color="#ff6b6b" style={{cursor: 'pointer'}} onClick={() => setShowInfo(false)}/>
              </div>
              <div className="text-[11px] space-y-3 leading-relaxed text-[#e2e8f0]">
                <p><span className="text-[#5de2ff] font-bold">AUTO:</span> Deteksi otomatis. Fast untuk ngobrol, Deep untuk cari berita/riset.</p>
                <p><span className="text-[#60a5fa] font-bold">FAST:</span> Respons kilat (Turboseek). Cocok untuk tanya jawab cepat.</p>
                <p><span className="text-[#a3b8a3] font-bold">DEEP:</span> Analisis mendalam (Perplexity). Menyusuri internet untuk fakta detail.</p>
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
            placeholder={isLoading ? "Mohon tunggu sebentar..." : "Tanya atau cari info market..."} 
            disabled={false} 
            required={!pendingNews}
          />
          <button type="submit" className="s-submit-btn" disabled={isLoading}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}