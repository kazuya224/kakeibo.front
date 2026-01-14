import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // URL遷移のために追加
import api from '../service/api'; // API通信のために追加

function Signup({ onSignupSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // navigate関数を定義

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // パスワード一致チェック
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    try {
      // 1. 実際にバックエンドのAPIを叩く
      // エンドポイントはご自身のバックエンド（/auth/signup など）に合わせてください
      await api.post('/auth/signup', { name, email, password });
      
      alert("登録が完了しました！ログインしてください。");
      
      // 2. 登録成功後、ログイン画面へ遷移させる
      navigate('/login'); 
      
    } catch (err) {
      // APIからエラーが返ってきた場合
      const message = err.response?.data?.message || '登録に失敗しました。もう一度お試しください。';
      setError(message);
    }
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

      {/* onClickの代わりに Link を使ってURLを "/login" に変更 */}
      <Link 
        to="/login" 
        className="mt-6 text-sm text-slate-400 font-bold text-center underline block w-full"
      >
        既にアカウントをお持ちの方はこちら
      </Link>
    </div>
  );
}

export default Signup;