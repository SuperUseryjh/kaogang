import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSpeech } from '../hooks/useSpeech';
import { VOCABULARY_DB, CATEGORY_MAP } from '../data/vocabulary';

export default function WordList() {
  const { masteredWords } = useApp();
  const { speak } = useSpeech();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredList = useMemo(() => {
    let list = filter === 'all' ? [...VOCABULARY_DB] : VOCABULARY_DB.filter(v => v.category === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(v =>
        v.word.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q) ||
        v.example.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, search]);

  const totalWords = VOCABULARY_DB.length;
  const masteredCount = masteredWords.length;
  const ratio = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

  return (
    <div className="tab-content">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">词汇检索</h2>

      {/* Stats bar */}
      <div className="bg-[#001e2b]/5 dark:bg-[#00ed64]/5 rounded-xl px-4 py-3 mb-4 flex items-center justify-between text-xs text-slate-500 dark:text-[#a8b3bc]">
        <span>共 <strong className="text-slate-800 dark:text-white">{VOCABULARY_DB.length}</strong> 词</span>
        <span>已掌握 <strong className="text-[#00ed64]">{masteredCount}</strong> ({ratio}%)</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-[#003d4f] bg-white dark:bg-[#0a2a3a] text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00ed64]"
        >
          <option value="all">全部词汇</option>
          <option value="noun">核心名词</option>
          <option value="verb">高频动词</option>
          <option value="adj_adv">形容词与副词</option>
          <option value="phrase">高频短语</option>
        </select>
        <div className="relative flex-1">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索单词、释义或例句..."
            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-[#003d4f] bg-white dark:bg-[#0a2a3a] text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00ed64]"
          />
        </div>
      </div>

      {/* Word count */}
      <p className="text-xs text-slate-400 dark:text-[#a8b3bc] mb-3">
        显示 {filteredList.length} 个结果
      </p>

      {/* Word cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredList.map((item, idx) => {
          const isMastered = masteredWords.includes(item.word);
          return (
            <div
              key={idx}
              className={`bg-white dark:bg-[#0a2a3a] rounded-xl border ${
                isMastered
                  ? 'border-[#00ed64]/30 dark:border-[#00ed64]/20'
                  : 'border-slate-200 dark:border-[#003d4f]'
              } p-4 hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {item.pos === 'n.' ? '名词' : item.pos === 'v.' ? '动词' : item.pos === 'adj.' || item.pos === 'adv.' ? '形/副' : '短语'}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 dark:text-[#a8b3bc]">{CATEGORY_MAP[item.category]}</span>
                </div>
                {isMastered && (
                  <span className="text-[9px] font-bold text-[#00ed64] bg-[#00ed64]/10 px-1.5 py-0.5 rounded-full">
                    <i className="fas fa-check"></i>
                  </span>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white flex items-center justify-between">
                <span>{item.word}</span>
                <button onClick={() => speak(item.word)} className="text-slate-400 hover:text-[#00ed64] text-xs p-1" title="发音">
                  <i className="fas fa-volume-up"></i>
                </button>
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">{item.meaning}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed italic border-l-2 border-slate-150 dark:border-slate-800 pl-2">{item.example}</p>
              {item.tip && (
                <p className="text-[10px] text-slate-400 dark:text-[#7c8c9a] mt-2 leading-relaxed">💡 {item.tip}</p>
              )}
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 dark:text-[#a8b3bc] text-sm">未找到匹配的词汇</p>
        </div>
      )}
    </div>
  );
}