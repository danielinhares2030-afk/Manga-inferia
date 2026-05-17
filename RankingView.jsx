import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';

const RankingView = ({ rankingData, perfilLogado }) => {
  return (
    <div className="animate-in fade-in duration-500 pt-8 px-4 pb-24 min-h-screen max-w-3xl mx-auto">
      <div className="mb-8 text-center mt-12">
        <h2 className="font-anime text-4xl text-white tracking-widest flex items-center justify-center gap-3 drop-shadow-md mb-2">
          <Trophy className="text-[#FFD700]" size={32} /> RANKING
        </h2>
        <p className="text-[#A7ADBE] text-sm font-bold">Os leitores mais dedicados do Abismo.</p>
      </div>

      <div className="space-y-3">
        {rankingData.map((user, index) => {
          const isMe = user.id === perfilLogado.id;
          let IconePosicao = null;
          let corBorda = 'border-[#2A0A0A]';
          let corFundo = 'bg-[#0A0505]';

          if (index === 0) { IconePosicao = Crown; corBorda = 'border-[#FFD700]'; corFundo = 'bg-[#FFD700]/10'; }
          else if (index === 1) { IconePosicao = Medal; corBorda = 'border-[#C0C0C0]'; corFundo = 'bg-[#C0C0C0]/10'; }
          else if (index === 2) { IconePosicao = Medal; corBorda = 'border-[#CD7F32]'; corFundo = 'bg-[#CD7F32]/10'; }

          return (
            <div key={user.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${isMe ? 'border-[#CC0000] bg-[#CC0000]/10 shadow-[0_0_15px_rgba(204,0,0,0.3)]' : `${corBorda} ${corFundo}`} transition-all`}>
              <div className="w-8 flex justify-center">
                {IconePosicao ? <IconePosicao size={24} className={index === 0 ? 'text-[#FFD700]' : index === 1 ? 'text-[#C0C0C0]' : 'text-[#CD7F32]'} /> : <span className="font-teko text-2xl text-[#A7ADBE] font-bold">{index + 1}º</span>}
              </div>
              
              <img src={user.avatar || 'https://via.placeholder.com/150'} alt={user.nome} className="w-12 h-12 rounded-full object-cover border-2 border-[#1A0505]" />
              
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
      </div>
    </div>
  );
};

export default RankingView;
