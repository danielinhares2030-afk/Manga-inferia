import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Home, LayoutGrid, Trophy, Bookmark, User, Loader2, Zap, ShieldAlert, Sparkles, Search, PackageOpen } from 'lucide-react';
import { onSnapshot, collection, doc, setDoc, getDoc, query, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from './firebase';
import SaveModal from './SaveModal';

const HomeView = lazy(() => import('./HomeView'));
const CatalogView = lazy(() => import('./CatalogView'));
const RankingView = lazy(() => import('./RankingView')); 
const LibraryView = lazy(() => import('./LibraryView'));
const ProfileView = lazy(() => import('./ProfileView'));
const MangaDetailsView = lazy(() => import('./MangaDetailsView'));
const ReaderView = lazy(() => import('./ReaderView'));
const LoginView = lazy(() => import('./LoginView'));
const SearchView = lazy(() => import('./SearchView'));
const CaixaView = lazy(() => import('./CaixaView')); 

const getLocalTheme = () => localStorage.getItem('mi_theme') || 'Inferia (Vermelho)';

const getHueFromName = (name) => {
  if (!name) return '0deg';
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (n.includes('vermelho') || n.includes('inferia') || n.includes('sangue')) return '0deg';
  if (n.includes('roxo') || n.includes('abismo') || n.includes('void') || n.includes('ametista')) return '260deg';
  if (n.includes('azul') || n.includes('gelo') || n.includes('frost') || n.includes('blue')) return '210deg';
  if (n.includes('verde') || n.includes('toxico') || n.includes('miasma') || n.includes('bioquimico')) return '120deg';
  if (n.includes('ouro') || n.includes('gold') || n.includes('zenith') || n.includes('amarelo')) return '45deg';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash % 360) + 'deg';
};

