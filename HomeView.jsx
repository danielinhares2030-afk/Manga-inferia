import React from 'react';
import { Play, ChevronRight, Star, Bookmark } from 'lucide-react';

const HomeView = ({ carouselData = [], obrasDestaque = [], obrasAtualizadas = [], currentSlide = 0, setSaveModal, onMangaClick }) => {

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1 bg-[#0A0505]/80 backdrop-blur border border-[#FFD700]/30 px-2 py-1 rounded">
        <Star size={12} className="text-[#FFD700] fill-[#FFD700]" />
        <span className="text-white text-[10px] font-black">{Number(rating || 0).toFixed(1)}</span>
      </div>
    );
  };

  const getUltimosCapitulos = (caps) => {
    try {
      if (!caps) return [];
      if (Array.isArray(caps)) return caps.slice(0, 2);
      if (typeof caps === 'object') return Object.values(caps).slice(0, 2);
      return [];
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="pb-10 font-nunito animate-in fade-in duration-500">
      
      {/* Carousel */}
      {carouselData.length > 0 && (
        <div className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden group">
          {carouselData.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/40 to-transparent z-10"></div>
              <img src={slide.capaUrl || slide.img} className="w-full h-full object-cover" alt="" />
              <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col items-start pb-12">
                <span className="bg-[#CC0000] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-[0_0_10px_#CC0000]">
                  {slide.tipo || 'Destaque'}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-none mb-3 font-teko uppercase tracking-wide drop-shadow-md">
                  {slide.nome || slide.title}
                </h2>
                <p className="text-gray-300 text-xs md:text-sm line-clamp-2 max-w-xl mb-5 font-medium drop-shadow-md">
                  {slide.sinopse || 'Nenhuma sinopse disponível para esta obra.'}
                </p>
                <button onClick={() => onMangaClick(slide.id)} className="bg-gradient-to-r from-[#CC0000] to-[#8B0000] text-white font-black uppercase tracking-widest py-3 px-6 rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(204,0,0,0.4)] text-sm">
                  <Play size={16} className="fill-white" /> Ler Agora
                </button>
              </div>
            </div>
          ))}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {carouselData.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-[#CC0000] shadow-[0_0_8px_#CC0000]' : 'w-2 bg-white/30'}`}></div>
            ))}
          </div>
        </div>
      )}

      {/* Em Destaque */}
      {obrasDestaque.length > 0 && (
        <div className="mt-8 px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 border-l-4 border-[#CC0000] pl-2 font-teko text-2xl">
              Em Destaque
            </h3>
            <ChevronRight className="text-gray-500" size={20} />
          </div>
          <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-4 snap-x">
            {obrasDestaque.map(obra => (
              <div key={obra.id} onClick={() => onMangaClick(obra.id)} className="min-w-[140px] md:min-w-[160px] snap-start relative rounded-xl overflow-hidden cursor-pointer group shadow-lg">
                <div className="absolute top-2 left-2 z-10">{renderStars(obra.rating)}</div>
                <button onClick={(e) => { e.stopPropagation(); setSaveModal({ isOpen: true, obraId: obra.id }); }} className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-[#0A0505]/80 backdrop-blur border border-[#2A0A0A] flex items-center justify-center text-white hover:border-[#CC0000] transition-colors">
                  <Bookmark size={14} />
                </button>
                <div className="h-48 md:h-56 w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent z-0 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <img src={obra.capaUrl || obra.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" loading="lazy" />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-3 z-10">
                  <span className="text-[#CC0000] text-[9px] font-black uppercase tracking-widest drop-shadow-md">{obra.tipo || 'Manga'}</span>
                  <h4 className="text-white text-xs md:text-sm font-bold line-clamp-2 leading-tight drop-shadow-md">{obra.nome || obra.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Atualizações */}
      {obrasAtualizadas.length > 0 && (
        <div className="mt-6 px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 border-l-4 border-[#CC0000] pl-2 font-teko text-2xl">
              Atualizações
            </h3>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {obrasAtualizadas.map(obra => {
              const ultimosCapitulos = getUltimosCapitulos(obra.capitulos);

              return (
                <div key={obra.id} onClick={() => onMangaClick(obra.id)} className="bg-[#0A0505] border border-[#2A0A0A] rounded-xl overflow-hidden flex flex-col cursor-pointer group hover:border-[#CC0000]/50 transition-colors shadow-lg">
                  <div className="relative h-40 md:h-48 w-full overflow-hidden">
                    <img src={obra.capaUrl || obra.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" loading="lazy" />
                    <div className="absolute top-2 left-2 bg-[#CC0000] text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-md">
                      {obra.tipo || 'Manga'}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setSaveModal({ isOpen: true, obraId: obra.id }); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#0A0505]/80 backdrop-blur border border-[#2A0A0A] flex items-center justify-center text-white hover:border-[#CC0000] transition-colors">
                      <Bookmark size={12} />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0505] via-transparent to-transparent opacity-90"></div>
                  </div>
                  
                  <div className="p-3 flex flex-col flex-1 relative z-10 -mt-6">
                    <h4 className="text-white text-xs font-bold line-clamp-2 mb-3 drop-shadow-md min-h-[32px]">{obra.nome || obra.title}</h4>
                    
                    <div className="mt-auto space-y-1.5">
                      {ultimosCapitulos.length > 0 ? ultimosCapitulos.map((cap, i) => (
                        <div key={i} className="flex justify-between items-center bg-[#140505] border border-[#2A0A0A] p-2 rounded-lg group-hover:border-[#CC0000]/30 transition-colors">
                          <span className="text-[11px] text-gray-200 font-bold">Cap. {cap.numero || cap.numeroCapitulo || '?'}</span>
                          <span className="text-[9px] text-[#CC0000] font-black uppercase tracking-wider">{cap.data || 'Novo'}</span>
                        </div>
                      )) : (
                        <div className="text-[10px] text-gray-500 italic text-center py-2 bg-[#140505] rounded-lg border border-[#2A0A0A]">
                          Nenhum capítulo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeView;
