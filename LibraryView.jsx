import React, { useState, useMemo } from 'react';
import { Bookmark, Play, Star, Settings } from 'lucide-react';

// Inserindo o componente MangaCard diretamente para resolver a importação
const MangaCard = React.memo(({ manga, variant = 'default', badge, isUpdate, onBookmark, onSettings }) => {
  return (
    <div className="group cursor-pointer relative font-nunito w-full h-full flex flex-col">
      <div className={`relative aspect-[2/3] overflow-hidden bg-[#0A0505] border border-[#2A0A0A] ${variant === 'library' ? 'rounded-t-xl' : 'rounded-xl'}`}>
        <img src={manga.capaUrl || manga.img || "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200"} alt={manga.nome || manga.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {variant === 'library' && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-[#CC0000] rounded-full flex items-center justify-center shadow-[0_0_15px_#CC0000]"><Play size={20} fill="currentColor" className="ml-1" /></div>
          </div>
        )}

        {badge && <div className="absolute bottom-2 left-2 text-[10px] font-bold text-white uppercase bg-[#CC0000] px-1.5 py-0.5 rounded z-10">{badge}</div>}
        {isUpdate && <div className="absolute bottom-0 w-full bg-black/80 backdrop-blur-sm py-1.5 px-2 text-center text-[11px] font-bold text-[#A970FF] border-t border-[#A970FF]/30 z-10">{manga.status || 'Atualizado'}</div>}
        
        {!badge && !isUpdate && variant !== 'library' && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-yellow-500 flex items-center gap-1 border border-yellow-500/20 z-10">
            <Star size={10} fill="currentColor" /> {manga.rating || 'N/A'}
          </div>
        )}

        {variant === 'library' ? (
          <button onClick={(e) => { e.stopPropagation(); onSettings(manga.id); }} className="absolute top-2 right-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-white hover:text-[#CC0000] border border-white/10 z-20 transition-colors">
            <Settings size={14} />
          </button>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onBookmark(manga.id); }} className="absolute top-2 right-2 w-7 h-7 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:text-[#CC0000] hover:scale-110 z-20 shadow-lg">
            <Bookmark size={14} />
          </button>
        )}
      </div>

      {variant === 'library' ? (
        <div className="p-3 bg-[#050508] border-t border-[#2A0A0A] rounded-b-xl border-b border-l border-r flex-1 flex flex-col justify-between">
          <h4 className="text-[13px] font-bold truncate text-[#F5F7FF] mb-2">{manga.nome || manga.title}</h4>
          {manga.status === 'Lendo' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-[#A7ADBE] font-bold">Capítulo {manga.capAtual || 0}</span>
                <span className="text-[10px] font-bold text-[#CC0000]">{manga.progresso || 0}%</span>
              </div>
              <div className="h-1.5 bg-[#1A0505] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#990000] to-[#FF3333] shadow-[0_0_10px_#CC0000]" style={{width: `${manga.progresso || 0}%`}}></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-2 flex-1">
          <h4 className="font-nunito text-sm font-bold truncate text-[#F5F7FF] group-hover:text-[#CC0000] transition-colors">{manga.nome || manga.title}</h4>
          {!isUpdate && <p className="text-[11px] text-[#A7ADBE] font-semibold">{manga.tipo || 'Cap. 01'}</p>}
        </div>
      )}
    </div>
  );
});

const LibraryView = React.memo(({ biblioteca = [], setSaveModal = () => {} }) => {
  const [bibTab, setBibTab] = useState('Lendo');
  const tabs = ['Lendo', 'Finalizado', 'Favorito', 'Dropado', 'Planejo Ler'];

  // Memoiza a filtragem para não pesar na renderização
  const bibliotecaFiltrada = useMemo(() => {
    return biblioteca.filter(m => m.status === bibTab);
  }, [biblioteca, bibTab]);

  return (
    <div className="px-4 pt-10 animate-in fade-in duration-300 font-nunito relative pb-10 min-h-screen bg-[#050508] text-white">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Shojumaru&family=Teko:wght@500;600;700&display=swap');
        .font-anime { font-family: 'Shojumaru', system-ui; }
        .font-teko { font-family: 'Teko', sans-serif; letter-spacing: 0.05em; }
        .font-nunito { font-family: 'Nunito', sans-serif; }
      `}} />

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
