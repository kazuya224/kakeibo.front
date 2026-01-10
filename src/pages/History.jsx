import React from 'react';

function History({ transactions, categories, setView }) {
  return (
    <div className="max-w-md mx-auto p-4 bg-slate-50 min-h-screen pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">取引履歴</h2>
        <button onClick={() => setView('calendar')} className="text-sm text-emerald-600">カレンダーへ</button>
      </div>
      
      <div className="space-y-3">
        {[...transactions].reverse().map(t => {
          const cat = categories.find(c => c.category_id === t.category_id);
          return (
            <div key={t.transaction_id} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center">
              <div>
                <div className="text-[10px] text-slate-400">{t.date}</div>
                <div className="font-bold text-slate-700">{cat?.category_name || '未分類'}</div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${cat?.type_flg === '0' ? 'text-red-500' : 'text-blue-500'}`}>
                  {cat?.type_flg === '0' ? '-' : '+'}¥{t.amount.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
        {transactions.length === 0 && <div className="text-center text-slate-400 py-10">履歴がありません</div>}
      </div>
    </div>
  );
}

export default History;