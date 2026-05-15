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

  const isRegister = loginMode === 'register';

  return (
    <div className={`fixed inset-0 z-[9000] flex items-center justify-center p-4 transition-colors duration-500 ease-in-out ${isRegister ? 'bg-[#000814]/80' : 'bg-[#050202]'} backdrop-blur-md`}>
      <div className={`absolute top-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]`}></div>
      
      {/* Luzes de Fundo - Otimizadas com will-change e transição suave */}
      <div className={`absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[140px] pointer-events-none transition-all duration-700 ease-in-out ${isRegister ? 'bg-[#00E5FF]/20' : 'bg-[#CC0000]/15'} will-change-transform-opacity`}></div>
      <div className={`absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full blur-[140px] pointer-events-none transition-all duration-700 ease-in-out ${isRegister ? 'bg-[#2979FF]/20' : 'bg-[#7A0000]/15'} will-change-transform-opacity`}></div>

      {/* Card Principal - Otimizado com padding fixo, will-change e animação suave */}
      <div className={`w-full max-w-lg backdrop-blur-lg border rounded-3xl p-12 relative z-10 transition-all duration-700 ease-in-out shadow-lg will-change-transform-opacity-background ${isRegister ? 'bg-[#000814]/90 border-[#00E5FF]/30 shadow-[#00E5FF]/10' : 'bg-[#0A0505]/95 border-[#CC0000]/30 shadow-[#CC0000]/15'}`}>
        <h1 className={`font-anime text-4xl text-center mb-4 drop-shadow-lg transition-colors duration-700 ease-in-out ${isRegister ? 'text-[#00E5FF]' : 'text-[#F5F7FF]'}`}>
          MANGA<span className={isRegister ? 'text-[#F5F7FF]' : 'text-[#CC0000]'}>INFERIA</span>
        </h1>
        <p className="text-center text-[#A7ADBE] text-base mb-12 font-nunito font-semibold">
          {isRegister ? 'Crie a sua conta agora.' : 'Acesse a sua biblioteca.'}
        </p>

        {/* space-y-6 para dar mais espaço entre os inputs */}
        <form onSubmit={handleEmailAuth} className="space-y-6 font-nunito">
          <div className="relative group">
            <Mail className={`absolute left-5 top-5 transition-colors duration-500 ${isRegister ? 'text-[#00E5FF] group-focus-within:text-white' : 'text-[#A7ADBE] group-focus-within:text-[#CC0000]'}`} size={20} />
            <input 
              type="email" required placeholder="O seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-[#050508]/70 border border-[#2A2A35] text-white rounded-xl py-4 pl-14 pr-5 focus:outline-none focus:ring-1 transition-all placeholder-[#555] font-semibold ${isRegister ? 'focus:border-[#00E5FF] focus:ring-[#00E5FF]' : 'focus:border-[#CC0000] focus:ring-[#CC0000]'}`}
            />
          </div>
          <div className="relative group">
            <Lock className={`absolute left-5 top-5 transition-colors duration-500 ${isRegister ? 'text-[#00E5FF] group-focus-within:text-white' : 'text-[#A7ADBE] group-focus-within:text-[#CC0000]'}`} size={20} />
            <input 
              type="password" required placeholder="A sua senha secreta" value={password} onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-[#050508]/70 border border-[#2A2A35] text-white rounded-xl py-4 pl-14 pr-5 focus:outline-none focus:ring-1 transition-all placeholder-[#555] font-semibold ${isRegister ? 'focus:border-[#00E5FF] focus:ring-[#00E5FF]' : 'focus:border-[#CC0000] focus:ring-[#CC0000]'}`}
            />
          </div>

          {authError && <p className="text-[#FF3333] text-sm text-center font-bold animate-pulse">{authError}</p>}

          <button type="submit" disabled={isSubmitting} className={`w-full text-white py-4 rounded-2xl font-bold tracking-widest transition-all duration-700 hover:scale-[1.02] flex justify-center items-center gap-2 border shadow-md font-teko text-2xl ${isRegister ? 'bg-gradient-to-r from-[#00A3FF] to-[#0055FF] border-[#00E5FF]/50 shadow-[#00E5FF]/20' : 'bg-gradient-to-r from-[#CC0000] to-[#7A0000] border-[#FF3333]/50 shadow-[#CC0000]/25'}`}>
            {isSubmitting ? <Loader2 className="animate-spin text-white" size={24} /> : (isRegister ? 'CRIAR CONTA' : 'ENTRAR')}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between text-sm text-[#A7ADBE] font-nunito font-semibold">
          <button onClick={() => setLoginMode(isRegister ? 'login' : 'register')} className={`transition-colors duration-500 ${isRegister ? 'hover:text-[#00E5FF]' : 'hover:text-[#CC0000]'}`}>
            {isRegister ? 'Já tem conta? Entrar' : 'Não tem conta? Criar'}
          </button>
          {!isRegister && (
            <button className="transition-colors duration-500 hover:text-[#CC0000]">
              Esqueceu a senha?
            </button>
          )}
        </div>

        <div className="my-10 flex items-center gap-5">
          <div className="flex-1 h-px bg-[#2A2A35]"></div>
          <span className="text-xs text-[#A7ADBE] font-bold uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-[#2A2A35]"></div>
        </div>

        <button onClick={handleAnonAuth} disabled={isSubmitting} className="w-full bg-[#050508]/80 border border-[#2A2A35] text-[#A7ADBE] py-4 rounded-2xl font-semibold text-base hover:bg-[#1A1A24] hover:text-white transition-colors flex items-center justify-center gap-3 font-nunito shadow-inner">
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><User size={20} /> Entrar como Anónimo</>}
        </button>
      </div>
    </div>
  );
};

export default LoginView;
