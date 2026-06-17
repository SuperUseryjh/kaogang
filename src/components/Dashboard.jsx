import { useApp } from '../context/AppContext';
import { VOCABULARY_DB, TRANSFORMATION_DB } from '../data/vocabulary';
import Announcement from './Announcement';

export default function Dashboard() {
  const { masteredWords, stats, setActiveTab, isDark } = useApp();

  const totalWords = VOCABULARY_DB.length;
  const masteredCount = masteredWords.length;
  const ratio = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
  const accuracy = stats.totalAttempts > 0 ? Math.round((stats.correctAttempts / stats.totalAttempts) * 100) : 0;

  const counts = { noun: 0, verb: 0, adj_adv: 0, phrase: 0 };
  VOCABULARY_DB.forEach(v => {
    if (counts[v.category] !== undefined) counts[v.category]++;
  });

  const categories = [
    { id: 'noun', title: '核心名词突破', desc: '名词不规则复数与核心抽象词', color: 'from-blue-500 to-indigo-500', icon: 'fa-font', num: counts.noun },
    { id: 'verb', title: '高频动词狂背', desc: '重在必考动词搭配与时态变形', color: 'from-purple-500 to-indigo-600', icon: 'fa-running', num: counts.verb },
    { id: 'adj_adv', title: '形容词与副词', desc: '攻克拼写及常考派生修饰词', color: 'from-pink-500 to-rose-500', icon: 'fa-magic', num: counts.adj_adv },
    { id: 'phrase', title: '中考高频短语', desc: '冲刺必背常考介词结构与词组', color: 'from-amber-500 to-orange-500', icon: 'fa-shapes', num: counts.phrase },
    { id: 'transformation', title: '词性转换专项', desc: '句型填空夺分重点，专攻经典派生', color: 'from-emerald-500 to-teal-600', icon: 'fa-sync-alt', num: TRANSFORMATION_DB.length },
  ];

  const handleCardClick = (catId) => {
    if (catId === 'transformation') {
      setActiveTab('transformation');
    } else {
      setActiveTab('flashcard');
    }
  };

  return (
    <div className="tab-content">
      {/* Announcement */}
      <div className="mb-6">
        <Announcement />
      </div>

      {/* Stats Header */}
      <div className="bg-[#001e2b] rounded-xl p-5 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">学习进度总览</h2>
          <span className="text-[10px] text-[#a8b3bc] bg-white/10 px-2.5 py-1 rounded-pill">
            已掌握 {masteredCount}/{totalWords}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 bg-[#00ed64] rounded-full transition-all duration-500"
            style={{ width: `${ratio}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#00ed64]">{ratio}%</p>
            <p className="text-[10px] text-[#a8b3bc]">掌握率</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-2xl font-bold text-white">{accuracy}%</p>
            <p className="text-[10px] text-[#a8b3bc]">正确率</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{stats.totalAttempts}</p>
            <p className="text-[10px] text-[#a8b3bc]">练习次数</p>
          </div>
        </div>
      </div>

      {/* 全数组统计条 */}
      <div className="bg-[#001e2b]/5 dark:bg-[#00ed64]/5 rounded-xl px-4 py-3 mb-6 flex items-center justify-between text-xs text-slate-500 dark:text-[#a8b3bc]">
        <span className="font-medium">词汇总量</span>
        <div className="flex items-center space-x-4">
          <span>名词 <strong className="text-slate-800 dark:text-white">{counts.noun}</strong></span>
          <span>动词 <strong className="text-slate-800 dark:text-white">{counts.verb}</strong></span>
          <span>形/副 <strong className="text-slate-800 dark:text-white">{counts.adj_adv}</strong></span>
          <span>短语 <strong className="text-slate-800 dark:text-white">{counts.phrase}</strong></span>
          <span>转换 <strong className="text-slate-800 dark:text-white">{TRANSFORMATION_DB.length}</strong></span>
        </div>
      </div>

      {/* Category Cards Grid */}
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">选择学习模块</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => {
          const masteredInCat = cat.id !== 'transformation'
            ? VOCABULARY_DB.filter(v => v.category === cat.id && masteredWords.includes(v.word)).length
            : 0;
          const completedText = cat.id === 'transformation'
            ? '专项训练'
            : `已记 ${masteredInCat}/${cat.num}`;

          return (
            <button
              key={cat.id}
              onClick={() => handleCardClick(cat.id)}
              className="bg-white dark:bg-[#0a2a3a] p-5 rounded-xl border border-slate-200 dark:border-[#003d4f] shadow-sm hover:shadow-md dark:hover:border-[#00684a] transition-all cursor-pointer group hover:-translate-y-0.5 flex flex-col justify-between text-left"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-sm`}>
                    <i className={`fas ${cat.icon}`}></i>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-[#a8b3bc] bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-pill">{completedText}</span>
                </div>
                <div className="mt-4">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-[#00ed64] transition-colors">{cat.title}</h4>
                  <p className="text-xs text-slate-400 dark:text-[#a8b3bc] mt-1">{cat.desc}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-white/5 flex items-center justify-between text-xs text-[#00684a] dark:text-[#00ed64] font-bold">
                <span>开始强化</span>
                <i className="fas fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}