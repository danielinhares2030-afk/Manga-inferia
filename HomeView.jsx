import React from 'react';
import { Play, Bookmark } from 'lucide-react';
import { Shelf } from './UIComponents';

const HomeView = React.memo(({ carouselData, obrasDestaque, obrasRecentes, obrasAtualizadas, currentSlide, setSaveModal }) => {
  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {carouselData.length > 0 && (
        <section className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden bg-[#030305]">
          {carouselData.map((item, index) => (
            <div key={item.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img src={item.capaUrl || item.img} alt={item.nome || item.title} className="w-full h-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/70 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#050508] via-[#050508]/50 to-transparent"></div>
              
              <div className="absolute bottom-6 left-4 right-4 md:left-12 z-20 font-nunito animate-in slide-in-from-bottom-10 duration-700">
                <span className="inline-block px-3 py-1 bg-[#13141C]/80 backdrop-blur-md border border-[#CC0000]/40 rounded-full text-[10px] font-bold tracking-wider text-[#FF3333] mb-3 uppercase shadow-[0_0_10px_rgba(204,0,0,0.3)]">
                  {item.tag || item.tipo || 'DESTAQUE'}
                </span>
                <h2 className="font-teko text-5xl md:text-7xl font-bold mb-1 uppercase leading-none drop-shadow-lg">{item.nome || item.title}</h2>
                <p className="text-[#A7ADBE] text-sm md:text-base max-w-sm mb-5 line-clamp-2 font-semibold drop-shadow-md">{item.descricao || item.desc}</p>
                <div className="flex items-center gap-3">
                  <button className="flex-1 max-w-[160px] bg-gradient-to-r from-[#CC0000] to-[#7A0000] text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,0,0,0.5)] hover:scale-105 transition-all font-teko tracking-wider border border-[#FF3333]/30">
                    <Play size={18} fill="currentColor" /> LER AGORA
                  </button>
                  <button onClick={() => setSaveModal({ isOpen: true, obraId: item.id })} className="w-12 h-12 bg-[#13141C]/80 backdrop-blur-md border border-[#232533] rounded-xl flex items-center justify-center text-white hover:bg-[#1A1C27] hover:border-[#CC0000]/50 hover:text-[#CC0000] transition-all shadow-lg hover:scale-105">
                    <Bookmark size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5 z-20">
            {carouselData.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-[#CC0000] shadow-[0_0_8px_#CC0000]' : 'w-2 bg-[#232533]'}`}></div>
            ))}
          </div>
        </section>
      )}

      <div className={carouselData.length === 0 ? "pt-24" : ""}>
        <Shelf title="Em Destaque" data={obrasDestaque} color="#CC0000" onBookmark={(id) => setSaveModal({ isOpen: true, obraId: id })} />
        <Shelf title="Adicionados Recentemente" data={obrasRecentes} color="#FF3333" badge="Novo" onBookmark={(id) => setSaveModal({ isOpen: true, obraId: id })} />
        <Shelf title="Últimas Atualizações" data={obrasAtualizadas} color="#7A3CFF" isUpdate={true} onBookmark={(id) => setSaveModal({ isOpen: true, obraId: id })} />
      </div>
    </div>
  );
});

export default HomeView;
