import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 1. インポートを追加
import api from '../service/api';

function Login({ onLoginSuccess }) { // setViewは不要なので削除
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // ここでエラーが出ていた原因が解消されます

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 実際にはバックエンドのレスポンスに合わせてトークン保存などが必要
      const response = await api.post('/auth/login', { email, password });
      onLoginSuccess();
      navigate('/calendar'); // 2. ログイン成功後にカレンダーへ遷移
    } catch (error) {
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

      {/* 3. onClick={setView} の代わりに Link コンポーネントを使用 */}
      <Link 
        to="/signup" 
        className="mt-8 text-sm text-slate-400 font-bold text-center block w-full"
      >
        アカウントをお持ちでない方はこちら
      </Link>
    </div>
  );
}

export default Login;