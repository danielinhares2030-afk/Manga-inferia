import React, { useState, useEffect } from 'react';
import { PackageOpen, Coins, Zap, Loader2, Star, Sparkles, AlertTriangle } from 'lucide-react';
import { doc, setDoc, collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

const GACHA_POOL = [
  { id: 'av_1', type: 'avatar', rarity: 'common', name: 'Avatar Sombra', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200' },
  { id: 'av_2', type: 'avatar', rarity: 'rare', name: 'Guerreiro Neon', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200' },
  { id: 'fr_1', type: 'moldura', rarity: 'rare', name: 'Borda de Gelo', color: '#3366FF' },
  { id: 'ti_1', type: 'titulo', rarity: 'epic', name: 'Cacador de Abismos', color: '#9933FF' },
  { id: 'cv_1', type: 'capa', rarity: 'epic', name: 'Capa do Vazio', image: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=1000' },
  { id: 'fr_2', type: 'moldura', rarity: 'legendary', name: 'Aura Dourada', color: '#FFD700' },
  { id: 'ti_2', type: 'titulo', rarity: 'legendary', name: 'Monarca das Sombras', color: '#FFD700' },
  { id: 'fr_3', type: 'moldura', rarity: 'mythical', name: 'Chamas Infernais', color: '#FF0000', animated: true },
  { id: 'xp_1', type: 'xp', rarity: 'common', name: 'Pocao de XP Pequena', amount: 500 },
  { id: 'xp_2', type: 'xp', rarity: 'epic', name: 'Pocao de XP Grande', amount: 3000 }
];

const BOXES = {
  common: { name: 'Caixa Comum', priceCoins: 1000, priceXP: 500, color: 'from-gray-600 to-gray-800', border: 'border-gray-500', shadow: 'shadow-[0_0_20px_rgba(156,163,175,0.2)]' },
  rare: { name: 'Caixa Rara', priceCoins: 5000, priceXP: 2500, color: 'from-blue-600 to-blue-900', border: 'border-blue-500', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' },
  epic: { name: 'Caixa Epica', priceCoins: 15000, priceXP: 7000, color: 'from-purple-600 to-purple-900', border: 'border-purple-500', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]' },
  legendary: { name: 'Caixa Lendaria', priceCoins: 50000, priceXP: 25000, color: 'from-yellow-500 to-yellow-800', border: 'border-yellow-400', shadow: 'shadow-[0_0_30px_rgba(234,179,8,0.5)]' }
};

const RARITIES = {
  common: { chance: 55, color: 'text-gray-400', bg: 'bg-gray-400/20', border: 'border-gray-400', label: 'Comum' },
  rare: { chance: 25, color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400', label: 'Raro' },
  epic: { chance: 12, color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400', label: 'Epico' },
  legendary: { chance: 6, color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400', label: 'Lendario' },
  mythical: { chance: 2, color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500', label: 'Mitico' }
};

const GachaView = ({ user, perfil }) => {
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('coins');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'usuarios', user.uid, 'gacha_history'), orderBy('createdAt', 'desc'), limit(10));
    const unsub = onSnapshot(q, (snap) => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [user]);

  const getRandomItem = () => {
    const rand = Math.random() * 100;
    let r = 'common';
    if (rand > 55 && rand <= 80) r = 'rare';
    else if (rand > 80 && rand <= 92) r = 'epic';
    else if (rand > 92 && rand <= 98) r = 'legendary';
    else if (rand > 98) r = 'mythical';

    const possibleItems = GACHA_POOL.filter(i => i.rarity === r);
    return possibleItems[Math.floor(Math.random() * possibleItems.length)] || GACHA_POOL[0];
  };

  const handleOpenBox = async (boxType) => {
    if (processing || !user) return;
    const box = BOXES[boxType];
    const cost = selectedCurrency === 'coins' ? box.priceCoins : box.priceXP;
    const currentBalance = selectedCurrency === 'coins' ? (perfil.coins || 0) : (perfil.xp || 0);

    if (currentBalance < cost) {
      if (window.mostrarAviso) window.mostrarAviso("Saldo insuficiente!", 'error');
      return;
    }

    setProcessing(true);

    try {
      let newXP = perfil.xp || 0;
      let newCoins = perfil.coins || 0;
      let newLevel = perfil.nivel || 1;

      if (selectedCurrency === 'xp') {
        newXP = Math.max(0, newXP - cost);
        const calcLevel = Math.floor(newXP / 1000) + 1;
        if (calcLevel < newLevel && window.mostrarAviso) {
          window.mostrarAviso(`Alerta! Voce caiu para o Nivel ${calcLevel}`, 'error');
        }
        newLevel = calcLevel;
      } else {
        newCoins = Math.max(0, newCoins - cost);
      }

      const droppedItem = getRandomItem();

      let updates = { xp: newXP, coins: newCoins, nivel: newLevel };
      
      if (droppedItem.type === 'xp') {
        updates.xp += droppedItem.amount;
        updates.nivel = Math.floor(updates.xp / 1000) + 1;
      } else {
        const invRef = doc(db, 'usuarios', user.uid, 'inventario', droppedItem.id);
        await setDoc(invRef, { ...droppedItem, acquiredAt: new Date().toISOString() }, { merge: true });
      }

      await setDoc(doc(db, 'usuarios', user.uid), updates, { merge: true });
      await addDoc(collection(db, 'usuarios', user.uid, 'gacha_history'), { item: droppedItem, box: boxType, createdAt: new Date().toISOString() });

      setReward(droppedItem);
      setOpening(true);
    } catch (err) {
      console.error(err);
      if (window.mostrarAviso) window.mostrarAviso("Erro ao abrir caixa.", 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] pb-24 font-nunito relative">
      <div className="pt-24 px-4 pb-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2A0A0A] via-[#050508] to-[#050508] border-b border-[#2A0A0A]">
        <h2 className="font-anime text-4xl text-white tracking-widest flex items-center justify-center gap-3 drop-shadow-[0_0_20px_#CC0000] mb-8">
          PORTAO DO ABISMO
        </h2>
        
        <div className="flex justify-center gap-4 mb-6">
          <div className="bg-[#0A0505]/80 backdrop-blur-md border border-[#2A0A0A] rounded-2xl px-6 py-3 flex flex-col items-center min-w-[140px] shadow-lg">
            <span className="text-[10px] font-bold text-[#A7ADBE] uppercase tracking-wider mb-1">XP Atual</span>
            <div className="flex items-center gap-2"><Zap size={16} className="text-[#FF3333]" /><span className="font-teko text-2xl text-white">{perfil.xp || 0}</span></div>
          </div>
          <div className="bg-[#0A0505]/80 backdrop-blur-md border border-[#2A0A0A] rounded-2xl px-6 py-3 flex flex-col items-center min-w-[140px] shadow-lg">
            <span className="text-[10px] font-bold text-[#A7ADBE] uppercase tracking-wider mb-1">Moedas</span>
            <div className="flex items-center gap-2"><Coins size={16} className="text-[#FFD700]" /><span className="font-teko text-2xl text-white">{perfil.coins || 0}</span></div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-4 bg-[#0A0505] p-1.5 rounded-full border border-[#2A0A0A] max-w-[240px] mx-auto shadow-inner">
          <button onClick={() => setSelectedCurrency('coins')} className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedCurrency === 'coins' ? 'bg-[#FFD700]/20 text-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.2)]' : 'text-[#A7ADBE] hover:text-white'}`}>Moedas</button>
          <button onClick={() => setSelectedCurrency('xp')} className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedCurrency === 'xp' ? 'bg-[#FF3333]/20 text-[#FF3333] shadow-[0_0_10px_rgba(255,51,51,0.2)]' : 'text-[#A7ADBE] hover:text-white'}`}>Usar XP</button>
        </div>

        {selectedCurrency === 'xp' && (
          <div className="flex items-center justify-center gap-2 text-[#FF3333] bg-[#CC0000]/10 border border-[#CC0000]/30 py-2.5 px-4 rounded-xl max-w-sm mx-auto text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(204,0,0,0.2)]">
            <AlertTriangle size={16} /> Cuidado: Ficar sem XP rebaixa seu nivel!
          </div>
        )}
      </div>

      <div className="px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {Object.entries(BOXES).map(([key, box]) => (
          <div key={key} className={`bg-gradient-to-br ${box.color} p-[2px] rounded-3xl ${box.shadow} hover:scale-[1.03] transition-transform cursor-pointer group`}>
            <div className={`bg-[#0A0505] h-full rounded-[22px] p-6 border ${box.border} flex flex-col items-center text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <PackageOpen size={56} className={`mb-4 ${RARITIES[key === 'common' ? 'common' : key === 'rare' ? 'rare' : key === 'epic' ? 'epic' : 'legendary'].color} drop-shadow-lg group-hover:animate-bounce`} />
              <h3 className="font-anime text-2xl text-white tracking-widest mb-1 z-10">{box.name}</h3>
              
              <button onClick={() => handleOpenBox(key)} disabled={processing} className={`mt-6 w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${box.color} text-white z-10 shadow-lg`}>
                {processing ? <Loader2 className="animate-spin" size={18} /> : `ABRIR (${selectedCurrency === 'coins' ? box.priceCoins + ' M' : box.priceXP + ' XP'})`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-12 max-w-4xl mx-auto">
        <h3 className="font-anime text-xl text-white tracking-widest mb-6 border-l-4 border-[#CC0000] pl-3">REGISTRO DO ABISMO</h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-center text-[#A7ADBE] font-bold text-sm py-8 border border-[#2A0A0A] rounded-2xl bg-[#0A0505]">Nenhum item aberto ainda.</p>
          ) : (
            history.map((log) => {
              const rar = RARITIES[log.item.rarity];
              return (
                <div key={log.id} className={`flex items-center justify-between p-4 rounded-2xl border ${rar.border} bg-[#0A0505] shadow-lg`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${rar.bg} border border-[${rar.color}] shadow-[0_0_10px_currentColor] ${rar.color}`}></div>
                    <span className="text-white text-sm font-bold tracking-wide">{log.item.name}</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${rar.bg} ${rar.color}`}>{rar.label}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {opening && reward && (
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,${RARITIES[reward.rarity].color.replace('text-', 'rgba(').replace('-400', ',0.2)')}_0%,transparent_70%)] animate-pulse`}></div>
          
          <div className={`relative z-10 flex flex-col items-center p-10 rounded-3xl border-4 ${RARITIES[reward.rarity].border} bg-[#050508] shadow-[0_0_150px_${RARITIES[reward.rarity].color.replace('text-', 'var(--tw-').replace('-400', '-500)')}] animate-in slide-in-from-bottom-10`}>
            {reward.rarity === 'mythical' && <Sparkles className="absolute -top-8 text-red-500 animate-spin" size={64} />}
            <span className={`text-sm font-black uppercase tracking-widest mb-6 px-4 py-1.5 rounded-full ${RARITIES[reward.rarity].bg} ${RARITIES[reward.rarity].color} shadow-lg`}>
              {RARITIES[reward.rarity].label}
            </span>
            <h2 className="font-anime text-4xl text-white text-center mb-8 drop-shadow-md">{reward.name}</h2>
            {reward.type === 'avatar' || reward.type === 'capa' ? (
              <img src={reward.image} className="w-40 h-40 object-cover rounded-2xl border-2 border-white/20 mb-8 shadow-2xl" alt="loot" />
            ) : reward.type === 'xp' ? (
              <div className="w-32 h-32 rounded-full bg-[#CC0000]/20 flex items-center justify-center border-2 border-[#CC0000] mb-8 shadow-[0_0_30px_rgba(204,0,0,0.5)]">
                <Zap size={56} className="text-[#FF3333]" />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center border-2 border-white/20 mb-8 shadow-xl">
                <Star size={56} className={RARITIES[reward.rarity].color} />
              </div>
            )}
            <button onClick={() => setOpening(false)} className="px-10 py-4 bg-white text-black font-black rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.5)]">
              COLETAR RECOMPENSA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaView;
