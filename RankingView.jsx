import React from 'react';
import { Trophy, Medal, Star, BookOpen, Clock } from 'lucide-react';

const RankingView = React.memo(({ rankingData = [], perfilLogado, setActiveTab }) => {
  
  // Verifica se o banco de dados já retornou os usuários
  if (rankingData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[#A7ADBE]">
        <Trophy size={48} className="mb-4 text-[#CC0000] opacity-50" />
        <p className="font-nunito font-bold text-lg">Carregando o Abismo...</p>
      </div>
    );
  }

  // Identifica a posição real do usuário atual
  const myRankIndex = rankingData.findIndex(u => u.id === perfilLogado.id);
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : 'N/A';

  const pódio = rankingData.slice(0, 3);
  const outros = rankingData.slice(3);

  const getPosicaoEspecial = (index) => {
    switch (index) {
      case 0: return { icone: Trophy, color: '#FFD700', blur: 'glow-gold', size: 40 }; 
      case 1: return { icone: Medal, color: '#C0C0C0', blur: 'glow-silver', size: 36 }; 
      case 2: return { icone: Medal, color: '#CD7F32', blur: 'glow-bronze', size: 32 }; 
      default: return null;
    }
  };

  const EstatisticaPódio = ({ icone: Icone, valor, label, color }) => (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1.5" style={{ color }}>
        <Icone size={16} />
        <span className="font-teko text-xl font-bold">{valor || 0}</span>
      </div>
      <span className="text-[10px] text-[#A7ADBE] uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );

  return (
    <div className="px-5 pt-20 animate-in fade-in duration-500 font-nunito pb-12 min-h-screen">
      <h2 className="font-anime text-3xl md:text-4xl font-bold mb-8 uppercase tracking-wider border-l-4 border-[#CC0000] pl-4 leading-none flex items-center drop-shadow-lg">Mestres do Abismo</h2>
      
      {/* Pódio Dinâmico */}
      <div className="grid grid-cols-3 gap-6 mb-12 items-end">
        {[1, 0, 2].map((posIndex) => {
          const user = pódio[posIndex];
          if (!user) return <div key={posIndex}></div>; // Caso haja menos de 3 usuários no banco

          const especial = getPosicaoEspecial(posIndex);
          const pos = posIndex + 1;
          const isPrimeiro = posIndex === 0;

          return (
            <div key={user.id} className={`flex flex-col items-center transition-all duration-700 ease-in-out ${isPrimeiro ? 'scale-110' : 'scale-100 mt-6'} ${especial.blur}`}>
              <div className="relative mb-3">
                <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'} alt={user.nome} className="w-20 h-20 rounded-full border-4 object-cover shadow-xl bg-[#140505]" style={{ borderColor: especial.color }} />
                <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full border-2 bg-[#0A0505] flex items-center justify-center font-teko text-2xl font-bold ${especial.color}`} style={{ borderColor: especial.color }}>
                  #{pos}
                </div>
              </div>
              <h3 className={`font-anime text-lg text-center mb-1 drop-shadow-md transition-colors duration-500 ${isPrimeiro ? especial.color : 'text-white'}`}>{user.nome || 'Anônimo'}</h3>
              <span className={`bg-[#1A0505] border border-opacity-30 px-3 py-1 rounded text-[11px] font-bold tracking-wider uppercase mb-3 ${especial.color}`} style={{ borderColor: especial.color }}>Nível {user.nivel || 1}</span>
              <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 pt-1.5">
                <EstatisticaPódio icone={Star} valor={user.xp || 0} label="XP" color={especial.color} />
                <EstatisticaPódio icone={BookOpen} valor={user.capitulosLidos || 0} label="Caps" color={especial.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Estatísticas Pessoais */}
      <div className="bg-[#140505] border border-[#2A0A0A] rounded-2xl p-6 mb-10 flex items-center gap-6 shadow-inner transition-colors duration-500 ease-in-out hover:border-[#CC0000]/50 will-change-background-color">
          <div className="relative">
              <img src={perfilLogado.avatar} alt="Seu Perfil" className="w-16 h-16 rounded-full border-2 border-[#CC0000] object-cover bg-[#0A0505]" />
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#CC0000] border-2 border-white flex items-center justify-center font-teko text-lg font-bold text-white shadow-xl">
                  #{myRank}
              </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[#CC0000]">
                      <Star size={18} />
                      <span className="font-anime text-xl text-white">O Teu Rank</span>
                  </div>
                  <p className="text-xs text-[#A7ADBE] font-semibold">Tens <strong className="text-white">{perfilLogado.xp || 0} XP</strong> no total.</p>
              </div>
              <button onClick={() => setActiveTab('profile')} className="w-full flex items-center justify-center gap-2 bg-[#0A0505] border border-[#2A0A0A] text-[#A7ADBE] py-3.5 rounded-xl font-bold hover:bg-[#1A0505] hover:text-white transition-all text-sm font-nunito shadow-lg">
                  <Medal size={16} /> Meu Perfil
              </button>
          </div>
      </div>

      {/* Lista Dinâmica */}
      <div className="space-y-4">
        {outros.map((user, index) => {
          const pos = index + 4; 
          const isCurrentUser = user.id === perfilLogado.id;

          return (
            <div key={user.id} className={`relative p-5 rounded-2xl flex items-center gap-5 border shadow-lg transition-all duration-700 ease-in-out will-change-background-color ${isCurrentUser ? 'bg-[#CC0000]/10 border-[#CC0000] scale-[1.01]' : 'bg-[#140505] border-[#2A0A0A] hover:border-[#2A2A35]'}`}>
              <div className={`font-teko text-4xl font-bold w-12 text-center transition-colors duration-500 ${isCurrentUser ? 'text-[#CC0000]' : 'text-[#A7ADBE]'}`}>#{pos}</div>
              <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'} alt={user.nome} className={`w-14 h-14 rounded-full border-2 object-cover bg-[#0A0505] transition-colors duration-500 ${isCurrentUser ? 'border-[#CC0000]' : 'border-[#2A0A0A]'}`} />
              <div className="flex-1 flex flex-col gap-0.5">
                <h4 className={`font-anime text-base text-white transition-colors duration-500 ${isCurrentUser ? 'text-[#CC0000]' : 'text-white'}`}>{user.nome || 'Anônimo'}</h4>
                <span className="text-xs text-[#A7ADBE] font-semibold">Nível {user.nivel || 1}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-1.5">
                <div className="flex items-center gap-2 text-white/80">
                  <Star size={16} className="text-[#CC0000]" />
                  <span className="font-teko text-lg font-bold">{user.xp || 0}</span>
                  <span className="text-[10px] text-[#A7ADBE] uppercase tracking-widest font-medium">XP</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <BookOpen size={16} className="text-[#CC0000]" />
                  <span className="font-teko text-lg font-bold">{user.capitulosLidos || 0}</span>
                  <span className="text-[10px] text-[#A7ADBE] uppercase tracking-widest font-medium">Caps</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
});

export default RankingView;
