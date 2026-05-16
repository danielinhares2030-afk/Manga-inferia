import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Loader2, AlertTriangle } from 'lucide-react';
import JSZip from 'jszip';

const ReaderView = ({ capitulo, obra, onBack }) => {
  const [showUI, setShowUI] = useState(true);
  const [paginas, setPaginas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShowUI(true);
    setPaginas([]);
    setError(null);
    setLoading(true);

    const extrairImagensDoZip = async () => {
      try {
        if (!capitulo.arquivoUrl) {
          throw new Error("Este capítulo não possui um link de arquivo válido.");
        }

        // 1. Baixa o arquivo ZIP/CBZ diretamente da URL (Cloudinary/Storage)
        const resposta = await fetch(capitulo.arquivoUrl);
        if (!resposta.ok) throw new Error("Não foi possível baixar o arquivo do capítulo.");
        
        const arquivoBlob = await resposta.blob();
        
        // 2. Carrega o arquivo binário na biblioteca JSZip
        const zip = await JSZip.loadAsync(arquivoBlob);
        const listaDeArquivos = [];

        // 3. Lê o conteúdo do ZIP, ignorando pastas e arquivos de sistema ocultos (ex: __MACOSX)
        zip.forEach((caminhoRelativo, arquivoZip) => {
          if (!arquivoZip.dir && !caminhoRelativo.includes('__MACOSX')) {
            const extensao = caminhoRelativo.toLowerCase().split('.').pop();
            // Filtra apenas formatos de imagem reais
            if (['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(extensao)) {
              listaDeArquivos.push(arquivoZip);
            }
          }
        });

        if (listaDeArquivos.length === 0) {
          throw new Error("Nenhuma imagem válida foi encontrada dentro do arquivo ZIP/CBZ.");
        }

        // 4. Ordena as imagens de forma alfanumérica (ex: 1.jpg, 2.jpg, 10.jpg)
        listaDeArquivos.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        // 5. Converte os arquivos extraídos em links temporários (Blob URLs) para o navegador renderizar
        const promessasDePaginas = listaDeArquivos.map(async (arquivo) => {
          const dadosBinarios = await arquivo.async('blob');
          return URL.createObjectURL(dadosBinarios);
        });

        const urlsDasPaginas = await Promise.all(promessasDePaginas);
        setPaginas(urlsDasPaginas);

      } catch (err) {
        console.error("Erro no processamento do ZIP:", err);
        setError(err.message || "Falha crítica ao abrir as páginas do capítulo.");
      } finally {
        setLoading(false);
      }
    };

    extrairImagensDoZip();

    // Cronômetro para esconder as barras de navegação automaticamente (leitura imersiva)
    const timer = setTimeout(() => setShowUI(false), 3500);

    // Função de limpeza: Quando sair do leitor, destrói os links temporários para liberar memória RAM do celular
    return () => {
      clearTimeout(timer);
      paginas.forEach(url => URL.revokeObjectURL(url));
    };
  }, [capitulo]);

  if (!capitulo) return null;

  return (
    <div className="bg-black min-h-screen relative font-nunito">
      {/* Top Bar - Desaparece para cima */}
      <div className={`fixed top-0 left-0 w-full bg-gradient-to-b from-black/90 to-transparent p-4 z-50 flex items-center justify-between transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
        <button onClick={onBack} className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center">
          <h2 className="text-white text-sm font-bold truncate max-w-[200px]">{obra?.nome || "Obra"}</h2>
          <p className="text-[#A7ADBE] text-[10px] uppercase font-bold tracking-widest">
            {capitulo.titulo ? `${capitulo.titulo} - Cap. ${capitulo.numero}` : `Capítulo ${capitulo.numero}`}
          </p>
        </div>
        <button className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-lg">
          <Settings size={18} />
        </button>
      </div>

      {/* ESTADO 1: CARREGANDO E EXTRAINDO O ZIP */}
      {loading && (
        <div className="flex flex-col h-screen items-center justify-center text-[#A7ADBE] gap-3 bg-[#030305]">
          <Loader2 className="animate-spin text-[#CC0000] w-12 h-12 drop-shadow-[0_0_10px_rgba(204,0,0,0.4)]" />
          <p className="font-anime text-xs tracking-widest animate-pulse">Descompactando Páginas...</p>
        </div>
      )}

      {/* ESTADO 2: ERRO AO BAIXAR OU ABRIR O ZIP */}
      {error && !loading && (
        <div className="flex flex-col h-screen items-center justify-center text-[#A7ADBE] gap-4 p-6 text-center bg-[#050508]">
          <div className="w-16 h-16 bg-[#CC0000]/10 border border-[#CC0000]/30 rounded-full flex items-center justify-center text-[#FF3333] shadow-lg">
            <AlertTriangle size={32} />
          </div>
          <h3 className="font-anime text-sm text-white tracking-wider">Erro ao carregar o capítulo</h3>
          <p className="text-xs text-[#777] max-w-xs font-semibold leading-relaxed">{error}</p>
          <button onClick={onBack} className="mt-4 px-5 py-2.5 bg-[#140505] border border-[#2A0A0A] text-[#A7ADBE] rounded-xl text-xs font-bold uppercase tracking-wider hover:text-white transition-colors">Voltar aos capítulos</button>
        </div>
      )}

      {/* ESTADO 3: LEITOR RENDERIZANDO AS IMAGENS */}
      {!loading && !error && (
        <div onClick={() => setShowUI(!showUI)} className="w-full max-w-3xl mx-auto flex flex-col bg-black pb-24 cursor-pointer min-h-screen">
          {paginas.map((imgUrl, index) => (
            <img 
              key={index} 
              src={imgUrl} 
              alt={`Página ${index + 1}`} 
              className="w-full object-contain select-none bg-black"
              loading={index < 3 ? "eager" : "lazy"} // Eager nas primeiras para abrir rápido, Lazy no resto para poupar internet
            />
          ))}
        </div>
      )}

      {/* Bottom Bar - Desaparece para baixo */}
      <div className={`fixed bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6 z-50 flex items-center justify-center transition-transform duration-300 ${showUI && !loading && !error ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-[#140505] border border-[#2A0A0A] rounded-full px-6 py-2 flex items-center justify-center shadow-2xl">
           <span className="text-white text-xs font-bold uppercase tracking-widest">{paginas.length} Páginas</span>
        </div>
      </div>
    </div>
  );
};

export default ReaderView;
