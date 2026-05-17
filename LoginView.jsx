import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

const LoginView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError('Falha na autenticação. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-4 relative font-nunito overflow-hidden">
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,${isLogin ? 'rgba(204,0,0,0.1)' : 'rgba(122,60,255,0.1)'}_0%,transparent_50%)] pointer-events-none transition-colors duration-1000`}></div>

      <div className={`w-full max-w-md bg-[#0A0505]/90 backdrop-blur-xl border ${isLogin ? 'border-[#2A0A0A]' : 'border-[#7A3CFF]/30'} rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 animate-in fade-in slide-in-from-bottom-5 transition-all duration-700`}>
        
        <div className="text-center mb-8">
          <h1 className="font-anime text-3xl drop-shadow-md text-[#F5F7FF] mb-2 transition-all duration-500">
            MANGA<span className={`${isLogin ? 'text-[#CC0000]' : 'text-[#7A3CFF]'} transition-colors duration-500`}>INFERIA</span>
          </h1>
          <p className="text-[#A7ADBE] text-xs font-bold uppercase tracking-widest transition-all duration-500">
            {isLogin ? 'Bem-vindo de volta' : 'Junte-se ao Abismo'}
          </p>
        </div>

        {error && <div className="bg-[#CC0000]/10 border border-[#CC0000]/30 text-[#FF3333] text-xs p-3 rounded-xl mb-5 text-center font-bold animate-in fade-in">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A7ADBE]" size={18} />
            <input
              type="email" placeholder="E-mail" required value={email} onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-[#140505] border border-[#2A0A0A] text-white text-sm rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-${isLogin ? '[#CC0000]' : '[#7A3CFF]'} transition-colors duration-500`}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A7ADBE]" size={18} />
            <input
              type="password" placeholder="Senha" required value={password} onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-[#140505] border border-[#2A0A0A] text-white text-sm rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-${isLogin ? '[#CC0000]' : '[#7A3CFF]'} transition-colors duration-500`}
            />
          </div>

          <button disabled={loading} className={`w-full text-white font-bold py-4 rounded-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-500 disabled:opacity-50 mt-2 ${isLogin ? 'bg-gradient-to-r from-[#CC0000] to-[#990000] shadow-[0_0_20px_rgba(204,0,0,0.4)]' : 'bg-gradient-to-r from-[#7A3CFF] to-[#5A28CC] shadow-[0_0_20px_rgba(122,60,255,0.4)]'}`}>
            {loading ? <Loader2 className="animate-spin" size={18}/> : isLogin ? <><LogIn size={18} /> ENTRAR</> : <><UserPlus size={18} /> CRIAR CONTA</>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-[#A7ADBE] hover:text-white text-xs font-bold transition-colors">
            {isLogin ? 'Não tem uma conta? Criar agora' : 'Já tem uma conta? Fazer login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
