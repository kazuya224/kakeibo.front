import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

function History({ selectedDate, transactions, categories, onDelete }) {
  const navigate = useNavigate();

  // 編集ボタン：既存のデータを state としてフォームに送る
  const handleEdit = (t) => {
    navigate('/form', { state: { editData: t } });
  };

  // 削除ボタン：App.js の関数を呼び出す
  const handleDelete = (id) => {
    if (window.confirm('この履歴を削除しますか？')) {
      onDelete(id);
    }
  };
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
            /* 1. カード全体の親要素 */
            <div key={t.transactionId} className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-3">

              {/* 2. 上段：カテゴリ名と金額の表示（既存の処理） */}
              <div className="flex justify-between items-center">
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

              {/* 3. 下段：編集・削除ボタン（ここを内側に入れる） */}
              <div className="flex justify-end gap-4 pt-2 border-t border-slate-50">
                <button
                  onClick={() => handleEdit(t)}
                  className="text-xs text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(t.transactionId)}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  削除
                </button>
              </div>

            </div> /* ここでカードの閉じタグ */
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