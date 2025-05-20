// 1. Spinner items per letter (updated to match uploaded files)
const spinnerItems = {
  A: ["alligator", "amulet", "anchor", "ant", "apple", "arrow", "astronaut", "ax"],
  B: ["bag", "bat", "bed", "bell", "bird", "book", "box", "bread", "bug", "bus"],
  C: ["cab", "can", "cap", "car", "cat", "cod", "cot", "cub", "cup"],
  D: ["dog", "duck", "dinosaur", "drum", "doll", "door", "desk", "diamond", "die"],
  E: ["egg", "elephant", "elf", "end", "enter", "envelope", "exit"],
  F: ["fish", "frog", "fan", "fire", "feather", "fork", "fox", "fence", "foot"],
  G: ["goat", "gift", "girl", "guitar", "grapes", "glasses", "goose", "gloves"],
  H: ["hat", "hen", "house", "hippo", "hammer", "hand", "helicopter", "hamburger"],
  I: ["igloo", "insect", "ink", "iguana", "infant", "internet"],
  J: ["jam", "jelly", "jacket", "juice", "jump", "jug", "jet", "jeep"],
  K: ["kangaroo", "kite", "key", "king", "kitten", "kettle", "kiwi", "keyboard", "kick"],
  L: ["lion", "leaf", "lamp", "ladder", "lemon", "lollipop", "lock", "ladybug", "log"],
  M: ["monkey", "moon", "mouse", "mug", "map", "milk", "mop"],
  N: ["nose", "nest", "net", "nail", "nap", "nine", "note", "needle"],
  O: ["octopus", "ostrich", "olive", "ox", "onion"],
  P: ["pig", "pen", "pan", "pizza", "pencil", "peach", "panda", "pumpkin"],
  Q: ["queen", "quilt", "quial", "quick", "queue", "quiet"],
  R: ["rabbit", "robot", "rainbow", "ring", "rose", "ruler", "rocket", "raft"],
  S: ["sun", "sock", "sandwich", "star", "seal", "soap", "snowman"],
  T: ["tiger", "tap", "top", "tooth", "tent", "tomato", "train", "tree"],
  U: ["umbrella", "up", "upset", "unzip", "upstairs", "undo"],
  V: ["van", "vase", "violin", "vegetables", "vest", "vulture", "volcano"],
  W: ["whale", "watch", "watermelon", "web", "wagon", "worm", "witch", "window"],
  Y: ["yarn", "yam", "yawn", "yolk", "yoyo"],
  Z: ["zebra", "zoo", "zip", "zero", "zap", "zigzag"]
};

// 2. Grab DOM elements
const spinBtn = document.getElementById('spin-button');
const playBtn = document.getElementById('play-sound-button');
const readQuestionBtn = document.getElementById('read-question-button');
const imgEl = document.getElementById('word-image');
const qEl = document.getElementById('question');
const ansEl = document.getElementById('answer');
const currentWordEl = document.getElementById('current-word');
const letterButtons = document.querySelectorAll('.letter-btn');

let currentWord = '';
let selectedLetter = 'all';
let correctCount = 0;

// 3. Helpers
function toFilename(word) {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getPool() {
  let pool = selectedLetter === 'all' ? Object.values(spinnerItems).flat() : spinnerItems[selectedLetter.toUpperCase()] || [];
  return pool.filter(word => word.length <= 5);
}

function preloadAssets() {
  const letters = Object.keys(spinnerItems);
  letters.forEach(letter => {
    spinnerItems[letter].forEach(word => {
      const baseName = toFilename(word);
      const letterLower = letter.toLowerCase();
      const img = new Image();
      img.src = `images/${letterLower}_${baseName}.webp`;
      const audio = new Audio(`audio/${letterLower}.mp3`);
    });
  });
}

// 4. Letter selection logic
letterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedLetter = btn.dataset.letter;
    letterButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const popSound = new Audio('audio/pop.mp3');
    popSound.play();
  });
});

// 5. Spin logic
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
    console.log(`Successfully loaded image: ${imgEl.src}`);
    qEl.textContent = `What is the first sound of “${currentWord}”?`;
    currentWordEl.textContent = currentWord;
  };
  imgEl.onerror = () => {
    console.log(`Failed to load WebP: ${webpSrc}, trying PNG: ${pngSrc}`);
    imgEl.onerror = () => {
      console.log(`Failed to load PNG: ${pngSrc}, reverting to placeholder`);
      imgEl.src = 'images/placeholder.png';
      qEl.textContent = 'Oops! Image not found. Try spinning again!';
      currentWordEl.textContent = '';
    };
    imgEl.onload = () => {
      console.log(`Successfully loaded PNG: ${pngSrc}`);
      qEl.textContent = `What is the first sound of “${currentWord}”?`;
      currentWordEl.textContent = currentWord;
    };
    imgEl.src = pngSrc;
  };

  console.log(`Attempting to load image for "${currentWord}": ${webpSrc}`);
  imgEl.src = webpSrc;
  imgEl.alt = currentWord;
});

// 6. Play-sound logic
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

  correctCount++;
  if (correctCount === 3) {
    ansEl.textContent += " 🎉 Yay! You got 3 in a row!";
    correctCount = 0;
  }
});

// 7. Text-to-speech for questions
readQuestionBtn.addEventListener('click', () => {
  if (qEl.textContent) {
    const utterance = new SpeechSynthesisUtterance(qEl.textContent);
    window.speechSynthesis.speak(utterance);
  }
});

// 8. Preload assets on load
window.addEventListener('load', preloadAssets);
