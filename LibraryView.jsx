import React, { useState, useMemo } from 'react';
import { Bookmark } from 'lucide-react';
import { MangaCard } from './UIComponents';

const LibraryView = React.memo(({ biblioteca, setSaveModal }) => {
  const [bibTab, setBibTab] = useState('Lendo');
  const tabs = ['Lendo', 'Finalizado', 'Favorito', 'Dropado', 'Planejo Ler'];

  const bibliotecaFiltrada = useMemo(() => {
    return biblioteca.filter(m => m.status === bibTab);
  }, [biblioteca, bibTab]);

  return (
    <div className="px-4 pt-10 animate-in fade-in duration-300 font-nunito relative pb-10 min-h-screen">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-[#CC0000]/10 blur-[100px] pointer-events-none"></div>

      <div className="flex justify-between items-end mb-6 relative z-10">
        <div className="mt-8">
          <h2 className="font-anime text-2xl md:text-3xl font-bold uppercase mb-2 flex items-center gap-3 leading-none drop-shadow-md">
            <Bookmark className="text-[#CC0000] shrink-0 drop-shadow-[0_0_10px_#CC0000]" size={28} fill="currentColor" /> Biblioteca
          </h2>
          <p className="text-[#A7ADBE] text-xs font-bold mt-1">As suas obras salvas e o seu progresso.</p>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-4 border-b border-[#2A0A0A] mb-6 relative z-10 hide-scrollbar pb-1 snap-x">
        {tabs.map(tab => (
          <button 
            key={tab} onClick={() => setBibTab(tab)}
            className={`pb-2 whitespace-nowrap text-sm font-bold border-b-2 transition-colors snap-start ${bibTab === tab ? 'border-[#CC0000] text-[#F5F7FF] drop-shadow-[0_0_5px_rgba(204,0,0,0.5)]' : 'border-transparent text-[#A7ADBE] hover:text-[#F5F7FF]'}`}>
            {tab.toUpperCase()} ({biblioteca.filter(m => m.status === tab).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 relative z-10">
        {bibliotecaFiltrada.map((obra) => (
          <MangaCard key={obra.id} manga={obra} variant="library" onSettings={(id) => setSaveModal({ isOpen: true, obraId: id })} />
        ))}
        {bibliotecaFiltrada.length === 0 && (
          <div className="col-span-full text-center py-16 text-[#A7ADBE] text-sm font-bold bg-[#0A0505] border border-[#2A0A0A] rounded-2xl">
            Nenhuma obra encontrada nesta categoria.
          </div>
        )}
      </div>
    </div>
  );
});

export default LibraryView;
