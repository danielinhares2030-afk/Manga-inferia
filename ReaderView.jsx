import React, { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Settings } from 'lucide-react';

const ReaderView = ({ capitulo, obra, onBack }) => {
  const [showUI, setShowUI] = useState(true);

  // Esconde a interface depois de 3 segundos para leitura imersiva
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setShowUI(false), 3000);
    return () => clearTimeout(timer);
  }, [capitulo]);

  if (!capitulo) return null;

  return (
    <div className="bg-black min-h-screen relative font-nunito">
      {/* Top Bar - Desaparece ao clicar na tela */}
      <div className={`fixed top-0 left-0 w-full bg-gradient-to-b from-black/90 to-transparent p-4 z-50 flex items-center justify-between transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
        <button onClick={onBack} className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-white text-sm font-bold truncate max-w-[200px]">{obra?.nome}</h2>
          <p className="text-[#A7ADBE] text-[10px] uppercase font-bold tracking-widest">Capítulo {capitulo.numero}</p>
        </div>
        <button className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
          <Settings size={18} />
        </button>
      </div>

      {/* Container de Imagens (O Leitor em si) */}
      <div onClick={() => setShowUI(!showUI)} className="w-full max-w-3xl mx-auto flex flex-col bg-black pb-20 cursor-pointer">
        {capitulo.paginas && capitulo.paginas.map((imgUrl, index) => (
          <img 
            key={index} 
            src={imgUrl} 
            alt={`Página ${index + 1}`} 
            className="w-full object-contain select-none"
            loading={index < 3 ? "eager" : "lazy"} // Carrega as 3 primeiras rápido, o resto sob demanda
          />
        ))}
      </div>

      {/* Bottom Bar */}
      <div className={`fixed bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6 z-50 flex items-center justify-center transition-transform duration-300 ${showUI ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-[#140505] border border-[#2A0A0A] rounded-full px-6 py-2 flex items-center gap-6 shadow-2xl">
           <span className="text-white text-xs font-bold uppercase tracking-widest">{capitulo.paginas?.length || 0} Páginas</span>
        </div>
      </div>
    </div>
  );
};

export default ReaderView;
