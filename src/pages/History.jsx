import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

function History({ selectedDate, transactions, categories }) {
  const navigate = useNavigate();

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, cat) => {
      const id = cat.categoryId || cat.category_id;
      acc[id] = cat;
      return acc;
    }, {});
  }, [categories]);

  const dailyTransactions = useMemo(() => {
    if (!selectedDate) return [];
    return transactions.filter(t => t.date === selectedDate);
  }, [transactions, selectedDate]);

  // 入力画面へ遷移するハンドラー
  const handleAddClick = () => {
    navigate('/form');
  };

  if (!selectedDate) {
    return <div className="p-10 text-center text-slate-400">日付を選択してください</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-50 min-h-screen pb-32">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {selectedDate.replace(/-/g, '/')} の履歴
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {dailyTransactions.length} 件の取引
          </p>
        </div>
        {/* 右上の追加ボタン */}
        <button
          onClick={handleAddClick}
          className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <span className="text-2xl leading-none">+</span>
        </button>
      </header>

      <div className="space-y-3">
        {dailyTransactions.map((t) => {
          const cat = categoryMap[t.categoryId];
          const isExpense = String(t.type || cat?.type) === '0';

          return (
            <div key={t.transactionId} className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-bold text-slate-700">
                  {t.categoryName || cat?.name || '未分類'}
                </span>
                {t.memo && <span className="text-[10px] text-slate-400">{t.memo}</span>}
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${isExpense ? 'text-red-500' : 'text-blue-500'}`}>
                  {isExpense ? '-' : '+'}¥{Number(t.amount).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}

        {dailyTransactions.length === 0 && (
          <div className="text-center text-slate-400 py-16 bg-white rounded-2xl border-2 border-dashed">
            この日の履歴はありません
          </div>
        )}
      </div>

      {/* 画面下部に固定する大きな追加ボタン（オプション） */}
      <div className="fixed bottom-24 left-0 right-0 flex justify-center px-4 max-w-md mx-auto">
        <button
          onClick={handleAddClick}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl active:bg-emerald-700 transition-colors"
        >
          この日に収支を追加する
        </button>
      </div>
    </div>
  );
}

export default History;