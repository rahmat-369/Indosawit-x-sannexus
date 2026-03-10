import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Send, PlayCircle, MessageCircle } from 'lucide-react';

export default function SanexusChat({ initialQuery = "", onClose }) {
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState(initialQuery);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const resultContainerRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('turboHistory')) || [];
    setHistory(saved);
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const addToHistory = (q) => {
    let newHistory = history.filter(item => item !== q);
    newHistory.unshift(q);
    if (newHistory.length > 10) newHistory.pop();
    setHistory(newHistory);
    localStorage.setItem('turboHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('turboHistory');
  };

  const performSearch = async (question) => {
    if (!question.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    setQuery(question);
    setInputValue('');
    setResult(null);
    addToHistory(question);
    setIsSidebarOpen(false);

    try {
      const response = await fetch(`/api?question=${encodeURIComponent(question)}`);
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Gagal mengambil data AI. Pastikan API berjalan.');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (resultContainerRef.current) {
            resultContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 100);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(inputValue);
  };

  // SVG Icons dari material-icons-round bawaan San
  const MaterialIcon = ({ name }) => <span className="material-icons-round" style={{ fontFamily: '"Material Icons Round"', fontWeight: 'normal', fontStyle: 'normal', fontSize: '24px', lineHeight: 1, letterSpacing: 'normal', textTransform: 'none', display: 'inline-block', whiteSpace: 'nowrap', wordWrap: 'normal', direction: 'ltr', fontFeatureSettings: '"liga"', WebkitFontSmoothing: 'antialiased' }}>{name}</span>;

  return (
    <div className="sanexus-wrapper">
      {/* RAW CSS MILIK SANEXUS (DIISOLASI AGAR TIDAK MERUSAK TAILWIND INDOSAWIT) */}
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
        
        /* HEADER & SIDEBAR */
        .s-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-dark); z-index: 10; border-bottom: 1px solid var(--border-glass);}
        .s-title { font-family: var(--font-serif); font-size: 1.2rem; color: var(--text-highlight); }
        .s-btn { background: none; border: none; color: var(--text-main); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 5px; }
        
        .s-sidebar { position: fixed; top: 0; left: -100%; width: 100%; height: 100%; z-index: 200; background: rgba(0,0,0,0.5); transition: 0.3s; }
        .s-sidebar.visible { left: 0; }
        .s-sidebar-content { width: 80%; max-width: 300px; height: 100%; background: #151a18; padding: 25px; display: flex; flex-direction: column; box-shadow: 5px 0 20px rgba(0,0,0,0.5); }
        .s-history-list { flex: 1; overflow-y: auto; list-style: none; padding:0; margin:0; }
        .s-history-list li { padding: 12px; color: var(--text-muted); border-bottom: 1px solid var(--border-glass); cursor: pointer; font-size:0.9rem; }
        .s-clear-btn { background: rgba(255,0,0,0.1); color: #ff6b6b; border: 1px solid rgba(255,0,0,0.2); padding: 10px; border-radius: 8px; cursor: pointer; display:flex; align-items:center; justify-content:center; gap:5px; margin-top:10px; }
        
        /* MAIN CHAT AREA */
        .s-chat-area { flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 120px; scroll-behavior: smooth; }
        .s-greeting { font-family: var(--font-serif); font-size: 2.2rem; color: var(--text-highlight); margin-bottom: 30px; font-weight: 400; }
        .s-action-pill { background: var(--bg-card); border: 1px solid var(--border-glass); padding: 10px 16px; border-radius: 20px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 8px; color: var(--text-main); margin-right: 10px; }
        
        .s-bubble-user { background: transparent; border: 1px solid var(--border-glass); color: var(--text-muted); text-align: right; margin-left: auto; max-width: 85%; border-radius: 20px 20px 0 20px; padding: 15px 20px; margin-bottom: 20px; line-height: 1.5; font-size:0.95rem; }
        .s-bubble-ai { background: #ffffff; color: #1a201d; border-radius: 20px 20px 20px 0; max-width: 100%; padding: 20px; margin-bottom: 20px; line-height: 1.6; }
        .s-bubble-header { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; margin-bottom: 10px; color: #0d1110; text-transform: uppercase; letter-spacing: 0.5px; }
        .s-info-card { background: var(--bg-card); border-radius: 16px; padding: 15px; margin-bottom: 15px; border: 1px solid var(--border-glass); }
        .s-info-card h4 { display: flex; align-items: center; gap: 8px; color: var(--text-muted); margin-bottom: 10px; font-size: 0.9rem; font-weight:500; }
        .s-list a, .s-list li { display: block; padding: 10px; background: rgba(0,0,0,0.2); margin-bottom: 8px; border-radius: 8px; color: var(--text-main); text-decoration: none; font-size: 0.85rem; }
        .s-list li { cursor: pointer; } .s-list li:hover, .s-list a:hover { background: rgba(255,255,255,0.1); }
        
        /* INPUT AREA */
        .s-input-area { position: absolute; bottom: 0; left: 0; width: 100%; padding: 15px 20px 25px 20px; background: linear-gradient(0deg, var(--bg-dark) 80%, transparent 100%); z-index: 100; }
        .s-search-bar { display: flex; align-items: center; background: #2a3330; border-radius: 50px; padding: 8px 8px 8px 20px; border: 1px solid var(--border-glass); box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
        .s-search-bar input { flex: 1; background: transparent; border: none; color: var(--text-main); font-size: 1rem; outline: none; }
        .s-submit-btn { width: 45px; height: 45px; border-radius: 50%; background: var(--text-main); color: var(--bg-dark); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
        
        /* LOADER */
        .s-loader-pulse { width: 50px; height: 50px; background: var(--text-highlight); border-radius: 50%; margin: 0 auto 10px; animation: s-pulse-ring 1.5s infinite; }
        @keyframes s-pulse-ring { 0% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(184, 203, 184, 0); } 100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(184, 203, 184, 0); } }
      `}} />

      {/* HEADER */}
      <header className="s-header">
        <button className="s-btn" onClick={() => setIsSidebarOpen(true)}><MaterialIcon name="grid_view" /></button>
        <span className="s-title">SanexusAI</span>
        <button className="s-btn" onClick={onClose} style={{color: '#ff6b6b'}}><MaterialIcon name="close" /></button>
      </header>

      {/* SIDEBAR HISTORY & PROFILE SAN */}
      <aside className={`s-sidebar ${isSidebarOpen ? 'visible' : ''}`} onClick={(e) => {if(e.target === e.currentTarget) setIsSidebarOpen(false)}}>
        <div className="s-sidebar-content">
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
            <h2 style={{fontSize: '1.2rem'}}>Menu</h2>
            <button className="s-btn" onClick={() => setIsSidebarOpen(false)}><MaterialIcon name="close" /></button>
          </div>
          
          {/* IDENTITAS SAN (SESUAI REQUEST) */}
          <div style={{background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', marginBottom: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)'}}>
            <img src="https://e.top4top.io/p_3721610g20.jpg" alt="SANN404" style={{width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 10px', objectFit: 'cover', border: '2px solid #b8cbb8'}} />
            <h3 style={{fontSize: '1rem', color: '#ffffff', marginBottom: '2px'}}>SANN404</h3>
            <p style={{fontSize: '0.7rem', color: '#8e9b95', marginBottom: '15px'}}>Node.js Expert & AI Research</p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px'}}>
              <a href="#" className="s-btn" style={{background: 'rgba(255,255,255,0.1)', borderRadius:'10px'}}><Instagram size={16}/></a>
              <a href="#" className="s-btn" style={{background: 'rgba(255,255,255,0.1)', borderRadius:'10px'}}><PlayCircle size={16}/></a>
              <a href="#" className="s-btn" style={{background: 'rgba(255,255,255,0.1)', borderRadius:'10px'}}><Send size={16}/></a>
            </div>
            <a href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L" target="_blank" rel="noreferrer" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#25D366', color: '#000', padding: '8px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 'bold'}}>
              <MessageCircle size={16}/> SANN404 FORUM
            </a>
          </div>

          <h3 style={{fontSize: '0.9rem', color: '#8e9b95', marginBottom: '10px', marginTop: '10px'}}>Search History</h3>
          <ul className="s-history-list">
            {history.length === 0 ? <li style={{border: 'none', opacity: 0.5}}>No history yet.</li> : null}
            {history.map((q, i) => (
              <li key={i} onClick={() => performSearch(q)}>{q}</li>
            ))}
          </ul>
          {history.length > 0 && (
            <button className="s-clear-btn" onClick={clearHistory}>
              <MaterialIcon name="delete" /> Clear History
            </button>
          )}
        </div>
      </aside>

      {/* CHAT AREA */}
      <main className="s-chat-area">
        {!hasSearched && (
          <div style={{marginTop: '20px'}}>
            <h2 className="s-greeting">Welcome Sir, <br/><span style={{color: '#fff'}}>User</span></h2>
            <div style={{display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '30px'}}>
              <div className="s-action-pill" onClick={() => performSearch("Job Finder UX")} style={{cursor:'pointer'}}><MaterialIcon name="work_outline"/> Job Finder UX</div>
              <div className="s-action-pill" onClick={() => performSearch("Marketing Strategy")} style={{cursor:'pointer'}}><MaterialIcon name="campaign"/> Marketing Strategy</div>
            </div>
          </div>
        )}

        {isLoading && (
          <div style={{textAlign: 'center', color: '#8e9b95', padding: '40px 0'}}>
            <div className="s-loader-pulse"></div>
            <p>Generating response...</p>
          </div>
        )}

        {hasSearched && !isLoading && (
          <div ref={resultContainerRef}>
            <div className="s-bubble-user">{query}</div>
            
            {result && (
              <>
                <div className="s-bubble-ai">
                  <div className="s-bubble-header">
                    <MaterialIcon name="auto_awesome" /> SanexusAI Analysis
                  </div>
                  <div style={{fontSize: '0.95rem', whiteSpace: 'pre-wrap'}}>{result.answer}</div>
                </div>

                <div className="s-info-card">
                  <h4><MaterialIcon name="link" /> Sources</h4>
                  <ul className="s-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
                    {result.sources?.length > 0 ? result.sources.map((url, i) => {
                      let domain = url;
                      try { domain = new URL(url).hostname; } catch(e){}
                      return <li key={i}><a href={url} target="_blank" rel="noreferrer">{domain}</a></li>;
                    }) : <li style={{pointerEvents:'none'}}>Tidak ada sumber ditemukan.</li>}
                  </ul>
                </div>

                <div className="s-info-card">
                  <h4><MaterialIcon name="manage_search" /> Related</h4>
                  <ul className="s-list" style={{listStyle: 'none', padding: 0, margin: 0}}>
                    {result.similarQuestions?.length > 0 ? result.similarQuestions.map((q, i) => {
                      const text = q.question || q;
                      return <li key={i} onClick={() => performSearch(text)}>{text}</li>;
                    }) : <li style={{pointerEvents:'none'}}>Tidak ada pertanyaan terkait.</li>}
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* INPUT BAR */}
      <div className="s-input-area">
        <form onSubmit={handleSubmit} className="s-search-bar">
          <input 
            type="text" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            placeholder="Type your question..." 
            required 
          />
          <button type="submit" className="s-submit-btn"><MaterialIcon name="arrow_upward" /></button>
        </form>
      </div>
    </div>
  );
}
