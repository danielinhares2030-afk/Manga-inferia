import React, { useState } from 'react';
import { Play, Bookmark, Clock } from 'lucide-react';
import { Shelf } from './UIComponents';

// FUNÇÃO PARA CALCULAR O TEMPO (Novo, 1 dia, etc)
const formatTimeAgo = (dateString) => {
  if (!dateString) return "NOVO";
  const diffTime = Math.abs(new Date() - new Date(dateString));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
  if (diffDays === 0) return "NOVO";
  if (diffDays === 1) return "1 DIA ATRÁS";
  return `${diffDays} DIAS ATRÁS`;
};

const HomeView = React.memo(({ carouselData, obrasDestaque, obrasRecentes, obrasAtualizadas, currentSlide, setSaveModal, onMangaClick }) => {
  // Estado para Filtros e Paginação das Atualizações
  const [filtro, setFiltro] = useState('Todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  // Aplica o filtro selecionado (Manga, Manhwa, etc)
  const atualizacoesFiltradas = obrasAtualizadas.filter(obra => {
    if (filtro === 'Todos') return true;
    return obra.tipo?.toLowerCase() === filtro.toLowerCase();
  });

  // Calcula Paginação
  const totalPaginas = Math.ceil(atualizacoesFiltradas.length / itensPorPagina);
  const atualizacoesDaPagina = atualizacoesFiltradas.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {carouselData.length > 0 && (
        <section className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden bg-[#030305]">
          {carouselData.map((item, index) => (
            <div key={item.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img src={item.capaUrl || item.img} alt={item.nome} className="w-full h-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/70 to-transparent"></div>
              <div className="absolute bottom-6 left-4 right-4 md:left-12 z-20 font-nunito animate-in slide-in-from-bottom-10 duration-700">
                <span className="inline-block px-3 py-1 bg-[#13141C]/80 backdrop-blur-md border border-[#CC0000]/40 rounded-full text-[10px] font-bold tracking-wider text-[#FF3333] mb-3 uppercase">
                  {item.tipo || 'DESTAQUE'}
                </span>
                <h2 className="font-teko text-5xl md:text-7xl font-bold mb-1 uppercase leading-none drop-shadow-lg">{item.nome}</h2>
                <p className="text-[#A7ADBE] text-sm md:text-base max-w-sm mb-5 line-clamp-2 font-semibold drop-shadow-md">{item.descricao}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => onMangaClick(item.id)} className="flex-1 max-w-[160px] bg-gradient-to-r from-[#CC0000] to-[#7A0000] text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,0,0,0.5)] transition-all font-teko tracking-wider">
                    <Play size={18} fill="currentColor" /> LER AGORA
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      <div className={carouselData.length === 0 ? "pt-24" : ""}>
        <Shelf title="Em Destaque" data={obrasDestaque} color="#CC0000" onBookmark={(id) => setSaveModal({ isOpen: true, obraId: id })} onMangaClick={onMangaClick} />
        <Shelf title="Lançamentos" data={obrasRecentes} color="#FF3333" badge="Novo" onBookmark={(id) => setSaveModal({ isOpen: true, obraId: id })} onMangaClick={onMangaClick} />
        
        {/* NOVA SEÇÃO DE ATUALIZAÇÕES VERTICAL */}
        <section className="mt-10 px-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 bg-[#7A3CFF] rounded-full shadow-[0_0_8px_#7A3CFF]"></div>
            <h3 className="font-teko text-2xl tracking-wide uppercase mt-1">Últimas Atualizações</h3>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-2">
            {['Todos', 'Manhwa', 'Manga', 'Manhua', 'Shoujo'].map(f => (
              <button 
                key={f} 
                onClick={() => { setFiltro(f); setPaginaAtual(1); }}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${filtro === f ? 'bg-[#7A3CFF]/20 border-[#7A3CFF] text-[#7A3CFF]' : 'bg-[#140505] border-[#2A0A0A] text-[#A7ADBE] hover:text-white'}`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Grid Vertical */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {atualizacoesDaPagina.map(obra => {
              // Simula os dois últimos capítulos baseado no mais recente (obra.cap)
              const capMaisRecente = obra.cap || 'Cap. 01';
              const numCap = parseInt(capMaisRecente.replace(/\D/g, '')) || 1;
              const capAnterior = numCap > 1 ? `Cap. ${String(numCap - 1).padStart(2, '0')}` : null;
              const timeLabel = formatTimeAgo(obra.updatedAt);

              return (
                <div key={obra.id} onClick={() => onMangaClick(obra.id)} className="flex gap-4 bg-[#0A0505] border border-[#2A0A0A] p-3 rounded-2xl hover:border-[#7A3CFF]/50 transition-colors cursor-pointer group">
                  <img src={obra.capaUrl} alt={obra.nome} className="w-20 h-28 object-cover rounded-xl border border-[#1A0505]" />
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <span className="text-[9px] text-[#7A3CFF] font-black uppercase tracking-widest">{obra.tipo}</span>
                      <h4 className="font-nunito text-sm font-bold text-[#F5F7FF] group-hover:text-white line-clamp-2 leading-tight">{obra.nome}</h4>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center bg-[#140505] px-2.5 py-1.5 rounded-lg border border-[#2A0A0A]">
                        <span className="text-xs font-bold text-[#A7ADBE]">{capMaisRecente}</span>
                        <span className={`text-[9px] font-bold uppercase ${timeLabel === 'NOVO' ? 'text-[#00FF88]' : 'text-[#777]'}`}>{timeLabel}</span>
                      </div>
                      {capAnterior && (
                        <div className="flex justify-between items-center px-2.5 py-1 rounded-lg">
                          <span className="text-xs font-bold text-[#777]">{capAnterior}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginação Numérica */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                <button 
                  key={num} 
                  onClick={() => setPaginaAtual(num)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${paginaAtual === num ? 'bg-[#7A3CFF] text-white shadow-[0_0_10px_#7A3CFF]' : 'bg-[#140505] border border-[#2A0A0A] text-[#A7ADBE] hover:text-white'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
});

export default HomeView;
