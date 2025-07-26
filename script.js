// Words are bundled directly so the app can run without a web server
const spinnerItems = {
  "A": ["alligator", "amulet", "anchor", "ant", "apple", "arrow", "astronaut", "ax"],
  "B": ["bag", "bat", "bed", "bell", "bird", "book", "box", "bread", "bug", "bus"],
  "C": ["cab", "can", "cap", "car", "cat", "cod", "cot", "cub", "cup"],
  "D": ["dog", "duck", "dinosaur", "drum", "doll", "door", "desk", "diamond", "die"],
  "E": ["egg", "elephant", "elf", "end", "enter", "envelope", "exit"],
  "F": ["fish", "frog", "fan", "fire", "feather", "fork", "fox", "fence", "foot"],
  "G": ["goat", "gift", "girl", "guitar", "grapes", "glasses", "goose", "gloves"],
  "H": ["hat", "hen", "house", "hippo", "hammer", "hand", "helicopter", "hamburger"],
  "I": ["igloo", "insect", "ink", "iguana", "infant", "internet"],
  "J": ["jam", "jelly", "jacket", "juice", "jump", "jug", "jet", "jeep"],
  "K": ["kangaroo", "kite", "key", "king", "kitten", "kettle", "kiwi", "keyboard", "kick"],
  "L": ["lion", "leaf", "lamp", "ladder", "lemon", "lollipop", "lock", "ladybug", "log"],
  "M": ["monkey", "moon", "mouse", "mug", "map", "milk", "mop"],
  "N": ["nose", "nest", "net", "nail", "nap", "nine", "note", "needle"],
  "O": ["octopus", "ostrich", "olive", "ox", "onion"],
  "P": ["pig", "pen", "pan", "pizza", "pencil", "peach", "panda", "pumpkin"],
  "Q": ["queen", "quilt", "quail", "quick", "queue", "quiet"],
  "R": ["rabbit", "robot", "rainbow", "ring", "rose", "ruler", "rocket", "raft"],
  "S": ["sun", "sock", "sandwich", "star", "seal", "soap", "snowman"],
  "T": ["tiger", "tap", "top", "tooth", "tent", "tomato", "train", "tree"],
  "U": ["umbrella", "up", "upset", "unzip", "upstairs", "undo"],
  "V": ["van", "vase", "violin", "vegetables", "vest", "vulture", "volcano"],
  "W": ["whale", "watch", "watermelon", "web", "wagon", "worm", "witch", "window"],
  "Y": ["yarn", "yam", "yawn", "yolk", "yoyo"],
  "Z": ["zebra", "zoo", "zip", "zero", "zap", "zigzag"]
};

const letterGroups = {
  1: ['A', 'B', 'C', 'D', 'E'],
  2: ['F', 'G', 'H', 'I', 'J'],
  3: ['K', 'L', 'M', 'N', 'O'],
  4: ['P', 'Q', 'R', 'S', 'T'],
  5: ['U', 'V', 'W', 'Y', 'Z']
};

const CONSTANTS = {
  STREAK_THRESHOLD: 3,
  CONFETTI_COUNT: 20,
  STARS_TO_UNLOCK: 5,
  CONFETTI_COLORS: ['#ffeb3b', '#ff6f61', '#4a90e2'],
  CONFETTI_COLORS_DARK: ['#ffd54f', '#ff9e80', '#4a90e2']
};

// DOM Elements (cached)
const elements = {
  spinBtn: document.getElementById('spin-button'),
  hearWordBtn: document.getElementById('hear-word-button'),
  playBtn: document.getElementById('play-sound-button'),
  readQuestionBtn: document.getElementById('read-question-button'),
  imgEl: document.getElementById('word-image'),
  qEl: document.getElementById('question'),
  ansEl: document.getElementById('answer'),
  currentWordEl: document.getElementById('current-word'),
  letterButtons: document.querySelectorAll('.letter-btn'),
  tabButtons: document.querySelectorAll('.tab-btn'),
  letterGrids: document.querySelectorAll('.letter-grid'),
  starCountEl: document.getElementById('star-count'),
  onboardingModal: document.getElementById('onboarding'),
  startButton: document.getElementById('start-button'),
  themeToggle: document.getElementById('theme-toggle'),
  settingsButton: document.getElementById('settings-button'),
  settingsModal: document.getElementById('settings-modal'),
  voiceSelect: document.getElementById('voice-select'),
  closeSettingsBtn: document.getElementById('close-settings'),
  resetProgressBtn: document.getElementById('reset-progress'),
  progressBar: document.getElementById('progress-bar'),
  mascot: document.querySelector('.mascot')
};

