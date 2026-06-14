/**************************************************************
 * 词汇总库检索 (Word Bank) 逻辑
 **************************************************************/
function initWordList() {
    const select = document.getElementById('wordlist-category-select');
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

    filterWordList();
}

function filterWordList() {
    const query = document.getElementById('wordlist-search').value.toLowerCase().trim();
    const cat = document.getElementById('wordlist-category-select').value;
    const grid = document.getElementById('wordlist-grid');

    let list = [...VOCABULARY_DB];

    if (cat !== 'all') {
        list = list.filter(v => v.category === cat);
    }

    if (query) {
        list = list.filter(v => 
            v.word.toLowerCase().includes(query) || 
            v.meaning.includes(query)
        );
    }

    document.getElementById('filtered-words-count').innerText = list.length;
    grid.innerHTML = "";

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                没有找到任何符合搜索条件的考纲词汇。
            </div>
        `;
        return;
    }

    list.forEach(item => {
        const card = document.createElement('div');
        const isMastered = appState.masteredWords.includes(item.word);
        card.className = `bg-white dark:bg-slate-900 p-4 rounded-2xl border ${isMastered ? 'border-emerald-100 dark:border-emerald-950 bg-emerald-50/5 dark:bg-emerald-950/5' : 'border-slate-100 dark:border-slate-800'} hover:shadow-sm transition-all flex flex-col justify-between space-y-3`;
        
        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">${item.pos}</span>
                    <span class="text-[9px] font-semibold text-slate-400 dark:text-slate-500">${CATEGORY_MAP[item.category]}</span>
                </div>
                <h4 class="text-base sm:text-lg font-extrabold text-slate-800 dark:text-white mt-2 flex items-center justify-between">
                    <span>${item.word}</span>
                    <button onclick="speakWord(event, '${item.word}')" class="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs p-1" title="发音">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </h4>
                <p class="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">${item.meaning}</p>
                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed italic border-l-2 border-slate-150 dark:border-slate-800 pl-2">例: ${item.example}</p>
            </div>
            <div class="pt-2 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
                <button onclick="toggleWordMastery('${item.word}')" class="text-[11px] font-bold ${isMastered ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400'} flex items-center space-x-1">
                    <i class="fas ${isMastered ? 'fa-check-circle' : 'fa-circle'}"></i>
                    <span>${isMastered ? '已记下' : '记住了吗'}</span>
                </button>
                <button onclick="addWordToMistakeManually('${item.word}')" class="text-[10px] text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 flex items-center space-x-1">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>加错题</span>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function toggleWordMastery(word) {
    playSound('click');
    if (appState.masteredWords.includes(word)) {
        appState.masteredWords = appState.masteredWords.filter(w => w !== word);
    } else {
        appState.masteredWords.push(word);
    }
    saveState();
    filterWordList();
}

function addWordToMistakeManually(word) {
    playSound('click');
    const item = VOCABULARY_DB.find(v => v.word.toLowerCase() === word.toLowerCase());
    if (item) {
        addMistake(item);
        alert(`📖 [${word}] 已成功加入错题强化本。`);
    }
}