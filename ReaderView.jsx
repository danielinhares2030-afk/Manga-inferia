import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Settings, AlertTriangle, ChevronLeft, ChevronRight, Loader2, Flame } from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const ReaderView = ({ capitulo, obra, onBack, onReadChapter, user, perfil }) => {
  const [showUI, setShowUI] = useState(true);
  const [progresso, setProgresso] = useState(0);
  const [capituloAnterior, setCapituloAnterior] = useState(null);
  const [proximoCapitulo, setProximoCapitulo] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [rollFeito, setRollFeito] = useState(false); 
  const [horaInicioLeitura, setHoraInicioLeitura] = useState(Date.now()); 
  const [dropAnim, setDropAnim] = useState(false);
  
  const [paginaAtualPaginado, setPaginaAtualPaginado] = useState(0);

  const isPaginado = perfil?.modoPaginado;
  const paginas = capitulo?.paginas || [];

  useEffect(() => {
    const buscarVizinhosESalvarProgresso = async () => {
      if (user && capitulo) {
        const numeroCorreto = Number(capitulo.numero) || capitulo.numero;
        setDoc(doc(db, 'usuarios', user.uid, 'biblioteca', obra.id), {
          id: obra.id, nome: obra.nome, capaUrl: obra.capaUrl,
          status: 'Lendo', capAtual: numeroCorreto, ultimoCapId: capitulo.id, progresso: 0,
          ultimoLidoEm: new Date().toISOString()
        }, { merge: true }).catch(err => console.error(err));
      }

      try {
        const q = query(collection(db, 'capitulos'), where('obraId', '==', obra.id));
        const snap = await getDocs(q);
        const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => Number(a.numero) - Number(b.numero));
        const currentIndex = lista.findIndex(c => c.id === capitulo.id);
        setCapituloAnterior(currentIndex > 0 ? lista[currentIndex - 1] : null);
        setProximoCapitulo(currentIndex < lista.length - 1 ? lista[currentIndex + 1] : null);
      } catch (err) { console.error(err); }
    };
    if (obra && capitulo) buscarVizinhosESalvarProgresso();
  }, [capitulo, obra, user]);

  const registrarLeituraEDrops = useCallback(async () => {
    if (rollFeito || !user) return;
    setRollFeito(true);
    const tempoGastoMinutos = Math.max(1, Math.floor((Date.now() - horaInicioLeitura) / 60000));
    
    const novoTempoLendo = (perfil?.tempoLendo || 0) + tempoGastoMinutos;
    const novosCapsLidos = (perfil?.capitulosLidos || 0) + 1;
    
    let atualizacoes = { capitulosLidos: novosCapsLidos, tempoLendo: novoTempoLendo };
    
    if (Math.random() <= 0.40) {
      atualizacoes.fragmentos = (perfil?.fragmentos || 0) + 1;
      setDropAnim(true); 
      setTimeout(() => setDropAnim(false), 4000); 
    }
    await setDoc(doc(db, 'usuarios', user.uid), atualizacoes, { merge: true }).catch(err => console.error(err));
  }, [rollFeito, user, horaInicioLeitura, perfil]);

  useEffect(() => {
    if (isPaginado) return;
    const handleScroll = async () => {
      const scrollTotal = document.documentElement.scrollTop;
      const alturaJanela = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percentual = alturaJanela > 0 ? (scrollTotal / alturaJanela) * 100 : 100;
      setProgresso(percentual);

      if (user && percentual > 5 && percentual % 10 < 2) { 
        setDoc(doc(db, 'usuarios', user.uid, 'biblioteca', obra.id), { progresso: Math.round(percentual) }, { merge: true });
      }

      if (percentual > 95) {
        registrarLeituraEDrops();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPaginado, registrarLeituraEDrops, user, obra.id]);

  useEffect(() => {
    if (isPaginado && paginas.length > 0) {
      const percentual = ((paginaAtualPaginado + 1) / paginas.length) * 100;
      setProgresso(percentual);
      if (user && percentual > 5) {
        setDoc(doc(db, 'usuarios', user.uid, 'biblioteca', obra.id), { progresso: Math.round(percentual) }, { merge: true });
      }
      if (paginaAtualPaginado === paginas.length - 1) {
        registrarLeituraEDrops();
      }
    }
  }, [paginaAtualPaginado, isPaginado, paginas.length, registrarLeituraEDrops, user, obra.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowUI(true); setProgresso(0); setRollFeito(false); setIsTransitioning(false); setDropAnim(false); setPaginaAtualPaginado(0); setHoraInicioLeitura(Date.now());
    const timer = setTimeout(() => setShowUI(false), 3500);
    return () => clearTimeout(timer);
  }, [capitulo]);

  const handleMudarCapitulo = (cap) => {
    setIsTransitioning(true); window.scrollTo(0, 0);
    setTimeout(() => onReadChapter(cap), 800); 
  };

  const handlePrevPage = () => setPaginaAtualPaginado(p => Math.max(0, p - 1));
  const handleNextPage = () => {
    if (paginaAtualPaginado < paginas.length - 1) {
      setPaginaAtualPaginado(p => p + 1);
    } else if (proximoCapitulo) {
      handleMudarCapitulo(proximoCapitulo);
    }
  };

  if (!capitulo) return null;

  return (
    <div className={`bg-black min-h-screen relative font-nunito ${perfil?.scrollSuave ? 'scroll-smooth' : ''}`}>
      
      {dropAnim && (
        <div className="fixed top-24 right-4 z-[9999] bg-[#140505]/90 backdrop-blur-md border border-[#CC0000] p-3 rounded-2xl shadow-[0_0_20px_rgba(204,0,0,0.6)] animate-in slide-in-from-right fade-in duration-500 flex items-center gap-3">
          <Flame className="text-[#FF3333] animate-pulse" size={24} />
          <div>
            <p className="text-[#FF3333] text-[10px] font-black uppercase tracking-widest leading-none">Drop Raro!</p>
            <p className="text-white text-xs font-bold">+1 Fragmento Infernal</p>
          </div>
        </div>
      )}

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

      {paginas.length > 0 && !isPaginado && (
        <div onClick={() => setShowUI(!showUI)} className="w-full max-w-3xl mx-auto flex flex-col bg-black pb-8 cursor-pointer min-h-screen">
          {paginas.map((imgUrl, index) => (
            <img key={index} src={imgUrl} alt={`Pg ${index + 1}`} className="w-full object-contain select-none bg-black" loading={index < 3 ? "eager" : "lazy"} />
          ))}
        </div>
      )}

      {paginas.length > 0 && isPaginado && (
        <div className="w-full max-w-3xl mx-auto h-screen flex items-center justify-center bg-black relative">
          <div className="absolute left-0 top-0 w-1/3 h-full z-10" onClick={handlePrevPage}></div>
          <div className="absolute right-0 top-0 w-1/3 h-full z-10" onClick={handleNextPage}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 z-10" onClick={() => setShowUI(!showUI)}></div>
          
          <img src={paginas[paginaAtualPaginado]} alt={`Pg ${paginaAtualPaginado + 1}`} className="w-full h-full object-contain select-none bg-black" />
          
          <div className="absolute bottom-6 right-4 bg-black/70 px-3 py-1 rounded-full text-white text-xs font-bold z-20 pointer-events-none">
            {paginaAtualPaginado + 1} / {paginas.length}
          </div>
        </div>
      )}

      <div className={`fixed bottom-0 left-0 w-full h-[3px] bg-[#1A0505] z-50`}>
        <div className="h-full bg-gradient-to-r from-[#CC0000] to-[#FF3333] transition-all duration-150" style={{ width: `${progresso}%` }}></div>
      </div>
    </div>
  );
};

export default ReaderView;
