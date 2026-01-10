import React from 'react';
import SummaryCard from '../components/SummaryCard';

function CalendarView({ currentDate, setCurrentDate, calendarDays, transactions, categories, monthlySummary, setSelectedDate, setView }) {
  return (
    <div className="max-w-md mx-auto p-4">
      <header className="flex justify-between items-center mb-4">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>←</button>
        <h1 className="font-bold">{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</h1>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>→</button>
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
            <div key={date} onClick={() => {setSelectedDate(date); setView('form');}} className="h-20 border-t p-1 cursor-pointer hover:bg-slate-50">
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
export default CalendarView;