import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Home, LayoutGrid, Trophy, Bookmark, User, Loader2 } from 'lucide-react';
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

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedObraId, setSelectedObraId] = useState(null);
  const [selectedCapitulo, setSelectedCapitulo] = useState(null);

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
    biografia: 'Adicione uma biografia legal aqui.', idade: '20', pais: 'Brasil', isPrivate: false,
    tempoLendo: 0, obrasLidas: 0, capitulosLidos: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [saveModal, setSaveModal] = useState({ isOpen: false, obraId: null });

  // Controle da Tela de Abertura (Splash Screen)
  useEffect(() => {
    document.title = `Manga Inferia | ${activeTab.toUpperCase()}`;
    document.fonts.ready.then(() => setFontsLoaded(true)); 

    const timer1 = setTimeout(() => setSplashFade(true), 2500); 
    const timer2 = setTimeout(() => setSplashVisible(false), 3000); 
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        try {
          const userRef = doc(db, 'usuarios', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) await setDoc(userRef, perfil);
        } catch (error) { console.warn("Erro Firestore Auth:", error); }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubObras = onSnapshot(collection(db, 'obras'), (snapshot) => {
      setObras(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const rankingQuery = query(collection(db, 'usuarios'), orderBy('xp', 'desc'), limit(50));
    const unsubRanking = onSnapshot(rankingQuery, (snap) => {
      setTodosUsuarios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    if (!user) return;

    const unsubBib = onSnapshot(collection(db, 'usuarios', user.uid, 'biblioteca'), (snap) => {
      setBiblioteca(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubPerfil = onSnapshot(doc(db, 'usuarios', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const xpAtual = data.xp || 0;
        const nivelCalculado = Math.floor(xpAtual / 1000) + 1;
        setPerfil(prev => ({ ...prev, ...data, nivel: nivelCalculado }));
        if (data.nivel !== nivelCalculado) setDoc(doc(db, 'usuarios', user.uid), { nivel: nivelCalculado }, { merge: true });
      }
    });

    return () => { unsubObras(); unsubRanking(); unsubBib(); unsubPerfil(); };
  }, [user]);

  const { carouselData, obrasDestaque, obrasRecentes, obrasAtualizadas, catalogoFiltrado } = useMemo(() => {
    const carousel = obras.filter(o => o.isCarousel).slice(0, 5);
    const destaque = obras.filter(o => o.isDestaque);
    const recentes = obras.filter(o => o.isRecente);
    const atualizadas = obras.filter(o => o.isAtualizado);
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
    setActiveTab('details');
  };

  const handleReadChapter = (capitulo) => {
    setSelectedCapitulo(capitulo);
    setActiveTab('reader');
  };

  const globais = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Shojumaru&family=Teko:wght@500;600;700&display=swap');
    .font-anime { font-family: 'Shojumaru', system-ui; }
    .font-teko { font-family: 'Teko', sans-serif; letter-spacing: 0.05em; }
    .font-nunito { font-family: 'Nunito', sans-serif; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  const isFullScreenView = activeTab === 'details' || activeTab === 'reader';

  return (
    <div className="min-h-screen bg-[#050508] text-[#F5F7FF] font-sans selection:bg-[#990000] selection:text-white relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: globais }} />

      {/* Condição 1: Tela de Abertura Totalmente Isolada */}
      {splashVisible ? (
        <div className={`fixed inset-0 z-[9999] bg-[#030305] flex flex-col justify-center items-center transition-opacity duration-700 ${splashFade ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,0,0,0.1)_0%,transparent_60%)] pointer-events-none"></div>
          <div className={`relative z-10 w-full px-4 mt-10 transition-opacity duration-500 ${fontsLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="font-anime text-3xl sm:text-5xl text-center w-full drop-shadow-[0_0_15px_rgba(204,0,0,0.8)] text-[#F5F7FF] animate-pulse">
              MANGA<span className="text-[#CC0000]">INFERIA</span>
            </h1>
          </div>
          <div className="absolute bottom-20 w-full flex justify-center">
            <Loader2 className="w-10 h-10 text-[#CC0000] animate-spin drop-shadow-[0_0_10px_rgba(204,0,0,0.5)]" />
          </div>
        </div>
      ) 
      
      /* Condição 2: Tela de Login se não tiver usuário logado */
      : !user && !authLoading ? (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#050202]"><Loader2 className="animate-spin text-[#CC0000]" /></div>}>
          <LoginView />
        </Suspense>
      ) 
      
      /* Condição 3: O App Principal de Fato */
      : user ? (
        <>
          {!isFullScreenView && (
            <nav className="fixed top-0 left-0 w-full z-40 bg-gradient-to-b from-[#050508] to-transparent pt-4 pb-6 px-4 pointer-events-none">
              <div className="flex items-center justify-between max-w-7xl mx-auto pointer-events-auto">
                <h1 className="font-anime text-lg md:text-xl shadow-black drop-shadow-md">
                  MANGA<span className="text-[#CC0000]">INFERIA</span>
                </h1>
                <div onClick={() => setActiveTab('profile')} className="w-9 h-9 rounded-full border-2 border-[#2A0A0A] overflow-hidden cursor-pointer hover:border-[#CC0000] transition-colors bg-[#140505]">
                  <img src={perfil.avatar} alt="User" className="w-full h-full object-cover" />
                </div>
              </div>
            </nav>
          )}

          <main className={isFullScreenView ? "pb-0" : "pb-24"}>
            <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#CC0000] w-12 h-12" /></div>}>
              {activeTab === 'home' && <HomeView carouselData={carouselData} obrasDestaque={obrasDestaque} obrasRecentes={obrasRecentes} obrasAtualizadas={obrasAtualizadas} currentSlide={currentSlide} setSaveModal={setSaveModal} onMangaClick={handleMangaClick} />}
              {activeTab === 'catalog' && <CatalogView searchQuery={searchQuery} setSearchQuery={setSearchQuery} catalogoFiltrado={catalogoFiltrado} setSaveModal={setSaveModal} onMangaClick={handleMangaClick} />}
              {activeTab === 'ranking' && <RankingView rankingData={todosUsuarios} perfilLogado={{ ...perfil, id: user.uid }} setActiveTab={setActiveTab} />}
              {activeTab === 'biblioteca' && <LibraryView biblioteca={biblioteca} setSaveModal={setSaveModal} />}
              {activeTab === 'profile' && <ProfileView perfil={perfil} biblioteca={biblioteca} setActiveTab={setActiveTab} />}
              {activeTab === 'details' && <MangaDetailsView obra={obras.find(o => o.id === selectedObraId)} onBack={() => setActiveTab('home')} onReadChapter={handleReadChapter} setSaveModal={setSaveModal} />}
              {activeTab === 'reader' && <ReaderView capitulo={selectedCapitulo} obra={obras.find(o => o.id === selectedObraId)} onBack={() => setActiveTab('details')} onReadChapter={handleReadChapter} />}
            </Suspense>
          </main>

          <SaveModal 
            isOpen={saveModal.isOpen} 
            onClose={() => setSaveModal({ isOpen: false, obraId: null })}
            obra={obras.find(o => o.id === saveModal.obraId)}
            user={user}
          />

          {!isFullScreenView && (
            <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-[#050508] via-[#050508]/95 to-transparent pointer-events-none">
              <div className="flex items-center justify-between bg-[#0A0505]/95 backdrop-blur-xl border border-[#2A0A0A] rounded-2xl px-5 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.8)] pointer-events-auto">
                {[{ id: 'home', icon: Home, label: 'Home' }, { id: 'catalog', icon: LayoutGrid, label: 'Catálogo' }, { id: 'ranking', icon: Trophy, label: 'Ranking' }, { id: 'biblioteca', icon: Bookmark, label: 'Biblioteca' }, { id: 'profile', icon: User, label: 'Perfil' }].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === tab.id ? 'text-[#CC0000] scale-110 drop-shadow-[0_0_5px_#CC0000]' : 'text-[#A7ADBE] hover:text-[#F5F7FF]'}`}>
                    <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-widest font-teko">{tab.label}</span>
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

export default App;
