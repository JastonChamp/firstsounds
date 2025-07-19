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

// 2. Grab DOM elements
const spinBtn = document.getElementById('spin-button');
// Spinner is enabled once the page finishes loading
spinBtn.disabled = true;
const playBtn = document.getElementById('play-sound-button');
const readQuestionBtn = document.getElementById('read-question-button');
const imgEl = document.getElementById('word-image');
imgEl.addEventListener('animationend', (e) => {
  if (e.animationName === 'bounce') {
    imgEl.classList.remove('spinning');
  }
});
const qEl = document.getElementById('question');
const ansEl = document.getElementById('answer');
const currentWordEl = document.getElementById('current-word');
const letterButtons = document.querySelectorAll('.letter-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const letterGrids = document.querySelectorAll('.letter-grid');
const starCountEl = document.getElementById('star-count');
const onboardingModal = document.getElementById('onboarding');
const startButton = document.getElementById('start-button');
const themeToggle = document.getElementById('theme-toggle');
const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const voiceSelect = document.getElementById('voice-select');
const closeSettingsBtn = document.getElementById('close-settings');
const progressBar = document.getElementById('progress-bar');
const mascot = document.querySelector('.mascot');
let currentWord = '';
let selectedLetter = 'all';
let selectedGroup = 1;
let correctCount = 0;
let starCount = parseInt(localStorage.getItem('starCount'), 10);
if (isNaN(starCount)) starCount = 0;
let completedWords = new Set();
let unlockedGroups = JSON.parse(localStorage.getItem('unlockedGroups') || 'null');
if (!Array.isArray(unlockedGroups)) {
  unlockedGroups = [1, 2, 3, 4, 5];
}
// Update UI based on saved values
starCountEl.textContent = starCount;
tabButtons.forEach(btn => {
  const group = parseInt(btn.dataset.group);
  if (!unlockedGroups.includes(group)) {
    btn.disabled = true;
  }
});
progressBar.style.width = `${(unlockedGroups.length / 5) * 100}%`;

// Spinner words are already loaded, so enable the spin button
spinBtn.disabled = false;
preloadAssets(letterGroups[selectedGroup]);

// Mascot wave on load
mascot.classList.add('wave');

function applyTheme(dark) {
  const emojiSpan = themeToggle.querySelector('.emoji');
  const labelSpan = themeToggle.querySelector('.label');

  if (dark) {
    document.body.classList.add('dark-mode');
   if (emojiSpan) emojiSpan.textContent = '☀️';
    if (labelSpan) labelSpan.textContent = 'Light Mode';
    themeToggle.setAttribute('aria-label', 'Switch to light mode');
  } else {
    document.body.classList.remove('dark-mode');
    if (emojiSpan) emojiSpan.textContent = '🌙';
    if (labelSpan) labelSpan.textContent = 'Dark Mode';
    themeToggle.setAttribute('aria-label', 'Switch to dark mode');
  }
}

// Initialize theme from localStorage
applyTheme(localStorage.getItem('theme') === 'dark');

themeToggle.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark-mode');
  applyTheme(isDark);
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Settings modal
  if (settingsButton && settingsModal && closeSettingsBtn) {
    settingsButton.addEventListener('click', () => {
      settingsModal.style.display = 'flex';
    });
    closeSettingsBtn.addEventListener('click', () => {
      settingsModal.style.display = 'none';
    });
  }

// 3. Voice selection for text-to-speech
let selectedVoice = null;
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
  if (!voiceSelect) return;
  voiceSelect.innerHTML = '';
  voices.forEach((v) => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    voiceSelect.appendChild(opt);
  });
  if (selectedVoice) {
    voiceSelect.value = selectedVoice.name;
  }
}

function loadVoices() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;

  const storedName = localStorage.getItem('selectedVoiceName');
  if (storedName) {
    const match = voices.find((v) => v.name === storedName);
    selectedVoice = match || chooseDefaultVoice(voices);
  } else {
    selectedVoice = chooseDefaultVoice(voices);
  }

  populateVoiceSelect(voices);
}

if (voiceSelect) {
  voiceSelect.addEventListener('change', () => {
    const voices = speechSynthesis.getVoices();
    const match = voices.find((v) => v.name === voiceSelect.value);
    if (match) {
      selectedVoice = match;
      localStorage.setItem('selectedVoiceName', match.name);
    }
  });
}

// Handle voice loading
speechSynthesis.addEventListener('voiceschanged', loadVoices);
loadVoices();

// 4. Helper functions
function toFilename(word) {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Reset completed words for a specific letter when all of its words
// have been seen. This allows the spinner to cycle again.
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
      ? Object.values(spinnerItems).flat()
      : spinnerItems[selectedLetter.toUpperCase()] || [];
  pool = pool.filter(word => word.length <= 5);
  let filtered = pool.filter(word => !completedWords.has(word));
  if (!filtered.length && pool.length) {
    if (selectedLetter === 'all') {
      Object.keys(spinnerItems).forEach(resetLetterIfDone);
      filtered = pool.filter(word => !completedWords.has(word));
    } else {
      resetLetterIfDone(selectedLetter.toUpperCase());
      filtered = pool;
    }
  }
  return filtered;
}

