import React, { useState, useMemo, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import api from '../service/api';
import { useNavigate, useLocation } from 'react-router-dom';

function TransactionForm({ selectedDate, setTransactions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const categories = location.state?.categories || [];
  const transactions = location.state?.transactions || [];
  const [amount, setAmount] = useState('');
  const [typeFlg, setTypeFlg] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  // ローディング状態を管理（二重送信防止）
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dailySummary = useMemo(() => {
    const dayTrans = transactions.filter(t => t.date === selectedDate);
    const income = dayTrans
      .filter(t => categories.find(c => c.category_id === t.category_id)?.type_flg === '1')
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = dayTrans
      .filter(t => categories.find(c => c.category_id === t.category_id)?.type_flg === '0')
      .reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [transactions, categories, selectedDate]);

  useEffect(() => {
    const firstCat = categories.find(c => c.type === typeFlg);
    if (firstCat) setCategoryId(firstCat.categoryId);
  }, [typeFlg, categories]);

  // --- API送信処理 ---
  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !categoryId || isSubmitting) return;

    setIsSubmitting(true);

    const requestBody = {
      categoryId: categoryId,
      date: selectedDate,
      amount: parseInt(amount, 10),
      type: typeFlg // '0' or '1'
    };

    try {
      console.log("リクエスト", requestBody);
      // api.post は Axios インスタンスと推測
      const response = await api.post('/transaction', requestBody);
      console.log("レスポンス", response);

      // Axiosの場合、response.data にサーバーからのレスポンスが入っています
      const data = response.data; 

      // Axiosはステータス200系以外は catch に飛ぶので、ここは成功時の処理だけでOK
      if (data.responseStatus === 'success') { // response_status ではなく camelCase に注意
        const newTransaction = {
          id: data.transactionId,
          date: data.date,
          amount: data.amount,
          category_id: data.categoryId
        };

        setTransactions(prev => [...prev, newTransaction]);
        navigate('/calendar'); 
      }
    } catch (error) {
      console.error('Error:', error);
      alert('保存中にエラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigate('/')} className="text-emerald-600 font-bold" disabled={isSubmitting}>← 戻る</button>
        <button onClick={() => navigate('/settings')} className="text-xs bg-white border px-3 py-1 rounded-full text-slate-500">カテゴリ設定</button>
      </div>

      <SummaryCard summary={dailySummary} label={`${selectedDate} の合計`} />

      <form onSubmit={handleSubmitTransaction} className="bg-white p-6 rounded-2xl shadow-sm space-y-6 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['0', '1'].map(f => (
            <button 
              key={f} 
              type="button" 
              onClick={() => setTypeFlg(f)} 
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                typeFlg === f 
                  ? `bg-white shadow ${f === '0' ? 'text-red-500' : 'text-blue-500'}` 
                  : 'text-gray-400'
              }`}
            >
              {f === '0' ? '収入' : '支出'}
            </button>
          ))}
        </div>

        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          className="w-full border-b-2 p-2 text-2xl font-bold outline-none" 
          placeholder="¥ 0" 
          disabled={isSubmitting}
        />

        <select 
          value={categoryId} 
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full bg-slate-50 p-3 rounded-xl outline-none font-medium"
          disabled={isSubmitting}
        >
          {categories
            .filter(c => c.type === typeFlg) // type_flg ではなく type
            .map(c => (
              <option key={c.categoryId} value={c.categoryId}> {/* category_id ではなく categoryId */}
                {c.name} {/* category_name ではなく name */}
              </option>
            ))
          }
        </select>

        <button 
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition ${
            isSubmitting ? 'bg-slate-300' : (typeFlg === '0' ? 'bg-red-500' : 'bg-blue-500')
          }`}
        >
          {isSubmitting ? '送信中...' : '保存'}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;