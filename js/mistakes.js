/**************************************************************
 * 错题强化本核心逻辑
 **************************************************************/
function addMistake(wordItem) {
    const index = appState.mistakes.findIndex(m => m.word.toLowerCase() === wordItem.word.toLowerCase());
    if (index > -1) {
        appState.mistakes[index].count++;
        appState.mistakes[index].timestamp = Date.now();
    } else {
        appState.mistakes.push({
            word: wordItem.word,
            pos: wordItem.pos,
            meaning: wordItem.meaning,
            category: wordItem.category || 'all',
            tip: wordItem.tip || '',
            count: 1,
            timestamp: Date.now()
        });
    }
    saveState();
}

function removeMistake(word) {
    appState.mistakes = appState.mistakes.filter(m => m.word.toLowerCase() !== word.toLowerCase());
    saveState();
    renderMistakes();
}

function clearMistakes() {
    if (appState.mistakes.length === 0) return;
    if (confirm("确定要清空错题强化本中的所有单词吗？这将无法恢复。")) {
        appState.mistakes = [];
        saveState();
        renderMistakes();
        playSound('click');
    }
}

function renderMistakes() {
    const count = appState.mistakes.length;
    const emptyDiv = document.getElementById('mistakes-empty');
    const contentDiv = document.getElementById('mistakes-content');

    document.getElementById('mistake-count').innerText = count;

    if (count === 0) {
        emptyDiv.classList.remove('hidden');
        contentDiv.classList.add('hidden');
        return;
    }

    emptyDiv.classList.add('hidden');
    contentDiv.classList.remove('hidden');

    const tbody = document.getElementById('mistake-list-tbody');
    tbody.innerHTML = "";

    const sortedMistakes = [...appState.mistakes].sort((a, b) => b.timestamp - a.timestamp);

    sortedMistakes.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors";
        tr.innerHTML = `
            <td class="p-4 font-bold text-slate-800 dark:text-white">
                <div class="flex items-center space-x-2">
                    <span>${item.word}</span>
                    <button onclick="speakWord(event, '${item.word}')" class="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-colors p-1" title="发音">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
            </td>
            <td class="p-4"><span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 text-xs rounded font-medium">${item.pos}</span></td>
            <td class="p-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" title="${item.meaning}">${item.meaning}</td>
            <td class="p-4 text-center"><span class="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full">${item.count} 次</span></td>
            <td class="p-4 text-right">
                <button onclick="removeMistake('${item.word}')" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold" title="我已经熟记了，移出本子">
                    <i class="fas fa-check-circle mr-1"></i>掌握
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function startMistakePractice() {
    if (appState.mistakes.length === 0) return;
    
    const listToPractice = appState.mistakes.map(m => {
        const original = VOCABULARY_DB.find(v => v.word.toLowerCase() === m.word.toLowerCase());
        return {
            word: m.word,
            pos: m.pos,
            meaning: m.meaning,
            category: m.category,
            example: original ? original.example : "错题巩固练习",
            tip: m.tip || (original ? original.tip : "认真核对拼写")
        };
    });

    switchTab('dictation');
    initDictation(listToPractice);
}