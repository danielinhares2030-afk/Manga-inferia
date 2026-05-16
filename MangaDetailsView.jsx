import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Play, Bookmark, List, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';

const MangaDetailsView = ({ obra, onBack, onReadChapter, setSaveModal }) => {
  const [capitulos, setCapitulos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarCapitulosFirestore = async () => {
      try {
        // Query real e direta no Firestore filtrando por obraId
        const q = query(
          collection(db, 'capitulos'),
          where('obraId', '==', obra.id)
        );
        
        const querySnapshot = await getDocs(q);
        const capsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Ordenação manual por número (caso o índice composto do Firebase ainda não tenha sido gerado pelo console)
        capsData.sort((a, b) => Number(b.numero) - Number(a.numero));

        setCapitulos(capsData);
      } catch (err) {
        console.error("Erro ao buscar capítulos no Firestore:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (obra) {
      carregarCapitulosFirestore();
      window.scrollTo(0, 0);
    }
  }, [obra]);

  if (!obra) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-500 bg-[#050508] min-h-screen pb-24 font-nunito">
      <button onClick={onBack} className="fixed top-6 left-4 z-50 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg">
        <ArrowLeft size={20} />
      </button>

      <div className="relative w-full h-72 md:h-96">
        <img src={obra.capaUrl} alt={obra.nome} className="w-full h-full object-cover opacity-40 blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/80 to-transparent"></div>
      </div>

      <div className="px-5 relative -mt-32 z-10">
        <div className="flex gap-4 items-end">
          <img src={obra.capaUrl} alt={obra.nome} className="w-32 h-44 md:w-48 md:h-64 object-cover rounded-xl border-2 border-[#2A0A0A] shadow-[0_0_30px_rgba(204,0,0,0.2)]" />
          <div className="flex-1 pb-2">
            <span className="bg-[#CC0000] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{obra.tipo}</span>
            <h1 className="font-teko text-3xl md:text-5xl font-bold mt-2 leading-none text-[#F5F7FF] drop-shadow-md">{obra.nome}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Star size={14} className="text-yellow-500" fill="currentColor" />
              <span className="text-sm font-bold text-yellow-500">{obra.rating || '0.0'}</span>
              <span className="text-[#A7ADBE] text-xs">• {obra.status}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={() => capitulos.length > 0 && onReadChapter(capitulos[capitulos.length - 1])} 
            disabled={capitulos.length === 0} 
            className="flex-1 bg-gradient-to-r from-[#CC0000] to-[#7A0000] text-white py-3.5 rounded-xl font-bold font-teko text-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,0,0,0.4)] disabled:opacity-50 tracking-wider"
          >
            <Play size={20} fill="currentColor" className="ml-0.5" /> 
            {capitulos.length > 0 ? 'COMEÇAR A LER' : 'SEM CAPÍTULOS'}
          </button>
          <button onClick={() => setSaveModal({ isOpen: true, obraId: obra.id })} className="w-14 h-14 bg-[#140505] border border-[#2A0A0A] rounded-xl flex items-center justify-center text-[#A7ADBE] hover:text-[#CC0000] hover:border-[#CC0000]/50 transition-colors">
            <Bookmark size={22} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {obra.generos && obra.generos.map(gen => (
            <span key={gen} className="bg-[#140505] border border-[#2A0A0A] text-[#A7ADBE] px-3 py-1 rounded-full text-[11px] font-bold">{gen}</span>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-anime text-lg text-white mb-2 tracking-widest border-l-4 border-[#CC0000] pl-2">SINOPSE</h3>
          <p className="text-[#A7ADBE] text-sm leading-relaxed font-semibold">{obra.descricao}</p>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-anime text-lg text-white tracking-widest border-l-4 border-[#CC0000] pl-2 flex items-center gap-2"><List size={18} className="text-[#CC0000]" /> CAPÍTULOS</h3>
            <span className="text-xs font-bold text-[#A7ADBE]">{capitulos.length} disp.</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#CC0000]" /></div>
          ) : capitulos.length === 0 ? (
            <div className="text-center py-8 bg-[#140505] border border-[#2A0A0A] rounded-xl text-[#A7ADBE] text-sm font-bold">Nenhum capítulo lançado ainda.</div>
          ) : (
            <div className="space-y-2">
              {capitulos.map((cap) => (
                <div key={cap.id} onClick={() => onReadChapter(cap)} className="bg-[#140505] border border-[#2A0A0A] p-4 rounded-xl flex items-center justify-between hover:border-[#CC0000]/50 cursor-pointer transition-colors group">
                  <div className="flex flex-col">
                    <span className="text-[#F5F7FF] font-bold text-sm group-hover:text-[#CC0000] transition-colors">Capítulo {cap.numero}</span>
                    {cap.titulo && <span className="text-[#A7ADBE] text-[10px] uppercase font-bold mt-0.5">{cap.titulo}</span>}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#0A0505] border border-[#2A0A0A] flex items-center justify-center text-[#A7ADBE] group-hover:bg-[#CC0000] group-hover:text-white transition-colors">
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MangaDetailsView;
