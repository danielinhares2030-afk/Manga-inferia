import React, { useState } from 'react';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase';

const LoginView = () => {
  const [loginMode, setLoginMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    try {
      if (loginMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError('Erro: Verifique os seus dados ou se a conta já existe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonAuth = async () => {
    setAuthError('');
    setIsSubmitting(true);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setAuthError('Erro ao entrar como anónimo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[9000] flex items-center justify-center p-4 transition-all duration-1000 ease-in-out bg-[#050202]`}>
      <div className={`absolute top-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]`}></div>
      
      <div className={`absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[140px] pointer-events-none transition-colors duration-1000 ease-in-out ${loginMode === 'register' ? 'bg-[#00E5FF]/15' : 'bg-[#CC0000]/15'}`}></div>
      <div className={`absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[140px] pointer-events-none transition-colors duration-1000 ease-in-out ${loginMode === 'register' ? 'bg-[#2979FF]/15' : 'bg-[#7A0000]/15'}`}></div>

      {/* Card principal aumentado: p-10 (padding maior) e sm:p-12 para telas maiores */}
      <div className={`w-full max-w-md backdrop-blur-3xl border rounded-2xl p-10 sm:p-12 relative z-10 transition-all duration-1000 ease-in-out shadow-2xl ${loginMode === 'register' ? 'bg-[#000814]/80 border-[#00E5FF]/20 shadow-[0_20px_60px_rgba(0,229,255,0.1)]' : 'bg-[#0A0505]/80 border-[#CC0000]/20 shadow-[0_20px_60px_rgba(204,0,0,0.15)]'}`}>
        <h1 className={`font-anime text-3xl md:text-4xl text-center mb-3 drop-shadow-lg transition-colors duration-1000 ease-in-out`}>
          MANGA<span className={loginMode === 'register' ? 'text-[#00E5FF]' : 'text-[#CC0000]'}>INFERIA</span>
        </h1>
        <p className="text-center text-[#A7ADBE] text-sm mb-10 font-nunito font-bold">
          {loginMode === 'login' ? 'Acesse a sua biblioteca.' : 'Crie a sua conta agora.'}
        </p>

        {/* space-y-5 para dar mais espaço entre os inputs */}
        <form onSubmit={handleEmailAuth} className="space-y-5 font-nunito">
          <div className="relative group">
            <Mail className={`absolute left-4 top-4 transition-colors duration-500 ${loginMode === 'register' ? 'text-[#A7ADBE] group-focus-within:text-[#00E5FF]' : 'text-[#A7ADBE] group-focus-within:text-[#CC0000]'}`} size={18} />
            <input 
              type="email" required placeholder="O seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-[#050508]/80 border border-[#2A2A35] text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-1 transition-all placeholder-[#555] font-semibold ${loginMode === 'register' ? 'focus:border-[#00E5FF] focus:ring-[#00E5FF]' : 'focus:border-[#CC0000] focus:ring-[#CC0000]'}`}
            />
          </div>
          <div className="relative group">
            <Lock className={`absolute left-4 top-4 transition-colors duration-500 ${loginMode === 'register' ? 'text-[#A7ADBE] group-focus-within:text-[#00E5FF]' : 'text-[#A7ADBE] group-focus-within:text-[#CC0000]'}`} size={18} />
            <input 
              type="password" required placeholder="A sua senha secreta" value={password} onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-[#050508]/80 border border-[#2A2A35] text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-1 transition-all placeholder-[#555] font-semibold ${loginMode === 'register' ? 'focus:border-[#00E5FF] focus:ring-[#00E5FF]' : 'focus:border-[#CC0000] focus:ring-[#CC0000]'}`}
            />
          </div>

          {authError && <p className="text-[#FF3333] text-xs text-center font-bold animate-pulse">{authError}</p>}

          <button type="submit" disabled={isSubmitting} className={`w-full text-white py-4 rounded-xl font-bold tracking-widest transition-all duration-700 hover:scale-[1.02] flex justify-center items-center gap-2 border shadow-lg font-teko text-xl ${loginMode === 'register' ? 'bg-gradient-to-r from-[#00A3FF] to-[#0055FF] border-[#00E5FF]/40 shadow-[0_0_20px_rgba(0,229,255,0.3)]' : 'bg-gradient-to-r from-[#CC0000] to-[#7A0000] border-[#FF3333]/40 shadow-[0_0_20px_rgba(204,0,0,0.3)]'}`}>
            {isSubmitting ? <Loader2 className="animate-spin text-white" size={20} /> : (loginMode === 'login' ? 'ENTRAR' : 'CRIAR CONTA')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-[#A7ADBE] font-nunito font-bold">
          <button onClick={() => setLoginMode(loginMode === 'login' ? 'register' : 'login')} className={`transition-colors duration-500 ${loginMode === 'register' ? 'hover:text-[#00E5FF]' : 'hover:text-[#CC0000]'}`}>
            {loginMode === 'login' ? 'Não tem conta? Criar' : 'Já tem conta? Entrar'}
          </button>
          {loginMode === 'login' && (
            <button className={`transition-colors duration-500 ${loginMode === 'register' ? 'hover:text-[#00E5FF]' : 'hover:text-[#CC0000]'}`}>
              Esqueceu a senha?
            </button>
          )}
        </div>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-[#2A2A35]"></div>
          <span className="text-[10px] text-[#A7ADBE] font-bold uppercase tracking-widest">ou</span>
          <div className="flex-1 h-px bg-[#2A2A35]"></div>
        </div>

        <button onClick={handleAnonAuth} disabled={isSubmitting} className="w-full bg-[#050508] border border-[#2A2A35] text-[#A7ADBE] py-3.5 rounded-xl font-bold text-sm hover:bg-[#1A1A24] hover:text-white transition-colors flex items-center justify-center gap-2 font-nunito">
          {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <><User size={16} /> Entrar como Anónimo</>}
        </button>
      </div>
    </div>
  );
};

export default LoginView;
