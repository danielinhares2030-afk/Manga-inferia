import React from 'react';
import { Play, Star, Bookmark, Settings, ChevronRight } from 'lucide-react';

export const MangaCard = React.memo(({ manga, variant = 'default', badge, isUpdate, onBookmark, onSettings, onClick }) => {
  return (
    <div onClick={() => onClick && onClick(manga.id)} className="group cursor-pointer relative font-nunito w-full h-full flex flex-col rounded-xl overflow-hidden shadow-lg border border-[#2A0A0A] bg-[#0A0505]">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img src={manga.capaUrl || manga.img || "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200"} alt={manga.nome || manga.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
        
        {/* Degradê mais forte para ler o texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
        
        {badge && <div className="absolute top-2 left-2 text-[10px] font-bold text-white uppercase bg-[#CC0000] px-1.5 py-0.5 rounded z-10">{badge}</div>}
        
        {!badge && !isUpdate && variant !== 'library' && (
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-yellow-500 flex items-center gap-1 border border-yellow-500/20 z-10">
            <Star size={10} fill="currentColor" /> {manga.rating || '0.0'}
          </div>
        )}

        {variant === 'library' ? (
          <button onClick={(e) => { e.stopPropagation(); onSettings(manga.id); }} className="absolute top-2 right-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-white hover:text-[#CC0000] border border-white/10 z-20 transition-colors">
            <Settings size={14} />
          </button>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onBookmark(manga.id); }} className="absolute top-2 right-2 w-8 h-8 bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:text-[#CC0000] hover:scale-110 z-20 shadow-lg">
            <Bookmark size={14} />
          </button>
        )}

        {/* Informações DENTRO do Card */}
        <div className="absolute bottom-0 left-0 w-full p-3 z-10 flex flex-col justify-end">
          <p className="text-[10px] text-[#CC0000] font-black uppercase tracking-widest mb-0.5 drop-shadow-md">{manga.tipo || 'Obra'}</p>
          <h4 className="font-nunito text-sm md:text-base font-bold text-[#F5F7FF] group-hover:text-white transition-colors line-clamp-2 leading-tight drop-shadow-lg">{manga.nome || manga.title}</h4>
          
          {variant === 'library' && manga.status === 'Lendo' && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-[#A7ADBE] font-bold">Cap. {manga.capAtual || 0}</span>
                <span className="text-[9px] font-bold text-[#CC0000]">{manga.progresso || 0}%</span>
              </div>
              <div className="h-1 bg-[#1A0505] rounded-full overflow-hidden">
                <div className="h-full bg-[#CC0000] shadow-[0_0_10px_#CC0000]" style={{width: `${manga.progresso || 0}%`}}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const Shelf = React.memo(({ title, data, color, badge, isUpdate, onBookmark, onMangaClick }) => {
  if (!data || data.length === 0) return null;
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
          <h3 className="font-teko text-2xl tracking-wide uppercase mt-1">{title}</h3>
        </div>
        <ChevronRight size={18} className="text-[#A7ADBE]" />
      </div>
      <div className="flex overflow-x-auto gap-3 px-4 pb-4 hide-scrollbar snap-x">
        {data.map((manga) => (
          <div key={manga.id} className="min-w-[140px] w-[140px] md:min-w-[160px] md:w-[160px] snap-start">
            <MangaCard manga={manga} badge={badge} isUpdate={isUpdate} onBookmark={onBookmark} onClick={onMangaClick} />
          </div>
        ))}
      </div>
    </section>
  );
});
