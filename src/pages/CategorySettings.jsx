import React, { useState, useEffect } from 'react'; // useEffectを追加
import { useParams, useNavigate } from 'react-router-dom';
import api from '../service/api';

function CategorySettings({ categories, setCategories }) {
  const { type } = useParams();
  const navigate = useNavigate();
  const currentType = type || '0';

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  // --- 【追加】初期表示時にカテゴリ一覧を取得 ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/category');
        // ログに基づき、response.data.categories をセット
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('カテゴリ取得エラー:', error);
      }
    };
    fetchCategories();
  }, [setCategories]);

  // カテゴリ追加
  const handleAddCategory = async () => {
    const newCategoryName = window.prompt('新しいカテゴリ名を入力してください');
    if (!newCategoryName || newCategoryName.trim() === '') return;

    try {
      const requestBody = {
        category_name: newCategoryName,
        type_flg: currentType
      };

      const response = await api.post('/category', requestBody);
      // 追加後のレスポンスも形式を合わせる必要があるかもしれません
      setCategories(prev => [...prev, response.data]);
      alert('カテゴリを追加しました');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('エラーが発生しました。');
    }
  };

  // カテゴリ編集・削除も同様に api.put / api.delete を呼ぶ形に拡張可能です

  return (
    <div className="max-w-md mx-auto p-4 bg-white min-h-screen">
      <button onClick={() => navigate('/form')} className="text-emerald-600 font-bold mb-4 flex items-center">
        ← 戻る
      </button>

      <h2 className="text-xl font-bold mb-6">
        カテゴリ編集 ({currentType === '0' ? '支出' : '収入'})
      </h2>

      <div className="space-y-3">
        {categories
          /* ログに合わせて c.type を参照 */
          .filter(c => String(c.type) === currentType)
          .map(cat => (
            /* ログに合わせて cat.categoryId を参照 */
            <div key={cat.categoryId} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              {editingId === cat.categoryId ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => setEditingId(null)}
                  className="border-b border-emerald-500 bg-transparent outline-none flex-1 mr-4"
                  autoFocus
                />
              ) : (
                /* ログに合わせて cat.name を参照 */
                <span className="font-bold text-gray-700">{cat.name}</span>
              )}

              <div className="space-x-4">
                <button
                  onClick={() => { setEditingId(cat.categoryId); setEditName(cat.name); }}
                  className="text-xs text-slate-400"
                >
                  編集
                </button>
                <button
                  className="text-xs text-red-400"
                  onClick={() => {/* 削除処理 */ }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}

        <button onClick={handleAddCategory} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold">
          + 追加
        </button>
      </div>
    </div>
  );
}

export default CategorySettings;