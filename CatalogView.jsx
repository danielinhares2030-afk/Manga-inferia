import React, { useState } from 'react';
import { Search, Filter, X, Play, Star, Bookmark, Settings } from 'lucide-react';

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

const CatalogView = React.memo(({ searchQuery = '', setSearchQuery = () => {}, catalogoFiltrado = [], setSaveModal = () => {} }) => {
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filtros, setFiltros] = useState({ genero: 'Todos', tipo: 'Todos' });

  return (
    <div className="px-4 pt-20 animate-in fade-in duration-300 font-nunito pb-10 min-h-screen bg-[#050508] text-white">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Shojumaru&family=Teko:wght@500;600;700&display=swap');
        .font-anime { font-family: 'Shojumaru', system-ui; }
        .font-teko { font-family: 'Teko', sans-serif; letter-spacing: 0.05em; }
        .font-nunito { font-family: 'Nunito', sans-serif; }
      `}} />

      <h2 className="font-anime text-xl md:text-2xl font-bold mb-5 uppercase tracking-wider border-l-4 border-[#CC0000] pl-3 leading-none flex items-center drop-shadow-md">Catálogo</h2>
      
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#A7ADBE]" />
        </div>
        <input 
          type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-12 pr-[100px] py-3.5 border border-[#2A0A0A] rounded-xl leading-5 bg-[#0A0505] text-[#F5F7FF] placeholder-[#A7ADBE] focus:outline-none focus:border-[#CC0000] focus:ring-1 focus:ring-[#CC0000] font-semibold transition-all shadow-inner" 
          placeholder="Buscar obras pelas profundezas..." 
        />
        <button onClick={() => setFilterModalOpen(true)} className="absolute inset-y-2 right-2 px-4 bg-[#1A0505] border border-[#2A0A0A] rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#2A0A0A] transition-colors text-[#FF3333] shadow-md hover:shadow-lg">
          <Filter size={14}/> Filtros
        </button>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-5">
        {catalogoFiltrado.map((obra) => (
          <MangaCard key={obra.id} manga={obra} variant="grid" onBookmark={(id) => setSaveModal({ isOpen: true, obraId: id })} />
        ))}
        {catalogoFiltrado.length === 0 && (
          <div className="col-span-full text-center py-20 text-[#A7ADBE] text-sm font-bold bg-[#0A0505] border border-[#2A0A0A] rounded-2xl flex flex-col items-center justify-center gap-3">
            <Search size={32} className="text-[#CC0000] opacity-50" />
            Nenhuma obra encontrada no abismo.
          </div>
        )}
      </div>

      {/* Modal de Filtros */}
      {filterModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center transition-opacity">
          <div className="bg-[#0A0505] border-t sm:border border-[#CC0000]/30 sm:rounded-3xl rounded-t-3xl p-6 w-full max-w-md font-nunito relative animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 duration-300 shadow-[0_0_50px_rgba(204,0,0,0.2)]">
            <button onClick={() => setFilterModalOpen(false)} className="absolute top-5 right-5 text-[#A7ADBE] hover:text-white bg-[#1A0505] rounded-full p-1 border border-[#2A0A0A]"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6 text-[#F5F7FF] font-anime flex items-center gap-2 tracking-widest"><Filter size={20} className="text-[#CC0000]" /> FILTROS</h3>
            
            <div className="mb-6">
              <h4 className="text-xs font-bold text-[#A7ADBE] mb-3 uppercase tracking-widest">Tipo de Obra</h4>
              <div className="flex flex-wrap gap-2">
                {['Todos', 'Mangá', 'Manhwa', 'Manhua', 'Comic', 'Novel'].map(tipo => (
                  <button key={tipo} onClick={() => setFiltros(prev => ({...prev, tipo}))} className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${filtros.tipo === tipo ? 'bg-[#CC0000] border-[#CC0000] text-white shadow-[0_0_15px_rgba(204,0,0,0.5)]' : 'bg-[#140505] border-[#2A0A0A] text-[#A7ADBE] hover:text-white hover:border-[#CC0000]/50'}`}>
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h4 className="text-xs font-bold text-[#A7ADBE] mb-3 uppercase tracking-widest">Gêneros</h4>
              <div className="flex flex-wrap gap-2">
                {['Todos', 'Ação', 'Romance', 'Fantasia', 'Shounen', 'Shoujo', 'Seinen', 'Isekai', 'Terror'].map(gen => (
                  <button key={gen} onClick={() => setFiltros(prev => ({...prev, genero: gen}))} className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${filtros.genero === gen ? 'bg-[#990000] border-[#990000] text-white shadow-[0_0_15px_rgba(153,0,0,0.5)]' : 'bg-[#140505] border-[#2A0A0A] text-[#A7ADBE] hover:text-white hover:border-[#990000]/50'}`}>
                    {gen}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setFilterModalOpen(false)} className="w-full bg-[#CC0000] text-white py-4 rounded-xl font-bold tracking-widest hover:bg-[#990000] transition-colors uppercase font-teko text-xl">
              APLICAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default CatalogView;
