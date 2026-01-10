import React, { useState } from 'react';

function Login({ onLoginSuccess, setView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // 本来はここでバックエンドのAPIを叩きます
    // 例: axios.post('/auth/login', { email, password })
    
    // MVP開発中やテスト用の仮実装
    if (email === 'test@example.com' && password === 'password') {
      onLoginSuccess(); // ログイン成功をApp.jsxに伝える
    } else {
      setError('メールアドレスまたはパスワードが正しくありません');
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white min-h-screen flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-8 text-center text-slate-800">おかえりなさい</h2>
      
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">メールアドレス</label>
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
          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">パスワード</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b-2 p-2 outline-none focus:border-emerald-500 transition"
            placeholder="••••••••"
            required 
          />
        </div>

        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

        <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-600 transition">
          ログイン
        </button>
      </form>

      <button 
        onClick={() => setView('signup')} 
        className="mt-8 text-sm text-slate-400 font-bold text-center"
      >
        アカウントをお持ちでない方はこちら
      </button>
    </div>
  );
}

export default Login;