import React, { useMemo, useEffect, useState } from 'react';
import api from '../service/api';
import SummaryCard from '../components/SummaryCard';
import { useNavigate } from 'react-router-dom';

function CalendarView({ currentDate, setCurrentDate, calendarDays, setSelectedDate }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. APIデータの取得 ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/kakeibo');
        setCategories(response.data.categories || []);
        setTransactions(response.data.transactions || []);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. 日ごとの集計計算 ---
  const dailyAggregates = useMemo(() => {
    const aggregates = {};
    transactions.forEach(t => {
      if (!aggregates[t.date]) {
        aggregates[t.date] = { income: 0, expense: 0 };
      }
      const category = categories.find(c => c.category_id === t.category_id);
      // typeが 1 なら収入、0 なら支出 (DBの型に合わせて適宜 String() 等で調整)
      if (String(t.type) === '1') {
        aggregates[t.date].income += t.amount;
      } else {
        aggregates[t.date].expense += t.amount;
      }
    });
    return aggregates;
  }, [transactions, categories]);

  // --- 3. 月間合計の計算 (ここで monthlySummary を定義します) ---
  const monthlySummary = useMemo(() => {
    const summary = { income: 0, expense: 0, balance: 0 };
    Object.values(dailyAggregates).forEach(day => {
      summary.income += day.income;
      summary.expense += day.expense;
    });
    summary.balance = summary.income - summary.expense;
    return summary;
  }, [dailyAggregates]);

  // ローディング中は何も表示しない（またはスピナーなど）
  if (loading) return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>←</button>
        <h1 className="font-bold">{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h1>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>→</button>
      </header>

      {/* ここで定義した monthlySummary を使用 */}
      <SummaryCard summary={monthlySummary} label="今月の収支状況" />

      <div className="grid grid-cols-7 gap-1 bg-white p-2 rounded-3xl shadow-sm">
        {['日', '月', '火', '水', '木', '金', '土'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-300 py-2">{d}</div>
        ))}
        
        {calendarDays.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="h-20"></div>;
          const dayData = dailyAggregates[date] || { income: 0, expense: 0 };

          return (
            <button 
              key={date} 
              onClick={() => {
                setSelectedDate(date); 
                console.log("送るデータ", categories);
                navigate('/form', {
                  state: {
                    categories: categories,
                    transactions: transactions
                  }
                });
              }} 
              className="h-20 border-t p-1 flex flex-col items-start hover:bg-slate-50 transition-colors"
            >
              <span className="text-[10px] font-bold text-slate-400">{date.split('-')[2]}</span>
              <div className="w-full flex flex-col text-[8px] text-right mt-1">
                {dayData.income > 0 && <span className="text-blue-500">+{dayData.income.toLocaleString()}</span>}
                {dayData.expense > 0 && <span className="text-red-500">-{dayData.expense.toLocaleString()}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarView;