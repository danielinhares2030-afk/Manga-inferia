import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { MangaCard } from './UIComponents';

const CatalogView = ({ searchQuery, setSearchQuery, catalogoFiltrado, setSaveModal, onMangaClick }) => {
  // Limite inicial de obras na tela (começa com 12)
  const [limite, setLimite] = useState(12);

  // Recupera a posição da rolagem e a quantidade de obras abertas ao voltar
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('catalogScroll');
    const savedLimit = sessionStorage.getItem('catalogLimit');
    
    if (savedLimit) setLimite(parseInt(savedLimit));
    if (savedScroll) {
      setTimeout(() => window.scrollTo(0, parseInt(savedScroll)), 100);
    }

    // Salva a posição antes de sair da tela de catálogo
    return () => {
      sessionStorage.setItem('catalogScroll', window.scrollY);
      sessionStorage.setItem('catalogLimit', limite);
    };
  }, [limite]);

  const obrasVisiveis = catalogoFiltrado.slice(0, limite);
  const temMaisObras = limite < catalogoFiltrado.length;

  const carregarMais = () => {
    setLimite(prev => prev + 12);
  };

  return (
    <div className="animate-in fade-in duration-500 pt-24 pb-10 px-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-teko text-3xl md:text-4xl uppercase tracking-wider border-l-4 border-[#CC0000] pl-3">Catálogo Completo</h2>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A7ADBE]" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar obra pelo nome..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#140505] border border-[#2A0A0A] text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#CC0000]/50 transition-colors shadow-lg"
          />
        </div>

        {/* Grid de Obras */}
        {obrasVisiveis.length === 0 ? (
          <div className="text-center py-20 text-[#A7ADBE]">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p>Nenhuma obra encontrada.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5">
              {obrasVisiveis.map(obra => (
                <MangaCard key={obra.id} manga={obra} onBookmark={setSaveModal} onClick={onMangaClick} />
              ))}
            </div>

            {/* Botão Carregar Mais */}
            {temMaisObras && (
              <div className="flex justify-center mt-10">
                <button 
                  onClick={carregarMais}
                  className="bg-[#140505] border border-[#2A0A0A] text-[#A7ADBE] px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-[#CC0000] hover:text-white hover:border-[#CC0000] transition-all shadow-lg"
                >
                  <ChevronDown size={18} /> Carregar Mais
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogView;
