import React, { useState, useMemo, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import api from '../service/api';
import { useNavigate, useLocation } from 'react-router-dom';

function TransactionForm({ selectedDate, setTransactions }) {
  const navigate = useNavigate();
  const location = useLocation();

  // APIから取得したデータを管理
  const [categories, setCategories] = useState([]);
  // transactionsはlocation.stateにない場合、空配列を初期値にする
  const transactions = location.state?.transactions || [];

  const [amount, setAmount] = useState('');
  const [typeFlg, setTypeFlg] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 【修正】初期表示時に /kakeibo からデータを取得 ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 設計書に基づき GET /kakeibo を実行
        const response = await api.get('/kakeibo');
        console.log("レスポンス", response);

        // 設計書のレスポンス形式: { categories: [...], transactions: [...] }
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);

          // 取得後、現在のtypeFlg(0:支出)に合う最初のカテゴリをデフォルト選択
          const firstCat = response.data.categories.find(c => String(c.type) === typeFlg);
          if (firstCat) setCategoryId(firstCat.categoryId);
        }
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      }
    };
    fetchInitialData();
  }, []); // 画面表示時に1回実行

  // 支出/収入の切り替え時に、選択中のカテゴリをその種別のものにリセット
  useEffect(() => {
    const firstCat = categories.find(c => String(c.type) === typeFlg);
    if (firstCat) setCategoryId(firstCat.categoryId);
  }, [typeFlg, categories]);

  // 日別サマリー計算 (categoriesとtransactionsの両方が揃ってから計算)
  const dailySummary = useMemo(() => {
    const dayTrans = transactions.filter(t => t.date === selectedDate);

    const calculateTotal = (targetType) => {
      return dayTrans
        .filter(t => {
          const cat = categories.find(c => c.categoryId === t.categoryId);
          return String(cat?.type) === targetType;
        })
        .reduce((s, t) => s + Number(t.amount || 0), 0);
    };

    const income = calculateTotal('1');
    const expense = calculateTotal('0');

    return { income, expense, balance: income - expense };
  }, [transactions, categories, selectedDate]);

  // --- 送信処理 ---
  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !categoryId || isSubmitting) return;

    setIsSubmitting(true);

    const requestBody = {
      categoryId: categoryId,
      date: selectedDate,
      amount: parseInt(amount, 10)
    };

    try {
      const response = await api.post('/transaction', requestBody);
      const data = response.data;

      if (data.response_status === 'success') {
        // App.js 側の transactions 状態を更新
        const newTransaction = {
          transaction_id: data.transaction_id,
          categoryId: data.categoryId,
          date: data.date,
          amount: data.amount
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
        <button onClick={() => navigate(`/settings/${typeFlg}`)} className="text-xs bg-white border px-3 py-1 rounded-full text-slate-500">カテゴリ設定</button>
      </div>

      <SummaryCard summary={dailySummary} label={`${selectedDate} の合計`} />

      <form onSubmit={handleSubmitTransaction} className="bg-white p-6 rounded-2xl shadow-sm space-y-6 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['0', '1'].map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setTypeFlg(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${typeFlg === f
                ? `bg-white shadow ${f === '0' ? 'text-red-500' : 'text-blue-500'}`
                : 'text-gray-400'
                }`}
            >
              {f === '0' ? '支出' : '収入'}
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
            .filter(c => String(c.type) === typeFlg)
            .map(c => (
              <option key={c.categoryId} value={c.categoryId}>
                {c.name}
              </option>
            ))
          }
        </select>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition ${isSubmitting ? 'bg-slate-300' : (typeFlg === '0' ? 'bg-red-500' : 'bg-blue-500')
            }`}
        >
          {isSubmitting ? '送信中...' : '保存'}
        </button>
      </form>
    </div>
  );
}

export default TransactionForm;