function preloadAssets(target) {
  let letters;
  if (!target || target === 'all') {
    letters = Object.keys(spinnerItems);
  } else if (Array.isArray(target)) {
    letters = target.map(l => l.toUpperCase());
  } else {
    letters = [String(target).toUpperCase()];
  }
  letters.forEach(letter => {
    if (!spinnerItems[letter]) return;
    spinnerItems[letter].forEach(word => {
      const baseName = toFilename(word);
      const letterLower = letter.toLowerCase();
      const img = new Image();
      img.src = `images/${letterLower}_${baseName}.webp`;
     new Audio(`audio/${letter.toLowerCase()}.mp3`);
    });
  });
}

function addConfetti() {
  for (let i = 0; i < 20; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.background = ['#ffeb3b', '#ff6f61', '#4a90e2'][Math.floor(Math.random() * 3)];
    confetti.style.animationDelay = `${Math.random() * 1}s`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 2000);
  }
}

// Persist progress to localStorage
function saveProgress() {
  localStorage.setItem('starCount', String(starCount));
  localStorage.setItem('unlockedGroups', JSON.stringify(unlockedGroups));
  progressBar.style.width = `${(unlockedGroups.length / 5) * 100}%`;
}

// 5. Onboarding
if (!localStorage.getItem('onboardingSeen')) {
  onboardingModal.style.display = 'flex';
}

startButton.addEventListener('click', () => {
  onboardingModal.style.display = 'none';
  localStorage.setItem('onboardingSeen', 'true');
});

// 6. Letter group tabs
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const group = parseInt(btn.dataset.group);
    if (!unlockedGroups.includes(group)) return;
    tabButtons.forEach(b => b.classList.remove('selected'));
    letterGrids.forEach(grid => grid.classList.remove('active'));
    btn.classList.add('selected');
    document.getElementById(`group-${group}`).classList.add('active');
    selectedLetter = 'all';
    selectedGroup = group;
    letterButtons.forEach(b => b.classList.remove('selected'));
    document.querySelector('.letter-btn[data-letter="all"]').classList.add('selected');
    preloadAssets(letterGroups[group]);
    mascot.classList.add('wave'); // Wave on tab change
  });
});

// 7. Letter selection
letterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedLetter = btn.dataset.letter;
    letterButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const popSound = new Audio('audio/pop.mp3');
    popSound.play();
     if (selectedLetter === 'all') {
      preloadAssets(letterGroups[selectedGroup]);
    } else {
      preloadAssets(selectedLetter);
    }
  });
});

// 8. Spin logic
spinBtn.addEventListener('click', () => {
  ansEl.textContent = '';
  imgEl.classList.add('spinning');
  if (navigator.vibrate) navigator.vibrate(200); // Haptic feedback
  const pool = getPool();
  if (!pool.length) {
    qEl.textContent = `No words for “${selectedLetter.toUpperCase()}”`;
    currentWordEl.textContent = '';
    imgEl.src = 'images/placeholder.png';
    imgEl.onerror = null;
    return;
  }
  currentWord = pool[Math.floor(Math.random() * pool.length)];
  const baseName = toFilename(currentWord);
  const letter = currentWord[0].toLowerCase();
  const webpSrc = `images/${letter}_${baseName}.webp`;
  const pngSrc = `images/${letter}_${baseName}.png`;
  imgEl.onerror = null;
  imgEl.onload = () => {
    qEl.textContent = `What is the first sound of “${currentWord}”?`;
    currentWordEl.textContent = currentWord;
  };
  imgEl.onerror = () => {
    imgEl.onerror = () => {
      imgEl.src = 'images/placeholder.png';
      qEl.textContent = 'Oops! Image not found. Try spinning again!';
      currentWordEl.textContent = '';
    };
    imgEl.onload = () => {
      qEl.textContent = `What is the first sound of “${currentWord}”?`;
      currentWordEl.textContent = currentWord;
    };
    imgEl.src = pngSrc;
  };
  imgEl.src = webpSrc;
  imgEl.alt = currentWord;
});

// 9. Play-sound logic
playBtn.addEventListener('click', () => {
  if (!currentWord) {
    const audio = new Audio('audio/instruction.mp3');
    audio.play();
    ansEl.textContent = '▶ Spin to hear a sound!';
    return;
  }
  const letter = currentWord[0].toLowerCase();
  const audio = new Audio(`audio/${letter}.mp3`);
  audio.onerror = () => {
    ansEl.textContent = 'Oops! Sound not found.';
  };
  audio.play();
  ansEl.textContent = `▶ The first sound is /${letter}/. Great job!`;
  ansEl.classList.add('correct');
  correctCount++;
  starCount++;
  starCountEl.textContent = starCount;
  saveProgress();
  completedWords.add(currentWord);
  resetLetterIfDone(currentWord[0].toUpperCase());
  if (correctCount === 3) {
    ansEl.textContent += " 🎉 Yay! You got 3 in a row!";
    addConfetti();
    correctCount = 0;
  }
  if (navigator.vibrate) navigator.vibrate(200); // Haptic feedback
  mascot.src = 'images/mascot-happy.png'; // Change to happy mascot
  setTimeout(() => { mascot.src = 'images/mascot.png'; }, 2000); // Revert after 2s
  const utter = new SpeechSynthesisUtterance('Great job!');
  if (selectedVoice) utter.voice = selectedVoice;
  window.speechSynthesis.speak(utter);
});

// 10. Text-to-speech
readQuestionBtn.addEventListener('click', () => {
  if (qEl.textContent) {
    const utterance = new SpeechSynthesisUtterance(qEl.textContent);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  }
});

// 11. Preload assets (invoked on selection)
