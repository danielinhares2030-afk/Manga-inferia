import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { MangaCard } from './UIComponents';

const LibraryView = ({ biblioteca = [], setSaveModal, onMangaClick }) => {
  const [filtro, setFiltro] = useState('Lendo');
  const abas = ['Lendo', 'Finalizado', 'Favorito', 'Dropado'];

  const safeBiblioteca = Array.isArray(biblioteca) ? biblioteca : [];
  const obrasFiltradas = safeBiblioteca.filter(b => b.status === filtro);

  return (
    <div className="animate-in fade-in duration-500 pt-8 pb-10 min-h-screen px-4 max-w-7xl mx-auto">
      <div className="mb-6 mt-16">
        <h2 className="font-anime text-3xl md:text-4xl text-white tracking-widest flex items-center gap-3 drop-shadow-md">
           BIBLIOTECA
        </h2>
        <p className="text-[#A7ADBE] text-sm font-bold mt-1">As suas obras salvas e o seu progresso.</p>
      </div>

      <div className="flex gap-4 border-b border-[#2A0A0A] mb-6 overflow-x-auto hide-scrollbar">
        {abas.map(aba => (
          <button 
            key={aba} 
            onClick={() => setFiltro(aba)}
            className={`pb-3 px-1 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors relative ${filtro === aba ? 'text-white' : 'text-[#A7ADBE] hover:text-white'}`}
          >
            {aba} ({safeBiblioteca.filter(b => b.status === aba).length})
            {filtro === aba && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#CC0000] rounded-t-full shadow-[0_0_10px_#CC0000]"></div>}
          </button>
        ))}
      </div>

      {obrasFiltradas.length === 0 ? (
        <div className="bg-[#0A0505] border border-[#2A0A0A] rounded-2xl p-10 flex flex-col items-center justify-center text-center mt-8">
          <Search size={40} className="text-[#2A0A0A] mb-4" />
          <p className="text-[#A7ADBE] font-bold text-sm">Nenhuma obra encontrada nesta categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
          {obrasFiltradas.map(obra => (
            <MangaCard 
              key={obra.id} 
              manga={obra} 
              variant="library" 
              onSettings={() => setSaveModal({ isOpen: true, obraId: obra.id })} 
              onClick={onMangaClick} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryView;
