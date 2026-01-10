import React from 'react';

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

export default SummaryCard;