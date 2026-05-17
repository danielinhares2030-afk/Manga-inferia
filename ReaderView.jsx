import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, AlertTriangle, ChevronLeft, ChevronRight, Loader2, Flame, X, Play } from 'lucide-react';
import { collection, query, where, getDocs, doc, setDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

const ReaderView = ({ capitulo, obra, onBack, onReadChapter, user, perfil }) => {
  const [showUI, setShowUI] = useState(true);
  const [progresso, setProgresso] = useState(0);
  const [todosCapitulos, setTodosCapitulos] = useState([]);
  const [capituloAnterior, setCapituloAnterior] = useState(null);
  const [proximoCapitulo, setProximoCapitulo] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showChaptersMenu, setShowChaptersMenu] = useState(false);
  const [rollFeito, setRollFeito] = useState(false); 
  const [horaInicioLeitura] = useState(Date.now()); 
  
  const [dropAnim, setDropAnim] = useState(false);

  useEffect(() => {
    const buscarVizinhosESalvarProgresso = async () => {
      if (user && capitulo) {
        const numeroCorreto = Number(capitulo.numero) || capitulo.numero;
        setDoc(doc(db, 'usuarios', user.uid, 'biblioteca', obra.id), {
          id: obra.id, nome: obra.nome, capaUrl: obra.capaUrl,
          status: 'Lendo', capAtual: numeroCorreto, progresso: 0,
          ultimoLidoEm: new Date().toISOString()
        }, { merge: true }).catch(err => console.error(err));
      }

      try {
        const q = query(collection(db, 'capitulos'), where('obraId', '==', obra.id));
        const snap = await getDocs(q);
        const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => Number(a.numero) - Number(b.numero));
        
        setTodosCapitulos(lista);

        const currentIndex = lista.findIndex(c => c.id === capitulo.id);
        setCapituloAnterior(currentIndex > 0 ? lista[currentIndex - 1] : null);
        setProximoCapitulo(currentIndex < lista.length - 1 ? lista[currentIndex + 1] : null);
      } catch (err) { console.error(err); }
    };
    if (obra && capitulo) buscarVizinhosESalvarProgresso();
  }, [capitulo, obra, user]);

  useEffect(() => {
    const handleScroll = async () => {
      const scrollTotal = document.documentElement.scrollTop;
      const alturaJanela = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percentual = alturaJanela > 0 ? (scrollTotal / alturaJanela) * 100 : 100;
      setProgresso(percentual);

      if (user && percentual > 5 && percentual % 10 < 2) { 
        setDoc(doc(db, 'usuarios', user.uid, 'biblioteca', obra.id), { progresso: Math.round(percentual) }, { merge: true });
      }

      if (percentual > 95 && !rollFeito && user) {
        setRollFeito(true); 
        const tempoGastoMinutos = Math.max(1, Math.floor((Date.now() - horaInicioLeitura) / 60000));
        const atualizacoes = { capitulosLidos: increment(1), tempoLendo: increment(tempoGastoMinutos) };
        
        if (Math.random() <= 0.40) {
          atualizacoes.fragmentos = increment(1);
          setDropAnim(true); 
          setTimeout(() => setDropAnim(false), 4000); 
        }
        await setDoc(doc(db, 'usuarios', user.uid), atualizacoes, { merge: true }).catch(err => console.error(err));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [rollFeito, user, horaInicioLeitura, obra]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowUI(true); setProgresso(0); setRollFeito(false); setIsTransitioning(false); setDropAnim(false); setShowChaptersMenu(false);
    const timer = setTimeout(() => setShowUI(false), 3500);
    return () => clearTimeout(timer);
  }, [capitulo]);

  const handleMudarCapitulo = (cap) => {
    setIsTransitioning(true); window.scrollTo(0, 0);
    setTimeout(() => onReadChapter(cap), 800); 
  };

  if (!capitulo) return null;
  const paginas = capitulo.paginas || [];

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

      {showChaptersMenu && (
        <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-6 mt-4">
            <h3 className="text-xl font-bold text-[#F5F7FF] font-anime tracking-widest border-l-4 border-[#CC0000] pl-2">CAPÍTULOS</h3>
            <button onClick={() => setShowChaptersMenu(false)} className="w-10 h-10 bg-[#140505] border border-[#2A0A0A] rounded-full flex items-center justify-center text-[#A7ADBE] hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="overflow-y-auto hide-scrollbar space-y-2 flex-1 pb-10">
            {todosCapitulos.slice().reverse().map((cap) => (
              <div 
                key={cap.id} 
                onClick={() => { setShowChaptersMenu(false); handleMudarCapitulo(cap); }} 
                className={`p-4 rounded-xl flex items-center justify-between cursor-pointer transition-colors border ${cap.id === capitulo.id ? 'bg-[#CC0000]/20 border-[#CC0000] text-white' : 'bg-[#140505] border-[#2A0A0A] text-[#A7ADBE] hover:border-[#CC0000]/50'}`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Capítulo {cap.numero}</span>
                  {cap.titulo && <span className="text-[10px] uppercase font-bold mt-0.5 opacity-70">{cap.titulo}</span>}
                </div>
                {cap.id === capitulo.id ? <div className="w-2 h-2 bg-[#CC0000] rounded-full shadow-[0_0_8px_#CC0000]"></div> : <Play size={14} />}
              </div>
            ))}
          </div>
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
        <button onClick={() => setShowChaptersMenu(true)} className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg">
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
        <div onClick={() => setShowUI(!showUI)} className="w-full max-w-3xl mx-auto flex flex-col bg-black pb-16 cursor-pointer min-h-screen">
          {paginas.map((imgUrl, index) => (
            <img key={index} src={imgUrl} alt={`Pg ${index + 1}`} className={`w-full object-contain select-none bg-black ${perfil?.leituraHD ? 'image-rendering-high-quality' : ''}`} loading={index < 3 ? "eager" : "lazy"} />
          ))}
        </div>
      )}

      <div className={`fixed bottom-4 left-0 w-full px-4 z-50 transition-transform duration-300 ${showUI && paginas.length > 0 ? 'translate-y-0' : 'translate-y-24'}`}>
        <div className="max-w-xs mx-auto flex items-center justify-between bg-[#0A0505]/95 backdrop-blur-md border border-[#2A0A0A] rounded-full p-1.5 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
          <button onClick={() => handleMudarCapitulo(capituloAnterior)} disabled={!capituloAnterior} className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 text-[#A7ADBE] hover:bg-[#140505] hover:text-[#CC0000] transition-colors">
            <ChevronLeft size={20} />
          </button>
          
          <span className="text-white text-[10px] font-bold uppercase tracking-widest px-2">
            Capítulo {capitulo.numero} {!proximoCapitulo && <span className="text-[#CC0000] ml-1">- FIM</span>}
          </span>
          
          <button onClick={() => handleMudarCapitulo(proximoCapitulo)} disabled={!proximoCapitulo} className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-30 text-[#A7ADBE] hover:bg-[#140505] hover:text-[#CC0000] transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-[3px] bg-[#1A0505] z-50">
        <div className="h-full bg-gradient-to-r from-[#CC0000] to-[#FF3333] transition-all duration-150" style={{ width: `${progresso}%` }}></div>
      </div>
    </div>
  );
};

export default ReaderView;
