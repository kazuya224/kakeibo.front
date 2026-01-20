import React, { useState, useMemo, useEffect } from 'react';
import SummaryCard from '../components/SummaryCard';
import api from '../service/api';
import { useNavigate, useLocation } from 'react-router-dom';

function TransactionForm({ selectedDate, setTransactions, transactions, ...props }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 履歴画面から渡された編集データ
  const editData = location.state?.editData;

  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState('');
  const [typeFlg, setTypeFlg] = useState('0');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. 初期データ（カテゴリ等）の取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await api.get('/kakeibo');
        if (response.data) {
          if (response.data.categories) {
            setCategories(response.data.categories);

            // --- 【編集モードの初期値セット】 ---
            if (editData) {
              setAmount(editData.amount);
              // editDataに対応するカテゴリのtypeを探してセット
              const currentCat = response.data.categories.find(c => c.categoryId === editData.categoryId);
              if (currentCat) {
                setTypeFlg(String(currentCat.type));
                setCategoryId(currentCat.categoryId);
              }
            } else {
              // 新規モード：最初のカテゴリを選択
              const firstCat = response.data.categories.find(c => String(c.type) === typeFlg);
              if (firstCat) setCategoryId(firstCat.categoryId);
            }
          }
          if (response.data.transactions) {
            setTransactions(response.data.transactions);
          }
        }
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      }
    };
    fetchInitialData();
  }, []); // ※ editDataを依存配列に入れない（初回のみセットしたいため）

  // 支出/収入の切り替え（新規作成時のみ自動でカテゴリを選択）
  useEffect(() => {
    if (!editData) {
      const firstCat = categories.find(c => String(c.type) === typeFlg);
      if (firstCat) setCategoryId(firstCat.categoryId);
    }
  }, [typeFlg, categories, editData]);

  // サマリー計算はそのまま
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

  // --- 送信処理（新規・更新の分岐） ---
  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    if (!amount || !categoryId || isSubmitting) return;

    setIsSubmitting(true);

    // 送信データ
    const requestBody = {
      categoryId: categoryId,
      date: selectedDate,
      amount: parseInt(amount, 10),
      type: typeFlg
    };

    try {
      let response;
      if (editData) {
        // 【更新】PUT
        response = await api.put(`/transaction/${editData.transactionId}`, requestBody);
      } else {
        // 【新規】POST
        response = await api.post('/transaction', requestBody);
      }

      if (response.data.responseStatus === 'success' || response.data.response_status === 'success') {

        if (editData) {
          // ★重要：既存の transactions リストの中の、該当データだけを新しい内容で差し替える
          setTransactions(prev => prev.map(t =>
            t.transactionId === editData.transactionId
              ? { ...t, ...requestBody, amount: Number(amount) } // 更新データで上書き
              : t
          ));
          alert('✅ 更新しました'); // 簡易的な演出
        } else {
          // 新規登録時の処理（既存通り）
          const newTransaction = {
            transactionId: response.data.transactionId,
            ...requestBody
          };
          setTransactions(prev => [...prev, newTransaction]);
          alert('✅ 保存しました');
        }

        // 履歴画面に戻る
        navigate('/history');
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
        <button onClick={() => navigate(-1)} className="text-emerald-600 font-bold">← 戻る</button>
        <h1 className="font-bold text-slate-700">{editData ? '履歴の編集' : '収支の入力'}</h1>
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