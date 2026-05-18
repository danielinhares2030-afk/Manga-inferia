import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';

const RankingView = ({ rankingData, perfilLogado }) => {
  const top3 = rankingData.slice(0, 3);
  const others = rankingData.slice(3);

  return (
    <div className="animate-in fade-in duration-500 pt-24 px-4 pb-24 min-h-screen max-w-4xl mx-auto font-nunito">
      <div className="mb-12 text-center">
        <h2 className="font-anime text-4xl md:text-5xl text-white tracking-widest flex items-center justify-center gap-4 drop-shadow-[0_0_15px_#CC0000] mb-3">
          <Trophy className="text-[#FF3333]" size={40} /> RANKING DO ABISMO
        </h2>
        <p className="text-[#A7ADBE] text-sm font-bold uppercase tracking-wider">Os monarcas supremos da leitura.</p>
      </div>

      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-2 md:gap-6 mb-16 mt-8 h-64">
          
          {top3[1] && (
            <div className="flex flex-col items-center w-[30%] max-w-[120px] animate-in slide-in-from-bottom-10 delay-100">
              <div className="relative mb-3">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[#C0C0C0] drop-shadow-[0_0_8px_#C0C0C0]"><Medal size={28} /></div>
                <img src={top3[1].avatar || 'https://via.placeholder.com/150'} alt={top3[1].nome} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-[#C0C0C0] shadow-[0_0_20px_rgba(192,192,192,0.4)] z-10 relative" />
              </div>
              <span className="text-white font-bold text-xs md:text-sm text-center truncate w-full">{top3[1].nome}</span>
              <span className="text-[#C0C0C0] font-teko text-xl md:text-2xl mt-1 leading-none">{top3[1].xp} XP</span>
              <div className="w-full bg-gradient-to-t from-[#C0C0C0]/20 to-[#C0C0C0]/5 border-t-2 border-[#C0C0C0] h-24 md:h-32 mt-3 rounded-t-xl flex items-center justify-center">
                <span className="font-teko text-5xl text-[#C0C0C0]/30 font-black">2</span>
              </div>
            </div>
          )}

          {top3[0] && (
            <div className="flex flex-col items-center w-[35%] max-w-[140px] animate-in slide-in-from-bottom-10 z-10">
              <div className="relative mb-4">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[#FFD700] drop-shadow-[0_0_15px_#FFD700] z-20"><Crown size={40} /></div>
                <img src={top3[0].avatar || 'https://via.placeholder.com/150'} alt={top3[0].nome} className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.6)] z-10 relative" />
              </div>
              <span className="text-white font-black text-sm md:text-base text-center truncate w-full drop-shadow-md">{top3[0].nome}</span>
              <span className="text-[#FFD700] font-teko text-2xl md:text-3xl mt-1 leading-none drop-shadow-[0_0_5px_#FFD700]">{top3[0].xp} XP</span>
              <div className="w-full bg-gradient-to-t from-[#FFD700]/30 to-[#FFD700]/10 border-t-4 border-[#FFD700] h-32 md:h-44 mt-3 rounded-t-xl flex items-center justify-center shadow-[0_-5px_20px_rgba(255,215,0,0.2)]">
                <span className="font-teko text-7xl text-[#FFD700]/40 font-black">1</span>
              </div>
            </div>
          )}

          {top3[2] && (
            <div className="flex flex-col items-center w-[30%] max-w-[120px] animate-in slide-in-from-bottom-10 delay-200">
              <div className="relative mb-3">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[#CD7F32] drop-shadow-[0_0_8px_#CD7F32]"><Medal size={28} /></div>
                <img src={top3[2].avatar || 'https://via.placeholder.com/150'} alt={top3[2].nome} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-[#CD7F32] shadow-[0_0_20px_rgba(205,127,50,0.4)] z-10 relative" />
              </div>
              <span className="text-white font-bold text-xs md:text-sm text-center truncate w-full">{top3[2].nome}</span>
              <span className="text-[#CD7F32] font-teko text-xl md:text-2xl mt-1 leading-none">{top3[2].xp} XP</span>
              <div className="w-full bg-gradient-to-t from-[#CD7F32]/20 to-[#CD7F32]/5 border-t-2 border-[#CD7F32] h-20 md:h-24 mt-3 rounded-t-xl flex items-center justify-center">
                <span className="font-teko text-5xl text-[#CD7F32]/30 font-black">3</span>
              </div>
            </div>
          )}

        </div>
      )}

      <div className="space-y-3 bg-[#0A0505] p-4 rounded-3xl border border-[#2A0A0A] shadow-xl">
        {others.map((user, index) => {
          const isMe = user.id === perfilLogado.id;
          const pos = index + 4;
          
          return (
            <div key={user.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all hover:bg-[#1A0505] ${isMe ? 'border-[#CC0000] bg-[#CC0000]/10 shadow-[0_0_15px_rgba(204,0,0,0.3)]' : 'border-[#1A0505] bg-[#140505]'}`}>
              <div className="w-8 flex justify-center">
                <span className="font-teko text-2xl text-[#A7ADBE] font-bold">{pos}º</span>
              </div>
              
              <img src={user.avatar || 'https://via.placeholder.com/150'} alt={user.nome} className="w-12 h-12 rounded-full object-cover border-2 border-[#2A0A0A]" />
              
              <div className="flex-1">
                <h4 className={`font-bold text-sm ${isMe ? 'text-[#FF3333]' : 'text-[#F5F7FF]'}`}>{user.nome || 'Leitor'} {isMe && '(Você)'}</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A7ADBE]">Nível {user.nivel || 1}</span>
              </div>
              
              <div className="text-right">
                <span className="block font-teko text-2xl text-white leading-none">{user.xp || 0}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#CC0000]">XP</span>
              </div>
            </div>
          );
        })}
        {others.length === 0 && rankingData.length <= 3 && (
          <p className="text-center text-[#A7ADBE] text-sm py-8 font-bold">Nenhum outro monarca no abismo.</p>
        )}
      </div>
    </div>
  );
};

export default RankingView;
