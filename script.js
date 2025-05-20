// 1. Spinner items per letter (unchanged)
const spinnerItems = {
  A: ["acorn", "alligator", "amulet", "anchor", "ant", "apple", "arrow", "astronaut", "axe"],
  B: ["bag", "bat", "bed", "bell", "bird", "book", "box", "bread", "bug", "bus"],
  C: ["cat", "car", "cake", "can", "cap", "cup", "corn", "coin", "comb"],
  D: ["dog", "duck", "dinosaur", "drum", "doll", "door", "desk", "diamond", "dice"],
  E: ["egg", "elephant", "elbow", "envelope", "engine", "elf", "end", "enter", "exit"],
  F: ["fish", "frog", "fan", "fire", "feather", "fork", "fox", "fence", "foot"],
  G: ["goat", "gift", "girl", "guitar", "gate", "grapes", "glasses", "goose", "gloves"],
  H: ["hat", "hen", "house", "hippo", "hammer", "hand", "heart", "helicopter", "hamburger"],
  I: ["igloo", "insect", "ink", "iguana", "infant", "instruments", "invitation", "inside", "internet"],
  J: ["jam", "jelly", "jacket", "juice", "jump", "jug", "jet", "jeep", "jar"],
  K: ["kangaroo", "kite", "key", "king", "kitten", "kettle", "kiwi", "keyboard", "kick"],
  L: ["lion", "leaf", "lamp", "ladder", "lemon", "lollipop", "lock", "ladybird", "log"],
  M: ["monkey", "moon", "mouse", "mug", "map", "milk", "magnet", "mushroom", "mirror"],
  N: ["nose", "nest", "net", "nail", "nap", "neck", "nine", "notebook", "needle"],
  O: ["octopus", "ostrich", "olive", "ox", "onion", "otter", "oven", "orange", "oar"],
  P: ["pig", "pen", "pan", "pizza", "pencil", "peach", "panda", "pumpkin", "popcorn"],
  Q: ["queen", "quilt", "quail", "question mark", "quick", "queue", "quack", "quiet"],
  R: ["rabbit", "robot", "rainbow", "ring", "rose", "ruler", "rocket", "raft", "radio"],
  S: ["sun", "sock", "sandwich", "star", "seal", "soap", "snowman", "scarf", "snail"],
  T: ["tiger", "tap", "top", "tooth", "tent", "tomato", "train", "table", "tree"],
  U: ["umbrella", "up", "upset", "unzip", "upstairs", "undo"],
  V: ["van", "vase", "violin", "vegetables", "vest", "vulture", "volcano", "vacuum"],
  W: ["whale", "watch", "watermelon", "web", "wagon", "worm", "witch", "wheel", "window"],
  X: ["box", "fox", "mix", "fix", "six", "axe", "ox", "wax", "T-Rex"],
  Y: ["yarn", "yam", "yak", "yawn", "yo-yo", "yolk", "yacht"],
  Z: ["zebra", "zoo", "zip", "zipper", "zero", "zap", "zigzag"]
};

// 2. Grab DOM elements
const spinBtn = document.getElementById('spin-button');
const playBtn = document.getElementById('play-sound-button');
const readQuestionBtn = document.getElementById('read-question-button');
const imgEl = document.getElementById('word-image');
const qEl = document.getElementById('question');
const ansEl = document.getElementById('answer');
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
  return pool.filter(word => word.length <= 5); // Progression: Start with shorter words
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
    letterButtons.forEach(b => b.style.backgroundColor = '#ffcc00');
    btn.style.backgroundColor = '#ffaa00';
  });
});

// 5. Spin logic
spinBtn.addEventListener('click', () => {
  ansEl.textContent = '';
  imgEl.classList.add('spinning');

  const pool = getPool();
  if (!pool.length) {
    qEl.textContent = `No words for “${selectedLetter.toUpperCase()}”`;
    imgEl.src = 'images/placeholder.png';
    imgEl.onerror = null; // Clear any previous error handlers
    return;
  }

  currentWord = pool[Math.floor(Math.random() * pool.length)];
  const baseName = toFilename(currentWord);
  const letter = currentWord[0].toLowerCase();
  const webpSrc = `images/${letter}_${baseName}.webp`;
  const pngSrc = `images/${letter}_${baseName}.png`;

  // Reset the image element's error handler and source
  imgEl.onerror = null;
  imgEl.onload = () => {
    // Image loaded successfully, update the question
    qEl.textContent = `What is the first sound of “${currentWord}”?`;
  };
  imgEl.onerror = () => {
    // Try the PNG fallback
    imgEl.onerror = () => {
      // Both WebP and PNG failed
      imgEl.src = 'images/placeholder.png';
      qEl.textContent = 'Oops! Image not found. Try spinning again!';
    };
    imgEl.onload = () => {
      // PNG loaded successfully
      qEl.textContent = `What is the first sound of “${currentWord}”?`;
    };
    imgEl.src = pngSrc;
  };

  imgEl.src = webpSrc;
  imgEl.alt = currentWord;
});

// 6. Play-sound logic
playBtn.addEventListener('click', () => {
  if (!currentWord) {
    const audio = new Audio('audio/instruction.mp3'); // Assumes an instruction audio exists
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
