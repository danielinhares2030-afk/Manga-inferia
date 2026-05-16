import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const ReaderView = ({ capitulo, obra, onBack, onReadChapter, user, perfil }) => {
  const [showUI, setShowUI] = useState(true);
  const [progresso, setProgresso] = useState(0);
  const [capituloAnterior, setCapituloAnterior] = useState(null);
  const [proximoCapitulo, setProximoCapitulo] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [rollFeito, setRollFeito] = useState(false); 

  useEffect(() => {
    const buscarVizinhos = async () => {
      try {
        const q = query(collection(db, 'capitulos'), where('obraId', '==', obra.id));
        const snap = await getDocs(q);
        const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => Number(a.numero) - Number(b.numero));
        
        const currentIndex = lista.findIndex(c => c.id === capitulo.id);
        if (currentIndex > 0) setCapituloAnterior(lista[currentIndex - 1]);
        else setCapituloAnterior(null);

        if (currentIndex < lista.length - 1) setProximoCapitulo(lista[currentIndex + 1]);
        else setProximoCapitulo(null);
      } catch (err) { console.error("Erro vizinhos:", err); }
    };
    if (obra && capitulo) buscarVizinhos();
  }, [capitulo, obra]);

  useEffect(() => {
    const handleScroll = async () => {
      const scrollTotal = document.documentElement.scrollTop;
      const alturaJanela = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percentual = alturaJanela > 0 ? (scrollTotal / alturaJanela) * 100 : 100;
      setProgresso(percentual);

      if (percentual > 95 && !rollFeito && user) {
        setRollFeito(true);
        if (Math.random() <= 0.10) {
          const qtdAtual = perfil.fragmentos || 0;
          await setDoc(doc(db, 'usuarios', user.uid), { fragmentos: qtdAtual + 1 }, { merge: true });
          if (window.mostrarAviso) window.mostrarAviso("🔥 Você encontrou um Fragmento Infernal!");
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [rollFeito, user, perfil]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowUI(true);
    setProgresso(0);
    setRollFeito(false);
    setIsTransitioning(false); 
    const timer = setTimeout(() => setShowUI(false), 3500);
    return () => clearTimeout(timer);
  }, [capitulo]);

  const handleMudarCapitulo = (cap) => {
    setIsTransitioning(true); 
    window.scrollTo(0, 0);
    setTimeout(() => {
      onReadChapter(cap);
    }, 800); 
  };

  if (!capitulo) return null;
  const paginas = capitulo.paginas || [];

  return (
    <div className="bg-black min-h-screen relative font-nunito">
      
      {isTransitioning && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
          <Loader2 className="w-16 h-16 text-[#CC0000] animate-spin mb-4" />
          <p className="text-[#CC0000] font-anime tracking-widest animate-pulse text-sm">ATRAVESSANDO INFERIA...</p>
        </div>
      )}

      <div className={`fixed top-0 left-0 w-full bg-gradient-to-b from-black/90 to-transparent p-4 z-50 flex items-center justify-between transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
        <button onClick={onBack} className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-white text-sm font-bold truncate max-w-[200px]">{obra?.nome || "Obra"}</h2>
          <p className="text-[#CC0000] text-[10px] uppercase font-bold tracking-widest">Capítulo {capitulo.numero}</p>
        </div>
        <button className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg">
          <Settings size={18} />
        </button>
      </div>

      {paginas.length === 0 && (
        <div className="flex flex-col h-screen items-center justify-center text-[#A7ADBE] gap-4">
          <AlertTriangle size={32} className="text-[#FF3333]" />
          <h3 className="font-anime text-sm text-white">Capítulo Vazio</h3>
        </div>
      )}

      {paginas.length > 0 && (
        <div onClick={() => setShowUI(!showUI)} className="w-full max-w-3xl mx-auto flex flex-col bg-black pb-28 cursor-pointer min-h-screen">
          {paginas.map((imgUrl, index) => (
            <img key={index} src={imgUrl} alt={`Página ${index + 1}`} className="w-full object-contain select-none bg-black" loading={index < 3 ? "eager" : "lazy"} />
          ))}
        </div>
      )}

      <div className={`fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-6 px-4 z-50 transition-transform duration-300 ${showUI && paginas.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#140505]">
          <div className="h-full bg-gradient-to-r from-[#990000] to-[#FF3333] shadow-[0_0_15px_#CC0000]" style={{ width: `${progresso}%` }}></div>
        </div>

        <div className="max-w-md mx-auto flex items-center justify-between bg-[#0A0505] border border-[#2A0A0A] rounded-2xl p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <button 
            onClick={() => handleMudarCapitulo(capituloAnterior)} disabled={!capituloAnterior}
            className="flex items-center gap-1 px-4 py-2 rounded-xl disabled:opacity-30 text-[#A7ADBE] hover:bg-[#140505] hover:text-[#CC0000] transition-colors font-bold text-[10px] uppercase"
          >
            <ChevronLeft size={20} /> Anterior
          </button>

          <span className="text-white text-[10px] font-bold uppercase tracking-widest px-2">{Math.round(progresso)}% CONCLUÍDO</span>

          <button 
            onClick={() => handleMudarCapitulo(proximoCapitulo)} disabled={!proximoCapitulo}
            className="flex items-center gap-1 px-4 py-2 rounded-xl disabled:opacity-30 text-[#A7ADBE] hover:bg-[#140505] hover:text-[#CC0000] transition-colors font-bold text-[10px] uppercase"
          >
            Próximo <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReaderView;
