import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from './firebase.js';
import { CLOUD_NAME, UPLOAD_PRESET } from './constants.js';
import { Image as ImageIcon, CheckSquare } from 'lucide-react';

export const FormularioObra = ({ setToast, setView }) => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    nome: '', descricao: '', tipo: 'Mangá', status: 'Lançamento', generos: '',
    isCarousel: false, isDestaque: false, isRecente: true, isAtualizado: false
  });

  const handleImageChange = (e) => {
    const selected = e.target.files[0];
    if (selected) { setFile(selected); setPreview(URL.createObjectURL(selected)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setToast({ message: "É obrigatório enviar uma capa!", type: "error" });
    setLoading(true);
    
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", UPLOAD_PRESET);
      
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      
      const resImg = await fetch(cloudinaryUrl, { method: 'POST', body: uploadData });
      const imgData = await resImg.json();
      
      if (imgData.error) {
        throw new Error(`Cloudinary: ${imgData.error.message}`);
      }
      
      const payload = { ...formData, capaUrl: imgData.secure_url, generos: formData.generos.split(',').map(g => g.trim()) };
      await addDoc(collection(db, "obras"), payload);
      
      setToast({ message: "Obra salva no Banco de Dados!", type: "success" });
      setView('obras');
    } catch (error) {
      console.error(error);
      // Aqui está o nosso detetive! Ele vai mostrar o motivo exato da falha.
      setToast({ message: `Erro: ${error.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in w-full max-w-6xl space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 mb-4 sm:mb-8">
        <button onClick={() => setView('obras')} className="text-gray-500 hover:text-white transition-colors text-sm sm:text-base self-start">← Voltar</button>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white uppercase tracking-wider break-words" style={{ fontFamily: "'Orbitron', sans-serif" }}>Nova Obra</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 bg-[#0a0a0f] border border-gray-800/60 p-5 sm:p-8 rounded-2xl shadow-xl">
          <div><label className="block text-gray-400 text-[10px] sm:text-xs font-bold mb-2 uppercase">Título</label><input required className="w-full bg-[#111116] border border-gray-800 rounded-xl p-3 sm:p-4 text-white focus:border-[#CC0000] outline-none text-sm sm:text-base" onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Solo Leveling" /></div>
          <div><label className="block text-gray-400 text-[10px] sm:text-xs font-bold mb-2 uppercase">Sinopse</label><textarea required className="w-full bg-[#111116] border border-gray-800 rounded-xl p-3 sm:p-4 text-white focus:border-[#CC0000] outline-none min-h-[120px] sm:min-h-[150px] text-sm sm:text-base" onChange={e => setFormData({...formData, descricao: e.target.value})} placeholder="Sinopse..."></textarea></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div><label className="block text-gray-400 text-[10px] sm:text-xs font-bold mb-2 uppercase">Tipo</label><select className="w-full bg-[#111116] border border-gray-800 rounded-xl p-3 sm:p-4 text-white outline-none focus:border-[#CC0000] text-sm sm:text-base" onChange={e => setFormData({...formData, tipo: e.target.value})}><option>Mangá</option><option>Manhwa</option><option>Manhua</option><option>Comic</option><option>Novel</option></select></div>
            <div><label className="block text-gray-400 text-[10px] sm:text-xs font-bold mb-2 uppercase">Status</label><select className="w-full bg-[#111116] border border-gray-800 rounded-xl p-3 sm:p-4 text-white outline-none focus:border-[#CC0000] text-sm sm:text-base" onChange={e => setFormData({...formData, status: e.target.value})}><option>Lançamento</option><option>Concluído</option><option>Hiato</option></select></div>
          </div>
          <div><label className="block text-gray-400 text-[10px] sm:text-xs font-bold mb-2 uppercase">Gêneros</label><input required className="w-full bg-[#111116] border border-gray-800 rounded-xl p-3 sm:p-4 text-white focus:border-[#CC0000] outline-none text-sm sm:text-base" placeholder="Ação, Fantasia" onChange={e => setFormData({...formData, generos: e.target.value})} /></div>
        </div>
        <div className="space-y-5 sm:space-y-6">
          <div className="bg-[#0a0a0f] border border-gray-800/60 p-5 sm:p-8 rounded-2xl shadow-xl">
            <label className="block text-gray-400 text-[10px] sm:text-xs font-bold mb-4 uppercase">Capa</label>
            <div className="border-2 border-dashed border-gray-700 rounded-2xl bg-[#111116] flex flex-col items-center justify-center p-4 h-48 sm:h-64 relative overflow-hidden group hover:border-[#CC0000] transition-colors cursor-pointer">
              <input type="file" required accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" /> : <div className="text-center text-gray-500 group-hover:text-[#CC0000] transition-colors"><ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2" /><span className="text-xs sm:text-sm font-bold">Arraste a capa</span></div>}
            </div>
          </div>
          <div className="bg-[#0a0a0f] border border-gray-800/60 p-5 sm:p-8 rounded-2xl shadow-xl space-y-3 sm:space-y-4">
            <label className="block text-gray-400 text-[10px] sm:text-xs font-bold mb-3 sm:mb-4 uppercase flex items-center gap-2"><CheckSquare size={14}/> Tags Exibição</label>
            {[ { id: 'isCarousel', label: 'Banner Gigante' }, { id: 'isDestaque', label: 'Em Destaque' }, { id: 'isRecente', label: 'Mais Recentes' }, { id: 'isAtualizado', label: 'Atualizações' } ].map(tag => (
              <label key={tag.id} className="flex items-center gap-3 sm:gap-4 cursor-pointer group pb-1">
                <div className={`w-5 h-5 rounded-md sm:rounded-lg border flex items-center justify-center transition-colors flex-shrink-0 ${formData[tag.id] ? 'bg-[#CC0000] border-[#CC0000]' : 'bg-[#111116] border-gray-600'}`}>{formData[tag.id] && <CheckSquare size={14} className="text-white" />}</div>
                <span className="text-gray-300 text-xs sm:text-sm">{tag.label}</span>
                <input type="checkbox" className="hidden" checked={formData[tag.id]} onChange={e => setFormData({...formData, [tag.id]: e.target.checked})} />
              </label>
            ))}
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#CC0000] hover:bg-red-700 text-white font-black uppercase tracking-widest py-3 sm:py-4 rounded-xl transition-all shadow-[0_5px_15px_rgba(204,0,0,0.3)] disabled:opacity-50 flex justify-center text-sm sm:text-base">{loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "SALVAR NO BANCO"}</button>
        </div>
      </form>
    </div>
  );
};
