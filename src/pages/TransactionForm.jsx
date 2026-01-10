import React from 'react';
import SummaryCard from '../components/SummaryCard';

function TransactionForm({ view, setView, selectedDate, transactions, categories, setTransactions }) {
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
}

export default TransactionForm;