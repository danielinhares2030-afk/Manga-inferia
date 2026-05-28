import React, { useState, useEffect } from 'react';
import { PackageOpen, Zap, Loader2, Sparkles, Box, Flame, X } from 'lucide-react';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const RARITIES = {
  common: { color: 'text-gray-400', bg: 'bg-gray-400/20', border: 'border-gray-400', label: 'Comum' },
  rare: { color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400', label: 'Raro' },
  epic: { color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400', label: 'Épico' },
  legendary: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400', label: 'Lendário' },
  mythical: { color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500', label: 'Mítico' }
};

const FALLBACK_POOL = [
  { id: 't_roxo', type: 'tema', rarity: 'rare', name: 'Abismo (Roxo)' },
  { id: 't_azul', type: 'tema', rarity: 'rare', name: 'Gelo (Azul)' },
  { id: 't_verde', type: 'tema', rarity: 'epic', name: 'Tóxico (Verde)' },
  { id: 'e_crt', type: 'efeito', rarity: 'epic', name: 'TV Antiga (CRT)' },
  { id: 'e_vinh', type: 'efeito', rarity: 'legendary', name: 'Vinheta Sombria' },
  { id: 'e_part', type: 'efeito', rarity: 'mythical', name: 'Partículas Siderais' },
  { id: 'm_ouro', type: 'moldura', rarity: 'legendary', name: 'Aura Dourada', color: '#FFD700' },
  { id: 'av_1', type: 'avatar', rarity: 'rare', name: 'Guerreiro de Inferia', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200' }
];

const GachaView = ({ user, perfil = {} }) => {
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [itemsPool, setItemsPool] = useState([]);
  const [showPoolModal, setShowPoolModal] = useState(false);

  useEffect(() => {
    const fetchPool = async () => {
      try {
        const snap = await getDocs(collection(db, 'reliquias_pool'));
        if (!snap.empty) {
          setItemsPool(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setItemsPool(FALLBACK_POOL);
        }
      } catch(err) { 
        setItemsPool(FALLBACK_POOL); 
      }
    };
    fetchPool();
  }, []);

  const getRandomItem = () => {
    const currentPool = itemsPool.length > 0 ? itemsPool : FALLBACK_POOL;
    const rand = Math.random() * 100;
    let targetRarity = 'common';
    
    if (rand > 50 && rand <= 80) targetRarity = 'rare';
    else if (rand > 80 && rand <= 93) targetRarity = 'epic';
    else if (rand > 93 && rand <= 98) targetRarity = 'legendary';
    else if (rand > 98) targetRarity = 'mythical';

    const possibleItems = currentPool.filter(i => i.rarity === targetRarity);
    
    return possibleItems.length > 0 
      ? possibleItems[Math.floor(Math.random() * possibleItems.length)] 
      : currentPool[Math.floor(Math.random() * currentPool.length)];
  };

  const handleOpenBox = async () => {
    if (processing || !user) return;
    const cost = 500; 

    if ((perfil.xp || 0) < cost) {
      if (window.mostrarAviso) window.mostrarAviso("XP Insuficiente para abrir a caixa!", 'error');
      return;
    }

    setProcessing(true);

    try {
      const droppedItem = getRandomItem();
      if (!droppedItem) throw new Error("Falha ao puxar item.");

      const newXP = Math.max(0, (perfil.xp || 0) - cost);

      await setDoc(doc(db, 'usuarios', user.uid), { xp: newXP }, { merge: true });
      const invRef = doc(db, 'usuarios', user.uid, 'inventario', droppedItem.id + '_' + Date.now());
      await setDoc(invRef, { ...droppedItem, acquiredAt: new Date().toISOString() }, { merge: true });

      setReward(droppedItem);
      setOpening(true);
    } catch (err) {
      if (window.mostrarAviso) window.mostrarAviso("Erro ao abrir a caixa.", 'error');
    } finally {
      setProcessing(false);
    }
  };

  const activeRarity = reward && reward.rarity && RARITIES[reward.rarity] ? RARITIES[reward.rarity] : RARITIES['common'];
  const currentDisplayPool = itemsPool.length > 0 ? itemsPool : FALLBACK_POOL;

  return (
    <div className="min-h-screen bg-[#050508] pb-24 font-nunito relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#CC0000]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="pt-28 px-4 pb-8 relative z-10 text-center">
        <h2 className="font-anime text-3xl md:text-4xl text-white tracking-widest flex items-center justify-center gap-3 drop-shadow-[0_0_20px_#CC0000] mb-2">
          CAIXA INFERIA
        </h2>
        <p className="text-[#A7ADBE] text-xs md:text-sm font-bold uppercase tracking-widest mb-10">Desbloqueie itens para sua conta.</p>
        
        <div className="bg-[#0A0505]/80 backdrop-blur-md border border-[#2A0A0A] rounded-2xl px-8 py-4 inline-flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-12">
          <span className="text-[10px] font-bold text-[#A7ADBE] uppercase tracking-wider mb-1">XP Disponível</span>
          <div className="flex items-center gap-2"><Zap size={20} className="text-[#FF3333]" /><span className="font-teko text-3xl text-white leading-none mt-1">{perfil.xp || 0} XP</span></div>
        </div>

        <div className="max-w-xs mx-auto">
          <div className="bg-gradient-to-b from-[#1A0505] to-[#0A0505] border border-[#CC0000]/30 rounded-3xl p-8 flex flex-col items-center relative overflow-hidden shadow-[0_0_40px_rgba(204,0,0,0.2)] group hover:border-[#CC0000] transition-all">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(204,0,0,0.2)_0%,transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <PackageOpen size={80} className="text-[#CC0000] mb-6 drop-shadow-[0_0_15px_#CC0000] group-hover:animate-bounce relative z-10" strokeWidth={1.5} />
            <h3 className="font-teko text-4xl text-white mb-2 relative z-10">CAIXA INFERIA</h3>
            <p className="text-[10px] text-[#A7ADBE] uppercase font-bold tracking-widest mb-6 relative z-10 text-center">Contém 1 item de personalização</p>
            
            <button onClick={handleOpenBox} disabled={processing} className="w-full bg-gradient-to-r from-[#CC0000] to-[#8B0000] text-white py-4 rounded-xl font-bold tracking-widest shadow-[0_0_20px_rgba(204,0,0,0.4)] flex justify-center items-center gap-2 font-teko text-xl uppercase relative z-10 hover:scale-105 transition-transform disabled:opacity-50">
              {processing ? <Loader2 className="animate-spin" size={24} /> : 'ABRIR (500 XP)'}
            </button>
          </div>

          <button onClick={() => setShowPoolModal(true)} className="mt-6 text-[#CC0000] hover:text-white text-xs font-bold uppercase tracking-widest border border-[#CC0000]/30 bg-[#140505] px-6 py-2.5 rounded-xl transition-all shadow-md">
            Visualizar Conteúdo
          </button>
        </div>
      </div>

      {showPoolModal && (
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 no-hue animate-in fade-in duration-300">
          <div className="bg-[#0A0505] border border-[#2A0A0A] rounded-3xl p-6 w-full max-w-md max-h-[80vh] flex flex-col font-nunito relative shadow-2xl">
            <button onClick={() => setShowPoolModal(false)} className="absolute top-5 right-5 text-[#A7ADBE] hover:text-white bg-[#140505] border border-[#2A0A0A] rounded-full p-1.5 transition-colors">
              <X size={18} />
            </button>
            <h3 className="font-anime text-base text-white tracking-widest border-l-4 border-[#CC0000] pl-2 mb-6 leading-none mt-1">RECOMPENSAS</h3>
            <div className="overflow-y-auto hide-scrollbar space-y-2 flex-1 pr-1">
              {currentDisplayPool.map((item, idx) => {
                const rar = RARITIES[item.rarity] || RARITIES.common;
                return (
                  <div key={item.id + idx} className="flex items-center justify-between bg-[#140505] p-3 rounded-xl border border-[#1A0505]">
                    <div className="flex flex-col min-w-0 flex-1 pr-3">
                      <span className="text-white text-sm font-bold truncate">{item.name}</span>
                      <span className="text-[9px] text-[#A7ADBE] uppercase font-black tracking-wider mt-0.5">{item.type}</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shrink-0 ${rar.bg} ${rar.color}`}>
                      {rar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {opening && reward && (
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 no-hue">
          <div className={`relative z-10 flex flex-col items-center p-10 rounded-3xl border-4 ${activeRarity.border} bg-[#050508] shadow-2xl animate-in slide-in-from-bottom-10`}>
            {reward.rarity === 'mythical' && <Sparkles className="absolute -top-8 text-red-500 animate-spin" size={64} />}
            
            <span className={`text-[10px] font-black uppercase tracking-widest mb-6 px-4 py-1.5 rounded-full ${activeRarity.bg} ${activeRarity.color} shadow-lg`}>
              {activeRarity.label} - {reward.type || 'Item'}
            </span>
            
            <h2 className="font-teko text-4xl text-white text-center mb-8 drop-shadow-md">{reward.name || 'Recompensa'}</h2>
            
            {reward.type === 'avatar' || reward.type === 'capa' ? (
              <img src={reward.image || ''} className="w-40 h-40 object-cover rounded-2xl border-2 border-white/20 mb-8 shadow-2xl" alt="loot" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/5 flex items-center justify-center border-2 border-white/20 mb-8 shadow-xl">
                <Box size={56} className={activeRarity.color} />
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
