import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Send, PlayCircle, MessageCircle } from 'lucide-react';

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
);
const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
);

export default function SanexusChat({ initialQuery, onClose }) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('turboHistory')) || [];
    setHistory(saved);
    
    // Logika Pemisah: Cek apakah yg dikirim String biasa atau Object Berita
    if (initialQuery && messages.length === 0) {
      if (typeof initialQuery === 'object' && initialQuery.type === 'news') {
        handleNewsQuery(initialQuery);
      } else if (typeof initialQuery === 'string' && initialQuery.trim() !== "") {
        performSearch(initialQuery);
      }
    }
  }, [initialQuery]);

  const addToHistory = (q) => {
    let newHistory = history.filter(item => item !== q);
    newHistory.unshift(q);
    if (newHistory.length > 15) newHistory.pop();
    setHistory(newHistory);
    localStorage.setItem('turboHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('turboHistory');
  };

  // FUNGSI KHUSUS UNTUK MEMBACA BERITA (SECRET PROMPTING)
  const handleNewsQuery = async (newsObj) => {
    // 1. Tampilkan visual UI Kartu Berita di layar chat
    setMessages([{
        role: 'user',
        isNewsCard: true,
        newsData: newsObj,
        content: `Tolong analisis berita ini: ${newsObj.title}`
    }]);

    setIsLoading(true);
    addToHistory(newsObj.title); // Simpan judulnya ke history

    // 2. Secret Prompt Injection (Dikirim ke Backend tanpa diketahui user)
    const secretPrompt = `Tolong baca dan analisis berita dengan judul '${newsObj.title}'. Referensi link: ${newsObj.link}. Berikan ringkasan detail dari isi berita tersebut agar kita bisa mendiskusikannya lebih lanjut.`;

    try {
      const response = await fetch(`/api?question=${encodeURIComponent(secretPrompt)}`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.answer, sources: data.sources, similar: data.similarQuestions }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: `Error: ${data.error}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Gagal menyambung ke otak Sanexus. Pastikan API stabil.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // FUNGSI SEARCH BIASA (OBROLAN)
  const performSearch = async (question) => {
    if (!question.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setIsLoading(true);
    setInputValue('');
    addToHistory(question);
    setIsSidebarOpen(false);

    let queryToSend = question;
    if (messages.length > 0) {
      const lastTopic = messages.filter(m => m.role === 'user').pop()?.content;
      if (lastTopic) {
        queryToSend = `Berdasarkan obrolan sebelumnya tentang "${lastTopic}", tolong jawab: ${question}`;
      }
    }

    try {
      const response = await fetch(`/api?question=${encodeURIComponent(queryToSend)}`);
      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'ai', content: data.answer, sources: data.sources, similar: data.similarQuestions }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: `Error: ${data.error}` }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Gagal menyambung ke otak Sanexus. Pastikan API stabil.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(inputValue);
  };

  const MaterialIcon = ({ name }) => <span className="material-icons-round" style={{ fontFamily: '"Material Icons Round"', fontWeight: 'normal', fontStyle: 'normal', fontSize: '24px', lineHeight: 1, letterSpacing: 'normal', textTransform: 'none', display: 'inline-block', whiteSpace: 'nowrap', wordWrap: 'normal', direction: 'ltr', fontFeatureSettings: '"liga"', WebkitFontSmoothing: 'antialiased' }}>{name}</span>;

  return (
    <div className="sanexus-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
        
        .sanexus-wrapper {
            --bg-dark: #0d1110; --bg-card: #1a201d; --bg-glass: rgba(255, 255, 255, 0.05);
            --border-glass: rgba(255, 255, 255, 0.1); --text-main: #ffffff; --text-muted: #8e9b95;
            --text-highlight: #b8cbb8; --font-serif: 'Playfair Display', serif; --font-sans: 'Manrope', sans-serif;
            position: fixed; inset: 0; z-index: 9999; display: flex; flex-direction: column;
            background: var(--bg-dark); color: var(--text-main); font-family: var(--font-sans);
            overflow: hidden; animation: slideUp 0.4s ease-out forwards;
        }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .sanexus-wrapper * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        
        .s-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-dark); z-index: 10; border-bottom: 1px solid var(--border-glass);}
        .s-title { font-family: var(--font-serif); font-size: 1.2rem; color: var(--text-highlight); }
        .s-btn { background: none; border: none; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 5px; }
        
        .s-sidebar { position: fixed; top: 0; left: -100%; width: 100%; height: 100%; z-index: 200; background: rgba(0,0,0,0.5); transition: 0.3s; }
        .s-sidebar.visible { left: 0; }
        .s-sidebar-content { width: 80%; max-width: 320px; height: 100%; background: #151a18; padding: 25px 20px; display: flex; flex-direction: column; box-shadow: 5px 0 20px rgba(0,0,0,0.5); }
        .s-history-list { flex: 1; overflow-y: auto; list-style: none; padding:0; margin:0; }
        .s-history-item { padding: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border-glass); cursor: pointer; font-size:0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .s-history-item:hover { background: rgba(255,255,255,0.05); }
        .s-clear-btn { background: rgba(255,0,0,0.1); color: #ff6b6b; border: 1px solid rgba(255,0,0,0.2); padding: 10px; border-radius: 8px; cursor: pointer; display:flex; align-items:center; justify-content:center; gap:5px; margin-top:10px; margin-bottom: 20px; }
        
        .s-mini-profile { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(184, 203, 184, 0.05); border: 1px solid rgba(184, 203, 184, 0.2); border-radius: 12px; cursor: pointer; transition: 0.2s; margin-top: auto; }
        .s-mini-profile:hover { background: rgba(184, 203, 184, 0.1); }
        .s-mini-profile img { width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--text-highlight); object-fit: cover; }
        .s-mini-profile-info h4 { font-size: 0.9rem; color: #fff; margin: 0; }
        .s-mini-profile-info p { font-size: 0.7rem; color: var(--text-muted); margin: 0; }

        /* FULL PAGE PROFILE OVERLAY - SCROLLABLE & RESTRUCTURED */
        .s-full-profile-overlay { position: fixed; inset: 0; background: var(--bg-dark); z-index: 300; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 60px 20px 40px 20px; text-align: center; overflow-y: auto; animation: profileFade 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
        @keyframes profileFade { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .s-close-full-profile { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); border: none; color: #fff; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 310; }
        .s-collab-badge { background: linear-gradient(90deg, rgba(34,197,94,0.1) 0%, rgba(184,203,184,0.1) 100%); border: 1px solid rgba(184,203,184,0.3); padding: 8px 15px; border-radius: 20px; font-size: 0.75rem; color: var(--text-highlight); margin-bottom: 30px; letter-spacing: 0.5px; }
        
        .s-chat-area { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 120px; scroll-behavior: smooth; }
        .s-greeting { font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-highlight); margin-bottom: 30px; font-weight: 400; }
        .s-action-pill { background: var(--bg-card); border: 1px solid var(--border-glass); padding: 10px 16px; border-radius: 20px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px; color: var(--text-main); margin-right: 10px; }
        
        .s-bubble-user { background: transparent; border: 1px solid var(--border-glass); color: var(--text-muted); text-align: right; margin-left: auto; max-width: 85%; border-radius: 20px 20px 0 20px; padding: 15px 20px; margin-bottom: 20px; line-height: 1.5; font-size:0.95rem; }
        .s-bubble-ai { background: #ffffff; color: #1a201d; border-radius: 20px 20px 20px 0; max-width: 100%; padding: 20px; margin-bottom: 15px; line-height: 1.6; }
        .s-bubble-header { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; margin-bottom: 10px; color: #0d1110; text-transform: uppercase; letter-spacing: 0.5px; }
        .s-smooth-appear { animation: smoothPop 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(20px); }
        @keyframes smoothPop { to { opacity: 1; transform: translateY(0); } }

        .s-info-container { display: flex; flex-direction: column; gap: 10px; margin-bottom: 30px; }
        .s-info-card { background: var(--bg-card); border-radius: 16px; padding: 15px; border: 1px solid var(--border-glass); }
        .s-info-card h4 { display: flex; align-items: center; gap: 8px; color: var(--text-muted); margin-bottom: 10px; font-size: 0.9rem; font-weight:500; }
        .s-list a, .s-list li { display: block; padding: 10px; background: rgba(0,0,0,0.2); margin-bottom: 8px; border-radius: 8px; color: var(--text-main); text-decoration: none; font-size: 0.85rem; }
        .s-list li { cursor: pointer; } .s-list li:hover, .s-list a:hover { background: rgba(255,255,255,0.1); }
        
        .s-input-area { position: absolute; bottom: 0; left: 0; width: 100%; padding: 15px 20px 25px 20px; background: linear-gradient(0deg, var(--bg-dark) 80%, transparent 100%); z-index: 100; }
        .s-search-bar { display: flex; align-items: center; background: #2a3330; border-radius: 50px; padding: 8px 8px 8px 20px; border: 1px solid var(--border-glass); box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        .s-search-bar input { flex: 1; background: transparent; border: none; color: var(--text-main); font-size: 1rem; outline: none; }
        .s-submit-btn { width: 45px; height: 45px; border-radius: 50%; background: var(--text-main); color: var(--bg-dark); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        .s-loader-pulse { width: 50px; height: 50px; background: var(--text-highlight); border-radius: 50%; margin: 0 auto 10px; animation: s-pulse-ring 1.5s infinite; }
        @keyframes s-pulse-ring { 0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(184, 203, 184, 0); } 100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0); } }
      `}} />

      {/* HEADER */}
      <header className="s-header">
        <button className="s-btn" onClick={() => setIsSidebarOpen(true)}><MaterialIcon name="grid_view" /></button>
        <span className="s-title">SanexusAI</span>
        <button className="s-btn" onClick={onClose} style={{color: '#ff6b6b'}}><MaterialIcon name="close" /></button>
      </header>

      {/* SIDEBAR */}
      <aside className={`s-sidebar ${isSidebarOpen ? 'visible' : ''}`} onClick={(e) => {if(e.target === e.currentTarget) setIsSidebarOpen(false)}}>
        <div className="s-sidebar-content">
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
            <h2 style={{fontSize: '1.2rem'}}>Menu</h2>
            <button className="s-btn" onClick={() => setIsSidebarOpen(false)}><MaterialIcon name="close" /></button>
          </div>

          <h3 style={{fontSize: '0.9rem', color: '#8e9b95', marginBottom: '10px'}}>Search History</h3>
          <ul className="s-history-list">
            {history.length === 0 ? <li style={{border: 'none', opacity: 0.5}} className="s-history-item">No history yet.</li> : null}
            {history.map((q, i) => (
              <li key={i} className="s-history-item" onClick={() => {
                setMessages([]);
                performSearch(q);
              }} title={q}>{q}</li>
            ))}
          </ul>
          {history.length > 0 && (
             <button className="s-clear-btn" onClick={clearHistory}>
               <MaterialIcon name="delete" /> Clear History
             </button>
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

      {/* FULL PAGE PROFILE OVERLAY - URUTAN BARU */}
      {showFullProfile && (
        <div className="s-full-profile-overlay">
          <button className="s-close-full-profile" onClick={() => setShowFullProfile(false)}>
            <MaterialIcon name="close" />
          </button>
          
          {/* 1. Badge Kolaborasi */}
          <div className="s-collab-badge">
            Official Collaboration: IndoSawit.news x SanexusAI - Menciptakan ekosistem informasi cerdas.
          </div>

          {/* 2. Foto Profil */}
          <img src="https://e.top4top.io/p_3721610g20.jpg" alt="SANN404" style={{width: '120px', height: '120px', borderRadius: '50%', border: '3px solid #b8cbb8', objectFit: 'cover', marginBottom: '20px', boxShadow: '0 0 30px rgba(184,203,184,0.2)', flexShrink: 0}} />
          
          {/* 3. Nama Web */}
          <h1 style={{fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', color: '#b8cbb8', marginBottom: '5px'}}>SANEXUSAI</h1>
          
          {/* 4. Nama Developer */}
          <h3 style={{fontSize: '1.5rem', color: '#ffffff', marginBottom: '20px', letterSpacing: '2px'}}>SANN404</h3>
          
          {/* 5. Deskripsi & Tombol */}
          <p style={{fontSize: '0.9rem', color: '#8e9b95', marginBottom: '30px', maxWidth: '300px', lineHeight: '1.6'}}>Node.js Expert & AI Engine Developer. Berfokus pada pengembangan sistem arsitektur backend yang kuat.</p>
          
          <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexShrink: 0}}>
            <a href="#" style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)'}}><Instagram size={20}/></a>
            <a href="#" style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)'}}><Send size={20}/></a>
            <a href="#" style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '15px', color: '#fff', border: '1px solid rgba(255,255,255,0.1)'}}><TikTokIcon size={20}/></a>
          </div>

          <a href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L" target="_blank" rel="noreferrer" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#25D366', color: '#000', padding: '15px 30px', borderRadius: '50px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(37,211,102,0.2)', flexShrink: 0, marginBottom: '40px'}}>
            <WhatsAppIcon size={20}/> JOIN SALURAN SANN404
          </a>
        </div>
      )}

      {/* MAIN CHAT AREA */}
      <main className="s-chat-area">
        {messages.length === 0 && (
          <div style={{marginTop: '20px'}}>
            <h2 className="s-greeting">Welcome Sir, <br/><span style={{color: '#fff'}}>User</span></h2>
            <div style={{display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '30px'}}>
              <div className="s-action-pill" onClick={() => performSearch("Berita Politik Terkini")} style={{cursor:'pointer'}}><MaterialIcon name="work_outline"/> Politik</div>
              <div className="s-action-pill" onClick={() => performSearch("Perkembangan AI 2026")} style={{cursor:'pointer'}}><MaterialIcon name="campaign"/> Teknologi AI</div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index}>
            {msg.role === 'user' ? (
              <div className="s-bubble-user animate-in fade-in slide-in-from-bottom-2">
                {/* JIKA BERUPA KARTU BERITA */}
                {msg.isNewsCard && (
                  <div style={{background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px', textAlign: 'left'}}>
                    <img src={msg.newsData.image} alt="news" style={{width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px'}} />
                    <h4 style={{fontSize: '0.85rem', color: '#fff', marginBottom: '5px', lineHeight: '1.4'}}>{msg.newsData.title}</h4>
                    <a href={msg.newsData.link} target="_blank" rel="noreferrer" style={{fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none'}}>Baca Sumber Artikel ↗</a>
                  </div>
                )}
                {/* TEKS PERTANYAAN */}
                {msg.content}
              </div>
            ) : (
              <div className="s-smooth-appear" style={{marginBottom: '30px'}}>
                <div className="s-bubble-ai shadow-lg">
                  <div className="s-bubble-header">
                    <MaterialIcon name="auto_awesome" /> SanexusAI Analysis
                  </div>
                  <div style={{fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>{msg.content}</div>
                </div>

                <div className="s-info-container">
                  {msg.sources?.length > 0 && (
                    <div className="s-info-card">
                      <h4><MaterialIcon name="link" /> Sources</h4>
                      <ul className="s-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
                        {msg.sources.map((url, i) => {
                          let domain = url;
                          try { domain = new URL(url).hostname; } catch(e){}
                          return <li key={i}><a href={url} target="_blank" rel="noreferrer">{domain}</a></li>;
                        })}
                      </ul>
                    </div>
                  )}

                  {msg.similar?.length > 0 && (
                    <div className="s-info-card">
                      <h4><MaterialIcon name="manage_search" /> Related</h4>
                      <ul className="s-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
                        {msg.similar.map((q, i) => {
                          const text = q.question || q;
                          return <li key={i} onClick={() => performSearch(text)}>{text}</li>;
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div style={{textAlign: 'center', color: '#8e9b95', padding: '20px 0'}}>
            <div className="s-loader-pulse"></div>
            <p>Sanexus is analyzing...</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </main>

      <div className="s-input-area">
        <form onSubmit={handleSubmit} className="s-search-bar">
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            placeholder="Ketik pesan atau cari berita..." 
            disabled={isLoading}
            required 
          />
          <button type="submit" disabled={isLoading} className="s-submit-btn" style={{opacity: isLoading ? 0.5 : 1}}>
            <MaterialIcon name="arrow_upward" />
          </button>
        </form>
      </div>
    </div>
  );
      }
