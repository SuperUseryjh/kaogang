/**************************************************************
 * 词卡速记及触控左右滑动手势系统 (Touch Swipe Support)
 **************************************************************/
function initFlashcards() {
    const cat = document.getElementById('flashcard-category-select').value;
    const select = document.getElementById('flashcard-category-select');
    
    if (select.options.length <= 1) { 
        select.innerHTML = "";
        Object.keys(CATEGORY_MAP).forEach(k => {
            const opt = document.createElement('option');
            opt.value = k;
            opt.innerText = CATEGORY_MAP[k];
            select.appendChild(opt);
        });
        select.value = cat || 'all';
    }

    if (cat === 'all') {
        activeFlashcardsList = [...VOCABULARY_DB];
    } else {
        activeFlashcardsList = VOCABULARY_DB.filter(v => v.category === cat);
    }

    // 打乱卡片顺序
    activeFlashcardsList.sort(() => Math.random() - 0.5);
    currentFlashcardIndex = 0;
    renderFlashcard();
    setupTouchGestures();
}

function renderFlashcard() {
    if (activeFlashcardsList.length === 0) {
        document.getElementById('card-pos-front').innerText = "-";
        document.getElementById('card-meaning-front').innerText = "当前分类没有词汇数据";
        document.getElementById('card-index').innerText = "0/0";
        return;
    }

    const inner = document.getElementById('flashcard-inner');
    inner.classList.remove('rotate-y-180');

    const item = activeFlashcardsList[currentFlashcardIndex];
    
    document.getElementById('card-pos-front').innerText = item.pos;
    document.getElementById('card-meaning-front').innerText = item.meaning;
    document.getElementById('card-index').innerText = `${currentFlashcardIndex + 1}/${activeFlashcardsList.length}`;
    document.getElementById('card-category-tag').innerText = CATEGORY_MAP[item.category] || "考纲词";

    document.getElementById('card-pos-back').innerText = item.pos;
    document.getElementById('card-word-back').innerText = item.word;
    document.getElementById('card-meaning-back').innerText = item.meaning;
    document.getElementById('card-example').innerText = `例句: ${item.example}`;
}

function flipCard() {
    const inner = document.getElementById('flashcard-inner');
    inner.classList.toggle('rotate-y-180');
    playSound('click');
}

// 点击外层防止翻转冲突
document.getElementById('flashcard-container').addEventListener('click', function(e) {
    if (e.target.closest('button')) return;
    flipCard();
});

function nextCard() {
    if (activeFlashcardsList.length === 0) return;
    currentFlashcardIndex = (currentFlashcardIndex + 1) % activeFlashcardsList.length;
    renderFlashcard();
    playSound('click');
}

function prevCard() {
    if (activeFlashcardsList.length === 0) return;
    currentFlashcardIndex = (currentFlashcardIndex - 1 + activeFlashcardsList.length) % activeFlashcardsList.length;
    renderFlashcard();
    playSound('click');
}

let touchStartX = 0;
let touchEndX = 0;

function setupTouchGestures() {
    const cardContainer = document.getElementById('flashcard-container');
    
    cardContainer.ontouchstart = null;
    cardContainer.ontouchend = null;

    cardContainer.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    cardContainer.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const threshold = 60;
    if (touchEndX < touchStartX - threshold) {
        nextCard();
    } else if (touchEndX > touchStartX + threshold) {
        prevCard();
    }
}

function markCardMastered(isMastered) {
    if (activeFlashcardsList.length === 0) return;
    const item = activeFlashcardsList[currentFlashcardIndex];

    if (isMastered) {
        if (!appState.masteredWords.includes(item.word)) {
            appState.masteredWords.push(item.word);
        }
        playSound('correct');
    } else {
        appState.masteredWords = appState.masteredWords.filter(w => w !== item.word);
        playSound('incorrect');
    }
    saveState();

    setTimeout(() => {
        nextCard();
    }, 300);
}