import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, AlertTriangle } from 'lucide-react';

const ReaderView = ({ capitulo, obra, onBack }) => {
  const [showUI, setShowUI] = useState(true);

  useEffect(() => {
    // Sempre que abre um capítulo, sobe a tela para o topo
    window.scrollTo(0, 0);
    setShowUI(true);

    // Cronômetro para esconder as barras de navegação automaticamente (leitura imersiva)
    const timer = setTimeout(() => setShowUI(false), 3500);

    return () => clearTimeout(timer);
  }, [capitulo]);

  if (!capitulo) return null;

  // Garante que páginas seja sempre um array, mesmo que venha vazio ou indefinido do banco
  const paginas = capitulo.paginas || [];

  return (
    <div className="bg-black min-h-screen relative font-nunito">
      {/* Top Bar - Desaparece para cima */}
      <div className={`fixed top-0 left-0 w-full bg-gradient-to-b from-black/90 to-transparent p-4 z-50 flex items-center justify-between transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
        <button onClick={onBack} className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg hover:bg-black/80 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-white text-sm font-bold truncate max-w-[200px]">{obra?.nome || "Obra"}</h2>
          <p className="text-[#A7ADBE] text-[10px] uppercase font-bold tracking-widest">
            {capitulo.titulo ? `${capitulo.titulo} - Cap. ${capitulo.numero}` : `Capítulo ${capitulo.numero}`}
          </p>
        </div>
        <button className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg hover:bg-black/80 transition-colors">
          <Settings size={18} />
        </button>
      </div>

      {/* ESTADO: ERRO - CAPÍTULO SEM PÁGINAS */}
      {paginas.length === 0 && (
        <div className="flex flex-col h-screen items-center justify-center text-[#A7ADBE] gap-4 p-6 text-center bg-[#050508]">
          <div className="w-16 h-16 bg-[#CC0000]/10 border border-[#CC0000]/30 rounded-full flex items-center justify-center text-[#FF3333] shadow-lg">
            <AlertTriangle size={32} />
          </div>
          <h3 className="font-anime text-sm text-white tracking-wider">Capítulo Vazio</h3>
          <p className="text-xs text-[#777] max-w-xs font-semibold leading-relaxed">Nenhuma página foi encontrada para este capítulo. Ele pode ainda estar em processamento.</p>
          <button onClick={onBack} className="mt-4 px-5 py-2.5 bg-[#140505] border border-[#2A0A0A] text-[#A7ADBE] rounded-xl text-xs font-bold uppercase tracking-wider hover:text-white transition-colors">Voltar aos capítulos</button>
        </div>
      )}

      {/* LEITOR RENDERIZANDO AS IMAGENS DIRETO DO ARRAY */}
      {paginas.length > 0 && (
        <div onClick={() => setShowUI(!showUI)} className="w-full max-w-3xl mx-auto flex flex-col bg-black pb-24 cursor-pointer min-h-screen">
          {paginas.map((imgUrl, index) => (
            <img 
              key={index} 
              src={imgUrl} 
              alt={`Página ${index + 1}`} 
              className="w-full object-contain select-none bg-black"
              // Dica de performance: Eager (baixa rápido) nas 3 primeiras, Lazy (sob demanda) no resto
              loading={index < 3 ? "eager" : "lazy"} 
            />
          ))}
        </div>
      )}

      {/* Bottom Bar - Desaparece para baixo */}
      <div className={`fixed bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6 z-50 flex items-center justify-center transition-transform duration-300 ${showUI && paginas.length > 0 ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-[#140505] border border-[#2A0A0A] rounded-full px-6 py-2 flex items-center justify-center shadow-2xl">
           <span className="text-white text-xs font-bold uppercase tracking-widest">{paginas.length} Páginas</span>
        </div>
      </div>
    </div>
  );
};

export default ReaderView;