// State
let currentWord = '';
let selectedLetter = 'all';
let selectedGroup = 1;
let correctCount = 0;
let starCount = parseInt(localStorage.getItem('starCount') || '0', 10);
let completedWords = new Set(JSON.parse(localStorage.getItem('completedWords') || '[]'));
let unlockedGroups = JSON.parse(localStorage.getItem('unlockedGroups') || '[1]');
let selectedVoice = null;

// Init
function init() {
  updateUI();
  loadVoices();
  applyTheme(localStorage.getItem('theme') === 'dark');
  preloadAssets(letterGroups[selectedGroup]);
  elements.mascot.classList.add('wave');
  elements.spinBtn.disabled = false; // Enable after init
  if (!localStorage.getItem('onboardingSeen')) {
    elements.onboardingModal.style.display = 'flex';
  }
  attachEventListeners();
}

function updateUI() {
  elements.starCountEl.textContent = starCount;
  elements.progressBar.style.width = `${(unlockedGroups.length / 5) * 100}%`;
  elements.tabButtons.forEach(btn => {
    const group = parseInt(btn.dataset.group);
    btn.disabled = !unlockedGroups.includes(group);
    if (btn.disabled) btn.classList.add('disabled');
    else btn.classList.remove('disabled');
  });
}

function saveProgress() {
  localStorage.setItem('starCount', starCount);
  localStorage.setItem('completedWords', JSON.stringify(Array.from(completedWords)));
  localStorage.setItem('unlockedGroups', JSON.stringify(unlockedGroups));
  updateUI();
  checkUnlockNextGroup();
}

function checkUnlockNextGroup() {
  const nextGroup = Math.max(...unlockedGroups) + 1;
  if (nextGroup <= 5 && starCount >= (unlockedGroups.length * CONSTANTS.STARS_TO_UNLOCK)) {
    unlockedGroups.push(nextGroup);
    saveProgress();
  }
}

function resetProgress() {
  starCount = 0;
  completedWords.clear();
  unlockedGroups = [1];
  selectedGroup = 1;
  saveProgress();
  location.reload(); // Simple reload to reset UI
}

function applyTheme(dark) {
  const emojiSpan = elements.themeToggle.querySelector('.emoji');
  const labelSpan = elements.themeToggle.querySelector('.label');

  if (dark) {
    document.body.classList.add('dark-mode');
    if (emojiSpan) emojiSpan.textContent = '☀️';
    if (labelSpan) labelSpan.textContent = 'Light Mode';
    elements.themeToggle.setAttribute('aria-label', 'Switch to light mode');
  } else {
    document.body.classList.remove('dark-mode');
    if (emojiSpan) emojiSpan.textContent = '🌙';
    if (labelSpan) labelSpan.textContent = 'Dark Mode';
    elements.themeToggle.setAttribute('aria-label', 'Switch to dark mode');
  }
}

