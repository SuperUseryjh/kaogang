/**************************************************************
 * 词性转换专项特训 (Word Formation)
 **************************************************************/
function initTransformation() {
    activeTransList = [...TRANSFORMATION_DB];
    activeTransList.sort(() => Math.random() - 0.5);

    currentTransIndex = 0;
    transCorrectCount = 0;
    transWrongCount = 0;

    document.getElementById('trans-correct-count').innerText = "0";
    document.getElementById('trans-wrong-count').innerText = "0";

    renderTransItem();
}

function renderTransItem() {
    const input = document.getElementById('trans-input');
    input.value = "";
    input.className = "w-full text-lg font-bold px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none transition-all pr-12 text-center tracking-wide";
    document.getElementById('trans-feedback-icon').innerHTML = "";

    transChecked = false;
    document.getElementById('trans-action-btn').innerHTML = `<i class="fas fa-check"></i> <span>提交核对 (Enter)</span>`;
    document.getElementById('trans-action-btn').className = "flex-1 min-h-[44px] px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1";

    if (activeTransList.length === 0) {
        document.getElementById('trans-progress-text').innerText = "0/0";
        document.getElementById('trans-title').innerText = "暂无练习题";
        return;
    }

    document.getElementById('trans-progress-text').innerText = `${currentTransIndex + 1}/${activeTransList.length}`;

    const item = activeTransList[currentTransIndex];
    document.getElementById('trans-title').innerText = `给出单词：${item.original}`;
    document.getElementById('trans-direction').innerText = item.direction;

    if (window.innerWidth > 768) {
        input.focus();
    }
}

function handleTransKeyDown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkTransAnswer();
    }
}

function checkTransAnswer() {
    if (activeTransList.length === 0) return;
    const item = activeTransList[currentTransIndex];
    const input = document.getElementById('trans-input');
    const userAns = input.value.trim().toLowerCase();
    const correctAns = item.target.trim().toLowerCase();

    if (transChecked) {
        currentTransIndex++;
        if (currentTransIndex < activeTransList.length) {
            renderTransItem();
        } else {
            playSound('success');
            alert(`🎉 恭喜完成词性转换特训！\n正确数：${transCorrectCount} | 错误数：${transWrongCount}`);
            initTransformation();
        }
        return;
    }

    if (!userAns) return;

    transChecked = true;
    appState.stats.totalAttempts++;

    const feedbackIcon = document.getElementById('trans-feedback-icon');
    const answerBox = document.getElementById('trans-answer-box');

    if (userAns === correctAns) {
        playSound('correct');
        transCorrectCount++;
        appState.stats.correctAttempts++;

        input.className = "w-full text-lg font-bold px-4 py-3.5 rounded-xl border-2 border-emerald-500 focus:ring-4 focus:ring-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/20 outline-none transition-all pr-12 text-center tracking-wide text-emerald-700 dark:text-emerald-300";
        feedbackIcon.innerHTML = `<i class="fas fa-check-circle text-emerald-500"></i>`;
    } else {
        playSound('incorrect');
        transWrongCount++;

        addMistake({
            word: item.target,
            pos: "词性转换",
            meaning: `[原词:${item.original}] -> ${item.target}`,
            category: "transformation",
            tip: item.explanation
        });

        input.className = "w-full text-lg font-bold px-4 py-3.5 rounded-xl border-2 border-rose-500 focus:ring-4 focus:ring-rose-100 bg-rose-50/50 dark:bg-rose-950/20 outline-none transition-all pr-12 text-center tracking-wide text-rose-700 dark:text-rose-300";
        feedbackIcon.innerHTML = `<i class="fas fa-times-circle text-rose-500"></i>`;

        document.getElementById('trans-answer-word').innerText = item.target;
        document.getElementById('trans-answer-detail').innerText = `${item.direction}。\n记忆规则：${item.explanation}`;
        answerBox.classList.remove('hidden');
    }

    document.getElementById('trans-correct-count').innerText = transCorrectCount;
    document.getElementById('trans-wrong-count').innerText = transWrongCount;

    const actionBtn = document.getElementById('trans-action-btn');
    actionBtn.innerHTML = `<span>下一题 (Enter)</span> <i class="fas fa-arrow-right"></i>`;
    actionBtn.className = "flex-1 min-h-[44px] px-4 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-950 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-1";

    saveState();
}

function revealTransAnswer() {
    if (activeTransList.length === 0 || transChecked) return;
    const input = document.getElementById('trans-input');
    const item = activeTransList[currentTransIndex];

    input.value = item.target;
    checkTransAnswer();
    
    addMistake({
        word: item.target,
        pos: "词性转换",
        meaning: `[原词:${item.original}] -> ${item.target}`,
        category: "transformation",
        tip: item.explanation
    });
}