import React from 'react';

function CategorySettings({ view, setView, categories, setCategories }) {
if (view === 'category_settings') {
    return (
      <div className="max-w-md mx-auto p-4 bg-white min-h-screen">
        <button onClick={() => setView('form')} className="text-emerald-600 font-bold mb-4 flex items-center">← 戻る</button>
        <h2 className="text-xl font-bold mb-6">カテゴリ編集 ({typeFlg === '0' ? '支出' : '収入'})</h2>
        <div className="space-y-3">
          {categories.filter(c => c.type_flg === typeFlg).map(cat => (
            <div key={cat.category_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              {editingId === cat.category_id ? (
                <input value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={() => handleSaveCategoryEdit(cat.category_id)} className="border-b border-emerald-500 bg-transparent outline-none flex-1 mr-4" autoFocus />
              ) : (
                <span className="font-bold text-gray-700">{cat.category_name}</span>
              )}
              <div className="space-x-4">
                <button onClick={() => {setEditingId(cat.category_id); setEditName(cat.category_name);}} className="text-xs text-slate-400">編集</button>
                <button onClick={() => handleDeleteCategory(cat.category_id)} className="text-xs text-red-400">削除</button>
              </div>
            </div>
          ))}
          <button onClick={handleAddCategory} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold">+ 追加</button>
        </div>
      </div>
    );
  }
}

export default CategorySettings;