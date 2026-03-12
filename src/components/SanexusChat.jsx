import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Send, MessageCircle, PlusCircle, Trash2, Copy, RefreshCw, Edit2, Share2, ChevronUp, ChevronDown } from 'lucide-react';

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);
const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
);

// RENDERER MARKDOWN DENGAN SITASI SUPERSCRIPT
const formatMarkdown = (text) => {
  if (!text) return "";
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-extrabold">$1</strong>');
  formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="font-bold text-lg mt-5 mb-2 text-gray-700">$1</h3>');
  formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="font-black text-xl mt-6 mb-3 text-[#a3b8a3] border-b border-white/5 pb-2">$1</h2>');
  formatted = formatted.replace(/^# (.*$)/gim, '<h1 class="font-black text-2xl mt-6 mb-4 text-[#b8cbb8]">$1</h1>');
  formatted = formatted.replace(/^\d+\.\s(.*$)/gim, '<div class="ml-4 mb-2 flex"><span class="mr-2 font-bold text-[#a3b8a3]">•</span><span>$1</span></div>');
  
  // SITASI SUPERSCRIPT (GPT STYLE)
  formatted = formatted.replace(/\[(\d+)\]/g, '<sup class="text-[#a3b8a3] font-bold ml-0.5 px-0.5 cursor-help" title="Lihat Sumber">$1</sup>');
  
  formatted = formatted.replace(/\n/g, '<br />');
  return { __html: formatted };
};

export default function SanexusChat({ initialQuery, onClose }) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Sanexus sedang memproses..."); // State Loading Dinamis
  const [pendingNews, setPendingNews] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(Date.now().toString());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [activeModel, setActiveModel] = useState('auto');
  
  const messagesEndRef = useRef(null);
  const hasInitialized = useRef(false);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading, pendingNews, loadingText]);

  // LOGIKA LOADER DINAMIS (Humanoid Speed)
  useEffect(() => {
    let timer;
    if (isLoading) {
      const texts = [
        "Menyambung ke jaringan...", 
        "Mencari sumber relevan...", 
        "Membaca data artikel...", 
        "Menganalisis konteks obrolan...", 
        "Merangkum poin penting...", 
        "Menulis jawaban final..."
      ];
      let step = 0;

      const updateLoadingText = () => {
        setLoadingText(texts[step % texts.length]);
        step++;
        // Kecepatan acak antara 800ms sampai 2500ms biar nggak konsisten
        const randomDelay = Math.floor(Math.random() * 1700) + 800;
        timer = setTimeout(updateLoadingText, randomDelay);
      };

      timer = setTimeout(updateLoadingText, 500); // Trigger awal
    } else {
      setLoadingText("Sanexus sedang memproses...");
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
      const updated = { id: currentSessionId, messages, title: messages[0].content.substring(0, 30) };
      const index = saved.findIndex(s => s.id === currentSessionId);
      if (index >= 0) saved[index] = updated; else saved.unshift(updated);
      localStorage.setItem('sanexus_sessions', JSON.stringify(saved));
      setSessions(saved);
    }
  }, [messages]);

  const performSearch = async (queryText, forceModel = null) => {
      setMessages(prev => [...prev, { role: 'user', content: queryText }]);
      setIsLoading(true);
      setInputValue('');
      setIsSidebarOpen(false);

      const needsDeep = /cari di internet|berita|jelaskan mendalam|analisis/i.test(queryText);
      const targetModel = forceModel || (activeModel === 'auto' ? (needsDeep ? 'deep' : 'fast') : activeModel);
      const endpoint = targetModel === 'deep' ? '/api/ngobrol' : '/api';

      try {
        const response = await fetch(`${endpoint}?question=${encodeURIComponent(queryText)}`);
        const data = await response.json();
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: data.answer || data, 
          model: targetModel,
          sources: data.sources || [],
          similar: data.similarQuestions || []
        }]);
      } catch (error) {
        setMessages(prev => [...prev, { role: 'ai', content: 'Gagal menyambung ke otak Sanexus.' }]);
      } finally { setIsLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return; // ANTI SPAM PROTECT

    if (pendingNews) {
      const customText = inputValue.trim();
      const newsObj = pendingNews;
      
      // BUNGKUS DALAM SATU BUBBLE USER
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

      const prompt = `Analisis berita: ${newsObj.title}. Link: ${newsObj.link}. ${customText ? 'Instruksi: ' + customText : ''}`;
      
      // Paksa pakai Deep Search untuk Kartu Berita
      const targetModel = activeModel === 'fast' ? 'fast' : 'deep';
      const endpoint = targetModel === 'deep' ? '/api/ngobrol' : '/api';
      
      fetch(`${endpoint}?question=${encodeURIComponent(prompt)}`)
        .then(res => res.json())
        .then(data => {
          setMessages(prev => [...prev, { role: 'ai', content: data.answer || data, model: targetModel, sources: data.sources || [] }]);
          setIsLoading(false);
        }).catch(() => {
          setMessages(prev => [...prev, { role: 'ai', content: 'Gagal menganalisis berita.' }]);
          setIsLoading(false);
        });
    } else {
      performSearch(inputValue);
    }
  };

  const handleCopy = (t) => { navigator.clipboard.writeText(t); setToastMsg("Tersalin!"); setTimeout(()=>setToastMsg(""), 2000); };
  
  const createNewSession = () => { setMessages([]); setCurrentSessionId(Date.now().toString()); setIsSidebarOpen(false); setPendingNews(null); };
  const loadSession = (id) => { const session = sessions.find(s => s.id === id); if(session) { setMessages(session.messages); setCurrentSessionId(session.id); } setIsSidebarOpen(false); setPendingNews(null); };
  const clearAllHistory = () => { setSessions([]); setMessages([]); setCurrentSessionId(Date.now().toString()); localStorage.removeItem('sanexus_sessions'); };
  
  const handleEdit = (text) => { setInputValue(text); setToastMsg("Pesan dimasukkan ke kolom ketik"); setTimeout(()=>setToastMsg(""), 2000); };
  const handleShare = async (userText, aiText) => {
    const shareText = `*Tanya:* ${userText}\n\n*SanexusAI:*\n${aiText || 'Sedang memproses...'}\n\n_Baca berita di IndoSawit.news_`;
    if (navigator.share) { try { await navigator.share({ title: 'Sanexus AI', text: shareText }); } catch (err) {} } 
    else { handleCopy(shareText); setToastMsg("Teks disalin"); setTimeout(()=>setToastMsg(""), 2000); }
  };

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
        .s-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .s-chat-area { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 180px; }
        
        .s-bubble-user { background: #1e293b; border: 1px solid #334155; color: #f8fafc; margin-left: auto; max-width: 85%; border-radius: 20px 20px 0 20px; padding: 15px 20px; margin-bottom: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); word-wrap: break-word; }
        .s-bubble-ai { background: white; color: #1a201d; border-radius: 20px 20px 20px 0; max-width: 95%; padding: 22px; margin-bottom: 5px; line-height: 1.7; box-shadow: 0 10px 30px rgba(0,0,0,0.4); word-wrap: break-word; }
        .s-model-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #a3b8a3; margin-bottom: 10px; display: block; opacity: 0.8; }
        
        .s-action-bar { display: flex; gap: 15px; margin-bottom: 25px; padding: 0 5px; }
        .s-action-bar.right { justify-content: flex-end; }
        .s-action-icon { background: none; border: none; color: #8e9b95; cursor: pointer; opacity: 0.6; display: flex; align-items: center; }
        .s-action-icon:hover { opacity: 1; color: #b8cbb8; }

        /* ACCORDION MODEL SELECTOR */
        .s-model-accordion { margin-bottom: 8px; align-self: flex-start; }
        .s-model-trigger { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #8e9b95; cursor: pointer; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
        .s-model-trigger:hover { color: #fff; }
        .s-model-options { display: flex; gap: 10px; padding: 8px 0; animation: slideDown 0.2s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .s-model-opt { font-size: 10px; color: #8e9b95; cursor: pointer; padding: 4px 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); font-weight: 700;}
        .s-model-opt.active { background: #b8cbb8; color: #000; border-color: #b8cbb8; }

        .s-input-container { position: absolute; bottom: 0; left: 0; width: 100%; padding: 0 20px 25px 20px; background: linear-gradient(0deg, #050705 85%, transparent); z-index: 100; }
        .s-search-bar { display: flex; align-items: center; background: #1a221f; border-radius: 50px; padding: 8px 8px 8px 20px; border: 1px solid rgba(255,255,255,0.1); }
        .s-search-bar input { flex: 1; background: transparent; border: none; color: white; outline: none; font-size: 0.95rem; }
        .s-submit-btn { width: 45px; height: 45px; border-radius: 50%; background: #b8cbb8; color: #000; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
        .s-submit-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        
        .s-sidebar { position: fixed; top: 0; left: -100%; width: 100%; height: 100%; z-index: 200; background: rgba(0,0,0,0.6); transition: 0.3s; }
        .s-sidebar.visible { left: 0; }
        .s-sidebar-content { width: 80%; max-width: 300px; height: 100%; background: #0a0d0c; padding: 25px 20px; display: flex; flex-direction: column; }
        
        .s-toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #a3b8a3; color: #050705; padding: 8px 16px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; z-index: 1000; box-shadow: 0 4px 15px rgba(163,184,163,0.3); }
        
        .s-preview-card { background: #0d1110; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px; display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .s-preview-img { width: 45px; height: 45px; border-radius: 8px; object-fit: cover; }
        .s-preview-text { flex: 1; overflow: hidden; }
        
        .s-loader-pulse { width: 30px; height: 30px; background: #b8cbb8; border-radius: 50%; margin: 0 auto 10px; animation: s-pulse-ring 1.2s infinite; }
        @keyframes s-pulse-ring { 0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(184, 203, 184, 0); } 100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0); } }
      `}} />

      {toastMsg && <div className="s-toast">{toastMsg}</div>}

      <header className="s-header">
        <button className="s-btn" onClick={() => setIsSidebarOpen(true)}><MaterialIcon name="grid_view" /></button>
        <span style={{fontFamily: "'Playfair Display', serif", color: '#b8cbb8'}}>SanexusAI</span>
        <button className="s-btn" onClick={onClose}><MaterialIcon name="close" /></button>
      </header>

      <aside className={`s-sidebar ${isSidebarOpen ? 'visible' : ''}`} onClick={() => setIsSidebarOpen(false)}>
        <div className="s-sidebar-content" onClick={e => e.stopPropagation()}>
           <h3 className="font-bold mb-4">Riwayat Obrolan</h3>
           <button className="s-new-chat-btn mb-4" onClick={createNewSession}><PlusCircle size={16}/> Obrolan Baru</button>
           <div className="flex-1 overflow-y-auto">
             {sessions.map(s => (
               <div key={s.id} className="p-3 text-sm border-b border-white/5 cursor-pointer hover:bg-white/5" onClick={() => loadSession(s.id)}>{s.title}</div>
             ))}
           </div>
           {sessions.length > 0 && <button className="s-clear-btn" onClick={clearAllHistory}>Bersihkan Semua</button>}
        </div>
      </aside>

      <main className="s-chat-area">
        {messages.map((msg, i) => (
          <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
            {msg.role === 'user' ? (
              <>
                <div className="s-bubble-user">
                  {/* KARTU BERITA & TEKS DALAM SATU BUBBLE */}
                  {msg.isNewsCard && (
                    <div style={{background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '12px', marginBottom: msg.content ? '10px' : '0'}}>
                      <img src={msg.newsData.image} alt="news" style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px'}} />
                      <h4 style={{fontSize: '0.85rem', color: '#fff', margin: 0, lineHeight: '1.4'}}>{msg.newsData.title}</h4>
                    </div>
                  )}
                  {msg.content}
                </div>
                <div className="s-action-bar right">
                  <button className="s-action-icon" onClick={() => handleEdit(msg.content)} title="Edit"><Edit2 size={14}/></button>
                  <button className="s-action-icon" onClick={() => handleCopy(msg.content)} title="Salin"><Copy size={14}/></button>
                </div>
              </>
            ) : (
              <>
                <div className="s-bubble-ai">
                  <span className="s-model-tag">⚡ {msg.model === 'deep' ? 'Deep Search' : 'Fast Chat'}</span>
                  <div dangerouslySetInnerHTML={formatMarkdown(msg.content)} />
                </div>
                <div className="s-action-bar">
                  <button className="s-action-icon" onClick={() => handleCopy(msg.content)} title="Salin"><Copy size={14}/></button>
                  <button className="s-action-icon" onClick={() => performSearch(messages[i-1]?.content)} title="Regenerate"><RefreshCw size={14}/></button>
                </div>
                {msg.sources?.length > 0 && (
                  <div className="mb-8 mt-[-15px] p-4 bg-white/5 rounded-xl border border-white/5">
                    <h4 className="text-[10px] font-bold text-[#8e9b95] uppercase mb-2">Sumber Terverifikasi:</h4>
                    {msg.sources.slice(0,4).map((u, index) => (
                      <a key={index} href={u} target="_blank" rel="noreferrer" className="block text-xs text-[#b8cbb8] mb-1 truncate">[{index+1}] {u}</a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{textAlign: 'center', padding: '20px 0', opacity: 0.8}}>
            <div className="s-loader-pulse"></div>
            {/* LOADER DINAMIS HUMANOID */}
            <p className="font-bold tracking-widest text-[10px] text-[#b8cbb8] uppercase mt-4 transition-all duration-300">
              {loadingText}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="s-input-container">
        {pendingNews && (
          <div className="s-preview-card">
            <img src={pendingNews.image} alt="preview" className="s-preview-img" />
            <div className="s-preview-text">
              <h4 style={{fontSize: '0.8rem', color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{pendingNews.title}</h4>
              <p style={{color: '#8e9b95', fontSize: '10px', margin: 0}}>Tambahkan instruksi (opsional)...</p>
            </div>
            <button type="button" onClick={() => setPendingNews(null)} style={{background: 'none', border: 'none', color: '#ff6b6b'}}><MaterialIcon name="close" /></button>
          </div>
        )}

        <div className="s-model-accordion">
          <div className="s-model-trigger" onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}>
            {isModelSelectorOpen ? <ChevronDown size={12}/> : <ChevronUp size={12}/>}
            Pilih Model: <span className="text-[#b8cbb8] ml-1">{activeModel.toUpperCase()}</span>
          </div>
          {isModelSelectorOpen && (
            <div className="s-model-options">
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
            placeholder={isLoading ? "Mohon tunggu sebentar..." : "Ketik pesan..."} 
            disabled={false} /* Biar user tetep bisa ngetik pertanyaan pas AI loading */
            required={!pendingNews}
          />
          {/* TOMBOL MATI (DISABLED) SAAT LOADING */}
          <button type="submit" className="s-submit-btn" disabled={isLoading}>
            <MaterialIcon name="arrow_upward" />
          </button>
        </form>
      </div>
    </div>
  );
}