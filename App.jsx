import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { Home, LayoutGrid, Trophy, Bookmark, User, Loader2 } from 'lucide-react'; // Importar Trophy
import { onSnapshot, collection, doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from './firebase';
import { API_URL } from './constants';

const HomeView = lazy(() => import('./HomeView'));
const CatalogView = lazy(() => import('./CatalogView'));
const RankingView = lazy(() => import('./RankingView')); // Novo Import Lazy
const LibraryView = lazy(() => import('./LibraryView'));
const ProfileView = lazy(() => import('./ProfileView'));
const LoginView = lazy(() => import('./LoginView'));

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFade, setSplashFade] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [obras, setObras] = useState([]);
  const [biblioteca, setBiblioteca] = useState([]);
  // Adicionar campos extras ao perfil para o Ranking (TempoLendo, CapitulosLidos, Nivel, isPrivate)
  const [perfil, setPerfil] = useState({
    nome: 'NOCTIS', nivel: 1, 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', 
    capa: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop',
    biografia: 'Adicione uma biografia legal aqui.', idade: '20', pais: 'Brasil', isPrivate: false,
    tempoLendo: 0, obrasLidas: 0, capitulosLidos: 0 // Novos campos
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [saveModal, setSaveModal] = useState({ isOpen: false, obraId: null });

  useEffect(() => {
    document.title = `Manga Inferia | ${activeTab.toUpperCase()}`;
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
        } catch (error) { console.warn("Erro Firestore:", error); }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const carregarObras = async () => {
      try {
        const res = await fetch(`${API_URL}/obras`);
        if (res.ok) {
          const data = await res.json();
          setObras(data.map(obra => ({ ...obra, id: obra._id })));
        }
      } catch (err) { console.warn("API Offline", err); }
    };
    carregarObras();

    if (!user) return;
    const unsubBib = onSnapshot(collection(db, 'usuarios', user.uid, 'biblioteca'), (snap) => {
      setBiblioteca(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubPerfil = onSnapshot(doc(db, 'usuarios', user.uid), (docSnap) => {
      if (docSnap.exists()) setPerfil(prev => ({ ...prev, ...docSnap.data() }));
    });

    return () => { unsubBib(); unsubPerfil(); };
  }, [user]);

  const { carouselData, obrasDestaque, obrasRecentes, obrasAtualizadas, catalogoFiltrado } = useMemo(() => {
    const carousel = obras.filter(o => o.isCarousel || o.status === 'Em andamento').slice(0, 5);
    const destaque = obras.filter(o => o.isDestaque);
    const recentes = obras.filter(o => o.isRecente || o.createdAt);
    const atualizadas = obras.filter(o => o.isAtualizado);
    const filtrado = obras.filter(o => {
      const matchBusca = (o.nome || o.title || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchBusca;
    });
    return { carouselData: carousel, obrasDestaque: destaque, obrasRecentes: recentes, obrasAtualizadas: atualizadas, catalogoFiltrado: filtrado };
  }, [obras, searchQuery]);

  const globais = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Shojumaru&family=Teko:wght@500;600;700&display=swap');
    .font-anime { font-family: 'Shojumaru', system-ui; }
    .font-teko { font-family: 'Teko', sans-serif; letter-spacing: 0.05em; }
    .font-nunito { font-family: 'Nunito', sans-serif; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    /* Glow effect para o Pódio Otimizado com will-change */
    .glow-gold { filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.45)); will-change-filter; }
    .glow-silver { filter: drop-shadow(0 0 10px rgba(192, 192, 192, 0.35)); will-change-filter; }
    .glow-bronze { filter: drop-shadow(0 0 8px rgba(205, 127, 50, 0.3)); will-change-filter; }
  `;

  return (
    <div className="min-h-screen bg-[#050508] text-[#F5F7FF] font-sans selection:bg-[#990000] selection:text-white relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: globais }} />

      {splashVisible && (
        <div className={`fixed inset-0 z-[9999] bg-[#030305] flex flex-col justify-center items-center transition-opacity duration-700 ${splashFade ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,0,0,0.1)_0%,transparent_60%)] pointer-events-none"></div>
          <div className="relative z-10 w-full px-4 mt-10">
            <h1 className="font-anime text-3xl sm:text-5xl text-center w-full drop-shadow-[0_0_15px_rgba(204,0,0,0.8)] text-[#F5F7FF] animate-pulse">
              MANGA<span className="text-[#CC0000]">INFERIA</span>
            </h1>
          </div>
          <div className="absolute bottom-20 w-full flex justify-center">
            <Loader2 className="w-10 h-10 text-[#CC0000] animate-spin drop-shadow-[0_0_10px_rgba(204,0,0,0.5)]" />
          </div>
        </div>
      )}

      {!user && !authLoading && !splashVisible ? (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#050202]"><Loader2 className="animate-spin text-[#CC0000]" /></div>}>
          <LoginView />
        </Suspense>
      ) : user && !splashVisible ? (
        <>
          <nav className="fixed top-0 left-0 w-full z-40 bg-gradient-to-b from-[#050508] to-transparent pt-4 pb-6 px-4 pointer-events-none transition-opacity duration-300" style={{ opacity: (activeTab === 'home' || activeTab === 'catalog') ? 1 : 0 }}>
            <div className="flex items-center justify-between max-w-7xl mx-auto pointer-events-auto">
              <h1 className="font-anime text-lg md:text-xl shadow-black drop-shadow-md">
                MANGA<span className="text-[#CC0000]">INFERIA</span>
              </h1>
              <div onClick={() => setActiveTab('profile')} className="w-9 h-9 rounded-full border-2 border-[#2A0A0A] overflow-hidden cursor-pointer hover:border-[#CC0000] transition-colors bg-[#140505]">
                <img src={perfil.avatar} alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </nav>

          <main className="pb-24">
            <Suspense fallback={<div className="flex pt-32 items-center justify-center"><Loader2 className="animate-spin text-[#CC0000] w-8 h-8" /></div>}>
              {activeTab === 'home' && <HomeView carouselData={carouselData} obrasDestaque={obrasDestaque} obrasRecentes={obrasRecentes} obrasAtualizadas={obrasAtualizadas} currentSlide={currentSlide} setSaveModal={setSaveModal} />}
              {activeTab === 'catalog' && <CatalogView searchQuery={searchQuery} setSearchQuery={setSearchQuery} catalogoFiltrado={catalogoFiltrado} setSaveModal={setSaveModal} />}
              {activeTab === 'ranking' && <RankingView perfilLogado={{ ...perfil, id: user.uid }} setActiveTab={setActiveTab} />} {/* Novo componente integrado */}
              {activeTab === 'biblioteca' && <LibraryView biblioteca={biblioteca} setSaveModal={setSaveModal} />}
              {activeTab === 'profile' && <ProfileView perfil={perfil} biblioteca={biblioteca} setActiveTab={setActiveTab} />}
            </Suspense>
          </main>

          <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pt-2 bg-gradient-to-t from-[#050508] via-[#050508]/95 to-transparent pointer-events-none">
            <div className="flex items-center justify-between bg-[#0A0505]/95 backdrop-blur-xl border border-[#2A0A0A] rounded-2xl px-5 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.8)] pointer-events-auto">
              {/* Adicionar Trophy ao mapeamento */}
              {[{ id: 'home', icon: Home, label: 'Home' }, { id: 'catalog', icon: LayoutGrid, label: 'Catálogo' }, { id: 'ranking', icon: Trophy, label: 'Ranking' }, { id: 'biblioteca', icon: Bookmark, label: 'Biblioteca' }, { id: 'profile', icon: User, label: 'Perfil' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === tab.id ? 'text-[#CC0000] scale-110 drop-shadow-[0_0_5px_#CC0000]' : 'text-[#A7ADBE] hover:text-[#F5F7FF]'}`}>
                  <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                  <span className="text-[9px] font-bold uppercase tracking-widest font-teko">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default App;
