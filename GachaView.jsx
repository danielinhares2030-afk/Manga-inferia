import React, { useState, useEffect } from 'react';
import { PackageOpen, Zap, Loader2, Sparkles, Box } from 'lucide-react';
import { doc, setDoc, collection, addDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const RARITIES = {
  common: { color: 'text-gray-400', bg: 'bg-gray-400/20', border: 'border-gray-400', label: 'Comum' },
  rare: { color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400', label: 'Raro' },
  epic: { color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400', label: 'Epico' },
  legendary: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400', label: 'Lendario' },
  mythical: { color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500', label: 'Mitico' }
};

// Fallback de itens caso o Admin App ainda não tenha enviado nada
const FALLBACK_POOL = [
  { id: 't_roxo', type: 'tema', rarity: 'rare', name: 'Abismo (Roxo)' },
  { id: 't_azul', type: 'tema', rarity: 'rare', name: 'Gelo (Azul)' },
  { id: 't_verde', type: 'tema', rarity: 'epic', name: 'Tóxico (Verde)' },
  { id: 'e_crt', type: 'efeito', rarity: 'epic', name: 'TV Antiga (CRT)' },
  { id: 'e_vinh', type: 'efeito', rarity: 'legendary', name: 'Vinheta Sombria' },
  { id: 'e_part', type: 'efeito', rarity: 'mythical', name: 'Partículas Siderais' },
  { id: 'm_ouro', type: 'moldura', rarity: 'legendary', name: 'Aura Dourada', color: '#FFD700' },
  { id: 'av_1', type: 'avatar', rarity: 'rare', name: 'Guerreiro Abissal', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200' }
];

const GachaView = ({ user, perfil }) => {
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [gachaPool, setGachaPool] = useState([]);

  useEffect(() => {
    const fetchPool = async () => {
      try {
        const snap = await getDocs(collection(db, 'gacha_pool'));
        if (!snap.empty) {
          setGachaPool(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setGachaPool(FALLBACK_POOL);
        }
      } catch(err) { setGachaPool(FALLBACK_POOL); }
    };
    fetchPool();
  }, []);

  const getRandomItem = () => {
    const rand = Math.random() * 100;
    let targetRarity = 'common';
    if (rand > 50 && rand <= 80) targetRarity = 'rare';
    else if (rand > 80 && rand <= 93) targetRarity = 'epic';
    else if (rand > 93 && rand <= 98) targetRarity = 'legendary';
    else if (rand > 98) targetRarity = 'mythical';

    const possibleItems = gachaPool.filter(i => i.rarity === targetRarity);
    return possibleItems.length > 0 ? possibleItems[Math.floor(Math.random() * possibleItems.length)] : gachaPool[Math.floor(Math.random() * gachaPool.length)];
  };

  const handleOpenBox = async () => {
    if (processing || !user) return;
    const cost = 500; // Custa 500 XP

    if ((perfil.xp || 0) < cost) {
      if (window.mostrarAviso) window.mostrarAviso("XP Insuficiente!", 'error');
      return;
    }

    setProcessing(true);

    try {
      const newXP = Math.max(0, (perfil.xp || 0) - cost);
      const droppedItem = getRandomItem();

      // Salva XP deduzido
      await setDoc(doc(db, 'usuarios', user.uid), { xp: newXP }, { merge: true });
      
      // Salva item no Inventário do Usuário
      const invRef = doc(db, 'usuarios', user.uid, 'inventario', droppedItem.id + '_' + Date.now());
      await setDoc(invRef, { ...droppedItem, acquiredAt: new Date().toISOString() }, { merge: true });

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
    <div className="min-h-screen bg-[#050508] pb-24 font-nunito relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#CC0000]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="pt-28 px-4 pb-8 relative z-10 text-center">
        <h2 className="font-anime text-4xl text-white tracking-widest flex items-center justify-center gap-3 drop-shadow-[0_0_20px_#CC0000] mb-2">
          CAIXA DO ABISMO
        </h2>
        <p className="text-[#A7ADBE] text-sm font-bold uppercase tracking-widest mb-10">Desbloqueie Temas, Efeitos e Avatares.</p>
        
        <div className="bg-[#0A0505]/80 backdrop-blur-md border border-[#2A0A0A] rounded-2xl px-8 py-4 inline-flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-12">
          <span className="text-[10px] font-bold text-[#A7ADBE] uppercase tracking-wider mb-1">XP Atual</span>
          <div className="flex items-center gap-2"><Zap size={20} className="text-[#FF3333]" /><span className="font-teko text-3xl text-white leading-none mt-1">{perfil.xp || 0}</span></div>
        </div>

        <div className="max-w-xs mx-auto">
          <div className="bg-gradient-to-b from-[#1A0505] to-[#0A0505] border border-[#CC0000]/30 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden shadow-[0_0_40px_rgba(204,0,0,0.2)] group hover:border-[#CC0000] transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(204,0,0,0.2)_0%,transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <PackageOpen size={80} className="text-[#CC0000] mb-6 drop-shadow-[0_0_15px_#CC0000] group-hover:animate-bounce relative z-10" strokeWidth={1.5} />
            <h3 className="font-teko text-3xl text-white mb-2 relative z-10">CAIXA MISTERIOSA</h3>
            <p className="text-[10px] text-[#A7ADBE] uppercase font-bold tracking-widest mb-6 relative z-10">Contém 1 Item de Personalização</p>
            
            <button onClick={handleOpenBox} disabled={processing} className="w-full bg-gradient-to-r from-[#CC0000] to-[#8B0000] text-white py-4 rounded-xl font-bold tracking-widest shadow-[0_0_20px_rgba(204,0,0,0.4)] flex justify-center items-center gap-2 font-teko text-xl uppercase relative z-10 hover:scale-105 transition-transform disabled:opacity-50">
              {processing ? <Loader2 className="animate-spin" size={24} /> : 'ABRIR POR 500 XP'}
            </button>
          </div>
        </div>
      </div>

      {opening && reward && (
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 no-hue">
          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,${RARITIES[reward.rarity].color.replace('text-', 'rgba(').replace('-400', ',0.2)')}_0%,transparent_70%)] animate-pulse`}></div>
          
          <div className={`relative z-10 flex flex-col items-center p-10 rounded-3xl border-4 ${RARITIES[reward.rarity].border} bg-[#050508] shadow-[0_0_100px_${RARITIES[reward.rarity].color.replace('text-', 'var(--tw-').replace('-400', '-500)')}] animate-in slide-in-from-bottom-10`}>
            {reward.rarity === 'mythical' && <Sparkles className="absolute -top-8 text-red-500 animate-spin" size={64} />}
            <span className={`text-[10px] font-black uppercase tracking-widest mb-6 px-4 py-1.5 rounded-full ${RARITIES[reward.rarity].bg} ${RARITIES[reward.rarity].color} shadow-lg`}>
              {RARITIES[reward.rarity].label} - {reward.type}
            </span>
            <h2 className="font-teko text-4xl text-white text-center mb-8 drop-shadow-md">{reward.name}</h2>
            
            {reward.type === 'avatar' || reward.type === 'capa' ? (
              <img src={reward.image} className="w-40 h-40 object-cover rounded-2xl border-2 border-white/20 mb-8 shadow-2xl" alt="loot" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center border-2 border-white/20 mb-8 shadow-xl">
                <Box size={56} className={RARITIES[reward.rarity].color} />
              </div>
            )}
            
            <button onClick={() => setOpening(false)} className="px-10 py-4 bg-white text-black font-black rounded-full uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.5)]">
              COLETAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaView;
