import { useApp } from '../context/AppContext';
import { useSound } from '../hooks/useSound';
import { useSpeech } from '../hooks/useSpeech';

export default function Mistakes() {
  const { mistakes, removeMistake, clearMistakes } = useApp();
  const { playSound } = useSound();
  const { speak } = useSpeech();

  if (mistakes.length === 0) {
    return (
      <div className="tab-content">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">错题强化</h2>
        <div className="bg-white dark:bg-[#0a2a3a] rounded-xl border border-slate-200 dark:border-[#003d4f] p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#00ed64]/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-smile text-2xl text-[#00ed64]"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">暂无错题</h3>
          <p className="text-sm text-slate-500 dark:text-[#a8b3bc]">继续保持，所有词汇一次通关！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">错题强化</h2>
        <button
          onClick={() => { playSound('click'); clearMistakes(); }}
          className="text-xs px-3 py-1.5 rounded-pill bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
        >
          <i className="fas fa-trash-alt mr-1"></i> 清空全部
        </button>
      </div>

      <div className="bg-white dark:bg-[#0a2a3a] rounded-xl border border-slate-200 dark:border-[#003d4f] overflow-hidden">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-[#003d4f]">
                <th className="text-left p-4 text-xs font-semibold text-slate-500 dark:text-[#a8b3bc]">单词</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 dark:text-[#a8b3bc]">词性</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 dark:text-[#a8b3bc]">释义</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 dark:text-[#a8b3bc]">例句</th>
                <th className="text-center p-4 text-xs font-semibold text-slate-500 dark:text-[#a8b3bc]">操作</th>
              </tr>
            </thead>
            <tbody>
              {mistakes.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-white/5">
                  <td className="p-4 font-bold text-slate-800 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <span>{item.word}</span>
                      <button onClick={() => speak(item.word)} className="text-slate-400 hover:text-[#00ed64] text-xs transition-colors p-1" title="发音">
                        <i className="fas fa-volume-up"></i>
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded font-medium">{item.pos}</span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 text-xs max-w-[200px]">{item.meaning}</td>
                  <td className="p-4 text-slate-400 dark:text-slate-500 text-xs italic max-w-[250px] truncate">{item.example}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => { playSound('click'); removeMistake(item.word); }}
                      className="text-rose-400 hover:text-rose-600 text-xs p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                      title="移出错题本"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-slate-100 dark:divide-[#003d4f]">
          {mistakes.map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 dark:text-white">{item.word}</span>
                  <button onClick={() => speak(item.word)} className="text-slate-400 hover:text-[#00ed64] text-xs">
                    <i className="fas fa-volume-up"></i>
                  </button>
                </div>
                <button onClick={() => { playSound('click'); removeMistake(item.word); }} className="text-rose-400 hover:text-rose-600 text-xs p-1">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] rounded font-medium">{item.pos}</span>
                <span className="text-xs text-slate-600 dark:text-slate-300">{item.meaning}</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">{item.example}</p>
            </div>
          ))}
        </div>
      </div>

      {mistakes.length > 0 && (
        <p className="text-xs text-slate-400 dark:text-[#a8b3bc] mt-3 text-center">
          共 {mistakes.length} 个待强化词汇
        </p>
      )}
    </div>
  );
}