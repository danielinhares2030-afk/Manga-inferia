import React from 'react';
import { Play, Star, Bookmark, Settings, ChevronRight } from 'lucide-react';

export const MangaCard = React.memo(({ manga, variant = 'default', badge, isUpdate, onBookmark, onSettings }) => {
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

export const Shelf = React.memo(({ title, data, color, badge, isUpdate, onBookmark }) => {
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
          <div key={manga.id} className="min-w-[120px] snap-start">
            <MangaCard manga={manga} badge={badge} isUpdate={isUpdate} onBookmark={onBookmark} />
          </div>
        ))}
      </div>
    </section>
  );
});
