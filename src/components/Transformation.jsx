import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useSound } from '../hooks/useSound';
import { TRANSFORMATION_DB } from '../data/vocabulary';

export default function Transformation() {
  const { addMistake, addMastered, recordAttempt } = useApp();
  const { playSound } = useSound();

  const [wordList, setWordList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const inputRef = useRef(null);

  const initTest = useCallback(() => {
    const shuffled = [...TRANSFORMATION_DB].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));
    setWordList(selected);
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setCompleted(false);
    setChecked(false);
    setIsCorrect(null);
    setInput('');
    setIsRevealed(false);
  }, []);

  useEffect(() => {
    initTest();
  }, [initTest]);

  const currentItem = wordList[currentIndex];
  const totalItems = wordList.length;

  const checkAnswer = useCallback(() => {
    if (checked || !currentItem) return;
    
    const userAnswer = input.trim().toLowerCase();
    const isCorrectAnswer = userAnswer === currentItem.target.toLowerCase();

    setChecked(true);
    setIsCorrect(isCorrectAnswer);
    setIsRevealed(false);

    if (isCorrectAnswer) {
      playSound('correct');
      setCorrectCount(c => c + 1);
      recordAttempt(true);
      addMastered(currentItem.original);
    } else {
      playSound('incorrect');
      setWrongCount(c => c + 1);
      recordAttempt(false);
    }
  }, [input, checked, currentItem, playSound, recordAttempt, addMastered]);

  const revealAnswer = useCallback(() => {
    if (checked || !currentItem) return;
    setIsRevealed(true);
    setChecked(true);
    setIsCorrect(false);
    playSound('incorrect');
    setWrongCount(c => c + 1);
    recordAttempt(false);
  }, [checked, currentItem, playSound, recordAttempt]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(i => i + 1);
      setInput('');
      setChecked(false);
      setIsCorrect(null);
      setIsRevealed(false);
      inputRef.current?.focus();
    } else {
      setCompleted(true);
    }
  }, [currentIndex, totalItems]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!checked) checkAnswer();
      else nextQuestion();
    }
  };

  if (completed) {
    const total = correctCount + wrongCount;
    const acc = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <div className="tab-content">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">词性转换专项</h2>
        <div className="bg-white dark:bg-[#0a2a3a] rounded-xl border border-slate-200 dark:border-[#003d4f] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#00ed64]/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-sync-alt text-2xl text-[#00ed64]"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">本轮已完成！</h3>
          <p className="text-sm text-slate-500 dark:text-[#a8b3bc] mb-4">
            正确 <span className="text-[#00ed64] font-bold">{correctCount}</span> / {total} 题
            （正确率 {acc}%）
          </p>
          <div className="flex justify-center space-x-3">
            <span className="px-3 py-1 bg-green-50 dark:bg-[#00ed64]/10 text-[#00684a] dark:text-[#00ed64] text-xs rounded-pill font-bold">
              ✅ 正确 {correctCount}
            </span>
            <span className="px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs rounded-pill font-bold">
              ❌ 错误 {wrongCount}
            </span>
          </div>
          <button onClick={initTest} className="mt-6 px-6 py-2.5 bg-[#00ed64] text-[#001e2b] font-bold rounded-pill text-sm hover:bg-[#00b545] transition-all">
            <i className="fas fa-redo-alt mr-1"></i> 再来一轮
          </button>
        </div>
      </div>
    );
  }

  if (!currentItem) return null;

  return (
    <div className="tab-content">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">词性转换专项</h2>
        <span className="text-xs text-slate-500 dark:text-[#a8b3bc]">
          <span className="text-[#00ed64] font-bold">{correctCount}</span> 正确 / <span className="text-rose-500 font-bold">{wrongCount}</span> 错误
        </span>
      </div>

      <p className="text-xs text-slate-400 dark:text-[#a8b3bc] mb-6">
        第 {currentIndex + 1} / {totalItems} 题
      </p>

      {/* Question card */}
      <div className="bg-white dark:bg-[#0a2a3a] rounded-xl border border-slate-200 dark:border-[#003d4f] p-6 sm:p-8 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <span className="px-2.5 py-1 bg-[#00ed64]/10 text-[#00684a] dark:text-[#00ed64] text-[10px] font-bold rounded-pill">
            {currentItem.direction}
          </span>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 text-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-xs text-slate-400 dark:text-[#a8b3bc] mb-1">原词</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{currentItem.original}</p>
          </div>
          <div className="text-slate-300 dark:text-slate-600">
            <i className="fas fa-arrow-right text-xl"></i>
          </div>
          <div className="flex-1 text-center p-4 bg-slate-50 dark:bg-white/5 rounded-xl">
            <p className="text-xs text-slate-400 dark:text-[#a8b3bc] mb-1">目标词</p>
            <p className="text-2xl font-extrabold text-[#00ed64]">{checked ? currentItem.target : '?'}</p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={checked}
          placeholder="输入目标词..."
          className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-[#003d4f] bg-white dark:bg-[#0a2a3a] text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00ed64] disabled:opacity-50 disabled:cursor-not-allowed"
          autoFocus
        />

        {checked && (
          <div className={`mt-4 p-4 rounded-xl border ${
            isCorrect
              ? 'bg-green-50 dark:bg-[#00ed64]/5 border-[#00ed64]/20'
              : 'bg-rose-50 dark:bg-rose-500/5 border-rose-200 dark:border-rose-500/20'
          }`}>
            <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-[#00684a] dark:text-[#00ed64]' : 'text-rose-600 dark:text-rose-400'}`}>
              <i className={`fas ${isCorrect ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
              {isCorrect ? '回答正确！' : (isRevealed ? '已显示答案' : '回答错误')}
            </p>
            <p className="text-sm text-slate-600 dark:text-[#a8b3bc]">
              正确答案：<span className="font-bold text-slate-800 dark:text-white">{currentItem.target}</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-[#7c8c9a] mt-2">{currentItem.explanation}</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center space-x-3">
        {!checked ? (
          <>
            <button onClick={revealAnswer} className="px-5 py-2.5 text-sm rounded-pill border border-slate-200 dark:border-[#003d4f] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              <i className="fas fa-lightbulb mr-1"></i> 提示答案
            </button>
            <button onClick={checkAnswer} className="px-6 py-2.5 text-sm rounded-pill bg-[#00ed64] text-[#001e2b] font-bold hover:bg-[#00b545] transition-all">
              <i className="fas fa-check mr-1"></i> 确认答案
            </button>
          </>
        ) : (
          <button onClick={nextQuestion} className="px-6 py-2.5 text-sm rounded-pill bg-[#00ed64] text-[#001e2b] font-bold hover:bg-[#00b545] transition-all">
            {currentIndex < totalItems - 1 ? (
              <>下一题 <i className="fas fa-arrow-right ml-1"></i></>
            ) : (
              <><i className="fas fa-check-double mr-1"></i> 查看成绩</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}