// Voices
let voicesLoaded = false;
function chooseDefaultVoice(voices) {
  const femaleIndicators = [
    'female',
    'woman',
    'girl',
    'emma',
    'susan',
    'libby',
    'hazel',
    'zia',
    'eva',
    'samantha'
  ];

  const isFemaleVoice = (voice) =>
    femaleIndicators.some((ind) => voice.name.toLowerCase().includes(ind));

  const enGBFemaleVoices = voices.filter(
    (v) => v.lang === 'en-GB' && isFemaleVoice(v)
  );
  if (enGBFemaleVoices.length) return enGBFemaleVoices[0];

  const enGBVoices = voices.filter((v) => v.lang === 'en-GB');
  if (enGBVoices.length) return enGBVoices[0];

  const enUSFemaleVoices = voices.filter(
    (v) => v.lang === 'en-US' && isFemaleVoice(v)
  );
  if (enUSFemaleVoices.length) return enUSFemaleVoices[0];

  const enUSVoices = voices.filter((v) => v.lang === 'en-US');
  if (enUSVoices.length) return enUSVoices[0];

  return voices[0] || null;
}

function populateVoiceSelect(voices) {
  if (!elements.voiceSelect) return;
  elements.voiceSelect.innerHTML = '';
  voices.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    elements.voiceSelect.appendChild(opt);
  });
  if (selectedVoice) {
    elements.voiceSelect.value = selectedVoice.name;
  }
}

function loadVoices() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length || voicesLoaded) return;
  voicesLoaded = true;

  const storedName = localStorage.getItem('selectedVoiceName');
  if (storedName) {
    const match = voices.find((v) => v.name === storedName);
    selectedVoice = match || chooseDefaultVoice(voices);
  } else {
    selectedVoice = chooseDefaultVoice(voices);
  }

  populateVoiceSelect(voices);
}

if (elements.voiceSelect) {
  elements.voiceSelect.addEventListener('change', () => {
    const voices = speechSynthesis.getVoices();
    const match = voices.find((v) => v.name === elements.voiceSelect.value);
    if (match) {
      selectedVoice = match;
      localStorage.setItem('selectedVoiceName', match.name);
    }
  });
}

// Handle voice loading
speechSynthesis.addEventListener('voiceschanged', loadVoices);
loadVoices();

// Preload (optimized to current only)
function preloadAssets(letters) {
  letters.forEach(letter => {
    spinnerItems[letter]?.forEach(word => {
      const baseName = toFilename(word);
      const img = new Image();
      img.src = `images/${letter.toLowerCase()}_${baseName}.webp`;
      // Audio preload not needed as created on demand
    });
  });
}

// Helpers
function toFilename(word) {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resetLetterIfDone(letter) {
  const words = spinnerItems[letter];
  if (!words) return;
  if (words.every(w => completedWords.has(w))) {
    words.forEach(w => completedWords.delete(w));
  }
}

function getPool() {
  let pool =
    selectedLetter === 'all'
      ? letterGroups[selectedGroup].flatMap(l => spinnerItems[l] || [])
      : spinnerItems[selectedLetter.toUpperCase()] || [];
  pool = pool.filter(word => word.length <= 5);
  let filtered = pool.filter(word => !completedWords.has(word));
  if (!filtered.length && pool.length) {
    if (selectedLetter === 'all') {
      letterGroups[selectedGroup].forEach(resetLetterIfDone);
      filtered = pool.filter(word => !completedWords.has(word));
    } else {
      resetLetterIfDone(selectedLetter.toUpperCase());
      filtered = pool;
    }
  }
  return filtered;
}

function addConfetti() {
  const colors = document.body.classList.contains('dark-mode') ? CONSTANTS.CONFETTI_COLORS_DARK : CONSTANTS.CONFETTI_COLORS;
  for (let i = 0; i < CONSTANTS.CONFETTI_COUNT; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = `${Math.random() * 1}s`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 2000);
  }
}

