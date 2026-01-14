import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import CalendarView from './pages/CalendarView';
import TransactionForm from './pages/TransactionForm';
import CategorySettings from './pages/CategorySettings';
import History from './pages/History';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [typeFlg, setTypeFlg] = useState('0'); 
  const [categoryId, setCategoryId] = useState('1');
  const [categories, setCategories] = useState([
    { category_id: '1', category_name: '食費', type_flg: '0' },
    { category_id: '2', category_name: '交通費', type_flg: '0' },
    { category_id: '3', category_name: '給与', type_flg: '1' },
    { category_id: '4', category_name: '趣味', type_flg: '0' },
    { category_id: '5', category_name: '臨時収入', type_flg: '1' },
  ]);

  // --- 計算ロジック (useMemo) はそのまま ---
  const monthlySummary = useMemo(() => {
    const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyTrans = transactions.filter(t => t.date.startsWith(yearMonth));
    const income = monthlyTrans.filter(t => categories.find(c => c.category_id === t.category_id)?.type_flg === '1').reduce((sum, t) => sum + t.amount, 0);
    const expense = monthlyTrans.filter(t => categories.find(c => c.category_id === t.category_id)?.type_flg === '0').reduce((sum, t) => sum + t.amount, 0);
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

  const handleTypeChange = (newType) => {
    setTypeFlg(newType);
    const firstAvailable = categories.find(c => c.type_flg === newType);
    if (firstAvailable) setCategoryId(firstAvailable.category_id);
  };

  const handleSubmitTransaction = (e) => {
    e.preventDefault();
    if (!amount) return;
    setTransactions([...transactions, { transaction_id: Date.now(), date: selectedDate, amount: Number(amount), category_id: categoryId }]);
    setAmount('');
    // ここで遷移させる場合は useNavigate を使う（後述）
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 pb-20">
        <Routes>
          {/* 未ログイン時のルート */}
          {!isLoggedIn ? (
            <>
              <Route path="/login" element={<Login onLoginSuccess={() => setIsLoggedIn(true)} />} />
              <Route path="/signup" element={<Signup onSignupSuccess={() => setIsLoggedIn(true)} />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              {/* ログイン後のルート */}
              <Route path="/calendar" element={
                <CalendarView 
                  currentDate={currentDate} setCurrentDate={setCurrentDate}
                  calendarDays={calendarDays} transactions={transactions}
                  categories={categories} monthlySummary={monthlySummary}
                  setSelectedDate={setSelectedDate}
                />
              } />
              <Route path="/form" element={
                <TransactionForm 
                  selectedDate={selectedDate} dailySummary={dailySummary}
                  typeFlg={typeFlg} handleTypeChange={handleTypeChange}
                  amount={amount} setAmount={setAmount}
                  categoryId={categoryId} setCategoryId={setCategoryId}
                  categories={categories} handleSubmitTransaction={handleSubmitTransaction}
                />
              } />
              <Route path="/history" element={<History transactions={transactions} categories={categories} />} />
              <Route path="/settings" element={<CategorySettings categories={categories} setCategories={setCategories} typeFlg={typeFlg} />} />
              <Route path="/" element={<Navigate to="/calendar" />} />
            </>
          )}
        </Routes>

        {/* ログイン時のみメニューを表示 */}
        {isLoggedIn && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 max-w-md mx-auto">
            <Link to="/calendar" className="text-emerald-600 font-bold">カレンダー</Link>
            <Link to="/history" className="text-slate-400">履歴</Link>
          </nav>
        )}
      </div>
    </Router>
  );
}

export default App;