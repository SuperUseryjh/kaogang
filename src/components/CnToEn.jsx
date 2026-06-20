import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useSound } from '../hooks/useSound';
import { VOCABULARY_DB } from '../data/vocabulary';

export default function CnToEn() {
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
    const shuffled = [...VOCABULARY_DB].sort(() => Math.random() - 0.5);
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
    const isCorrectAnswer = userAnswer === currentItem.word.toLowerCase();

    setChecked(true);
    setIsCorrect(isCorrectAnswer);
    setIsRevealed(false);

    if (isCorrectAnswer) {
      playSound('correct');
      setCorrectCount(c => c + 1);
      recordAttempt(true);
      addMastered(currentItem.word);
    } else {
      playSound('incorrect');
      setWrongCount(c => c + 1);
      recordAttempt(false);
      addMistake(currentItem);
    }
  }, [input, checked, currentItem, playSound, recordAttempt, addMastered, addMistake]);

  const revealAnswer = useCallback(() => {
    if (checked || !currentItem) return;
    setIsRevealed(true);
    setChecked(true);
    setIsCorrect(false);
    playSound('incorrect');
    setWrongCount(c => c + 1);
    recordAttempt(false);
    addMistake(currentItem);
  }, [checked, currentItem, playSound, recordAttempt, addMistake]);

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
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">中文默英文</h2>
        <div className="bg-white dark:bg-[#0a2a3a] rounded-xl border border-slate-200 dark:border-[#003d4f] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#00ed64]/10 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-language text-2xl text-[#00ed64]"></i>
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

  const progress = totalItems > 0 ? Math.round((currentIndex / totalItems) * 100) : 0;

  return (
    <div className="tab-content">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">中文默英文</h2>
        <span className="text-xs text-slate-500 dark:text-[#a8b3bc]">
          <span className="text-[#00ed64] font-bold">{correctCount}</span> 正确 / <span className="text-rose-500 font-bold">{wrongCount}</span> 错误
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden mb-4">
        <div className="absolute inset-y-0 left-0 bg-[#00ed64] rounded-full transition-all" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-xs text-slate-400 dark:text-[#a8b3bc] mb-6">
        第 {currentIndex + 1} / {totalItems} 题
      </p>

      {/* Question card */}
      <div className="bg-white dark:bg-[#0a2a3a] rounded-xl border border-slate-200 dark:border-[#003d4f] p-6 sm:p-8 mb-6">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-[#a8b3bc] mb-2">请根据中文释义写出对应的英文单词</p>
        <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mb-1">{currentItem.meaning}</p>
        <p className="text-sm text-slate-500 dark:text-[#a8b3bc] mb-6">{currentItem.pos}</p>

        {/* Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={checked}
            placeholder="输入英文单词..."
            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-[#003d4f] bg-white dark:bg-[#0a2a3a] text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#00ed64] disabled:opacity-50 disabled:cursor-not-allowed"
            autoFocus
          />
        </div>

        {/* Feedback */}
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
              正确答案：<span className="font-bold text-slate-800 dark:text-white">{currentItem.word}</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-[#a8b3bc] mt-2">{currentItem.tip}</p>
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