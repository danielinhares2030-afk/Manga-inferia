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
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute inset-0 border-t-2 border-[#CC0000] rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-b-2 border-[#FF3333] rounded-full animate-spin reverse"></div>
      <Sparkles className="text-[#CC0000]" size={20} />
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
    
    return { 
      carouselData: carousel, 
      obrasDestaque: destaque, 
      obrasRecentes: recentes, 
      obrasAtualizadas: atualizadas, 
      catalogoFiltrado: filtrado 
    };
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

  // Verificações para as Novas Texturas Estáticas
  const showKatana = /katana|corte|espada|slash/.test(effectStr);
  const showSeigaiha = /seigaiha|onda|mar|jap/.test(effectStr);
  const showRunas = /runa|circulo|magia|array/.test(effectStr);
  const showFibra = /fibra|carbono|armadura/.test(effectStr);
  const showEscamas = /escama|dragao|reptil/.test(effectStr);
  const showMosaico = /mosaico|vidro|quebrado/.test(effectStr);
  const showHex = /colmeia|hex|ciber|grid/.test(effectStr);
  const showLinhas = /velocidade|linha|speed/.test(effectStr);
  const showDamasco = /damasco|aco|metal/.test(effectStr);
  const showTopografia = /topografia|mapa|abissal/.test(effectStr);

  const globais = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Shojumaru&family=Teko:wght@500;600;700&display=swap');
    body { overflow-x: hidden; background-color: #050508; }
    .font-anime { font-family: 'Shojumaru', system-ui; }
    .font-teko { font-family: 'Teko', sans-serif; letter-spacing: 0.05em; }
    .font-nunito { font-family: 'Nunito', sans-serif; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .theme-wrapper { filter: hue-rotate(var(--theme-hue)); transition: filter 0.5s ease; }
    .theme-wrapper img:not(.no-hue-effect), .theme-wrapper video, .no-hue { filter: hue-rotate(calc(-1 * var(--theme-hue))); }

    /* --- SISTEMA DE TEXTURAS 100% ESTÁTICAS (Zero processamento) --- */
    
    .effect-katana {
      background:
        linear-gradient(115deg, transparent 49%, rgba(255,255,255,0.15) 49.5%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.15) 50.5%, transparent 51%),
        linear-gradient(65deg, transparent 20%, rgba(204,0,0,0.15) 20.2%, rgba(204,0,0,0.3) 20.5%, rgba(204,0,0,0.15) 20.8%, transparent 21%);
    }

    .effect-seigaiha {
      background:
        radial-gradient(circle at 100% 150%, transparent 20%, rgba(255,255,255,0.04) 21%, rgba(255,255,255,0.04) 34%, transparent 35%, transparent 44%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.04) 54%, transparent 55%, transparent 64%, rgba(255,255,255,0.04) 65%, rgba(255,255,255,0.04) 74%, transparent 75%, transparent 84%, rgba(255,255,255,0.04) 85%, rgba(255,255,255,0.04) 90%, transparent 91%),
        radial-gradient(circle at 0% 150%, transparent 20%, rgba(255,255,255,0.04) 21%, rgba(255,255,255,0.04) 34%, transparent 35%, transparent 44%, rgba(255,255,255,0.04) 45%, rgba(255,255,255,0.04) 54%, transparent 55%, transparent 64%, rgba(255,255,255,0.04) 65%, rgba(255,255,255,0.04) 74%, transparent 75%, transparent 84%, rgba(255,255,255,0.04) 85%, rgba(255,255,255,0.04) 90%, transparent 91%);
      background-size: 60px 30px;
    }

    .effect-runas {
      background:
        repeating-radial-gradient(circle at center, transparent 0, transparent 60px, rgba(255,215,0,0.05) 60px, rgba(255,215,0,0.05) 62px),
        repeating-linear-gradient(45deg, transparent, transparent 150px, rgba(255,215,0,0.03) 150px, rgba(255,215,0,0.03) 152px),
        repeating-linear-gradient(-45deg, transparent, transparent 150px, rgba(255,215,0,0.03) 150px, rgba(255,215,0,0.03) 152px);
    }

    .effect-fibra {
      background:
        repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.02)),
        repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.02) 75%, rgba(255,255,255,0.02));
      background-position: 0 0, 10px 10px;
      background-size: 20px 20px;
    }

    .effect-escamas {
      background:
        radial-gradient(circle at 50% 100%, rgba(0,255,136,0.06) 20%, transparent 21%),
        radial-gradient(circle at 50% 0%, rgba(0,255,136,0.06) 20%, transparent 21%);
      background-size: 40px 40px;
      background-position: 0 0, 20px 20px;
    }

    .effect-mosaico {
      background:
        linear-gradient(30deg, rgba(122,60,255,0.04) 12%, transparent 12.5%, transparent 87%, rgba(122,60,255,0.04) 87.5%, rgba(122,60,255,0.04)),
        linear-gradient(150deg, rgba(122,60,255,0.04) 12%, transparent 12.5%, transparent 87%, rgba(122,60,255,0.04) 87.5%, rgba(122,60,255,0.04)),
        linear-gradient(60deg, rgba(122,60,255,0.02) 25%, transparent 25.5%, transparent 75%, rgba(122,60,255,0.02) 75%, rgba(122,60,255,0.02));
      background-size: 60px 105px;
      background-position: 0 0, 0 0, 30px 52.5px;
    }

    .effect-hex {
      background:
        linear-gradient(90deg, rgba(204,0,0,0.05) 1px, transparent 1px) 0 0,
        linear-gradient(rgba(204,0,0,0.05) 1px, transparent 1px) 0 0;
      background-size: 40px 40px;
    }

    .effect-linhas {
      background: repeating-linear-gradient(90deg, transparent, transparent 10%, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 10.5%, transparent 10.5%, transparent 20%, rgba(255,255,255,0.01) 20%, rgba(255,255,255,0.01) 21%);
    }

    .effect-damasco {
      background: repeating-radial-gradient(circle at 0 0, transparent 0, rgba(255,255,255,0.03) 15px, transparent 30px);
    }

    .effect-topografia {
      background:
        radial-gradient(circle at 20% 30%, transparent 0, transparent 80px, rgba(0,150,255,0.04) 81px, transparent 82px),
        radial-gradient(circle at 80% 70%, transparent 0, transparent 120px, rgba(0,150,255,0.04) 121px, transparent 122px),
        radial-gradient(circle at 50% 50%, transparent 0, transparent 200px, rgba(0,150,255,0.02) 201px, transparent 202px);
    }
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

      {/* RENDERIZAÇÃO DAS NOVAS TEXTURAS ESTÁTICAS */}
      {showKatana && <div className="fixed inset-0 pointer-events-none z-[9998] effect-katana mix-blend-screen opacity-100"></div>}
      {showSeigaiha && <div className="fixed inset-0 pointer-events-none z-[9998] effect-seigaiha mix-blend-screen opacity-100"></div>}
      {showRunas && <div className="fixed inset-0 pointer-events-none z-[9998] effect-runas mix-blend-screen opacity-100"></div>}
      {showFibra && <div className="fixed inset-0 pointer-events-none z-[9998] effect-fibra opacity-100 mix-blend-screen"></div>}
      {showEscamas && <div className="fixed inset-0 pointer-events-none z-[9998] effect-escamas mix-blend-screen opacity-100"></div>}
      {showMosaico && <div className="fixed inset-0 pointer-events-none z-[9998] effect-mosaico mix-blend-screen opacity-100"></div>}
      {showHex && <div className="fixed inset-0 pointer-events-none z-[9998] effect-hex mix-blend-screen opacity-100"></div>}
      {showLinhas && <div className="fixed inset-0 pointer-events-none z-[9998] effect-linhas mix-blend-screen opacity-100"></div>}
      {showDamasco && <div className="fixed inset-0 pointer-events-none z-[9998] effect-damasco mix-blend-screen opacity-100"></div>}
      {showTopografia && <div className="fixed inset-0 pointer-events-none z-[9998] effect-topografia mix-blend-screen opacity-100"></div>}

      <div style={{ '--theme-hue': themeHue }} className={`theme-wrapper fixed top-12 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-3 px-6 py-3 rounded-2xl border font-bold shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 w-max max-w-[90vw] backdrop-blur-xl no-hue ${toast.msg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'} ${toast.type === 'error' ? 'bg-[#1A0505]/95 border-[#CC0000] text-[#FF3333]' : 'bg-[#051A0A]/95 border-[#00CC66]/50 text-[#00FF88]'}`}>
        <Zap size={20} />
        <span className="text-sm tracking-wider font-nunito uppercase">{toast.msg}</span>
      </div>

      {splashVisible && (
        <div style={{ '--theme-hue': themeHue }} className={`theme-wrapper fixed inset-0 z-[999999] bg-[#030305] flex flex-col justify-center items-center transition-all duration-700 no-hue ${splashFade ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,0,0,0.15)_0%,transparent_60%)]"></div>
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
