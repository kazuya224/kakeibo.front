import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../service/api';

function CategorySettings({ categories, setCategories }) {
  const { type } = useParams();
  const navigate = useNavigate();
  const currentType = type || '0';

  // --- モーダル・編集用ステート ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState(null); // 編集対象のオブジェクト
  const [editName, setEditName] = useState('');

  const [newName, setNewName] = useState('');

  // 1. カテゴリ一覧の取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/category');
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('カテゴリ取得エラー:', error);
      }
    };
    fetchCategories();
  }, [setCategories]);

  // 2. 編集ボタン押下時（ポップアップを開く）
  const openEditModal = (cat) => {
    setTargetCategory(cat);
    setEditName(cat.name);
    setIsModalOpen(true);
  };

  // 3. 保存ボタン押下時（API実行）
  const handleSave = async () => {
    if (!editName.trim()) return;

    try {
      // 送信する ID が UUID 形式であることを確認してください
      // もし targetCategory.categoryId が数値（1768...）ならここでエラーになります
      await api.put(`/category/${targetCategory.categoryId}`, {
        category_name: editName,
        type_flg: currentType
      });

      // ステートの更新
      setCategories(prev => prev.map(c =>
        // 比較する ID も型や値が一致している必要があります
        c.categoryId === targetCategory.categoryId ? { ...c, name: editName } : c
      ));

      setIsModalOpen(false);
      alert('更新しました');
    } catch (error) {
      console.error('更新エラー:', error);
      // エラー詳細を確認するためのログ
      if (error.response) {
        console.error('サーバーからのレスポンス:', error.response.data);
      }
      alert('更新に失敗しました。ID形式が正しくない可能性があります。');
    }
  };

  // 4. 削除処理
  const handleDelete = async (id) => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await api.delete(`/category/${id}`);
      setCategories(prev => prev.filter(c => c.categoryId !== id));
    } catch (error) {
      console.error('削除エラー:', error);
    }
  };

  // 5. 追加処理
  const handleAdd = async () => {
    if (!newName.trim()) return;

    try {
      const response = await api.post('/category', {
        category_name: newName,
        type_flg: currentType
      });
      console.log("レスポンス", response);

      // 仕様書通り、スネークケースでデータが返ってくる
      const { category_id, category_name, type_flg } = response.data;

      const newCategory = {
        categoryId: category_id,   // フロントで使うキー名に変換
        name: category_name,
        type: type_flg
      };

      setCategories(prev => [...prev, newCategory]);
      setNewName('');
      alert('追加しました');
    } catch (error) {
      console.error('追加エラー:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white min-h-screen relative">
      <button onClick={() => navigate('/form')} className="text-emerald-600 font-bold mb-4 flex items-center">
        ← 戻る
      </button>

      <h2 className="text-xl font-bold mb-6">カテゴリ編集 ({currentType === '0' ? '支出' : '収入'})</h2>

      {/* --- 新規追加フォーム --- */}
      <div className="mb-8 p-4 bg-emerald-50 rounded-2xl">
        <h3 className="text-sm font-bold text-emerald-700 mb-2">新規カテゴリ追加</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="カテゴリ名を入力"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 border-none rounded-lg p-2 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleAdd}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-md active:scale-95 transition-transform"
          >
            追加
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {categories
          .filter(c => String(c.type) === currentType)
          .map(cat => (
            <div key={cat.categoryId} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="font-bold text-gray-700">{cat.name}</span>
              <div className="space-x-4">
                <button onClick={() => openEditModal(cat)} className="text-xs text-slate-400">編集</button>
                <button onClick={() => handleDelete(cat.categoryId)} className="text-xs text-red-400">削除</button>
              </div>
            </div>
          ))}
      </div>

      {/* --- 編集ポップアップ（モーダル） --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-4">カテゴリ名を編集</h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-lg p-3 mb-6 outline-none focus:border-emerald-500 transition-colors"
              autoFocus
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-500"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-200"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default CategorySettings;