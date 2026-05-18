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
  common: { name: 'Caixa Comum', priceCoins: 1000, priceXP: 500, color: 'from-gray-600 to-gray-800', border: 'border-gray-500' },
  rare: { name: 'Caixa Rara', priceCoins: 5000, priceXP: 2500, color: 'from-blue-600 to-blue-900', border: 'border-blue-500' },
  epic: { name: 'Caixa Epica', priceCoins: 15000, priceXP: 7000, color: 'from-purple-600 to-purple-900', border: 'border-purple-500' },
  legendary: { name: 'Caixa Lendaria', priceCoins: 50000, priceXP: 25000, color: 'from-yellow-500 to-yellow-800', border: 'border-yellow-400' }
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
      <div className="px-4 pt-12 pb-6 bg-gradient-to-b from-[#1A0505] to-[#050508] border-b border-[#2A0A0A]">
        <h2 className="font-anime text-4xl text-white tracking-widest flex items-center justify-center gap-3 drop-shadow-[0_0_15px_#CC0000] mb-6">
          PORTAO DO ABISMO
        </h2>
        
        <div className="flex justify-center gap-4 mb-6">
          <div className="bg-[#0A0505] border border-[#2A0A0A] rounded-xl px-4 py-2 flex flex-col items-center min-w-[120px]">
            <span className="text-[10px] font-bold text-[#A7ADBE] uppercase tracking-wider">Seu XP</span>
            <div className="flex items-center gap-1"><Zap size={14} className="text-[#FF3333]" /><span className="font-teko text-xl text-white">{perfil.xp || 0}</span></div>
          </div>
          <div className="bg-[#0A0505] border border-[#2A0A0A] rounded-xl px-4 py-2 flex flex-col items-center min-w-[120px]">
            <span className="text-[10px] font-bold text-[#A7ADBE] uppercase tracking-wider">Moedas</span>
            <div className="flex items-center gap-1"><Coins size={14} className="text-[#FFD700]" /><span className="font-teko text-xl text-white">{perfil.coins || 0}</span></div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-4 bg-[#0A0505] p-1 rounded-full border border-[#2A0A0A] max-w-[200px] mx-auto">
          <button onClick={() => setSelectedCurrency('coins')} className={`flex-1 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedCurrency === 'coins' ? 'bg-[#FFD700]/20 text-[#FFD700]' : 'text-[#A7ADBE]'}`}>Moedas</button>
          <button onClick={() => setSelectedCurrency('xp')} className={`flex-1 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${selectedCurrency === 'xp' ? 'bg-[#FF3333]/20 text-[#FF3333]' : 'text-[#A7ADBE]'}`}>Usar XP</button>
        </div>

        {selectedCurrency === 'xp' && (
          <div className="flex items-center justify-center gap-2 text-[#FF3333] bg-[#CC0000]/10 border border-[#CC0000]/30 py-2 px-4 rounded-lg max-w-sm mx-auto text-xs font-bold animate-pulse">
            <AlertTriangle size={14} /> Cuidado: Perder XP rebaixa seu nivel!
          </div>
        )}
      </div>

      <div className="px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {Object.entries(BOXES).map(([key, box]) => (
          <div key={key} className={`bg-gradient-to-br ${box.color} p-1 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:scale-[1.02] transition-transform`}>
            <div className={`bg-[#0A0505] h-full rounded-xl p-6 border ${box.border} flex flex-col items-center text-center relative overflow-hidden`}>
              <PackageOpen size={48} className={`mb-4 ${RARITIES[key === 'common' ? 'common' : key === 'rare' ? 'rare' : key === 'epic' ? 'epic' : 'legendary'].color}`} />
              <h3 className="font-anime text-xl text-white tracking-widest mb-1">{box.name}</h3>
              
              <button onClick={() => handleOpenBox(key)} disabled={processing} className={`mt-6 w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${box.color} text-white`}>
                {processing ? <Loader2 className="animate-spin" size={16} /> : `ABRIR (${selectedCurrency === 'coins' ? box.priceCoins + ' M' : box.priceXP + ' XP'})`}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-12 max-w-4xl mx-auto">
        <h3 className="font-teko text-2xl text-white uppercase tracking-wider mb-4 border-l-2 border-[#CC0000] pl-2">Ultimos Loots</h3>
        <div className="space-y-2">
          {history.map((log) => {
            const rar = RARITIES[log.item.rarity];
            return (
              <div key={log.id} className={`flex items-center justify-between p-3 rounded-xl border ${rar.border} bg-[#0A0505]`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${rar.bg} border ${rar.border}`}></div>
                  <span className="text-white text-sm font-bold">{log.item.name}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${rar.bg} ${rar.color}`}>{rar.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {opening && reward && (
        <div className="fixed inset-0 z-[999999] bg-black/95 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-pulse"></div>
          
          <div className={`relative z-10 flex flex-col items-center p-8 rounded-2xl border-2 ${RARITIES[reward.rarity].border} bg-[#050508] shadow-[0_0_100px_${RARITIES[reward.rarity].color.replace('text-', 'bg-').replace('-400', '-500')}] animate-in slide-in-from-bottom-10`}>
            {reward.rarity === 'mythical' && <Sparkles className="absolute -top-6 text-red-500 animate-spin" size={48} />}
            <span className={`text-xs font-black uppercase tracking-widest mb-4 px-3 py-1 rounded-full ${RARITIES[reward.rarity].bg} ${RARITIES[reward.rarity].color}`}>
              {RARITIES[reward.rarity].label}
            </span>
            <h2 className="font-anime text-3xl text-white text-center mb-6">{reward.name}</h2>
            {reward.type === 'avatar' || reward.type === 'capa' ? (
              <img src={reward.image} className="w-32 h-32 object-cover rounded-xl border border-white/20 mb-6" alt="loot" />
            ) : reward.type === 'xp' ? (
              <div className="w-24 h-24 rounded-full bg-[#CC0000]/20 flex items-center justify-center border border-[#CC0000] mb-6">
                <Zap size={40} className="text-[#FF3333]" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/20 mb-6">
                <Star size={40} className={RARITIES[reward.rarity].color} />
              </div>
            )}
            <button onClick={() => setOpening(false)} className="px-8 py-3 bg-white text-black font-bold rounded-full uppercase tracking-widest hover:scale-105 transition-transform">
              COLETAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaView;
