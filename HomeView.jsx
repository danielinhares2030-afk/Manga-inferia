import React, { useState, useEffect } from 'react';
import { Play, Bookmark, Clock } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Shelf } from './UIComponents';

const formatTimeAgo = (dateString) => {
  if (!dateString) return "NOVO";
  const diffTime = Date.now() - new Date(dateString).getTime();
  const diffHours = diffTime / (1000 * 60 * 60);
  if (diffHours < 24) return "NOVO";
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 DIA ATRÁS";
  return `${diffDays} DIAS ATRÁS`;
};

const UpdateCard = ({ obra, onMangaClick }) => {
  const [recentCaps, setRecentCaps] = useState([]);
  
  useEffect(() => {
    const fetchCaps = async () => {
      try {
        const q = query(collection(db, 'capitulos'), where('obraId', '==', obra.id));
        const snap = await getDocs(q);
        let lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        lista.sort((a, b) => Number(b.numero) - Number(a.numero));
        setRecentCaps(lista.slice(0, 3)); 
      } catch (err) {
        console.error(err);
      }
    };
    fetchCaps();
  }, [obra.id]);

  return (
    <div onClick={() => onMangaClick(obra.id)} className="flex bg-[#0A0505] border border-[#2A0A0A] rounded-2xl hover:border-[#7A3CFF]/50 transition-colors cursor-pointer group overflow-hidden shadow-lg relative">
      <div className="w-1.5 bg-gradient-to-b from-[#7A3CFF] to-transparent"></div>
      
      <div className="flex w-full p-3 gap-3">
        <img src={obra.capaUrl} alt={obra.nome} className="w-24 h-[120px] shrink-0 object-cover rounded-xl border border-[#1A0505] shadow-md" />
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[9px] text-[#7A3CFF] font-black uppercase tracking-widest bg-[#7A3CFF]/10 px-2 py-0.5 rounded border border-[#7A3CFF]/20">{obra.tipo}</span>
            <h4 className="font-nunito text-sm font-bold text-[#F5F7FF] group-hover:text-white line-clamp-2 leading-tight mt-1.5">{obra.nome}</h4>
          </div>
          
          <div className="bg-[#140505] rounded-xl border border-[#1A0505] mt-2 overflow-hidden flex flex-col divide-y divide-[#1A0505]">
            {recentCaps.length > 0 ? recentCaps.map((cap) => {
              const timeLabel = formatTimeAgo(cap.dataAdicionado || obra.updatedAt);
              return (
                <div key={cap.id} className="flex justify-between items-center px-3 py-1.5 hover:bg-[#1A0505] transition-colors">
                  <span className="text-xs font-bold text-[#A7ADBE] group-hover:text-[#F5F7FF] transition-colors">Cap. {cap.numero}</span>
                  <span className={`text-[8px] font-black uppercase ${timeLabel === 'NOVO' ? 'text-[#00FF88]' : 'text-[#777]'}`}>{timeLabel}</span>
                </div>
              )
            }) : (
              <div className="px-3 py-2 text-center"><span className="text-[10px] font-bold text-[#777]">Sem Capítulos</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HomeView = React.memo(({ carouselData, obrasDestaque, obrasRecentes, obrasAtualizadas, currentSlide, setSaveModal, onMangaClick }) => {
  const [filtro, setFiltro] = useState('Todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 6;

  const atualizacoesFiltradas = obrasAtualizadas.filter(obra => {
    if (filtro === 'Todos') return true;
    return obra.tipo?.toLowerCase() === filtro.toLowerCase();
  });

  const totalPaginas = Math.ceil(atualizacoesFiltradas.length / itensPorPagina);
  const atualizacoesDaPagina = atualizacoesFiltradas.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);

  return (
    <div className="animate-in fade-in duration-500 pb-10 overflow-hidden">
      {carouselData.length > 0 && (
        <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-[#030305]">
          {carouselData.map((item, index) => (
            <div key={item.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img src={item.capaUrl || item.img} alt={item.nome} className="w-full h-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} />
              
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050508]/90 to-transparent z-10 pointer-events-none"></div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent z-10 pointer-events-none"></div>
              
              <div className="absolute bottom-8 md:bottom-12 left-4 right-4 md:left-12 z-20 font-nunito animate-in slide-in-from-bottom-10 duration-700">
                <span className="inline-block px-3 py-1 bg-[#CC0000] rounded-md text-[10px] font-black tracking-widest text-white mb-3 uppercase shadow-[0_0_10px_#CC0000]">
                  {item.tipo || 'DESTAQUE'}
                </span>
                
                <h2 className="font-teko text-4xl md:text-5xl lg:text-6xl font-bold mb-2 uppercase leading-none drop-shadow-lg text-white line-clamp-2 max-w-2xl">{item.nome}</h2>
                
                <p className="text-[#A7ADBE] text-xs md:text-sm max-w-md mb-5 line-clamp-2 font-semibold drop-shadow-md">{item.descricao}</p>
                
                <div className="flex items-center gap-3">
                  <button onClick={() => onMangaClick(item.id)} className="w-[160px] bg-gradient-to-r from-[#CC0000] to-[#7A0000] text-white py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,0,0,0.5)] transition-all font-teko tracking-wider hover:scale-[1.02]">
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
        
        <section className="mt-8 px-4 max-w-7xl mx-auto overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 bg-[#7A3CFF] rounded-full shadow-[0_0_8px_#7A3CFF]"></div>
            <h3 className="font-teko text-2xl tracking-wide uppercase mt-1">Últimas Atualizações</h3>
          </div>

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

          <div key={paginaAtual} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-right-16 fade-in duration-500 ease-out fill-mode-forwards">
            {atualizacoesDaPagina.map(obra => (
              <UpdateCard key={obra.id} obra={obra} onMangaClick={onMangaClick} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 pb-4">
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
