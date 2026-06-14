/**************************************************************
 * 拼写默写大通关 (Dictation) 逻辑
 **************************************************************/
function initDictation(customWordList = null) {
    const select = document.getElementById('dictation-category-select');
    
    if (select.options.length <= 1) {
        select.innerHTML = "";
        Object.keys(CATEGORY_MAP).forEach(k => {
            const opt = document.createElement('option');
            opt.value = k;
            opt.innerText = CATEGORY_MAP[k];
            select.appendChild(opt);
        });
        select.value = 'all';
    }

    const cat = select.value;

    if (customWordList) {
        activeDictationList = [...customWordList];
    } else {
        if (cat === 'all') {
            activeDictationList = [...VOCABULARY_DB];
        } else {
            activeDictationList = VOCABULARY_DB.filter(v => v.category === cat);
        }
    }

    activeDictationList.sort(() => Math.random() - 0.5);

    currentDictationIndex = 0;
    dictationCorrectCount = 0;
    dictationWrongCount = 0;
    
    document.getElementById('dict-correct-count').innerText = "0";
    document.getElementById('dict-wrong-count').innerText = "0";

    renderDictationItem();
}

function renderDictationItem() {
    const input = document.getElementById('dict-input');
    input.value = "";
    input.className = "w-full text-lg font-bold px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all pr-12 text-center tracking-wide";
    document.getElementById('dict-feedback-icon').innerHTML = "";
    document.getElementById('dict-answer-box').classList.add('hidden');
    
    dictationChecked = false;
    document.getElementById('dict-action-btn').innerHTML = `<i class="fas fa-check-double"></i> <span>确认提交 (Enter)</span>`;
    document.getElementById('dict-action-btn').className = "flex-1 min-h-[44px] px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1";

    if (activeDictationList.length === 0) {
        document.getElementById('dict-progress-text').innerText = "0/0";
        document.getElementById('dict-word-pos').innerText = "-";
        document.getElementById('dict-word-meaning').innerText = "没有可以默写的词汇！";
        document.getElementById('dict-hint-tip').classList.add('hidden');
        return;
    }

    document.getElementById('dict-hint-tip').classList.remove('hidden');
    document.getElementById('dict-progress-text').innerText = `${currentDictationIndex + 1}/${activeDictationList.length}`;

    const item = activeDictationList[currentDictationIndex];
    document.getElementById('dict-word-pos').innerText = item.pos;
    document.getElementById('dict-word-meaning').innerText = item.meaning;
    
    const cleanWord = item.word.trim();
    document.getElementById('dict-first-letter').innerText = cleanWord.charAt(0).toUpperCase();
    document.getElementById('dict-word-length').innerText = cleanWord.length;

    if (window.innerWidth > 768) {
        input.focus();
    }
}

function handleDictKeyDown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkDictAnswer();
    }
}

function checkDictAnswer() {
    if (activeDictationList.length === 0) return;
    const item = activeDictationList[currentDictationIndex];
    const input = document.getElementById('dict-input');
    const userAns = input.value.trim().toLowerCase();
    const correctAns = item.word.trim().toLowerCase();

    if (dictationChecked) {
        currentDictationIndex++;
        if (currentDictationIndex < activeDictationList.length) {
            renderDictationItem();
        } else {
            playSound('success');
            alert(`🎉 恭喜完成这批默写！\n正确数：${dictationCorrectCount} | 错误数：${dictationWrongCount}`);
            initDictation();
        }
        return;
    }

    if (!userAns) return; 

    dictationChecked = true;
    appState.stats.totalAttempts++;

    const feedbackIcon = document.getElementById('dict-feedback-icon');
    const answerBox = document.getElementById('dict-answer-box');

    if (userAns === correctAns) {
        playSound('correct');
        dictationCorrectCount++;
        appState.stats.correctAttempts++;
        
        if (!appState.masteredWords.includes(item.word)) {
            appState.masteredWords.push(item.word);
        }

        input.className = "w-full text-lg font-bold px-4 py-3.5 rounded-xl border-2 border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/20 outline-none transition-all pr-12 text-center tracking-wide text-emerald-700 dark:text-emerald-300";
        feedbackIcon.innerHTML = `<i class="fas fa-check-circle text-emerald-500"></i>`;
    } else {
        playSound('incorrect');
        dictationWrongCount++;

        addMistake(item);

        input.className = "w-full text-lg font-bold px-4 py-3.5 rounded-xl border-2 border-rose-500 focus:ring-4 focus:ring-rose-100 bg-rose-50/50 dark:bg-rose-950/20 outline-none transition-all pr-12 text-center tracking-wide text-rose-700 dark:text-rose-300";
        feedbackIcon.innerHTML = `<i class="fas fa-times-circle text-rose-500"></i>`;
        
        document.getElementById('dict-answer-word').innerText = item.word;
        document.getElementById('dict-answer-example').innerText = `大纲解析：${item.tip || '无'} \n例句: ${item.example}`;
        answerBox.classList.remove('hidden');
    }

    document.getElementById('dict-correct-count').innerText = dictationCorrectCount;
    document.getElementById('dict-wrong-count').innerText = dictationWrongCount;

    const actionBtn = document.getElementById('dict-action-btn');
    actionBtn.innerHTML = `<span>下一题 (Enter)</span> <i class="fas fa-arrow-right"></i>`;
    actionBtn.className = "flex-1 min-h-[44px] px-4 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-950 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1";

    saveState();
}

function revealDictAnswer() {
    if (activeDictationList.length === 0 || dictationChecked) return;
    const input = document.getElementById('dict-input');
    const item = activeDictationList[currentDictationIndex];
    const feedbackIcon = document.getElementById('dict-feedback-icon');
    const answerBox = document.getElementById('dict-answer-box');

    input.value = item.word;
    dictationChecked = true;
    appState.stats.totalAttempts++;
    dictationWrongCount++;

    input.className = "w-full text-lg font-bold px-4 py-3.5 rounded-pill border-2 border-rose-500 focus:ring-4 focus:ring-rose-100 bg-rose-50/50 dark:bg-rose-950/20 outline-none transition-all pr-12 text-center tracking-wide text-rose-700 dark:text-rose-300";
    feedbackIcon.innerHTML = `<i class="fas fa-times-circle text-rose-500"></i>`;
    answerBox.classList.remove('hidden');
    answerBox.querySelector('#dict-answer-word').innerText = item.word;

    addMistake(item);
    saveState();
}