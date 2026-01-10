import React, { useState } from 'react';

function Signup({ onSignupSuccess, setView }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // パスワード一致チェック
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    // 本来はここでバックエンドのAPIを叩きます
    // axios.post('/auth/signup', { name, email, password })
    
    console.log("Signup attempt:", { name, email });
    
    // 仮の成功処理
    alert("登録が完了しました！ログインしてください。");
    setView('login'); 
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white min-h-screen flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-8 text-center text-slate-800">新規アカウント登録</h2>
      
      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">お名前</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full border-b-2 p-2 outline-none focus:border-emerald-500 transition"
            placeholder="家計 太郎"
            required 
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">メールアドレス</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b-2 p-2 outline-none focus:border-emerald-500 transition"
            placeholder="example@mail.com"
            required 
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">パスワード</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b-2 p-2 outline-none focus:border-emerald-500 transition"
            placeholder="••••••••"
            required 
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">パスワード（確認）</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-b-2 p-2 outline-none focus:border-emerald-500 transition"
            placeholder="••••••••"
            required 
          />
        </div>

        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

        <button className="w-full py-4 mt-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition">
          登録する
        </button>
      </form>

      <button 
        onClick={() => setView('login')} 
        className="mt-6 text-sm text-slate-400 font-bold text-center underline"
      >
        既にアカウントをお持ちの方はこちら
      </button>
    </div>
  );
}

export default Signup;