import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useSound } from '../hooks/useSound';
import { useSpeech } from '../hooks/useSpeech';
import { VOCABULARY_DB } from '../data/vocabulary';

export default function Flashcard() {
  const { masteredWords, addMastered, recordAttempt, addMistake } = useApp();
  const { playSound } = useSound();
  const { speak } = useSpeech();
  
  const [category, setCategory] = useState('all');
  const [filteredList, setFilteredList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const cardRef = useRef(null);
  const startX = useRef(0);

  // Filter words when category changes
  useEffect(() => {
    const list = category === 'all'
      ? [...VOCABULARY_DB]
      : VOCABULARY_DB.filter(v => v.category === category);
    setFilteredList(list);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [category]);

  const currentWord = filteredList[currentIndex];
  const isMastered = currentWord ? masteredWords.includes(currentWord.word) : false;

  // Touch/drag handlers
  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = x - startX.current;
    setDragX(Math.max(-120, Math.min(120, diff)));
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    if (Math.abs(dragX) > 60) {
      if (dragX < 0 && currentIndex < filteredList.length - 1) {
        setCurrentIndex(i => i + 1);
        setIsFlipped(false);
      } else if (dragX > 0 && currentIndex > 0) {
        setCurrentIndex(i => i - 1);
        setIsFlipped(false);
      }
    }
    setDragX(0);
  }, [dragX, currentIndex, filteredList.length]);

  const flipCard = () => {
    playSound('click');
    setIsFlipped(prev => !prev);
  };

  const goNext = () => {
    if (currentIndex < filteredList.length - 1) {
      playSound('click');
      setCurrentIndex(i => i + 1);
      setIsFlipped(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      playSound('click');
      setCurrentIndex(i => i - 1);
      setIsFlipped(false);
    }
  };

  const handleMastered = () => {
    if (currentWord && !isMastered) {
      playSound('correct');
      addMastered(currentWord.word);
      recordAttempt(true);
    }
  };

  const handleSpeak = () => {
    if (currentWord) speak(currentWord.word);
  };

  if (!currentWord) {
    return (
      <div className="tab-content">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">词卡速记</h2>
        <p className="text-slate-500 dark:text-[#a8b3bc]">暂无词汇数据</p>
      </div>
    );
  }

  if (filteredList.length === 0) {
    return (
      <div className="tab-content">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">词卡速记</h2>
        <p className="text-slate-500 dark:text-[#a8b3bc]">该分类暂无词汇</p>
      </div>
    );
  }

  return (
    <div className="tab-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">词卡速记</h2>
        <div className="flex items-center space-x-2">
          <button onClick={handleSpeak} className="text-slate-400 hover:text-[#00ed64] dark:hover:text-[#00ed64] text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5" title="发音">
            <i className="fas fa-volume-up"></i>
          </button>
          {isMastered && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#00ed64]/10 text-[#00684a] dark:text-[#00ed64] rounded-pill">
              <i className="fas fa-check mr-0.5"></i>已掌握
            </span>
          )}
        </div>
      </div>

      {/* Category filter */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full sm:w-56 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-[#003d4f] bg-white dark:bg-[#0a2a3a] text-slate-700 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-[#00ed64]"
      >
        <option value="all">全部词汇（随机）</option>
        <option value="noun">核心名词</option>
        <option value="verb">高频动词</option>
        <option value="adj_adv">形容词与副词</option>
        <option value="phrase">高频短语</option>
      </select>

      {/* Progress */}
      <p className="text-xs text-slate-500 dark:text-[#a8b3bc] mb-3">
        第 {currentIndex + 1} / {filteredList.length} 张
      </p>

      {/* Card */}
      <div
        ref={cardRef}
        className="scene h-64 sm:h-72 mb-4 cursor-pointer select-none"
        onClick={flipCard}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <div
          className={`card-flipper w-full h-full ${isFlipped ? 'flipped' : ''}`}
          style={isDragging ? { transform: `translateX(${dragX}px)` } : {}}
        >
          {/* Front */}
          <div className="card-front bg-white dark:bg-[#0a2a3a] rounded-xl border border-slate-200 dark:border-[#003d4f] shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-[#a8b3bc] mb-3">
              {currentWord.category === 'noun' ? '核心名词' : currentWord.category === 'verb' ? '高频动词' : currentWord.category === 'adj_adv' ? '形容词/副词' : '高频短语'}
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white mb-3 text-center">{currentWord.word}</p>
            <p className="text-sm text-slate-500 dark:text-[#a8b3bc]">{currentWord.pos}</p>
            <p className="text-xs text-slate-400 dark:text-[#a8b3bc] mt-4">点击翻转查看释义</p>
          </div>

          {/* Back */}
          <div className="card-back bg-white dark:bg-[#0a2a3a] rounded-xl border border-slate-200 dark:border-[#003d4f] shadow-sm p-6 sm:p-8 flex flex-col items-center justify-center overflow-y-auto">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-[#a8b3bc] mb-2">释义 & 例句</span>
            <p className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-1">{currentWord.word}</p>
            <p className="text-sm text-[#00684a] dark:text-[#00ed64] font-semibold mb-3">{currentWord.meaning}</p>
            <div className="w-full max-w-sm bg-slate-50 dark:bg-white/5 rounded-lg px-4 py-3 mb-3">
              <p className="text-xs text-slate-500 dark:text-[#a8b3bc] italic">例: {currentWord.example}</p>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-[#a8b3bc]">
              <span className="font-semibold text-slate-500 dark:text-[#7c8c9a]">💡</span> {currentWord.tip}
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center space-x-4">
        <button onClick={goPrev} disabled={currentIndex === 0} className="px-5 py-2.5 text-sm rounded-pill border border-slate-200 dark:border-[#003d4f] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <i className="fas fa-arrow-left mr-1"></i> 上一张
        </button>
        <button
          onClick={handleMastered}
          disabled={isMastered}
          className="px-5 py-2.5 text-sm rounded-pill bg-[#00ed64] text-[#001e2b] font-bold hover:bg-[#00b545] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <i className="fas fa-check mr-1"></i> {isMastered ? '已掌握' : '标记掌握'}
        </button>
        <button onClick={goNext} disabled={currentIndex === filteredList.length - 1} className="px-5 py-2.5 text-sm rounded-pill border border-slate-200 dark:border-[#003d4f] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          下一张 <i className="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
    </div>
  );
}