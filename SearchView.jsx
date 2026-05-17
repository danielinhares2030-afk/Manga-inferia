// SearchView.jsx

import React, { useState, useMemo } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { MangaCard } from './UIComponents';

const SearchView = ({ obras, onBack, onMangaClick }) => {
  const [queryBusca, setQueryBusca] = useState('');

  const resultados = useMemo(() => {
    if (!queryBusca.trim()) return [];
    return obras.filter(o => (o.nome || '').toLowerCase().includes(queryBusca.toLowerCase()));
  }, [obras, queryBusca]);

  return (
    <div className="bg-[#050508] min-h-screen pt-4 px-4 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-10 h-10 bg-[#140505] rounded-full flex items-center justify-center text-[#A7ADBE] border border-[#2A0A0A] hover:text-white hover:border-[#CC0000]/50 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A7ADBE]" size={18} />
          <input 
            autoFocus
            type="text" 
            placeholder="Qual obra você procura?" 
            value={queryBusca}
            onChange={(e) => setQueryBusca(e.target.value)}
            className="w-full bg-[#140505] border border-[#2A0A0A] text-white rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-[#CC0000]/50 shadow-lg"
          />
        </div>
      </div>

      {queryBusca.trim() === '' ? (
        <div className="text-center py-32 text-[#A7ADBE] flex flex-col items-center">
          <Search size={48} className="opacity-20 mb-4" />
          <p className="font-bold text-sm tracking-wide">Digite o nome da obra para pesquisar...</p>
        </div>
      ) : resultados.length === 0 ? (
        <div className="text-center py-32 text-[#A7ADBE]">
          <p className="font-bold text-sm">Nenhuma obra encontrada com "{queryBusca}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
          {resultados.map(obra => (
            <div key={obra.id} className="min-w-[100px]">
              <MangaCard manga={obra} onClick={onMangaClick} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchView;
