import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const ReaderView = ({ capitulo, obra, onBack, onReadChapter }) => {
  const [showUI, setShowUI] = useState(true);
  const [progresso, setProgresso] = useState(0);
  const [capituloAnterior, setCapituloAnterior] = useState(null);
  const [proximoCapitulo, setProximoCapitulo] = useState(null);

  // Busca Capítulos Vizinhos
  useEffect(() => {
    const buscarVizinhos = async () => {
      try {
        const q = query(collection(db, 'capitulos'), where('obraId', '==', obra.id));
        const snap = await getDocs(q);
        const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Ordena do menor para o maior (1, 2, 3...)
        lista.sort((a, b) => Number(a.numero) - Number(b.numero));
        
        const currentIndex = lista.findIndex(c => c.id === capitulo.id);
        if (currentIndex > 0) setCapituloAnterior(lista[currentIndex - 1]);
        else setCapituloAnterior(null);

        if (currentIndex < lista.length - 1) setProximoCapitulo(lista[currentIndex + 1]);
        else setProximoCapitulo(null);
      } catch (err) {
        console.error("Erro ao buscar próximos capítulos:", err);
      }
    };
    if (obra && capitulo) buscarVizinhos();
  }, [capitulo, obra]);

  // Barra de Progresso (Scroll)
  useEffect(() => {
    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollTop;
      const alturaJanela = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const percentual = (scrollTotal / alturaJanela) * 100;
      setProgresso(percentual || 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowUI(true);
    const timer = setTimeout(() => setShowUI(false), 3500);
    return () => clearTimeout(timer);
  }, [capitulo]);

  if (!capitulo) return null;
  const paginas = capitulo.paginas || [];

  return (
    <div className="bg-black min-h-screen relative font-nunito">
      {/* Top Bar */}
      <div className={`fixed top-0 left-0 w-full bg-gradient-to-b from-black/90 to-transparent p-4 z-50 flex items-center justify-between transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
        <button onClick={onBack} className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-white text-sm font-bold truncate max-w-[200px]">{obra?.nome || "Obra"}</h2>
          <p className="text-[#A7ADBE] text-[10px] uppercase font-bold tracking-widest">Capítulo {capitulo.numero}</p>
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

      {/* Imagens */}
      {paginas.length > 0 && (
        <div onClick={() => setShowUI(!showUI)} className="w-full max-w-3xl mx-auto flex flex-col bg-black pb-28 cursor-pointer min-h-screen">
          {paginas.map((imgUrl, index) => (
            <img key={index} src={imgUrl} alt={`Página ${index + 1}`} className="w-full object-contain select-none bg-black" loading={index < 3 ? "eager" : "lazy"} />
          ))}
        </div>
      )}

      {/* Bottom Bar com Navegação e Progresso */}
      <div className={`fixed bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/80 to-transparent pt-10 pb-4 px-4 z-50 transition-transform duration-300 ${showUI && paginas.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="max-w-md mx-auto flex items-center justify-between bg-[#140505]/95 backdrop-blur-md border border-[#2A0A0A] rounded-2xl p-2 shadow-2xl">
          
          <button 
            onClick={() => capituloAnterior && onReadChapter(capituloAnterior)}
            disabled={!capituloAnterior}
            className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 text-[#A7ADBE] hover:bg-[#2A0A0A] hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <span className="text-white text-[11px] font-bold uppercase tracking-widest">{paginas.length} Páginas</span>

          <button 
            onClick={() => proximoCapitulo && onReadChapter(proximoCapitulo)}
            disabled={!proximoCapitulo}
            className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30 text-[#A7ADBE] hover:bg-[#2A0A0A] hover:text-white transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Linha de Progresso Fixa na base */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1A0505]">
          <div className="h-full bg-[#CC0000] shadow-[0_0_10px_#CC0000] transition-all duration-150 ease-out" style={{ width: `${progresso}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default ReaderView;
