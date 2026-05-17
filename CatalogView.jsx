import React, { useState, useMemo } from 'react';
import { Search, Hash, Filter, X } from 'lucide-react';
import { MangaCard } from './UIComponents';

const CatalogView = ({ searchQuery, setSearchQuery, catalogoFiltrado, setSaveModal, onMangaClick }) => {
  const [showFiltros, setShowFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: 'Todos',
    genero: 'Todos',
    status: 'Todos'
  });

  const listasDeFiltro = {
    tipos: ['Todos', 'Manga', 'Manhwa', 'Manhua', 'Shoujo'],
    generos: ['Todos', 'Ação', 'Aventura', 'Romance', 'Comédia', 'Fantasia', 'Isekai', 'Drama', 'Terror', 'Suspense', 'Mistério', 'Sci-Fi'],
    status: ['Todos', 'Em Andamento', 'Finalizado']
  };

  const handleFiltroChange = (categoria, valor) => {
    setFiltros(prev => ({ ...prev, [categoria]: valor }));
  };

  const limparFiltros = () => {
    setFiltros({ tipo: 'Todos', genero: 'Todos', status: 'Todos' });
  };

  const obrasExibidas = useMemo(() => {
    return catalogoFiltrado.filter(obra => {
      const matchTipo = filtros.tipo === 'Todos' || obra.tipo?.toLowerCase() === filtros.tipo.toLowerCase();
      const matchStatus = filtros.status === 'Todos' || obra.statusObra?.toLowerCase() === filtros.status.toLowerCase();
      const matchGenero = filtros.genero === 'Todos' || (obra.generos && obra.generos.includes(filtros.genero));
      
      return matchTipo && matchStatus && matchGenero;
    });
  }, [catalogoFiltrado, filtros]);

  const totalFiltrosAtivos = Object.values(filtros).filter(val => val !== 'Todos').length;

  return (
    <div className="animate-in fade-in duration-500 pt-6 px-4 pb-24 min-h-screen relative">
      <div className="mb-6">
        <h2 className="font-anime text-3xl md:text-4xl text-white tracking-widest flex items-center gap-3 drop-shadow-md mb-4">
          <Hash className="text-[#CC0000]" size={28} /> CATÁLOGO
        </h2>
        
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A7ADBE]" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar obras..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0505] border border-[#2A0A0A] text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#CC0000]/50 shadow-lg font-bold text-sm"
            />
          </div>
          
          <button 
            onClick={() => setShowFiltros(true)}
            className={`relative w-14 rounded-2xl border flex items-center justify-center transition-colors shadow-lg ${totalFiltrosAtivos > 0 ? 'bg-[#CC0000]/20 border-[#CC0000] text-[#FF3333]' : 'bg-[#0A0505] border-[#2A0A0A] text-[#A7ADBE] hover:text-white'}`}
          >
            <Filter size={20} />
            {totalFiltrosAtivos > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#CC0000] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg">
                {totalFiltrosAtivos}
              </span>
            )}
          </button>
        </div>
      </div>

      {showFiltros && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0A0505] h-full border-l border-[#2A0A0A] flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-300">
            
            <div className="flex justify-between items-center p-5 border-b border-[#2A0A0A]">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-[#CC0000]" />
                <h3 className="font-anime text-lg text-white tracking-widest">FILTROS</h3>
              </div>
              <button onClick={() => setShowFiltros(false)} className="w-8 h-8 rounded-full bg-[#140505] border border-[#2A0A0A] flex items-center justify-center text-[#A7ADBE] hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 hide-scrollbar">
              
              <div>
                <h4 className="text-xs font-bold text-[#A7ADBE] uppercase tracking-wider mb-3 border-l-2 border-[#CC0000] pl-2">Por Tipo</h4>
                <div className="flex flex-wrap gap-2">
                  {listasDeFiltro.tipos.map(tipo => (
                    <button 
                      key={tipo} 
                      onClick={() => handleFiltroChange('tipo', tipo)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors border ${filtros.tipo === tipo ? 'bg-[#CC0000] border-[#CC0000] text-white shadow-[0_0_10px_rgba(204,0,0,0.4)]' : 'bg-[#140505] border-[#2A0A0A] text-[#A7ADBE] hover:text-white hover:border-[#A7ADBE]/50'}`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#A7ADBE] uppercase tracking-wider mb-3 border-l-2 border-[#CC0000] pl-2">Por Status</h4>
                <div className="flex flex-wrap gap-2">
                  {listasDeFiltro.status.map(status => (
                    <button 
                      key={status} 
                      onClick={() => handleFiltroChange('status', status)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors border ${filtros.status === status ? 'bg-[#CC0000] border-[#CC0000] text-white shadow-[0_0_10px_rgba(204,0,0,0.4)]' : 'bg-[#140505] border-[#2A0A0A] text-[#A7ADBE] hover:text-white hover:border-[#A7ADBE]/50'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#A7ADBE] uppercase tracking-wider mb-3 border-l-2 border-[#CC0000] pl-2">Por Gênero</h4>
                <div className="flex flex-wrap gap-2">
                  {listasDeFiltro.generos.map(genero => (
                    <button 
                      key={genero} 
                      onClick={() => handleFiltroChange('genero', genero)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors border ${filtros.genero === genero ? 'bg-[#CC0000] border-[#CC0000] text-white shadow-[0_0_10px_rgba(204,0,0,0.4)]' : 'bg-[#140505] border-[#2A0A0A] text-[#A7ADBE] hover:text-white hover:border-[#A7ADBE]/50'}`}
                    >
                      {genero}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-5 border-t border-[#2A0A0A] flex gap-3 bg-[#050508]">
              <button 
                onClick={limparFiltros}
                className="flex-1 py-3.5 rounded-xl border border-[#2A0A0A] text-[#A7ADBE] font-bold text-xs uppercase tracking-wider hover:text-white hover:bg-[#140505] transition-colors"
              >
                Limpar
              </button>
              <button 
                onClick={() => setShowFiltros(false)}
                className="flex-[2] bg-gradient-to-r from-[#CC0000] to-[#990000] text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(204,0,0,0.4)] hover:scale-[1.02] transition-transform"
              >
                Aplicar
              </button>
            </div>

          </div>
        </div>
      )}

      {obrasExibidas.length === 0 ? (
        <div className="bg-[#0A0505] border border-[#2A0A0A] rounded-2xl p-10 flex flex-col items-center justify-center text-center mt-8">
          <Search size={40} className="text-[#2A0A0A] mb-4" />
          <p className="text-[#A7ADBE] font-bold text-sm">Nenhuma obra encontrada com estes filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
          {obrasExibidas.map(obra => (
            <div key={obra.id} className="min-w-[100px]">
              <MangaCard 
                manga={obra} 
                onBookmark={(id) => setSaveModal({ isOpen: true, obraId: id })} 
                onClick={onMangaClick} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogView;
