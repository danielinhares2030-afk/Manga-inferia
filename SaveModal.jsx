import React from 'react';
import { X, BookOpen, CheckCircle2, Star, XCircle, Trash2 } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const SaveModal = ({ isOpen, onClose, obra, user, isAlreadySaved }) => {
  if (!isOpen || !obra || !user) return null;

  const handleSave = async (status) => {
    try {
      const bibRef = doc(db, 'usuarios', user.uid, 'biblioteca', obra.id);
      await setDoc(bibRef, {
        id: obra.id,
        nome: obra.nome,
        capaUrl: obra.capaUrl,
        tipo: obra.tipo,
        status: status,
        capAtual: 0,
        progresso: 0,
        adicionadoEm: new Date().toISOString()
      }, { merge: true });
      
      if (window.mostrarAviso) window.mostrarAviso(`Salvo em: ${status}!`);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      if (window.mostrarAviso) window.mostrarAviso("Erro ao salvar obra!", "error");
    }
  };

  const handleRemove = async () => {
    try {
      await deleteDoc(doc(db, 'usuarios', user.uid, 'biblioteca', obra.id));
      if (window.mostrarAviso) window.mostrarAviso("Obra removida da biblioteca!", "error");
      onClose();
    } catch (error) {
      console.error("Erro ao remover:", error);
      if (window.mostrarAviso) window.mostrarAviso("Erro ao remover obra!", "error");
    }
  };

  const statusOptions = [
    { label: 'Lendo', icon: BookOpen, color: 'text-blue-400', bg: 'hover:bg-blue-400/10 hover:border-blue-400/50' },
    { label: 'Finalizado', icon: CheckCircle2, color: 'text-green-400', bg: 'hover:bg-green-400/10 hover:border-green-400/50' },
    { label: 'Favorito', icon: Star, color: 'text-yellow-400', bg: 'hover:bg-yellow-400/10 hover:border-yellow-400/50' },
    { label: 'Dropado', icon: XCircle, color: 'text-red-400', bg: 'hover:bg-red-400/10 hover:border-red-400/50' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="bg-[#0A0505] border border-[#2A0A0A] w-full max-w-xs rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(204,0,0,0.15)] animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-4 border-b border-[#2A0A0A] bg-[#140505]">
          <h3 className="font-anime text-sm text-white tracking-widest">SALVAR OBRA</h3>
          <button onClick={onClose} className="text-[#A7ADBE] hover:text-[#CC0000] transition-colors"><X size={20} /></button>
        </div>
        
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <img src={obra.capaUrl} alt="Capa" className="w-12 h-16 object-cover rounded border border-[#2A0A0A]" />
            <span className="font-bold text-sm text-[#F5F7FF] line-clamp-2">{obra.nome}</span>
          </div>

          {statusOptions.map((opt) => (
            <button 
              key={opt.label} 
              onClick={() => handleSave(opt.label)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border border-[#2A0A0A] bg-[#140505] transition-all ${opt.bg} group`}
            >
              <opt.icon size={18} className={`${opt.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              <span className="text-xs font-bold text-[#A7ADBE] group-hover:text-white uppercase tracking-wider">{opt.label}</span>
            </button>
          ))}

          {isAlreadySaved && (
            <button 
              onClick={handleRemove}
              className="w-full flex items-center justify-center gap-2 p-3 mt-4 rounded-xl border border-[#CC0000]/30 bg-[#CC0000]/10 hover:bg-[#CC0000] transition-colors group text-[#FF3333] hover:text-white"
            >
              <Trash2 size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Remover Obra</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