const CustomLoader = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-[#050508] no-hue">
    <div className="relative w-16 h-16 flex items-center justify-center animate-pulse">
      <div className="absolute inset-0 border-t-2 border-[#CC0000] rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-b-2 border-[#FF3333] rounded-full animate-spin reverse"></div>
      <Sparkles className="text-[#CC0000] animate-pulse" size={20} />
    </div>
  </div>
);

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [lastMainTab, setLastMainTab] = useState('home');
  const [selectedObraId, setSelectedObraId] = useState(null);
  const [selectedCapitulo, setSelectedCapitulo] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFade, setSplashFade] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false); 
  const [currentSlide, setCurrentSlide] = useState(0);
  const [obras, setObras] = useState([]);
  const [biblioteca, setBiblioteca] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]); 
  
  const [perfil, setPerfil] = useState({
    nome: 'NOCTIS', xp: 0, nivel: 1, 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200', 
    capa: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000',
    moedas: 0, fragmentos: 0, tempoLendo: 0, obrasLidas: 0, capitulosLidos: 0,
    tema: getLocalTheme(), equipamentos: {}
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [saveModal, setSaveModal] = useState({ isOpen: false, obraId: null });

  useEffect(() => {
    window.mostrarAviso = (msg, type = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
    };
  }, []);

  const changeTab = (newTab) => {
    if (activeTab !== newTab) {
      if (['home', 'catalog', 'search', 'biblioteca', 'ranking', 'profile', 'caixa'].includes(activeTab)) setLastMainTab(activeTab);
      setActiveTab(newTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState({ tab: newTab }, '', window.location.href);
    }
  };

  useEffect(() => {
    window.history.replaceState({ tab: activeTab }, '', window.location.href);
    const handlePopState = () => {
      if (activeTab === 'reader') setActiveTab('details');
      else if (activeTab === 'details' || activeTab === 'search') setActiveTab(lastMainTab);
      else if (activeTab !== 'home') setActiveTab('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab, lastMainTab]);

  useEffect(() => {
    document.title = `Manga Inferia | ${activeTab.toUpperCase()}`;
    const fontTimer = setTimeout(() => setFontsLoaded(true), 400); 
    const timer1 = setTimeout(() => setSplashFade(true), 2400); 
    const timer2 = setTimeout(() => setSplashVisible(false), 2900); 
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(fontTimer); };
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        try {
          const userRef = doc(db, 'usuarios', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) await setDoc(userRef, { ...perfil, xp: 0, moedas: 0 }, { merge: true });
        } catch (e) {}
      } else {
        setPerfil({ nome: 'Visitante', xp: 0, nivel: 1 });
        setBiblioteca([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubObras = onSnapshot(collection(db, 'obras'), (snap) => setObras(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubRanking = onSnapshot(query(collection(db, 'usuarios'), orderBy('xp', 'desc'), limit(150)), (snap) => setTodosUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    if (!user) return;
    const unsubBib = onSnapshot(collection(db, 'usuarios', user.uid, 'biblioteca'), (snap) => {
      const bibData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      bibData.sort((a, b) => new Date(b.ultimoLidoEm || 0) - new Date(a.ultimoLidoEm || 0));
      setBiblioteca(bibData);
    });
    const unsubPerfil = onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.tema) localStorage.setItem('mi_theme', data.tema);
        const xpAtual = data.xp || 0;
        const nivelCalculado = Math.floor(xpAtual / 1000) + 1;
        setPerfil(prev => ({ ...prev, ...data, nivel: nivelCalculado }));
      }
    });
    return () => { unsubObras(); unsubRanking(); unsubBib(); unsubPerfil(); };
  }, [user]);

  const { carouselData, obrasDestaque, obrasRecentes, obrasAtualizadas, catalogoFiltrado } = useMemo(() => {
    const carousel = obras.filter(o => o.isCarousel).slice(0, 5);
    const destaque = [...obras].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 10);
    const recentes = obras.filter(o => o.isRecente);
    const atualizadas = obras.filter(o => o.isAtualizado).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    const filtrado = obras.filter(o => (o.nome || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return { carouselData, obrasDestaque: destaque, obrasRecentes: recentes, obrasAtualizadas: atualizadas, catalogoFiltrado: filtrado };
  }, [obras, searchQuery]);

  useEffect(() => {
    if (carouselData.length === 0) return;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % carouselData.length), 5000);
    return () => clearInterval(timer);
  }, [carouselData.length]);

  const handleMangaClick = (id) => { setSelectedObraId(id); changeTab('details'); };
  const handleReadChapter = (cap) => { setSelectedCapitulo(cap); changeTab('reader'); };
  const handleResumeManga = async (obraId, capId) => {
    setSelectedObraId(obraId);
    if (!capId) { changeTab('details'); return; }
    const snap = await getDoc(doc(db, 'capitulos', capId));
    if (snap.exists()) { setSelectedCapitulo({ id: snap.id, ...snap.data() }); changeTab('reader'); }
    else changeTab('details');
  };

  const themeHue = getHueFromName(perfil.tema);

  const particleStyles = useMemo(() => {
    return Array.from({ length: 35 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 4 + 2}s`,
      animationDelay: `${Math.random() * 5}s`,
      size: `${Math.random() * 8 + 4}px`,
      drift: `${Math.random() * 60 - 30}px`,
      opacity: Math.random() * 0.5 + 0.5
    }));
  }, []);

  const equippedEffect = perfil.equipamentos?.efeito || null;
  const effectCSS = equippedEffect?.css || equippedEffect?.codigoCss || '';
  const effectAnim = equippedEffect?.animacao || equippedEffect?.keyframes || '';
  const effectHTML = equippedEffect?.html || equippedEffect?.codigoHtml || '';
  const effectUrl = equippedEffect?.image || null;
  const hasCustomAICode = !!(effectCSS || effectAnim || effectHTML);

  const effectNameToUse = equippedEffect?.name || perfil.efeitoVisual || '';
  const effectStr = (!hasCustomAICode && !effectUrl && effectNameToUse) 
    ? effectNameToUse.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') 
    : '';

  const showAmaterasu = /amaterasu|chamas negras/.test(effectStr);
  const showSakura = /sakura|petala/.test(effectStr);
  const showMatrix = /matrix|chuva neon/.test(effectStr);
  const showNevasca = /nevasca|profunda/.test(effectStr);
  const showTempestade = /tempestade|raio/.test(effectStr);
  const showAura = /aura|dourada/.test(effectStr);
  const showCosmico = /abismo cosmico|cosmico/.test(effectStr);
  const showMiasma = /miasma|toxico/.test(effectStr);
  const showCristal = /cristal|fragmento/.test(effectStr);
  const showSangue = /sangue|chuva de sangue/.test(effectStr);
  
  const showCRT = /crt|tv|retro|glitch|pixel|cyber/.test(effectStr);
  const showVinheta = /vinheta|sombra|trevas|escuro|dark|abismo|void|shadow/.test(effectStr);

  const showDefaultAura = equippedEffect && !hasCustomAICode && !effectUrl && !effectHTML && !showAmaterasu && !showSakura && !showMatrix && !showNevasca && !showTempestade && !showAura && !showCosmico && !showMiasma && !showCristal && !showSangue && !showCRT && !showVinheta;

  const globais = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Shojumaru&family=Teko:wght@500;600;700&display=swap');
    body { overflow-x: hidden; background-color: #050508; }
    .font-anime { font-family: 'Shojumaru', system-ui; }
    .font-teko { font-family: 'Teko', sans-serif; letter-spacing: 0.05em; }
    .font-nunito { font-family: 'Nunito', sans-serif; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .theme-wrapper { filter: hue-rotate(var(--theme-hue)); transition: filter 0.5s ease; }
    .theme-wrapper img:not(.no-hue-effect), .theme-wrapper video, .no-hue { filter: hue-rotate(calc(-1 * var(--theme-hue))); }

    @keyframes flameup { 0% { transform: translateY(110vh) scale(1) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-10vh) scale(0.5) rotate(45deg); opacity: 0; } }
    .amat-flame { position: fixed; background: linear-gradient(to top, #1a0033, #000000); border-radius: 50% 0 50% 50%; box-shadow: 0 0 15px #4b0082; animation: flameup ease-in infinite; pointer-events: none; z-index: 9998; }
    @keyframes sakurafall { 0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(105vh) translateX(80px) rotate(540deg); opacity: 0; } }
    .sakura-leaf { position: fixed; background: linear-gradient(135deg, #ffb7c5, #ffa0b5); border-radius: 100% 0 100% 100%; pointer-events: none; z-index: 9998; animation: sakurafall linear infinite; box-shadow: 0 0 5px rgba(255,183,197,0.5); }
    @keyframes matrixfall { 0% { transform: translateY(-10vh); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(110vh); opacity: 0; } }
    .matrix-drop { position: fixed; width: 2px; height: 40px; background: linear-gradient(transparent, #0f0, #fff); animation: matrixfall linear infinite; pointer-events: none; z-index: 9998; box-shadow: 0 0 8px #0f0; }
    @keyframes snowfall { 0% { transform: translateY(-20px) translateX(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(105vh) translateX(30px); opacity: 0; } }
    .snow-flake { position: fixed; background: #fff; border-radius: 50%; pointer-events: none; z-index: 9998; animation: snowfall linear infinite; box-shadow: 0 0 6px #fff; }
    @keyframes cristalfloat { 0% { transform: translateY(105vh) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-10vh) rotate(720deg); opacity: 0; } }
    .cristal-shard { position: fixed; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 12px solid rgba(0, 255, 255, 0.8); animation: cristalfloat linear infinite; pointer-events: none; z-index: 9998; filter: drop-shadow(0 0 6px cyan); }
    @keyframes bloodfall { 0% { transform: translateY(-10vh); opacity: 0; } 5% { opacity: 1; } 100% { transform: translateY(110vh); opacity: 0; } }
    .blood-drop { position: fixed; width: 3px; border-radius: 50%; background: #8a0303; animation: bloodfall linear infinite; pointer-events: none; z-index: 9998; box-shadow: 0 0 4px #ff0000; }
    @keyframes miasmarise { 0% { transform: translateY(105vh) scale(0.8); opacity: 0; filter: blur(3px); } 30% { opacity: 0.5; } 100% { transform: translateY(-10vh) scale(2); opacity: 0; filter: blur(8px); } }
    .poison-cloud { position: fixed; background: radial-gradient(circle, #32cd32 0%, transparent 70%); border-radius: 50%; pointer-events: none; z-index: 9998; animation: miasmarise ease-out infinite; mix-blend-screen; }
    @keyframes starfloat { 0% { transform: scale(0) translateY(0); opacity: 0; } 50% { opacity: 0.8; } 100% { transform: scale(1.5) translateY(-50px); opacity: 0; } }
    .cosmic-star { position: fixed; background: #fff; border-radius: 50%; pointer-events: none; z-index: 9998; animation: starfloat ease-in-out infinite; box-shadow: 0 0 8px #fff, 0 0 15px #a855f7; }
  `;

  const isFullScreenView = activeTab === 'details' || activeTab === 'reader' || activeTab === 'search' || activeTab === 'caixa';

  return (
    <React.Fragment>
      <style dangerouslySetInnerHTML={{ __html: globais }} />

      {hasCustomAICode && (
        <style dangerouslySetInnerHTML={{ __html: `
          .ia-custom-effect-layer { ${effectCSS} }
          ${effectAnim}
        `}} />
      )}
      
      {hasCustomAICode && (
        <div className="fixed inset-0 pointer-events-none z-[9998] ia-custom-effect-layer opacity-60 no-hue mix-blend-screen"></div>
      )}

      {effectHTML && (
        <div className="fixed inset-0 pointer-events-none z-[9998] no-hue" dangerouslySetInnerHTML={{ __html: effectHTML }} />
      )}

      {effectUrl && !effectHTML && (
        <img src={effectUrl} alt="Efeito Equipado" className="fixed inset-0 w-full h-full object-cover pointer-events-none z-[9998] opacity-60 no-hue no-hue-effect mix-blend-screen" />
      )}

      {/* RENDERIZAÇÃO DOS 10 EFEITOS ESPECIAIS */}
      {showAmaterasu && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden mix-blend-screen">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(75,0,130,0.15)_0%,transparent_80%)]"></div>
          {particleStyles.map((p, i) => <div key={i} className="amat-flame" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, width: p.size, height: p.size, opacity: p.opacity }} />)}
        </div>
      )}

      {showSakura && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,183,197,0.15)_0%,transparent_80%)] mix-blend-screen"></div>
          {particleStyles.map((p, i) => <div key={i} className="sakura-leaf" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, width: p.size, height: `${parseFloat(p.size) * 0.7}px` }} />)}
        </div>
      )}

      {showMatrix && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden mix-blend-screen">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_50%,transparent_50%)] bg-[length:100%_4px]"></div>
          {particleStyles.map((p, i) => <div key={i} className="matrix-drop" style={{ left: p.left, animationDuration: `${Math.random() * 2 + 1}s`, animationDelay: p.animationDelay, height: `${Math.random() * 50 + 20}px` }} />)}
        </div>
      )}

      {showNevasca && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/snow.png')] opacity-20 animate-pulse"></div>
          {particleStyles.map((p, i) => <div key={i} className="snow-flake" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, width: `${parseFloat(p.size) * 0.6}px`, height: `${parseFloat(p.size) * 0.6}px` }} />)}
        </div>
      )}

      {showTempestade && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden mix-blend-screen">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.05)_0%,transparent_100%)] animate-[pulse_0.2s_infinite]"></div>
          <div className="absolute inset-0 bg-white opacity-0 animate-[pulse_3s_infinite_ease-in-out]"></div>
        </div>
      )}

      {showAura && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden mix-blend-screen">
          <div className="absolute inset-0 shadow-[0_0_200px_rgba(255,215,0,0.15)_inset] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-[60vh] bg-gradient-to-t from-[rgba(255,215,0,0.2)] to-transparent animate-[pulse_2s_infinite]"></div>
        </div>
      )}

      {showCosmico && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(75,0,130,0.1)_0%,transparent_100%)]"></div>
          {particleStyles.map((p, i) => <div key={i} className="cosmic-star" style={{ left: p.left, top: `${Math.random() * 100}%`, animationDuration: p.animationDuration, animationDelay: p.animationDelay, width: `${parseFloat(p.size) * 0.3}px`, height: `${parseFloat(p.size) * 0.3}px` }} />)}
        </div>
      )}

      {showMiasma && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(50,205,50,0.1)_0%,transparent_100%)] mix-blend-screen"></div>
          {particleStyles.map((p, i) => <div key={i} className="poison-cloud" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, width: `${parseFloat(p.size) * 5}px`, height: `${parseFloat(p.size) * 5}px` }} />)}
        </div>
      )}

      {showCristal && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden mix-blend-screen">
          {particleStyles.map((p, i) => <div key={i} className="cristal-shard" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay }} />)}
        </div>
      )}

      {showSangue && (
        <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden mix-blend-multiply">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(138,3,3,0.2)_0%,transparent_80%)]"></div>
          {particleStyles.map((p, i) => <div key={i} className="blood-drop" style={{ left: p.left, animationDuration: `${Math.random() * 1.5 + 1}s`, animationDelay: p.animationDelay, height: `${Math.random() * 10 + 10}px` }} />)}
        </div>
      )}

      {/* FALLBACKS ANTIGOS */}
      {showCRT && <div className="fixed inset-0 pointer-events-none z-[9998] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-40 mix-blend-screen"></div>}
      {showVinheta && <div className="fixed inset-0 pointer-events-none z-[9998] shadow-[0_0_250px_rgba(0,0,0,0.95)_inset]"></div>}
      {showDefaultAura && <div className="fixed inset-0 pointer-events-none z-[9998] shadow-[0_0_150px_rgba(255,255,255,0.08)_inset] animate-pulse"></div>}

      <div style={{ '--theme-hue': themeHue }} className={`theme-wrapper fixed top-12 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-3 px-6 py-3 rounded-2xl border font-bold shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 w-max max-w-[90vw] backdrop-blur-xl no-hue ${toast.msg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'} ${toast.type === 'error' ? 'bg-[#1A0505]/95 border-[#CC0000] text-[#FF3333]' : 'bg-[#051A0A]/95 border-[#00CC66]/50 text-[#00FF88]'}`}>
        <Zap size={20} />
        <span className="text-sm tracking-wider font-nunito uppercase">{toast.msg}</span>
      </div>

      {splashVisible && (
        <div style={{ '--theme-hue': themeHue }} className={`theme-wrapper fixed inset-0 z-[999999] bg-[#030305] flex flex-col justify-center items-center transition-all duration-700 no-hue ${splashFade ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,0,0,0.15)_0%,transparent_60%)] animate-pulse"></div>
          <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 w-full px-6 ${fontsLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <h1 className="font-anime text-[11vw] sm:text-7xl text-white tracking-widest drop-shadow-[0_0_50px_rgba(204,0,0,1)] mb-4 flex flex-wrap justify-center gap-x-3 text-center leading-tight">
              <span>MANGA</span><span className="text-[#CC0000]">INFERIA</span>
            </h1>
            <Loader2 className="animate-spin text-[#CC0000] mt-2" size={32} />
          </div>
        </div>
      )}

      {!isFullScreenView && user && !authLoading && (
        <header style={{ '--theme-hue': themeHue }} className="theme-wrapper fixed top-0 left-0 w-full z-[9990] bg-gradient-to-b from-[#050508] via-[#050508]/80 to-transparent pt-4 pb-8 px-4 text-[#F5F7FF] pointer-events-none">
          <div className="flex items-center justify-between max-w-7xl mx-auto drop-shadow-md pointer-events-auto">
            <h1 className="font-anime text-base md:text-xl shadow-black flex gap-1">
              <span>MANGA</span><span className="text-[#CC0000]">INFERIA</span>
            </h1>
            <div className="flex items-center gap-4">
              <Search size={22} className="text-[#A7ADBE] cursor-pointer hover:text-white transition-colors" onClick={() => changeTab('search')} />
              <div onClick={() => changeTab('profile')} className="w-9 h-9 rounded-full border-2 border-[#2A0A0A] overflow-hidden cursor-pointer hover:border-[#CC0000] transition-colors bg-[#140505]">
                <img src={perfil.equipamentos?.avatar?.image || perfil.avatar} alt="" className="w-full h-full object-cover no-hue" />
              </div>
            </div>
          </div>
        </header>
      )}

      <div style={{ '--theme-hue': themeHue }} className="theme-wrapper min-h-screen flex flex-col bg-[#050508] text-[#F5F7FF] font-sans selection:bg-[#990000] selection:text-white">
        {authLoading ? (
          <CustomLoader />
        ) : !user ? (
          <Suspense fallback={<CustomLoader />}>
            <LoginView />
          </Suspense>
        ) : (
          <main className={isFullScreenView ? "pb-0" : "pb-32"}>
            <Suspense fallback={<CustomLoader />}>
              {activeTab === 'home' && <HomeView carouselData={carouselData} obrasDestaque={obrasDestaque} obrasRecentes={obrasRecentes} obrasAtualizadas={obrasAtualizadas} currentSlide={currentSlide} setSaveModal={setSaveModal} onMangaClick={handleMangaClick} />}
              {activeTab === 'catalog' && <CatalogView searchQuery={searchQuery} setSearchQuery={setSearchQuery} catalogoFiltrado={catalogoFiltrado} setSaveModal={setSaveModal} onMangaClick={handleMangaClick} />}
              {activeTab === 'ranking' && <RankingView rankingData={todosUsuarios} perfilLogado={{ ...perfil, id: user.uid }} setActiveTab={changeTab} />}
              {activeTab === 'biblioteca' && <LibraryView biblioteca={biblioteca} setSaveModal={setSaveModal} onMangaClick={handleMangaClick} />}
              {activeTab === 'profile' && <ProfileView perfil={perfil} biblioteca={biblioteca} setActiveTab={changeTab} onMangaClick={handleResumeManga} />}
              {activeTab === 'caixa' && <CaixaView user={user} perfil={perfil} />}
              {activeTab === 'search' && <SearchView obras={obras} onBack={() => changeTab(lastMainTab)} onMangaClick={handleMangaClick} />}
              {activeTab === 'details' && <MangaDetailsView obra={obras.find(o => o.id === selectedObraId)} biblioteca={biblioteca} onBack={() => changeTab(lastMainTab)} onReadChapter={handleReadChapter} setSaveModal={setSaveModal} user={user} />}
              {activeTab === 'reader' && <ReaderView key={selectedCapitulo?.id} capitulo={selectedCapitulo} obra={obras.find(o => o.id === selectedObraId)} onBack={() => changeTab('details')} onReadChapter={handleReadChapter} user={user} perfil={perfil} />}
            </Suspense>
          </main>
        )}
      </div>

      {user && (
        <div style={{ '--theme-hue': themeHue }} className="theme-wrapper">
          <SaveModal isOpen={saveModal.isOpen} onClose={() => setSaveModal({ isOpen: false, obraId: null })} obra={obras.find(o => o.id === saveModal.obraId)} user={user} isAlreadySaved={biblioteca.some(b => b.id === saveModal.obraId)} />
        </div>
      )}

      {user && !isFullScreenView && !authLoading && (
        <div style={{ '--theme-hue': themeHue }} className="theme-wrapper fixed bottom-0 left-0 w-full z-[9999] px-2 pb-4 pt-2 pointer-events-none text-[#F5F7FF]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/95 to-transparent z-0"></div>
          <div className="flex items-center justify-between bg-[#0A0505]/95 backdrop-blur-xl border border-[#2A0A0A] rounded-2xl px-5 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.8)] pointer-events-auto overflow-x-auto hide-scrollbar gap-2 max-w-lg mx-auto relative z-10">
            {[{ id: 'home', icon: Home, label: 'Home' }, { id: 'catalog', icon: LayoutGrid, label: 'Catálogo' }, { id: 'caixa', icon: PackageOpen, label: 'Caixa Inferia' }, { id: 'ranking', icon: Trophy, label: 'Ranking' }, { id: 'profile', icon: User, label: 'Perfil' }].map(tab => (
              <button key={tab.id} onClick={() => changeTab(tab.id)} className={`flex flex-col items-center gap-1 transition-all duration-300 min-w-[50px] ${activeTab === tab.id ? 'text-[#CC0000] scale-110 drop-shadow-[0_0_5px_#CC0000]' : 'text-[#A7ADBE] hover:text-[#F5F7FF]'}`}>
                <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                <span className="text-[9px] font-bold uppercase tracking-widest font-teko mt-1">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default function App() { return <AppContent />; }
