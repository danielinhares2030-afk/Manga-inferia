import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Home, LayoutGrid, Trophy, Bookmark, User, Loader2, Zap, ShieldAlert, Sparkles, Search } from 'lucide-react';
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
    fragmentos: 0, tempoLendo: 0, obrasLidas: 0, capitulosLidos: 0,
    modoPaginado: false, scrollSuave: true
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
      if (['home', 'catalog', 'search', 'biblioteca', 'ranking', 'profile'].includes(activeTab)) {
        setLastMainTab(activeTab);
      }
      setActiveTab(newTab);
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
    const timer1 = setTimeout(() => setSplashFade(true), 2800); 
    const timer2 = setTimeout(() => setSplashVisible(false), 3300); 
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
          if (!userSnap.exists()) await setDoc(userRef, { ...perfil, xp: 0 });
        } catch (error) { console.warn(error); }
      } else {
        setPerfil({ nome: 'Visitante', xp: 0, nivel: 1 });
        setBiblioteca([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubObras = onSnapshot(collection(db, 'obras'), (snapshot) => {
      setObras(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const rankingQuery = query(collection(db, 'usuarios'), orderBy('xp', 'desc'), limit(100));
    const unsubRanking = onSnapshot(rankingQuery, (snap) => {
      setTodosUsuarios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    if (!user) return;

    let syncTimeout = null;
    const unsubBib = onSnapshot(collection(db, 'usuarios', user.uid, 'biblioteca'), (snap) => {
      const bibData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      bibData.sort((a, b) => new Date(b.ultimoLidoEm || 0) - new Date(a.ultimoLidoEm || 0));
      setBiblioteca(bibData);

      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        const obrasConcluidas = bibData.filter(b => b.progresso >= 95 || b.status === 'Finalizado').length;
        setDoc(doc(db, 'usuarios', user.uid), { obrasLidas: obrasConcluidas }, { merge: true });
      }, 2000);
    });

    const unsubPerfil = onSnapshot(doc(db, 'usuarios', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const xpAtual = data.xp || 0;
        const nivelCalculado = Math.floor(xpAtual / 1000) + 1;
        setPerfil(prev => ({ ...prev, ...data, nivel: nivelCalculado }));
        
        if (data.nivel && nivelCalculado > data.nivel) {
          if (window.mostrarAviso) window.mostrarAviso(`SUBIU DE NÍVEL! Bateu Nível ${nivelCalculado}!`, 'level_up');
          setDoc(doc(db, 'usuarios', user.uid), { nivel: nivelCalculado }, { merge: true });
        } else if (!data.nivel && nivelCalculado > 1) {
          setDoc(doc(db, 'usuarios', user.uid), { nivel: nivelCalculado }, { merge: true });
        }
      }
    });

    return () => { unsubObras(); unsubRanking(); unsubBib(); unsubPerfil(); clearTimeout(syncTimeout); };
  }, [user]);

  const { carouselData, obrasDestaque, obrasRecentes, obrasAtualizadas, catalogoFiltrado } = useMemo(() => {
    const carousel = obras.filter(o => o.isCarousel).slice(0, 5);
    const destaque = [...obras].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 10);
    const recentes = obras.filter(o => o.isRecente);
    const atualizadas = obras.filter(o => o.isAtualizado).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    const filtrado = obras.filter(o => (o.nome || '').toLowerCase().includes(searchQuery.toLowerCase()));
    
    return { carouselData: carousel, obrasDestaque: destaque, obrasRecentes: recentes, obrasAtualizadas: atualizadas, catalogoFiltrado: filtrado };
  }, [obras, searchQuery]);

  useEffect(() => {
    if (carouselData.length === 0) return;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % carouselData.length), 5000);
    return () => clearInterval(timer);
  }, [carouselData.length]);

  const handleMangaClick = (id) => {
    setSelectedObraId(id);
    changeTab('details');
  };

  const handleReadChapter = (capitulo) => {
    setSelectedCapitulo(capitulo);
    changeTab('reader');
  };

  const handleResumeManga = async (obraId, capId) => {
    setSelectedObraId(obraId);
    if (!capId) { changeTab('details'); return; }
    try {
      const docRef = doc(db, 'capitulos', capId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelectedCapitulo({ id: docSnap.id, ...docSnap.data() });
        changeTab('reader');
      } else { changeTab('details'); }
    } catch (err) { changeTab('details'); }
  };

  const globais = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Shojumaru&family=Teko:wght@500;600;700&display=swap');
    .font-anime { font-family: 'Shojumaru', system-ui; }
    .font-teko { font-family: 'Teko', sans-serif; letter-spacing: 0.05em; }
    .font-nunito { font-family: 'Nunito', sans-serif; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes slash-in { 0% { transform: scaleX(0); opacity: 0; } 50% { transform: scaleX(1); opacity: 1; } 100% { transform: scaleX(0); opacity: 0; } }
    @keyframes shimmer-slide { 100% { transform: translateX(100%); } }
  `;

  const isFullScreenView = activeTab === 'details' || activeTab === 'reader' || activeTab === 'search';

  return (
    <div className="min-h-screen bg-[#050508] text-[#F5F7FF] font-sans selection:bg-[#990000] selection:text-white relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: globais }} />

      <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-3 px-6 py-3 rounded-2xl border font-bold shadow-[0_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 w-max max-w-[90vw] backdrop-blur-xl ${toast.msg ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'} ${toast.type === 'error' ? 'bg-[#1A0505]/95 border-[#CC0000] text-[#FF3333]' : toast.type === 'level_up' ? 'bg-[#1A1005]/95 border-[#FF8C00] text-[#FFB000]' : 'bg-[#051A0A]/95 border-[#00CC66]/50 text-[#00FF88]'}`}>
        {toast.type === 'error' ? <ShieldAlert size={20} /> : toast.type === 'level_up' ? <Sparkles size={20} className="animate-pulse" /> : <Zap size={20} />}
        <span className="text-sm tracking-wider font-nunito uppercase">{toast.msg}</span>
      </div>

      {splashVisible ? (
        <div className={`fixed inset-0 z-[99999] bg-[#030305] flex flex-col justify-center items-center transition-all duration-1000 ${splashFade ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(204,0,0,0.2)_0%,transparent_60%)] animate-pulse"></div>
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#CC0000] shadow-[0_0_30px_5px_rgba(204,0,0,0.8)] animate-[slash-in_1.5s_ease-out_forwards] origin-center"></div>
          <div className={`relative z-10 flex flex-col items-center transition-all duration-700 delay-300 w-full ${fontsLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="font-anime text-[11vw] sm:text-7xl text-white tracking-widest drop-shadow-[0_0_40px_rgba(204,0,0,1)] mb-3 relative overflow-hidden px-2 whitespace-nowrap">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 -translate-x-full animate-[shimmer-slide_2.5s_infinite]"></span>
              MANGA<span className="text-[#CC0000]">INFERIA</span>
            </h1>
            <p className="font-teko text-xl text-[#CC0000] tracking-[0.4em] uppercase animate-pulse drop-shadow-[0_0_10px_#CC0000]">Abrindo o Abismo</p>
          </div>
        </div>
      ) : !user && !authLoading ? (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#050202]"><Loader2 className="animate-spin text-[#CC0000]" /></div>}>
          <LoginView />
        </Suspense>
      ) : user ? (
        <>
          {!isFullScreenView && (
            <nav className="fixed top-0 left-0 w-full z-40 bg-gradient-to-b from-[#050508] to-transparent pt-4 pb-6 px-4 pointer-events-none">
              <div className="flex items-center justify-between max-w-7xl mx-auto pointer-events-auto">
                <h1 className="font-anime text-lg md:text-xl shadow-black drop-shadow-md">
                  MANGA<span className="text-[#CC0000]">INFERIA</span>
                </h1>
                <div className="flex items-center gap-4">
                  <Search size={22} className="text-[#A7ADBE] cursor-pointer hover:text-white transition-colors" onClick={() => changeTab('search')} />
                  <div onClick={() => changeTab('profile')} className="w-9 h-9 rounded-full border-2 border-[#2A0A0A] overflow-hidden cursor-pointer hover:border-[#CC0000] transition-colors bg-[#140505]">
                    <img src={perfil.avatar} alt="User" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </nav>
          )}

          <main className={isFullScreenView ? "pb-0" : "pb-24"}>
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#CC0000] w-12 h-12" /></div>}>
              {activeTab === 'home' && <HomeView carouselData={carouselData} obrasDestaque={obrasDestaque} obrasRecentes={obrasRecentes} obrasAtualizadas={obrasAtualizadas} currentSlide={currentSlide} setSaveModal={setSaveModal} onMangaClick={handleMangaClick} />}
              {activeTab === 'catalog' && <CatalogView searchQuery={searchQuery} setSearchQuery={setSearchQuery} catalogoFiltrado={catalogoFiltrado} setSaveModal={setSaveModal} onMangaClick={handleMangaClick} />}
              {activeTab === 'ranking' && <RankingView rankingData={todosUsuarios} perfilLogado={{ ...perfil, id: user.uid }} setActiveTab={changeTab} />}
              {activeTab === 'biblioteca' && <LibraryView biblioteca={biblioteca} setSaveModal={setSaveModal} onMangaClick={handleMangaClick} />}
              {activeTab === 'profile' && <ProfileView perfil={perfil} biblioteca={biblioteca} setActiveTab={changeTab} onMangaClick={handleResumeManga} />}
              {activeTab === 'search' && <SearchView obras={obras} onBack={() => changeTab(lastMainTab)} onMangaClick={handleMangaClick} />}
              {activeTab === 'details' && <MangaDetailsView obra={obras.find(o => o.id === selectedObraId)} biblioteca={biblioteca} onBack={() => changeTab(lastMainTab)} onReadChapter={handleReadChapter} setSaveModal={setSaveModal} user={user} />}
              
              {activeTab === 'reader' && (
                <ReaderView 
                  key={selectedCapitulo?.id} 
                  capitulo={selectedCapitulo} 
                  obra={obras.find(o => o.id === selectedObraId)} 
                  onBack={() => changeTab('details')} 
                  onReadChapter={handleReadChapter} 
                  user={user} 
                  perfil={perfil} 
                />
              )}
            </Suspense>
          </main>

          <SaveModal isOpen={saveModal.isOpen} onClose={() => setSaveModal({ isOpen: false, obraId: null })} obra={obras.find(o => o.id === saveModal.obraId)} user={user} isAlreadySaved={biblioteca.some(b => b.id === saveModal.obraId)} />

          {!isFullScreenView && (
            <div className="fixed bottom-0 left-0 w-full z-40 px-2 pb-4 pt-2 bg-gradient-to-t from-[#050508] via-[#050508]/95 to-transparent pointer-events-none">
              <div className="flex items-center justify-between bg-[#0A0505]/95 backdrop-blur-xl border border-[#2A0A0A] rounded-2xl px-5 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.8)] pointer-events-auto overflow-x-auto hide-scrollbar gap-2">
                {[{ id: 'home', icon: Home, label: 'Home' }, { id: 'catalog', icon: LayoutGrid, label: 'Catálogo' }, { id: 'ranking', icon: Trophy, label: 'Ranking' }, { id: 'biblioteca', icon: Bookmark, label: 'Biblioteca' }, { id: 'profile', icon: User, label: 'Perfil' }].map(tab => (
                  <button key={tab.id} onClick={() => changeTab(tab.id)} className={`flex flex-col items-center gap-1 transition-all duration-300 min-w-[50px] ${activeTab === tab.id ? 'text-[#CC0000] scale-110 drop-shadow-[0_0_5px_#CC0000]' : 'text-[#A7ADBE] hover:text-[#F5F7FF]'}`}>
                    <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-widest font-teko mt-1">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default function App() { return <AppContent />; }
