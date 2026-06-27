import { useApp } from '../context/AppContext';
import { useSound } from '../hooks/useSound';
import { useSpeech } from '../hooks/useSpeech';

const TABS = [
  { id: 'dashboard', icon: 'fa-chart-pie', label: '学习面板' },
  { id: 'flashcard', icon: 'fa-clone', label: '词卡速记' },
  { id: 'cnoten', icon: 'fa-language', label: '中文默英文' },
  { id: 'dictation', icon: 'fa-keyboard', label: '英默中' },
  { id: 'transformation', icon: 'fa-exchange-alt', label: '词性转换' },
  { id: 'mistakes', icon: 'fa-exclamation-triangle', label: '错题强化' },
  { id: 'wordlist', icon: 'fa-list-ul', label: '词汇检索' },
];

export default function Layout({ children }) {
  const { activeTab, setActiveTab, isMuted, toggleMute, isDark, toggleTheme, mistakes } = useApp();
  const { playSound } = useSound();

  const handleTabChange = (tabId) => {
    playSound('click');
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f9fbfa] dark:bg-[#001e2b] flex">
      {/* ========== 左侧桌面侧边导航 ========== */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white dark:bg-[#0a2a3a] border-r border-slate-200 dark:border-[#003d4f] h-screen sticky top-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-[#003d4f]">
          <div className="flex items-center space-x-3">
            <img src="./icon.png" alt="Logo" className="w-9 h-9 rounded-lg" />
            <div>
              <h1 className="text-sm font-bold text-[#001e2b] dark:text-white leading-tight">中考词汇</h1>
              <p className="text-[10px] text-slate-400 dark:text-[#a8b3bc]">背默通关神器</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-pill transition-all font-medium text-sm relative ${
                activeTab === tab.id
                  ? 'bg-[#00ed64] text-[#001e2b]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <i className={`fas ${tab.icon} text-sm w-5 text-center`}></i>
              <span>{tab.label}</span>
              {tab.id === 'mistakes' && mistakes.length > 0 && activeTab !== 'mistakes' && (
                <span className="absolute right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-pill">{mistakes.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-3 border-t border-slate-100 dark:border-[#003d4f] space-y-1">
          <button onClick={toggleTheme} className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-pill transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 text-sm">
            <i className={`fas ${isDark ? 'fa-sun text-amber-400' : 'fa-moon text-slate-500'} text-sm w-5 text-center`}></i>
            <span>{isDark ? '亮色模式' : '暗色模式'}</span>
          </button>
          <button onClick={toggleMute} className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-pill transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 text-sm">
            <i className={`fas ${isMuted ? 'fa-volume-mute text-rose-400' : 'fa-volume-up text-[#00ed64]'} text-sm w-5 text-center`}></i>
            <span>{isMuted ? '音效已关' : '音效已开'}</span>
          </button>
        </div>
      </aside>

      {/* ========== 主内容区 ========== */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* 顶部条 (仅移动端可见) */}
        <header className="md:hidden bg-[#001e2b] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            <img src="./icon.png" alt="Logo" className="w-7 h-7 rounded-md" />
            <span className="text-sm font-bold text-white">中考词汇</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={toggleTheme} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white text-xs">
              <i className={`fas ${isDark ? 'fa-sun text-amber-400' : 'fa-moon'}`}></i>
            </button>
            <button onClick={toggleMute} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs">
              <i className={`fas ${isMuted ? 'fa-volume-mute text-rose-400' : 'fa-volume-up text-white'}`}></i>
            </button>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 max-w-5xl w-full mx-auto">
          {children}
        </main>

        {/* 页脚 */}
        <footer className="block text-center py-4 text-[11px] text-slate-400 dark:text-[#a8b3bc] border-t border-slate-100 dark:border-[#003d4f] pb-20 md:pb-4">
          <p>© 2026 上海英语中考考纲词汇背默平台 · 助力学子冲刺 A+</p>
          <p>Built by <a href="https://yaoonion.fun" target="_blank" rel="noopener noreferrer">YaoOnion</a> & <a href="https://frankrank.franj2.top" target="_blank" rel="noopener noreferrer">frankrank</a></p>
        </footer>

        {/* 移动端底部导航 */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#0a2a3a] border-t border-slate-200 dark:border-[#003d4f] z-50 px-1 pb-1 pt-1.5">
          <div className="flex items-center justify-around">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 relative ${
                  activeTab === tab.id
                    ? tab.id === 'mistakes' ? 'text-rose-500' : 'text-[#00ed64]'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <i className={`fas ${tab.icon} text-lg`}></i>
                <span className="text-[9px] mt-0.5 font-medium">{tab.label}</span>
                {tab.id === 'mistakes' && mistakes.length > 0 && activeTab !== 'mistakes' && (
                  <span className="absolute -top-0.5 right-1/4 bg-rose-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full leading-none">{mistakes.length}</span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
