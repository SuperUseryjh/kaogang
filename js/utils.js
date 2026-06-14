/**************************************************************
 * 全局状态变量与本地数据初始化
 **************************************************************/
let appState = {
    masteredWords: [],
    mistakes: [],
    stats: {
        totalAttempts: 0,
        correctAttempts: 0
    },
    isMuted: false
};

let currentFlashcardIndex = 0;
let activeFlashcardsList = [];

let currentDictationIndex = 0;
let activeDictationList = [];
let dictationCorrectCount = 0;
let dictationWrongCount = 0;
let dictationChecked = false;

let currentTransIndex = 0;
let activeTransList = [];
let transCorrectCount = 0;
let transWrongCount = 0;
let transChecked = false;

let audioCtx = null;

function loadState() {
    const saved = localStorage.getItem('sh_zhongkao_vocab_state_v2');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            appState = { ...appState, ...parsed };
        } catch (e) {
            console.error("加载存档失败", e);
        }
    }
    updateMuteButtonUI();
    initTheme();
}

function saveState() {
    localStorage.setItem('sh_zhongkao_vocab_state_v2', JSON.stringify(appState));
    updateOverallProgress();
}

/**************************************************************
 * 亮暗模式切换核心逻辑 (System Follow + Manual Toggle)
 **************************************************************/
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    updateThemeIcon();
}

function toggleTheme() {
    playSound('click');
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (document.documentElement.classList.contains('dark')) {
        icon.className = "fas fa-sun text-amber-400";
    } else {
        icon.className = "fas fa-moon text-slate-600 dark:text-slate-300";
    }
}

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        if (e.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        updateThemeIcon();
    }
});

/**************************************************************
 * 纯代码合成音效系统 (Web Audio API)
 **************************************************************/
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (appState.isMuted) return;
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'incorrect') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, audioCtx.currentTime);
            osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.25);
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'click') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'success') {
            const now = audioCtx.currentTime;
            const freqs = [523.25, 659.25, 783.99, 1046.50];
            freqs.forEach((f, idx) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.connect(g);
                g.connect(audioCtx.destination);
                o.type = 'sine';
                o.frequency.setValueAtTime(f, now + idx * 0.1);
                g.gain.setValueAtTime(0.08, now + idx * 0.1);
                g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.4);
                o.start(now + idx * 0.1);
                o.stop(now + idx * 0.1 + 0.4);
            });
        }
    } catch (e) {
        console.log("音频播放失败", e);
    }
}

function toggleMute() {
    appState.isMuted = !appState.isMuted;
    saveState();
    updateMuteButtonUI();
}

function updateMuteButtonUI() {
    const icon = document.getElementById('mute-icon');
    if (appState.isMuted) {
        icon.className = "fas fa-volume-mute text-rose-500 dark:text-rose-400";
    } else {
        icon.className = "fas fa-volume-up text-blue-600 dark:text-blue-400";
    }
}

/**************************************************************
 * 语音合成朗读 (Web Speech Synthesis)
 **************************************************************/
function speakWord(event, textToSpeak) {
    if (event) event.stopPropagation();
    const text = textToSpeak || document.getElementById('card-word-back').innerText;
    if (!text) return;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }
}

/**************************************************************
 * 更新全局面板上的进度看板
 **************************************************************/
function updateOverallProgress() {
    const totalWords = VOCABULARY_DB.length;
    const masteredCount = appState.masteredWords.length;
    
    const ratio = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
    document.getElementById('mastered-ratio').innerText = `${ratio}%`;
    document.getElementById('mastered-progress').style.width = `${ratio}%`;
    
    document.getElementById('stats-total').innerText = `${masteredCount}/${totalWords}`;
    
    const acc = appState.stats.totalAttempts > 0 
        ? Math.round((appState.stats.correctAttempts / appState.stats.totalAttempts) * 100) 
        : 0;
    document.getElementById('stats-accuracy').innerText = `${acc}%`;

    // 更新错题标记角标
    const count = appState.mistakes.length;
    const badge = document.getElementById('mistake-badge');
    const mBadge = document.getElementById('m-mistake-badge');
    
    if (count > 0) {
        badge.innerText = count;
        badge.classList.remove('hidden');
        mBadge.innerText = count;
        mBadge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
        mBadge.classList.add('hidden');
    }
}