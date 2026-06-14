/**************************************************************
 * 视图切换逻辑与移动端底部高亮
 **************************************************************/
function switchTab(tabName) {
    playSound('click');
    const views = ['dashboard', 'flashcard', 'dictation', 'transformation', 'mistakes', 'wordlist'];
    
    views.forEach(v => {
        document.getElementById(`view-${v}`).classList.add('hidden');
        const btn = document.getElementById(`tab-${v}`);
        if (btn) {
            btn.className = "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50";
        }
        
        const mBtn = document.getElementById(`m-tab-${v}`);
        if (mBtn) {
            mBtn.className = "flex flex-col items-center justify-center flex-1 text-slate-400 dark:text-slate-500";
        }
    });

    document.getElementById(`view-${tabName}`).classList.remove('hidden');
    
    const activeBtn = document.getElementById(`tab-${tabName}`);
    if (activeBtn) {
        if (tabName === 'transformation') {
            activeBtn.className = "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-500 pl-3";
        } else if (tabName === 'mistakes') {
            activeBtn.className = "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 pl-3";
        } else {
            activeBtn.className = "w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-blue-500 pl-3";
        }
    }

    const activeMobileBtn = document.getElementById(`m-tab-${tabName}`);
    if (activeMobileBtn) {
        if (tabName === 'transformation') {
            activeMobileBtn.className = "flex flex-col items-center justify-center flex-1 text-emerald-600 dark:text-emerald-400";
        } else if (tabName === 'mistakes') {
            activeMobileBtn.className = "flex flex-col items-center justify-center flex-1 text-rose-600 dark:text-rose-400";
        } else {
            activeMobileBtn.className = "flex flex-col items-center justify-center flex-1 text-blue-600 dark:text-blue-400";
        }
    }

    if (tabName === 'dashboard') {
        renderDashboardCategories();
    } else if (tabName === 'flashcard') {
        initFlashcards();
    } else if (tabName === 'dictation') {
        initDictation();
    } else if (tabName === 'transformation') {
        initTransformation();
    } else if (tabName === 'mistakes') {
        renderMistakes();
    } else if (tabName === 'wordlist') {
        initWordList();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderDashboardCategories() {
    const container = document.getElementById('category-cards');
    container.innerHTML = "";

    const counts = { noun: 0, verb: 0, adj_adv: 0, phrase: 0 };
    VOCABULARY_DB.forEach(v => {
        if (counts[v.category] !== undefined) counts[v.category]++;
    });

    const categories = [
        { id: "noun", title: "核心名词突破", desc: "名词不规则复数与核心抽象词", color: "from-blue-500 to-indigo-500", icon: "fa-font", num: counts.noun },
        { id: "verb", title: "高频动词狂背", desc: "重在必考动词搭配与时态变形", color: "from-purple-500 to-indigo-600", icon: "fa-running", num: counts.verb },
        { id: "adj_adv", title: "形容词与副词", desc: "攻克拼写及常考派生修饰词", color: "from-pink-500 to-rose-500", icon: "fa-magic", num: counts.adj_adv },
        { id: "phrase", title: "中考高频短语", desc: "冲刺必背常考介词结构与词组", color: "from-amber-500 to-orange-500", icon: "fa-shapes", num: counts.phrase },
        { id: "transformation", title: "词性转换专项", desc: "句型填空夺分重点，专攻经典派生", color: "from-emerald-500 to-teal-600", icon: "fa-sync-alt", num: TRANSFORMATION_DB.length }
    ];

    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = "bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition-all cursor-pointer group hover:-translate-y-0.5 flex flex-col justify-between";
        
        let completedText = "";
        if (cat.id === 'transformation') {
            completedText = "专项";
        } else {
            const masteredInCat = VOCABULARY_DB.filter(v => v.category === cat.id && appState.masteredWords.includes(v.word)).length;
            completedText = `已记 ${masteredInCat}/${cat.num}`;
        }

        card.innerHTML = `
            <div>
                <div class="flex items-start justify-between">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-sm">
                        <i class="fas ${cat.icon}"></i>
                    </div>
                    <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">${completedText}</span>
                </div>
                <div class="mt-4">
                    <h4 class="font-bold text-slate-800 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${cat.title}</h4>
                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">${cat.desc}</p>
                </div>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-bold">
                <span>开始强化</span>
                <i class="fas fa-chevron-right group-hover:translate-x-1 transition-transform"></i>
            </div>
        `;
        card.onclick = () => {
            if (cat.id === 'transformation') {
                switchTab('transformation');
            } else {
                document.getElementById('flashcard-category-select').value = cat.id;
                switchTab('flashcard');
            }
        };
        container.appendChild(card);
    });
}

/**************************************************************
 * 页面载入与自适应初始化
 **************************************************************/
window.onload = function() {
    loadState();
    renderDashboardCategories();
    updateOverallProgress();

    // 隐藏全局防乱点遮罩层
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('opacity-0');
        setTimeout(() => {
            overlay.remove();
        }, 500);
    }
};