import React, { useState } from 'react';
import { Clock, BookOpen, History, Bell, Settings, LogOut, Eye, EyeOff, Edit3, X, CheckCircle2, AlertCircle, MapPin, Calendar, Loader2, Flame } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebase'; 

const ProfileView = React.memo(({ perfil = {}, biblioteca = [], setActiveTab = () => {} }) => {
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [editForm, setEditForm] = useState(perfil);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]); 
  const [loadingReator, setLoadingReator] = useState(false);

  const user = auth.currentUser;

  const openEditProfile = () => { setEditForm(perfil); setEditProfileModal(true); };
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const saveProfileSettings = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    const cleanForm = Object.fromEntries(Object.entries(editForm).filter(([_, v]) => v !== undefined));
    try {
      await setDoc(doc(db, 'usuarios', user.uid), cleanForm, { merge: true });
      setEditProfileModal(false);
      if (window.mostrarAviso) window.mostrarAviso("Perfil atualizado com sucesso!");
    } catch (error) {
      if (window.mostrarAviso) window.mostrarAviso("Falha ao salvar. Verifique a conexão.", 'error');
    } finally { setIsSavingProfile(false); }
  };

  const togglePrivacy = async () => {
    if (user) await setDoc(doc(db, 'usuarios', user.uid), { isPrivate: !perfil.isPrivate }, { merge: true });
  };

  // BOTÕES DE CONFIGURAÇÃO SALVANDO NO BANCO
  const toggleSetting = async (field) => {
    if (user) await setDoc(doc(db, 'usuarios', user.uid), { [field]: !perfil[field] }, { merge: true });
  };

  const fragmentos = perfil.fragmentos || 0;
  const podeSintetizar = fragmentos >= 5;

  const usarReator = async () => {
    if (!user || !podeSintetizar || loadingReator) return;
    setLoadingReator(true);
    try {
      await setDoc(doc(db, 'usuarios', user.uid), { fragmentos: fragmentos - 5, xp: (perfil.xp || 0) + 500 }, { merge: true });
      if (window.mostrarAviso) window.mostrarAviso("🔥 Fragmentos Queimados! +500 XP");
    } catch (err) { 
      if (window.mostrarAviso) window.mostrarAviso("Erro ao queimar fragmentos.", 'error');
    } finally { setLoadingReator(false); }
  };

  const xpAtual = perfil.xp || 0;
  const nivelAtual = perfil.nivel || 1;
  const xpProximoNivel = nivelAtual * 1000;
  const xpNivelAnterior = (nivelAtual - 1) * 1000;
  const progressoXP = Math.min(Math.max(((xpAtual - xpNivelAnterior) / 1000) * 100, 0), 100);

  const horasLendoReal = Math.floor((perfil.tempoLendo || 0) / 60);
  const obrasFinalizadasReais = biblioteca.filter(b => b.status === 'Finalizado').length;
  const capitulosLidosReais = perfil.capitulosLidos || 0;

  return (
    <div className="animate-in fade-in duration-300 font-nunito pb-10 min-h-screen">
      <div className="relative w-full h-48 md:h-64 bg-[#0A0505] border-b border-[#2A0A0A]">
        <img src={perfil.capa || "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000"} alt="Cover" className="w-full h-full object-cover opacity-50 object-top" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/30 to-transparent"></div>
      </div>

      <div className="px-6 relative flex flex-col md:flex-row items-start md:items-end gap-5 -mt-16 z-10 mb-8">
        <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-full border-4 border-[#050508] overflow-hidden bg-[#0A0505] shadow-[0_0_30px_rgba(204,0,0,0.3)]">
          <img src={perfil.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="flex-1 mt-2 md:mt-0 pt-2 w-full">
          <div className="flex items-center justify-between w-full mb-1">
            <h2 className="font-anime text-2xl md:text-3xl font-bold tracking-wider leading-none drop-shadow-md">{perfil.nome || 'NOCTIS'}</h2>
            <button onClick={openEditProfile} className="flex items-center gap-2 bg-[#1A0505] border border-[#CC0000]/40 text-[#FF3333] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#CC0000] hover:text-white transition-colors shadow-[0_0_15px_rgba(204,0,0,0.2)] font-teko text-lg">
              <Edit3 size={16} /> Editar
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="bg-[#1A0505] border border-[#CC0000]/30 text-[#FF3333] px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase">Nível {nivelAtual}</span>
            <span className="flex items-center gap-1 text-[#A7ADBE] text-xs font-bold"><MapPin size={12}/> {perfil.pais || 'Brasil'}</span>
            <span className="flex items-center gap-1 text-[#A7ADBE] text-xs font-bold"><Calendar size={12}/> {perfil.idade || '20'} anos</span>
          </div>
          <p className="text-sm text-[#A7ADBE] mt-3 max-w-md italic border-l-2 border-[#CC0000] pl-3 font-semibold">"{perfil.biografia || 'Adicione uma biografia legal aqui.'}"</p>
          
          <div className="mt-4 w-full md:max-w-md">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-[10px] text-[#A7ADBE] font-bold uppercase tracking-widest">Progresso do Nível</span>
              <span className="text-[11px] font-teko text-[#CC0000] font-bold tracking-wider">{xpAtual} / {xpProximoNivel} XP</span>
            </div>
            <div className="h-2 bg-[#0A0505] rounded-full overflow-hidden border border-[#2A0A0A] shadow-inner">
              <div className="h-full bg-gradient-to-r from-[#990000] to-[#FF3333] shadow-[0_0_10px_#CC0000] transition-all duration-1000 ease-out" style={{ width: `${progressoXP}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 mb-6">
        <div className="bg-gradient-to-b from-[#1A0505] to-[#0A0505] border border-[#2A0A0A] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CC0000] to-transparent opacity-80"></div>
          <Clock size={18} className="text-[#CC0000] mb-2" />
          <span className="text-2xl font-black text-[#F5F7FF] font-teko">{horasLendoReal}<span className="text-sm font-nunito text-[#FF3333] ml-0.5">h</span></span>
          <span className="text-[10px] text-[#A7ADBE] uppercase tracking-wider mt-1 text-center font-bold">Horas Lendo</span>
        </div>
        <div className="bg-gradient-to-b from-[#1A0505] to-[#0A0505] border border-[#2A0A0A] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#7A3CFF] to-transparent opacity-80"></div>
          <BookOpen size={18} className="text-[#7A3CFF] mb-2" />
          <span className="text-2xl font-black text-[#F5F7FF] font-teko">{obrasFinalizadasReais}</span>
          <span className="text-[10px] text-[#A7ADBE] uppercase tracking-wider mt-1 text-center font-bold">Obras Finalizadas</span>
        </div>
        <div className="bg-gradient-to-b from-[#1A0505] to-[#0A0505] border border-[#2A0A0A] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF8C00] to-transparent opacity-80"></div>
          <History size={18} className="text-[#FF8C00] mb-2" />
          <span className="text-2xl font-black text-[#F5F7FF] font-teko">{capitulosLidosReais}</span>
          <span className="text-[10px] text-[#A7ADBE] uppercase tracking-wider mt-1 text-center font-bold">Caps. Lidos</span>
        </div>
      </div>

      <div className="px-4 mb-8">
        <div className="bg-gradient-to-br from-[#140505] to-[#0A0505] border border-[#CC0000]/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(204,0,0,0.1)] relative overflow-hidden">
          <Flame className="absolute -right-4 -bottom-4 w-32 h-32 text-[#CC0000]/10 rotate-12 pointer-events-none" />
          <h3 className="font-anime text-lg text-[#F5F7FF] mb-1">FORNALHA DE INFERIA</h3>
          <p className="text-xs text-[#A7ADBE] font-bold mb-4">Queime os fragmentos infernais dropados nas leituras para ganhar XP.</p>
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
            {loadingReator ? <Loader2 className="animate-spin" /> : podeSintetizar ? 'QUEIMAR FRAGMENTOS (+500 XP)' : 'FALTAM FRAGMENTOS'}
          </button>
        </div>
      </div>

      <div className="pl-4 mb-6">
        <h3 className="font-anime text-sm md:text-base font-bold tracking-widest uppercase text-[#A7ADBE] mb-4 border-l-2 border-[#2A0A0A] pl-3 leading-none mt-2">Conta</h3>
        <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-4 pr-4 snap-x">
          <button onClick={() => setHistoryModal(true)} className="snap-start min-w-[140px] bg-[#0A0505] border border-[#2A0A0A] p-4 rounded-2xl flex flex-col gap-3 hover:bg-[#1A0505] transition-colors shadow-lg">
            <div className="w-8 h-8 rounded-full bg-[#1A0505] flex items-center justify-center text-[#7A3CFF] border border-[#7A3CFF]/20"><History size={16} /></div>
            <span className="text-sm font-bold text-left tracking-wide">Histórico<br/>Detalhado</span>
          </button>
          <button onClick={() => setNotifModal(true)} className="snap-start min-w-[140px] bg-[#0A0505] border border-[#2A0A0A] p-4 rounded-2xl flex flex-col gap-3 hover:bg-[#1A0505] transition-colors shadow-lg relative">
            {notificacoes.length > 0 && notificacoes.some(n => !n.read) && <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-[#CC0000] rounded-full animate-ping"></div>}
            <div className="w-8 h-8 rounded-full bg-[#1A0505] flex items-center justify-center text-[#FF8C00] border border-[#FF8C00]/20"><Bell size={16} /></div>
            <span className="text-sm font-bold text-left tracking-wide">Central de<br/>Avisos</span>
          </button>
          <button onClick={() => setSettingsModal(true)} className="snap-start min-w-[140px] bg-[#0A0505] border border-[#2A0A0A] p-4 rounded-2xl flex flex-col gap-3 hover:bg-[#1A0505] transition-colors shadow-lg">
            <div className="w-8 h-8 rounded-full bg-[#1A0505] flex items-center justify-center text-[#A7ADBE] border border-[#A7ADBE]/20"><Settings size={16} /></div>
            <span className="text-sm font-bold text-left tracking-wide">Configurar<br/>Leitor</span>
          </button>
          <button onClick={() => signOut(auth).then(()=>setActiveTab('home'))} className="snap-start min-w-[140px] bg-[#1A0505] border border-[#CC0000]/30 p-4 rounded-2xl flex flex-col gap-3 hover:bg-[#2A0A0A] transition-colors shadow-lg">
            <div className="w-8 h-8 rounded-full bg-[#CC0000]/20 flex items-center justify-center text-[#FF3333]"><LogOut size={16} /></div>
            <span className="text-sm font-bold text-left text-[#FF3333] tracking-wide">Sair da<br/>Conta</span>
          </button>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center justify-between p-4 bg-[#0A0505] border border-[#2A0A0A] rounded-2xl shadow-lg">
          <div className="flex items-center gap-3">
            {perfil.isPrivate ? <EyeOff size={22} className="text-[#CC0000]" /> : <Eye size={22} className="text-[#A7ADBE]" />}
            <div>
              <p className="text-sm font-bold text-[#F5F7FF] tracking-wide">Privacidade</p>
              <p className="text-[11px] text-[#A7ADBE] font-bold">{perfil.isPrivate ? 'Seu perfil está Oculto.' : 'Seu perfil é Público.'}</p>
            </div>
          </div>
          <button onClick={togglePrivacy} className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${perfil.isPrivate ? 'bg-[#CC0000]' : 'bg-[#2A0A0A]'}`}>
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${perfil.isPrivate ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
      </div>

      {editProfileModal && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0505] border border-[#CC0000]/40 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar font-nunito relative shadow-[0_0_50px_rgba(204,0,0,0.3)]">
            <button onClick={() => setEditProfileModal(false)} disabled={isSavingProfile} className="absolute top-5 right-5 text-[#A7ADBE] hover:text-white bg-[#1A0505] rounded-full p-1"><X size={20} /></button>
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-[#F5F7FF] font-anime tracking-widest border-l-4 border-[#CC0000] pl-2 leading-none mt-1">EDITAR</h3>
            <div className="space-y-4">
              <div><label className="text-xs font-bold text-[#A7ADBE] uppercase block">Link Avatar</label><input type="text" name="avatar" value={editForm.avatar || ''} onChange={handleEditChange} className="w-full bg-[#140505] border border-[#2A0A0A] text-white rounded-lg py-3 px-3 text-xs" /></div>
              <div><label className="text-xs font-bold text-[#A7ADBE] uppercase block">Link Capa</label><input type="text" name="capa" value={editForm.capa || ''} onChange={handleEditChange} className="w-full bg-[#140505] border border-[#2A0A0A] text-white rounded-lg py-3 px-3 text-xs" /></div>
              <div className="grid grid-cols-2 gap-3"><div className="col-span-2"><label className="text-xs font-bold text-[#A7ADBE] uppercase block">Nome</label><input type="text" name="nome" value={editForm.nome || ''} onChange={handleEditChange} className="w-full bg-[#140505] border border-[#2A0A0A] text-white rounded-xl py-2.5 px-4 text-sm" /></div>
                <div><label className="text-xs font-bold text-[#A7ADBE] uppercase block">Idade</label><input type="number" name="idade" value={editForm.idade || ''} onChange={handleEditChange} className="w-full bg-[#140505] border border-[#2A0A0A] text-white rounded-xl py-2.5 px-4 text-sm" /></div>
                <div><label className="text-xs font-bold text-[#A7ADBE] uppercase block">País</label><input type="text" name="pais" value={editForm.pais || ''} onChange={handleEditChange} className="w-full bg-[#140505] border border-[#2A0A0A] text-white rounded-xl py-2.5 px-4 text-sm" /></div>
                <div className="col-span-2"><label className="text-xs font-bold text-[#A7ADBE] uppercase block">Biografia</label><textarea name="biografia" value={editForm.biografia || ''} onChange={handleEditChange} rows="3" className="w-full bg-[#140505] border border-[#2A0A0A] text-white rounded-xl py-2.5 px-4 text-sm resize-none"></textarea></div>
              </div>
            </div>
            <button onClick={saveProfileSettings} disabled={isSavingProfile} className="mt-6 w-full bg-gradient-to-r from-[#CC0000] to-[#8B0000] text-white py-3.5 rounded-xl font-bold tracking-widest shadow-[0_0_15px_rgba(204,0,0,0.4)] flex justify-center items-center gap-2 font-teko text-xl uppercase">
              {isSavingProfile ? <Loader2 className="animate-spin" size={20} /> : 'SALVAR'}
            </button>
          </div>
        </div>
      )}

      {/* Histórico Lê Obras Recentes da Biblioteca (Que agora são salvas no ReaderView) */}
      {historyModal && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0505] border border-[#2A0A0A] rounded-3xl p-6 w-full max-w-md max-h-[80vh] flex flex-col font-nunito relative">
            <button onClick={() => setHistoryModal(false)} className="absolute top-5 right-5 text-[#A7ADBE] hover:text-white bg-[#1A0505] rounded-full p-1"><X size={20} /></button>
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-[#F5F7FF] font-anime tracking-widest border-l-4 border-[#7A3CFF] pl-2 leading-none mt-1">HISTÓRICO RECENTE</h3>
            <div className="overflow-y-auto hide-scrollbar space-y-3 flex-1 pr-2">
              {biblioteca.length > 0 ? biblioteca.map(manga => (
                <div key={manga.id} className="flex gap-3 bg-[#140505] p-3 rounded-xl border border-[#2A0A0A] items-center">
                  <img src={manga.capaUrl || manga.img} className="w-12 h-16 object-cover rounded" alt="capa" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white">{manga.nome || manga.title}</h4>
                    <p className="text-[10px] text-[#A7ADBE] uppercase tracking-wider font-medium">Lido Cap. {manga.capAtual || 0}</p>
                  </div>
                </div>
              )) : <p className="text-center text-[#A7ADBE] text-sm py-10 font-medium">Você não abriu nenhuma obra ainda.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Configurações salvando no Firebase */}
      {settingsModal && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0505] border border-[#2A0A0A] rounded-3xl p-6 w-full max-w-sm font-nunito relative">
            <button onClick={() => setSettingsModal(false)} className="absolute top-5 right-5 text-[#A7ADBE] hover:text-white"><X size={20} /></button>
            <h3 className="text-xl font-bold mb-6 text-[#F5F7FF] font-anime tracking-widest border-l-4 border-[#A7ADBE] pl-2">SISTEMA</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#140505] rounded-xl border border-[#2A0A0A]">
                <span className="text-sm font-bold text-[#A7ADBE]">Modo Leitura HD</span>
                <button onClick={() => toggleSetting('leituraHD')} className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${perfil.leituraHD ? 'bg-[#CC0000]' : 'bg-[#2A0A0A]'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${perfil.leituraHD ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#140505] rounded-xl border border-[#2A0A0A]">
                <span className="text-sm font-bold text-[#A7ADBE]">Scroll Suave Vertical</span>
                <button onClick={() => toggleSetting('scrollSuave')} className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ${perfil.scrollSuave ? 'bg-[#CC0000]' : 'bg-[#2A0A0A]'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${perfil.scrollSuave ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
            <button onClick={() => setSettingsModal(false)} className="mt-6 w-full border border-[#A7ADBE] text-[#A7ADBE] py-3 rounded-xl font-bold hover:bg-[#A7ADBE] hover:text-black transition-colors">
              FECHAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProfileView;
