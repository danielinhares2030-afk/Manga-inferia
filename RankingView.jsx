import React, { useState, useMemo } from 'react';
import { Trophy, Crown, Flame } from 'lucide-react';

const RankingView = ({ rankingData, perfilLogado }) => {
  const [filtroRank, setFiltroRank] = useState('xp'); 

  const dadosOrdenados = useMemo(() => {
    return [...rankingData].sort((a, b) => {
      if (filtroRank === 'xp') return (b.xp || 0) - (a.xp || 0);
      if (filtroRank === 'caps') return (b.capitulosLidos || 0) - (a.capitulosLidos || 0);
      if (filtroRank === 'obras') return (b.obrasLidas || 0) - (a.obrasLidas || 0);
      if (filtroRank === 'horas') return (b.tempoLendo || 0) - (a.tempoLendo || 0);
      return 0;
    });
  }, [rankingData, filtroRank]);

  const top3 = dadosOrdenados.slice(0, 3);
  const others = dadosOrdenados.slice(3);

  return (
    <div className="animate-in fade-in duration-500 pt-24 px-4 pb-24 min-h-screen max-w-4xl mx-auto font-nunito">
      <div className="mb-8 text-center relative">
        <Flame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-[#CC0000]/10 blur-2xl pointer-events-none" />
        <h2 className="font-anime text-3xl md:text-5xl text-white tracking-widest flex items-center justify-center gap-4 drop-shadow-[0_0_20px_#CC0000] mb-2 relative z-10">
          <Trophy className="text-[#FF3333]" size={36} /> RANKING DE INFERIA
        </h2>
        <p className="text-[#FF3333] text-xs md:text-sm font-bold uppercase tracking-widest relative z-10 drop-shadow-md">Os Lordes Soberanos do Abismo</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10 bg-[#0A0505] p-1.5 rounded-2xl border border-[#2A0A0A] max-w-md mx-auto shadow-inner relative z-10">
        <button onClick={() => setFiltroRank('xp')} className={`flex-1 min-w-[70px] py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${filtroRank === 'xp' ? 'bg-[#CC0000] text-white shadow-[0_0_10px_#CC0000]' : 'text-[#A7ADBE] hover:text-white'}`}>Maior XP</button>
        <button onClick={() => setFiltroRank('caps')} className={`flex-1 min-w-[70px] py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${filtroRank === 'caps' ? 'bg-[#CC0000] text-white shadow-[0_0_10px_#CC0000]' : 'text-[#A7ADBE] hover:text-white'}`}>Caps</button>
        <button onClick={() => setFiltroRank('obras')} className={`flex-1 min-w-[70px] py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${filtroRank === 'obras' ? 'bg-[#CC0000] text-white shadow-[0_0_10px_#CC0000]' : 'text-[#A7ADBE] hover:text-white'}`}>Obras</button>
        <button onClick={() => setFiltroRank('horas')} className={`flex-1 min-w-[70px] py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all ${filtroRank === 'horas' ? 'bg-[#CC0000] text-white shadow-[0_0_10px_#CC0000]' : 'text-[#A7ADBE] hover:text-white'}`}>Horas</button>
      </div>

      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 md:gap-8 mb-16 mt-12 h-64 md:h-72">
          
          {/* Top 2 */}
          {top3[1] && (
            <div className="flex flex-col items-center w-[30%] max-w-[130px] relative animate-in slide-in-from-bottom-10 delay-100 z-10 mb-6">
              <div className="absolute inset-0 bg-gradient-to-t from-[#C0C0C0]/20 to-transparent rounded-t-full blur-md"></div>
              <Crown className="text-[#C0C0C0] drop-shadow-[0_0_15px_#C0C0C0] absolute -top-8" size={32} />
              <img src={top3[1].avatar || 'https://via.placeholder.com/150'} alt={top3[1].nome} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-[3px] border-[#C0C0C0] shadow-[0_0_25px_rgba(192,192,192,0.4)] relative z-10 bg-black" />
              <div className="bg-[#0A0505] border border-[#C0C0C0]/50 rounded-xl px-2 py-3 w-full mt-[-20px] pt-6 flex flex-col items-center relative z-0 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                <span className="font-teko text-[#C0C0C0] text-3xl leading-none">2º</span>
                <span className="text-white font-bold text-xs md:text-sm text-center truncate w-full mt-1">{top3[1].nome}</span>
                <div className="flex gap-2 justify-center mt-2 w-full">
                  <div className="flex flex-col items-center"><span className="text-white font-teko text-lg leading-none">{top3[1].xp || 0}</span><span className="text-[7px] font-bold text-[#C0C0C0] uppercase">XP</span></div>
                  <div className="flex flex-col items-center"><span className="text-white font-teko text-lg leading-none">{Math.floor((top3[1].tempoLendo || 0) / 60)}h</span><span className="text-[7px] font-bold text-[#C0C0C0] uppercase">Tempo</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Top 1 */}
          {top3[0] && (
            <div className="flex flex-col items-center w-[35%] max-w-[160px] relative animate-in slide-in-from-bottom-10 z-20">
              <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/30 to-transparent rounded-t-full blur-lg animate-pulse"></div>
              <Crown className="text-[#FFD700] drop-shadow-[0_0_20px_#FFD700] absolute -top-10" size={50} />
              <img src={top3[0].avatar || 'https://via.placeholder.com/150'} alt={top3[0].nome} className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-[4px] border-[#FFD700] shadow-[0_0_40px_rgba(255,215,0,0.6)] relative z-10 bg-black" />
              <div className="bg-gradient-to-b from-[#1A0505] to-[#0A0505] border border-[#FFD700] rounded-xl px-2 py-4 w-full mt-[-24px] pt-8 flex flex-col items-center relative z-0 shadow-[0_10px_30px_rgba(204,0,0,0.6)]">
                <span className="font-teko text-[#FFD700] text-5xl leading-none drop-shadow-[0_0_10px_#FFD700]">1º</span>
                <span className="text-white font-black text-sm md:text-base text-center truncate w-full mt-1 drop-shadow-md">{top3[0].nome}</span>
                <div className="flex gap-3 justify-center mt-2 w-full bg-[#FFD700]/10 py-1 rounded border border-[#FFD700]/30">
                  <div className="flex flex-col items-center"><span className="text-[#FFD700] font-teko text-xl leading-none">{top3[0].xp || 0}</span><span className="text-[8px] font-black text-[#FFD700] uppercase">XP</span></div>
                  <div className="flex flex-col items-center"><span className="text-[#FFD700] font-teko text-xl leading-none">{top3[0].capitulosLidos || 0}</span><span className="text-[8px] font-black text-[#FFD700] uppercase">Caps</span></div>
                  <div className="flex flex-col items-center"><span className="text-[#FFD700] font-teko text-xl leading-none">{Math.floor((top3[0].tempoLendo || 0) / 60)}h</span><span className="text-[8px] font-black text-[#FFD700] uppercase">Tempo</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Top 3 */}
          {top3[2] && (
            <div className="flex flex-col items-center w-[30%] max-w-[130px] relative animate-in slide-in-from-bottom-10 delay-200 z-10 mb-10">
              <div className="absolute inset-0 bg-gradient-to-t from-[#CD7F32]/20 to-transparent rounded-t-full blur-md"></div>
              <Crown className="text-[#CD7F32] drop-shadow-[0_0_15px_#CD7F32] absolute -top-8" size={32} />
              <img src={top3[2].avatar || 'https://via.placeholder.com/150'} alt={top3[2].nome} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-[3px] border-[#CD7F32] shadow-[0_0_25px_rgba(205,127,50,0.4)] relative z-10 bg-black" />
              <div className="bg-[#0A0505] border border-[#CD7F32]/50 rounded-xl px-2 py-3 w-full mt-[-20px] pt-6 flex flex-col items-center relative z-0 shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                <span className="font-teko text-[#CD7F32] text-3xl leading-none">3º</span>
                <span className="text-white font-bold text-xs md:text-sm text-center truncate w-full mt-1">{top3[2].nome}</span>
                <div className="flex gap-2 justify-center mt-2 w-full">
                  <div className="flex flex-col items-center"><span className="text-white font-teko text-lg leading-none">{top3[2].xp || 0}</span><span className="text-[7px] font-bold text-[#CD7F32] uppercase">XP</span></div>
                  <div className="flex flex-col items-center"><span className="text-white font-teko text-lg leading-none">{Math.floor((top3[2].tempoLendo || 0) / 60)}h</span><span className="text-[7px] font-bold text-[#CD7F32] uppercase">Tempo</span></div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      <div className="space-y-3 bg-[#0A0505] p-3 md:p-5 rounded-3xl border border-[#CC0000]/20 shadow-[0_0_30px_rgba(204,0,0,0.1)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0A0505] via-[#CC0000] to-[#0A0505] opacity-50"></div>
        
        {others.map((user, index) => {
          const isMe = user.id === perfilLogado.id;
          const pos = index + 4;
          
          return (
            <div key={user.id} className={`relative flex items-center gap-3 p-4 rounded-2xl transition-all overflow-hidden group ${isMe ? 'bg-gradient-to-r from-[#CC0000]/20 to-[#1A0505] border border-[#CC0000] shadow-[0_0_20px_rgba(204,0,0,0.3)]' : 'bg-[#140505] border border-[#2A0A0A] hover:border-[#CC0000]/50 hover:bg-[#1A0505]'}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isMe ? 'bg-[#FF3333]' : 'bg-[#2A0A0A] group-hover:bg-[#CC0000]'}`}></div>
              
              <div className="w-8 flex justify-center ml-1 shrink-0">
                <span className={`font-teko text-2xl font-bold ${isMe ? 'text-[#FF3333]' : 'text-[#A7ADBE] group-hover:text-white'}`}>{pos}º</span>
              </div>
              
              <img src={user.avatar || 'https://via.placeholder.com/150'} alt={user.nome} className="w-12 h-12 rounded-full object-cover border-2 border-[#2A0A0A] shrink-0" />
              
              <div className="flex-1 overflow-hidden">
                <h4 className={`font-bold text-sm truncate ${isMe ? 'text-[#FF3333]' : 'text-[#F5F7FF]'}`}>{user.nome || 'Leitor'} {isMe && '(Você)'}</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7ADBE]">Nível {user.nivel || 1}</span>
              </div>
              
              <div className="flex gap-4 pr-2 shrink-0">
                <div className="flex flex-col items-center justify-center">
                  <span className={`font-teko text-xl leading-none ${isMe ? 'text-white' : 'text-[#F5F7FF]'}`}>{user.xp || 0}</span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#CC0000]">XP</span>
                </div>
                <div className="flex flex-col items-center justify-center hidden sm:flex">
                  <span className={`font-teko text-xl leading-none ${isMe ? 'text-white' : 'text-[#A7ADBE]'}`}>{user.capitulosLidos || 0}</span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#CC0000]">Caps</span>
                </div>
                <div className="flex flex-col items-center justify-center hidden sm:flex">
                  <span className={`font-teko text-xl leading-none ${isMe ? 'text-white' : 'text-[#A7ADBE]'}`}>{Math.floor((user.tempoLendo || 0) / 60)}h</span>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#CC0000]">Tempo</span>
                </div>
              </div>
            </div>
          );
        })}
        {others.length === 0 && rankingData.length <= 3 && (
          <p className="text-center text-[#A7ADBE] text-sm py-8 font-bold uppercase tracking-widest">Apenas estes Monarcas dominam Inferia.</p>
        )}
      </div>
    </div>
  );
};

export default RankingView;
