// 1. Spinner items per letter
// Loaded asynchronously from data/words.json
let spinnerItems = {};

const letterGroups = {
  1: ['A', 'B', 'C', 'D', 'E'],
  2: ['F', 'G', 'H', 'I', 'J'],
  3: ['K', 'L', 'M', 'N', 'O'],
  4: ['P', 'Q', 'R', 'S', 'T'],
  5: ['U', 'V', 'W', 'Y', 'Z']
};

// 2. Grab DOM elements
const spinBtn = document.getElementById('spin-button');
// Disable spin until words load
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

// Load spinner words from external JSON
fetch('data/words.json')
  .then(res => res.json())
  .then(data => {
    spinnerItems = data;
    spinBtn.disabled = false;
    preloadAssets(letterGroups[selectedGroup]);
  })
  .catch(err => console.error('Failed to load words.json', err));
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

// 3. Voice selection for text-to-speech
let selectedVoice = null;

function selectVoice() {
  const voices = speechSynthesis.getVoices();
  
  // Indicators for female voices
  const femaleIndicators = ["female", "woman", "girl", "emma", "susan", "libby", "hazel", "zia", "eva", "samantha"];
  
  // Helper to identify female voices
  const isFemaleVoice = (voice) => 
    femaleIndicators.some(indicator => voice.name.toLowerCase().includes(indicator));
  
  // Priority 1: UK female voice (en-GB)
  const enGBFemaleVoices = voices.filter(voice => voice.lang === 'en-GB' && isFemaleVoice(voice));
  if (enGBFemaleVoices.length > 0) {
    selectedVoice = enGBFemaleVoices[0];
    console.log(`Selected voice: ${selectedVoice.name}`);
    return;
  }
  
  // Priority 2: Any UK voice (en-GB)
  const enGBVoices = voices.filter(voice => voice.lang === 'en-GB');
  if (enGBVoices.length > 0) {
    selectedVoice = enGBVoices[0];
    console.log(`Selected voice: ${selectedVoice.name}`);
    return;
  }
  
  // Priority 3: US female voice (en-US)
  const enUSFemaleVoices = voices.filter(voice => voice.lang === 'en-US' && isFemaleVoice(voice));
  if (enUSFemaleVoices.length > 0) {
    selectedVoice = enUSFemaleVoices[0];
    console.log(`Selected voice: ${selectedVoice.name}`);
    return;
  }
  
  // Priority 4: Any US voice (en-US)
  const enUSVoices = voices.filter(voice => voice.lang === 'en-US');
  if (enUSVoices.length > 0) {
    selectedVoice = enUSVoices[0];
    console.log(`Selected voice: ${selectedVoice.name}`);
    return;
  }
  
  // Priority 5: Any available voice
  if (voices.length > 0) {
    selectedVoice = voices[0];
    console.log(`Selected voice: ${selectedVoice.name}`);
  }
}

// Handle voice loading
speechSynthesis.addEventListener('voiceschanged', selectVoice);
selectVoice(); // For browsers where voices are already available

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