// Event Listeners
function attachEventListeners() {
  elements.startButton.addEventListener('click', () => {
    elements.onboardingModal.style.display = 'none';
    localStorage.setItem('onboardingSeen', 'true');
  });

  elements.themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    applyTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  elements.settingsButton.addEventListener('click', () => {
    elements.settingsModal.style.display = 'flex';
  });
  elements.closeSettingsBtn.addEventListener('click', () => {
    elements.settingsModal.style.display = 'none';
  });
  elements.resetProgressBtn.addEventListener('click', resetProgress);

  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const group = parseInt(btn.dataset.group);
      if (!unlockedGroups.includes(group)) return;
      elements.tabButtons.forEach(b => b.classList.remove('selected'));
      elements.letterGrids.forEach(grid => grid.classList.remove('active'));
      btn.classList.add('selected');
      document.getElementById(`group-${group}`).classList.add('active');
      selectedGroup = group;
      selectedLetter = 'all';
      elements.letterButtons.forEach(b => b.classList.remove('selected'));
      document.querySelector('.letter-btn[data-letter="all"]').classList.add('selected');
      preloadAssets(letterGroups[group]);
      elements.mascot.classList.add('wave');
    });
  });

  elements.letterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedLetter = btn.dataset.letter;
      elements.letterButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      new Audio('audio/pop.mp3').play();
      preloadAssets(selectedLetter === 'all' ? letterGroups[selectedGroup] : [selectedLetter]);
    });
  });

  elements.spinBtn.addEventListener('click', () => {
    elements.ansEl.textContent = '';
    elements.imgEl.classList.add('spinning');
    if (navigator.vibrate) navigator.vibrate(200);
    const pool = getPool();
    if (!pool.length) {
      elements.qEl.textContent = `No words for “${selectedLetter.toUpperCase()}”`;
      elements.currentWordEl.textContent = '';
      elements.imgEl.src = 'images/placeholder.png';
      return;
    }
    currentWord = pool[Math.floor(Math.random() * pool.length)];
    const baseName = toFilename(currentWord);
    const letter = currentWord[0].toLowerCase();
    elements.imgEl.src = `images/${letter}_${baseName}.webp`;
    elements.imgEl.alt = currentWord;
    elements.imgEl.onerror = () => { elements.imgEl.src = `images/${letter}_${baseName}.png`; };
    elements.qEl.textContent = `What is the first sound of “${currentWord}”?`;
    elements.currentWordEl.textContent = currentWord;
    // Auto-play word TTS
    const utterance = new SpeechSynthesisUtterance(currentWord);
    if (selectedVoice) utterance.voice = selectedVoice;
    speechSynthesis.speak(utterance);
  });

  elements.hearWordBtn.addEventListener('click', () => {
    if (currentWord) {
      const utterance = new SpeechSynthesisUtterance(currentWord);
      if (selectedVoice) utterance.voice = selectedVoice;
      speechSynthesis.speak(utterance);
    }
  });

  elements.playBtn.addEventListener('click', () => {
    if (!currentWord) {
      new Audio('audio/instruction.mp3').play();
      elements.ansEl.textContent = '▶ Spin to hear a sound!';
      return;
    }
    const letter = currentWord[0].toLowerCase();
    const audio = new Audio(`audio/${letter}.mp3`);
    audio.play().catch(() => elements.ansEl.textContent = 'Oops! Sound not found.');
    elements.ansEl.textContent = `▶ The first sound is /${letter}/.`;
    elements.ansEl.classList.add('correct');
    correctCount++;
    starCount++;
    elements.starCountEl.textContent = starCount;
    saveProgress();
    completedWords.add(currentWord);
    resetLetterIfDone(currentWord[0].toUpperCase());
    if (correctCount >= CONSTANTS.STREAK_THRESHOLD) {
      elements.ansEl.textContent += " 🎉 Yay! Streak bonus!";
      addConfetti();
      correctCount = 0;
    }
    if (navigator.vibrate) navigator.vibrate(200);
    elements.mascot.src = 'images/mascot-happy.png';
    setTimeout(() => { elements.mascot.src = 'images/mascot.png'; }, 2000);
  });

  elements.readQuestionBtn.addEventListener('click', () => {
    if (elements.qEl.textContent) {
      const utterance = new SpeechSynthesisUtterance(elements.qEl.textContent);
      if (selectedVoice) utterance.voice = selectedVoice;
      speechSynthesis.speak(utterance);
    }
  });

  elements.imgEl.addEventListener('animationend', (e) => {
    if (e.animationName === 'bounce') elements.imgEl.classList.remove('spinning');
  });
}

init();
