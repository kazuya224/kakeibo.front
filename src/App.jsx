import React, { useState, useMemo } from 'react';

function App() {
  // --- 1. 状態管理 ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('calendar'); // 'calendar', 'form', 'category_settings'
  const [selectedDate, setSelectedDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [typeFlg, setTypeFlg] = useState('0'); // '0':支出, '1':収入
  const [categoryId, setCategoryId] = useState('1');
  
  // カテゴリをStateで管理
  const [categories, setCategories] = useState([
    { category_id: '1', category_name: '食費', type_flg: '0' },
    { category_id: '2', category_name: '交通費', type_flg: '0' },
    { category_id: '3', category_name: '給与', type_flg: '1' },
    { category_id: '4', category_name: '趣味', type_flg: '0' },
    { category_id: '5', category_name: '臨時収入', type_flg: '1' },
  ]);

  // カテゴリ編集用
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // --- 2. 計算ロジック (Hooksは常にトップレベル) ---
  const monthlySummary = useMemo(() => {
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyTrans = transactions.filter(t => t.date.startsWith(yearMonth));
    const income = monthlyTrans.filter(t => categories.find(c => c.category_id === t.transaction_category_id || c.category_id === t.category_id)?.type_flg === '1').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthlyTrans.filter(t => categories.find(c => c.category_id === t.transaction_category_id || c.category_id === t.category_id)?.type_flg === '0').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions, currentDate, categories]);

  const dailySummary = useMemo(() => {
    const dailyTrans = transactions.filter(t => t.date === selectedDate);
    const income = dailyTrans.filter(t => categories.find(c => c.category_id === t.category_id)?.type_flg === '1').reduce((sum, t) => sum + t.amount, 0);
    const expense = dailyTrans.filter(t => categories.find(c => c.category_id === t.category_id)?.type_flg === '0').reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions, selectedDate, categories]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= lastDate; i++) {
      days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
    }
    return days;
  }, [currentDate]);

  // --- 3. ハンドラー関数 ---
  const handleTypeChange = (newType) => {
    setTypeFlg(newType);
    const firstAvailable = categories.find(c => c.type_flg === newType);
    if (firstAvailable) setCategoryId(firstAvailable.category_id);
  };

  const handleAddCategory = () => {
    const name = prompt("新しいカテゴリ名を入力してください");
    if (!name) return;
    setCategories([...categories, { category_id: Date.now().toString(), category_name: name, type_flg: typeFlg }]);
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm("このカテゴリを削除しますか？")) {
      setCategories(categories.filter(c => c.category_id !== id));
    }
  };

  const handleSaveCategoryEdit = (id) => {
    setCategories(categories.map(c => c.category_id === id ? { ...c, category_name: editName } : c));
    setEditingId(null);
  };

  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    if (!amount) return;
    setTransactions([...transactions, { transaction_id: Date.now(), date: selectedDate, amount: Number(amount), category_id: categoryId }]);
    setAmount('');
    setView('calendar');
  };

  // --- 4. 共通コンポーネント ---
  const SummaryCard = ({ summary, label }) => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-4">
      <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">{label}</div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div><div className="text-slate-400">収入</div><div className="font-bold text-blue-500">¥{summary.income.toLocaleString()}</div></div>
        <div><div className="text-slate-400">支出</div><div className="font-bold text-red-500">¥{summary.expense.toLocaleString()}</div></div>
        <div><div className="text-slate-400">収支</div><div className={`font-bold ${summary.balance >= 0 ? 'text-slate-700' : 'text-red-600'}`}>{summary.balance >= 0 && '+'}¥{summary.balance.toLocaleString()}</div></div>
      </div>
    </div>
  );

  // --- 5. レンダリング条件分岐 ---

  // A. カテゴリ設定画面
  if (view === 'category_settings') {
    return (
      <div className="max-w-md mx-auto p-4 bg-white min-h-screen">
        <button onClick={() => setView('form')} className="text-emerald-600 font-bold mb-4 flex items-center">← 戻る</button>
        <h2 className="text-xl font-bold mb-6">カテゴリ編集 ({typeFlg === '0' ? '支出' : '収入'})</h2>
        <div className="space-y-3">
          {categories.filter(c => c.type_flg === typeFlg).map(cat => (
            <div key={cat.category_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              {editingId === cat.category_id ? (
                <input value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={() => handleSaveCategoryEdit(cat.category_id)} className="border-b border-emerald-500 bg-transparent outline-none flex-1 mr-4" autoFocus />
              ) : (
                <span className="font-bold text-gray-700">{cat.category_name}</span>
              )}
              <div className="space-x-4">
                <button onClick={() => {setEditingId(cat.category_id); setEditName(cat.category_name);}} className="text-xs text-slate-400">編集</button>
                <button onClick={() => handleDeleteCategory(cat.category_id)} className="text-xs text-red-400">削除</button>
              </div>
            </div>
          ))}
          <button onClick={handleAddCategory} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold">+ 追加</button>
        </div>
      </div>
    );
  }

  // B. 入力フォーム画面
  if (view === 'form') {
    return (
      <div className="max-w-md mx-auto p-4 bg-slate-50 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setView('calendar')} className="text-emerald-600 font-bold">← 戻る</button>
          <button onClick={() => setView('category_settings')} className="text-xs bg-white border px-3 py-1 rounded-full text-slate-500">カテゴリ設定</button>
        </div>
        <SummaryCard summary={dailySummary} label={`${selectedDate} の合計`} />
        <form onSubmit={handleSubmitTransaction} className="bg-white p-6 rounded-2xl shadow-sm space-y-6 mb-6">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['0', '1'].map(f => (
              <button key={f} type="button" onClick={() => handleTypeChange(f)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${typeFlg === f ? `bg-white shadow ${f === '0' ? 'text-red-500' : 'text-blue-500'}` : 'text-gray-400'}`}>
                {f === '0' ? '支出' : '収入'}
              </button>
            ))}
          </div>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border-b-2 p-2 text-2xl font-bold outline-none" placeholder="¥ 0" autoFocus />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl outline-none font-medium">
            {categories.filter(c => c.type_flg === typeFlg).map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
          <button className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg ${typeFlg === '0' ? 'bg-red-500' : 'bg-blue-500'}`}>保存</button>
        </form>
      </div>
    );
  }

  // C. カレンダー画面
  return (
    <div className="max-w-md mx-auto p-4 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 text-slate-300">←</button>
        <h1 className="font-bold text-slate-800">{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h1>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 text-slate-300">→</button>
      </header>
      <SummaryCard summary={monthlySummary} label="今月の収支状況" />
      <div className="grid grid-cols-7 gap-1 bg-white p-2 rounded-3xl shadow-sm">
        {['日', '月', '火', '水', '木', '金', '土'].map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-300 py-2">{d}</div>)}
        {calendarDays.map((date, idx) => {
          if (!date) return <div key={idx} className="h-20"></div>;
          const dayTrans = transactions.filter(t => t.date === date);
          const inc = dayTrans.filter(t => categories.find(c => c.category_id === t.category_id)?.type_flg === '1').reduce((s, t) => s + t.amount, 0);
          const exp = dayTrans.filter(t => categories.find(c => c.category_id === t.category_id)?.type_flg === '0').reduce((s, t) => s + t.amount, 0);
          return (
            <div key={date} onClick={() => {setSelectedDate(date); setView('form');}} className="h-20 border-t border-slate-50 p-1 cursor-pointer hover:bg-slate-50 transition">
              <span className="text-[10px] font-bold text-slate-400">{date.split('-')[2]}</span>
              <div className="flex flex-col text-[8px] text-right">
                {inc > 0 && <span className="text-blue-500">+{inc.toLocaleString()}</span>}
                {exp > 0 && <span className="text-red-500">-{exp.toLocaleString()}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;