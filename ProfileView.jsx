import React, { useState, useEffect, useMemo } from 'react';
import { Clock, BookOpen, History, Bell, Settings, LogOut, Eye, EyeOff, Edit3, X, Loader2, Flame, Image as ImageIcon, MapPin, Calendar, Package, Coins, ChevronRight } from 'lucide-react';
import { doc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebase'; 

const compressImage = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const MAX = 600; 
      let width = img.width; let height = img.height;
      if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
      else { if (height > MAX) { width *= MAX / height; height = MAX; } }
      canvas.width = width; canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const RARITIES = {
  common: { color: 'text-gray-400', bg: 'bg-gray-400/20', border: 'border-gray-400', label: 'Comum' },
  rare: { color: 'text-blue-400', bg: 'bg-blue-400/20', border: 'border-blue-400', label: 'Raro' },
  epic: { color: 'text-purple-400', bg: 'bg-purple-400/20', border: 'border-purple-400', label: 'Épico' },
  legendary: { color: 'text-yellow-400', bg: 'bg-yellow-400/20', border: 'border-yellow-400', label: 'Lendário' },
  mythical: { color: 'text-red-500', bg: 'bg-red-500/20', border: 'border-red-500', label: 'Mítico' }
};

const ProfileView = React.memo(({ perfil = {}, biblioteca = [], setActiveTab = () => {}, onMangaClick }) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [inventario, setInventario] = useState([]);
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]); 
  const [loadingReator, setLoadingReator] = useState(false);

  const user = auth.currentUser;
  const safePerfil = perfil || {};
  const safeBiblioteca = Array.isArray(biblioteca) ? biblioteca : [];
  const eq = safePerfil.equipamentos || {};

  // Extração inteligente do Tema e Título Equipados
  const equippedTitulo = eq.titulo || null;
  // Procura o tema completo no inventário com base no nome salvo, ou puxa do equipamento se já foi migrado
  const equippedTema = eq.tema || inventario.find(i => i.type === 'tema' && i.name === safePerfil.tema) || null;

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, 'usuarios', user.uid, 'inventario'), (snap) => {
      setInventario(snap.docs.map(d => ({ dbId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const openEditProfile = () => { setEditForm(safePerfil); setEditProfileModal(true); };
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) compressImage(file, (compressedBase64) => setEditForm(prev => ({ ...prev, [field]: compressedBase64 })));
  };

  const saveProfileSettings = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    const cleanForm = Object.fromEntries(Object.entries(editForm).filter(([_, v]) => v !== undefined));
    try {
      await setDoc(doc(db, 'usuarios', user.uid), cleanForm, { merge: true });
      setEditProfileModal(false);
      if (window.mostrarAviso) window.mostrarAviso("Perfil atualizado com sucesso!");
    } catch (error) {
      if (window.mostrarAviso) window.mostrarAviso("Erro ao salvar.", 'error');
    } finally { setIsSavingProfile(false); }
  };

  const equipItem = async (item) => {
    if (!user || !item) return;
    try {
      const equipamentosAtualizados = { ...eq };
      equipamentosAtualizados[item.type] = item;
      
      let updatePayload = { equipamentos: equipamentosAtualizados };
      if (item.type === 'tema') {
        updatePayload.tema = item.name;
        localStorage.setItem('mi_theme', item.name);
      }
      
      await setDoc(doc(db, 'usuarios', user.uid), updatePayload, { merge: true });
      if (window.mostrarAviso) window.mostrarAviso(`${item.name} Equipado!`);
    } catch(err) {}
  };

  const unequipItem = async (item) => {
    if (!user || !item) return;
    try {
      const equipamentosAtualizados = { ...eq };
      delete equipamentosAtualizados[item.type];

      let updatePayload = { equipamentos: equipamentosAtualizados };
      if (item.type === 'tema') {
        updatePayload.tema = 'Inferia (Vermelho)';
        localStorage.setItem('mi_theme', 'Inferia (Vermelho)');
      }

      await setDoc(doc(db, 'usuarios', user.uid), updatePayload, { merge: true });
    } catch(err) {}
  };

  const toggleSetting = async (field) => {
    if (user) await setDoc(doc(db, 'usuarios', user.uid), { [field]: !safePerfil[field] }, { merge: true });
  };

  const togglePrivacy = async () => {
    if (user) await setDoc(doc(db, 'usuarios', user.uid), { isPrivate: !safePerfil.isPrivate }, { merge: true });
  };

  const fragmentos = safePerfil.fragmentos || 0;
  const podeSintetizar = fragmentos >= 5;

  const usarReator = async () => {
    if (!user || !podeSintetizar || loadingReator) return;
    setLoadingReator(true);
    try {
      const gainedXP = Math.floor(Math.random() * 201) + 100;
      await setDoc(doc(db, 'usuarios', user.uid), { fragmentos: fragmentos - 5, xp: (safePerfil.xp || 0) + gainedXP }, { merge: true });
      if (window.mostrarAviso) window.mostrarAviso(`🔥 Fornalha ativada! +${gainedXP} XP`);
    } catch (err) { 
      if (window.mostrarAviso) window.mostrarAviso("Erro ao queimar fragmentos.", 'error');
    } finally { setLoadingReator(false); }
  };

  const xpAtual = safePerfil.xp || 0;
  const nivelAtual = safePerfil.nivel || 1;
  const xpProximoNivel = nivelAtual * 1000;
  const xpNivelAnterior = (nivelAtual - 1) * 1000;
  const progressoXP = Math.min(Math.max(((xpAtual - xpNivelAnterior) / 1000) * 100, 0), 100);

  const horasLendoReal = Math.floor((safePerfil.tempoLendo || 0) / 60);
  const obrasLidasReais = safeBiblioteca.filter(b => b?.progresso >= 95 || b?.status === 'Finalizado').length;
  const capitulosLidosReais = safePerfil.capitulosLidos || 0;

  const currentAvatar = eq.avatar?.image || safePerfil.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200";
  const currentCover = eq.capa?.image || safePerfil.capa || "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000";

  // Classes Baseadas na IA
  const temaClass = equippedTema?.uniqueClass || (equippedTema?.css ? equippedTema.id : '');
  const tituloClass = equippedTitulo?.uniqueClass || (equippedTitulo?.css ? equippedTitulo.id : '');

  return (
    <div 
      className={`animate-in fade-in duration-300 font-nunito pb-10 min-h-screen relative ${temaClass}`}
      style={equippedTema && !equippedTema.css ? { backgroundColor: equippedTema.color + '20' } : {}}
    >
      {/* --- INJEÇÃO DE CSS GLOBAL DO PERFIL --- */}
      {equippedTema?.css && (
        <style dangerouslySetInnerHTML={{__html: 
          equippedTema.uniqueClass 
            ? `.${equippedTema.uniqueClass} { ${equippedTema.css} } \n ${equippedTema.animacao || equippedTema.keyframes || ''}` 
            : `.${equippedTema.id} { ${equippedTema.css} } \n ${equippedTema.animacao || equippedTema.keyframes || ''}`
        }} />
      )}
      
      {equippedTitulo?.css && (
        <style dangerouslySetInnerHTML={{__html: 
          equippedTitulo.uniqueClass 
            ? `.${equippedTitulo.uniqueClass} { ${equippedTitulo.css} } \n ${equippedTitulo.animacao || equippedTitulo.keyframes || ''}` 
            : `.${equippedTitulo.id} { ${equippedTitulo.css} } \n ${equippedTitulo.animacao || equippedTitulo.keyframes || ''}`
        }} />
      )}

      <div className="relative w-full h-64 md:h-80 bg-[#0A0505] border-b border-[#2A0A0A]">
        <img src={currentCover} alt="" className="w-full h-full object-cover opacity-60 object-center no-hue" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/30 to-transparent"></div>
      </div>

      <div className="px-6 relative flex flex-col md:flex-row items-start md:items-end gap-5 -mt-20 md:-mt-24 z-10 mb-6">
        <div className="relative">
          <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-full border-4 border-[#050508] overflow-hidden bg-[#0A0505] shadow-[0_0_30px_rgba(204,0,0,0.3)] relative z-10" style={{ boxShadow: eq.moldura ? `0 0 20px ${eq.moldura.color}` : 'none', borderColor: eq.moldura ? eq.moldura.color : '#050508' }}>
            <img src={currentAvatar} alt="" className="w-full h-full object-cover no-hue" loading="lazy" />
          </div>
        </div>

        <div className="flex-1 mt-2 md:mt-0 pt-2 w-full">
          <div className="flex items-center justify-between w-full mb-1">
            <div>
              {/* --- APLICAÇÃO DA CLASSE NO NICKNAME --- */}
              <h2 
                className={`font-anime text-2xl md:text-3xl font-bold tracking-wider leading-none drop-shadow-md text-[#F5F7FF] ${tituloClass}`}
                style={equippedTitulo && !equippedTitulo.css ? { color: equippedTitulo.color } : {}}
              >
                {safePerfil.nome || 'NOCTIS'}
              </h2>
            </div>
            <button onClick={openEditProfile} className="flex items-center gap-2 bg-[#1A0505] border border-[#CC0000]/40 text-[#FF3333] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#CC0000] hover:text-white transition-colors shadow-[0_0_15px_rgba(204,0,0,0.2)] font-teko text-lg">
              <Edit3 size={16} /> Editar
            </button>
          </div>
          
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="bg-[#1A0505] border border-[#CC0000]/30 text-[#FF3333] px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">Nível {nivelAtual}</span>
            <span className="flex items-center gap-1 text-[#A7ADBE] text-xs font-bold"><MapPin size={12}/> {safePerfil.pais || 'Brasil'}</span>
            <span className="flex items-center gap-1 text-[#A7ADBE] text-xs font-bold"><Calendar size={12}/> {safePerfil.idade || '20'} anos</span>
          </div>
          <p className="text-sm text-[#A7ADBE] mt-3 max-w-md italic border-l-2 border-[#CC0000] pl-3 font-semibold">"{safePerfil.biografia || 'Adicione uma biografia legal aqui.'}"</p>
          
          <div className="mt-4 w-full md:max-w-md">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[10px] text-[#A7ADBE] font-bold uppercase tracking-widest">Progresso do Nível</span>
              <span className="text-[11px] font-teko text-[#CC0000] font-bold tracking-wider">{xpAtual} / {xpProximoNivel} XP</span>
            </div>
            <div className="h-3 bg-[#0A0505] rounded-full overflow-hidden border border-[#2A0A0A] shadow-inner">
              <div className="h-full bg-gradient-to-r from-[#990000] to-[#FF3333] shadow-[0_0_10px_#CC0000] transition-all duration-1000 ease-out" style={{ width: `${progressoXP}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="flex bg-[#0A0505] border border-[#2A0A0A] rounded-xl p-1 max-w-md">
          <button onClick={() => setActiveSubTab('overview')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeSubTab === 'overview' ? 'bg-[#CC0000] text-white' : 'text-[#A7ADBE] hover:text-white'}`}>Visao Geral</button>
          <button onClick={() => setActiveSubTab('inventory')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeSubTab === 'inventory' ? 'bg-[#CC0000] text-white' : 'text-[#A7ADBE] hover:text-white'}`}>Inventario</button>
        </div>
      </div>

      {activeSubTab === 'overview' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 mb-6">
            <div className="bg-gradient-to-b from-[#1A0505] to-[#0A0505] border border-[#2A0A0A] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <Clock size={18} className="text-[#CC0000] mb-2" />
              <span className="text-2xl font-black text-[#F5F7FF] font-teko">{horasLendoReal}<span className="text-sm font-nunito text-[#FF3333] ml-0.5">h</span></span>
              <span className="text-[10px] text-[#A7ADBE] uppercase tracking-wider mt-1 text-center font-bold">Horas Lendo</span>
            </div>
            <div className="bg-gradient-to-b from-[#1A0505] to-[#0A0505] border border-[#2A0A0A] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <BookOpen size={18} className="text-[#7A3CFF] mb-2" />
              <span className="text-2xl font-black text-[#F5F7FF] font-teko">{obrasLidasReais}</span>
              <span className="text-[10px] text-[#A7ADBE] uppercase tracking-wider mt-1 text-center font-bold">Finalizadas</span>
            </div>
            <div className="bg-gradient-to-b from-[#1A0505] to-[#0A0505] border border-[#2A0A0A] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <History size={18} className="text-[#FF8C00] mb-2" />
              <span className="text-2xl font-black text-[#F5F7FF] font-teko">{capitulosLidosReais}</span>
              <span className="text-[10px] text-[#A7ADBE] uppercase tracking-wider mt-1 text-center font-bold">Caps. Lidos</span>
            </div>
            <div className="bg-gradient-to-b from-[#1A1505] to-[#0A0505] border border-[#FFD700]/30 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <Coins size={18} className="text-[#FFD700] mb-2" />
              <span className="text-2xl font-black text-[#F5F7FF] font-teko">{safePerfil.moedas || 0}</span>
              <span className="text-[10px] text-[#FFD700] uppercase tracking-wider mt-1 text-center font-bold">Moedas</span>
            </div>
          </div>

          <div className="px-4 mb-8">
            <div className="bg-gradient-to-br from-[#140505] to-[#0A0505] border border-[#CC0000]/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(204,0,0,0.1)] relative overflow-hidden">
              <Flame className="absolute -right-4 -bottom-4 w-32 h-32 text-[#CC0000]/10 rotate-12 pointer-events-none" />
              <h3 className="font-anime text-lg text-[#F5F7FF] mb-1">FORNALHA DE INFERIA</h3>
              <p className="text-xs text-[#A7ADBE] font-bold mb-4">Queime fragmentos infernais dropados nas leituras para ganhar XP.</p>
              <div className="flex items-center justify-between bg-black/50 p-4 rounded-xl border border-[#2A0A0A] mb-4 relative z-10">
                <div>
                  <p className="text-[10px] text-[#A7ADBE] font-bold uppercase mb-1 tracking-wider">Fragmentos Infernais</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-teko text-[#FF3333]">{fragmentos}</span>
                    <span className="text-sm font-bold text-[#555]">/ 5</span>
                  </div>
                </div>
                <div className="w-24 md:w-32 h-2 bg-[#1A0505] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#CC0000] to-[#FF5555] shadow-[0_0_10px_#CC0000] transition-all" style={{ width: `${Math.min((fragmentos / 5) * 100, 100)}%` }}></div>
                </div>
              </div>
              <button onClick={usarReator} disabled={!podeSintetizar || loadingReator} className="w-full relative z-10 bg-gradient-to-r from-[#CC0000] to-[#990000] disabled:from-[#2A0A0A] disabled:to-[#2A0A0A] disabled:text-[#555] text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(204,0,0,0.4)] disabled:shadow-none flex items-center justify-center gap-2">
                {loadingReator ? <Loader2 className="animate-spin" /> : podeSintetizar ? 'QUEIMAR FRAGMENTOS (+XP)' : 'FALTAM FRAGMENTOS'}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="px-4 pb-12">
          {inventario.length === 0 ? (
            <div className="bg-[#0A0505] border border-[#2A0A0A] rounded-2xl p-10 flex flex-col items-center justify-center text-center shadow-lg">
              <Package size={40} className="text-[#2A0A0A] mb-4" />
              <p className="text-[#A7ADBE] font-bold text-sm">Seu inventário está vazio.</p>
              <button onClick={() => setActiveTab('caixa')} className="mt-4 text-[#CC0000] text-xs font-bold uppercase tracking-wider underline hover:text-white transition-colors">Abrir Caixa Inferia</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {inventario.map(item => {
                const rar = RARITIES[item?.rarity] || RARITIES['common'];
                let isEquipped = false;
                if (item.type === 'tema') isEquipped = safePerfil.tema === item.name;
                else isEquipped = eq[item?.type]?.id === item?.id;
                
                // Pré-visualização do Item no Card do Inventário
                const itemClass = item.uniqueClass || (item.css ? item.id : '');

                return (
                  <div key={item.dbId} className={`bg-[#0A0505] border ${rar.border} p-4 rounded-xl flex flex-col items-center text-center relative overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] ${item.type === 'tema' ? itemClass : ''}`}>
                    {/* Injeta CSS do card individual no inventário para preview */}
                    {item.css && (
                      <style dangerouslySetInnerHTML={{__html: 
                        item.uniqueClass 
                          ? `.${item.uniqueClass} { ${item.css} } \n ${item.animacao || item.keyframes || ''}` 
                          : `.${item.id} { ${item.css} } \n ${item.animacao || item.keyframes || ''}`
                      }} />
                    )}

                    {isEquipped && <div className="absolute top-2 right-2 w-2 h-2 bg-[#00FF88] rounded-full shadow-[0_0_8px_#00FF88] z-10"></div>}
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-2 z-10 drop-shadow-md ${rar.color}`}>{item.type || 'Item'}</span>
                    
                    {/* Aplica a classe de título se o item for um título */}
                    <h4 className={`text-white text-xs font-bold line-clamp-2 mb-4 h-8 z-10 drop-shadow-md ${item.type === 'titulo' ? itemClass : ''}`}>
                      {item.name || 'Desconhecido'}
                    </h4>
                    
                    <button 
                      onClick={() => isEquipped ? unequipItem(item) : equipItem(item)}
                      className={`w-full py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all z-10 backdrop-blur-md ${isEquipped ? 'bg-black/50 border border-[#2A0A0A] text-[#A7ADBE]' : `bg-black/50 border ${rar.border} ${rar.color} hover:${rar.bg}`}`}
                    >
                      {isEquipped ? 'REMOVER' : 'EQUIPAR'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default ProfileView;
