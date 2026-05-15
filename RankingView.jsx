import React, { useMemo } from 'react';
import { Trophy, Medal, Star, Target, Users, BookOpen, Clock, Activity, Target as TargetIcon } from 'lucide-react';

const RankingView = React.memo(({ perfilLogado, setActiveTab }) => {
  // Dados mockados para demonstração da interface (substitua por dados reais do Firestore)
  const rankingData = useMemo(() => {
    return [
      { id: '1', nome: 'Noctis Void', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', nivel: 85, capitulos: 15420, tempo: 3200, isCurrent: perfilLogado.id === '1' },
      { id: '2', nome: 'Luna Star', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop', nivel: 72, capitulos: 12150, tempo: 2850, isCurrent: perfilLogado.id === '2' },
      { id: '3', nome: 'Ren Shadow', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop', nivel: 68, capitulos: 10890, tempo: 2600, isCurrent: perfilLogado.id === '3' },
      { id: '4', nome: 'Kira Light', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop', nivel: 60, capitulos: 9500, tempo: 2100, isCurrent: perfilLogado.id === '4' },
      { id: '5', nome: 'Kai Abyss', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop', nivel: 55, capitulos: 8800, tempo: 1950, isCurrent: perfilLogado.id === '5' },
      { id:PerfilLogado.id, nome: PerfilLogado.nome, avatar: PerfilLogado.avatar, nivel: PerfilLogado.nivel, capitulos: PerfilLogado.capitulosLidos, tempo: PerfilLogado.tempoLendo, isCurrent: true, rankPosition: 23 },
    ];
  }, [perfilLogado]);

  const pódio = rankingData.slice(0, 3);
  const outros = rankingData.slice(3);

  const getPosicaoEspecial = (index) => {
    switch (index) {
      case 0: return { icone: Trophy, color: '#FFD700', blur: 'glow-gold', size: 40 }; // Ouro
      case 1: return { icone: Medal, color: '#C0C0C0', blur: 'glow-silver', size: 36 }; // Prata
      case 2: return { icone: Medal, color: '#CD7F32', blur: 'glow-bronze', size: 32 }; // Bronze
      default: return null;
    }
  };

  const EstatisticaPódio = ({ icone: Icone, valor, label, color }) => (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1.5" style={{ color }}>
        <Icone size={16} />
        <span className="font-teko text-xl font-bold">{valor}</span>
      </div>
      <span className="text-[10px] text-[#A7ADBE] uppercase tracking-widest font-semibold">{label}</span>
    </div>
  );

  return (
    <div className="px-5 pt-20 animate-in fade-in duration-500 font-nunito pb-12 min-h-screen">
      <h2 className="font-anime text-3xl md:text-4xl font-bold mb-8 uppercase tracking-wider border-l-4 border-[#CC0000] pl-4 leading-none flex items-center drop-shadow-lg">Mestres do Abismo</h2>
      
      {/* Pódio Otimizado e Suave */}
      <div className="grid grid-cols-3 gap-6 mb-12 items-end">
        {[1, 0, 2].map((posIndex) => { // Renderiza na ordem 2º, 1º, 3º
          const user = pódio[posIndex];
          const especial = getPosicaoEspecial(posIndex);
          const pos = posIndex + 1;
          const isPrimeiro = posIndex === 0;

          return (
            <div key={user.id} className={`flex flex-col items-center transition-all duration-700 ease-in-out ${isPrimeiro ? 'scale-110' : 'scale-100 mt-6'} ${especial.blur}`}>
              <div className="relative mb-3">
                <img src={user.avatar} alt={user.nome} className="w-20 h-20 rounded-full border-4 object-cover shadow-xl" style={{ borderColor: especial.color }} />
                <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full border-2 bg-[#0A0505] flex items-center justify-center font-teko text-2xl font-bold ${especial.color}`} style={{ borderColor: especial.color }}>
                  #{pos}
                </div>
              </div>
              <h3 className={`font-anime text-lg text-center mb-1 drop-shadow-md transition-colors duration-500 ${isPrimeiro ? especial.color : 'text-white'}`}>{user.nome}</h3>
              <span className={`bg-[#1A0505] border border-opacity-30 px-3 py-1 rounded text-[11px] font-bold tracking-wider uppercase mb-3 ${especial.color}`} style={{ borderColor: especial.color }}>Nível {user.nivel}</span>
              <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 pt-1.5">
                <EstatisticaPódio icone={BookOpen} valor={user.capitulos} label="Caps" color={especial.color} />
                <EstatisticaPódio icone={Clock} valor={user.tempo} label="Horas" color={especial.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Estatísticas do Perfil Logado no Ranking */}
      <div className="bg-[#140505] border border-[#2A0A0A] rounded-2xl p-6 mb-10 flex items-center gap-6 shadow-inner transition-colors duration-500 ease-in-out hover:border-[#CC0000]/50 will-change-background-color">
          <div className="relative">
              <img src={perfilLogado.avatar} alt="Seu Perfil" className="w-16 h-16 rounded-full border-2 border-[#CC0000] object-cover" />
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#CC0000] border-2 border-white flex items-center justify-center font-teko text-lg font-bold text-white shadow-xl">
                  #{rankingData[rankingData.length - 1].rankPosition}
              </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-[#CC0000]">
                      <Star size={18} />
                      <span className="font-anime text-xl text-white">O Teu Rank</span>
                  </div>
                  <p className="text-xs text-[#A7ADBE] font-semibold">Tás quase lá! Continua a ler para subir.</p>
              </div>
              <button onClick={() => setActiveTab('profile')} className="w-full flex items-center justify-center gap-2 bg-[#0A0505] border border-[#2A0A0A] text-[#A7ADBE] py-3.5 rounded-xl font-bold hover:bg-[#1A0505] hover:text-white transition-all text-sm font-nunito shadow-lg">
                  <Medal size={16} /> Ver Meu Progresso
              </button>
          </div>
      </div>

      {/* Lista de Ranking */}
      <div className="space-y-4">
        {outros.map((user, index) => {
          const pos = index + 4; // Começa na 4ª posição
          const isCurrentUser = user.isCurrent;

          return (
            <div key={user.id} className={`relative p-5 rounded-2xl flex items-center gap-5 border shadow-lg transition-all duration-700 ease-in-out will-change-background-color ${isCurrentUser ? 'bg-[#CC0000]/10 border-[#CC0000] scale-[1.01]' : 'bg-[#140505] border-[#2A0A0A] hover:border-[#2A2A35]'} before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent before:opacity-0 before:hover:opacity-100 before:transition-opacity`}>
              <div className={`font-teko text-4xl font-bold w-12 text-center transition-colors duration-500 ${isCurrentUser ? 'text-[#CC0000]' : 'text-[#A7ADBE]'}`}>#{pos}</div>
              <img src={user.avatar} alt={user.nome} className={`w-14 h-14 rounded-full border-2 object-cover transition-colors duration-500 ${isCurrentUser ? 'border-[#CC0000]' : 'border-[#2A0A0A]'}`} />
              <div className="flex-1 flex flex-col gap-0.5">
                <h4 className={`font-anime text-base text-white transition-colors duration-500 ${isCurrentUser ? 'text-[#CC0000]' : 'text-white'}`}>{user.nome}</h4>
                <span className="text-xs text-[#A7ADBE] font-semibold">Nível {user.nivel}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 pt-1.5">
                <div className="flex items-center gap-2 text-white/80">
                  <BookOpen size={16} className="text-[#CC0000]" />
                  <span className="font-teko text-lg font-bold">{user.capitulos}</span>
                  <span className="text-[10px] text-[#A7ADBE] uppercase tracking-widest font-medium">Caps</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock size={16} className="text-[#CC0000]" />
                  <span className="font-teko text-lg font-bold">{user.tempo}</span>
                  <span className="text-[10px] text-[#A7ADBE] uppercase tracking-widest font-medium">Horas</span>
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
