// script.js

// 1. Spinner items per letter (exactly your A–Z master list)
const spinnerItems = {
  A: [
    "acorn",
    "alligator",
    "amulet",
    "anchor",
    "ant",
    "apple",
    "arrow",
    "astronaut",
    "axe"
  ],
  B: [
    "bag",
    "bat",
    "bed",
    "bell",
    "bird",
    "book",
    "box",
    "bread",
    "bug",
    "bus"
  ],
  C: [
    "cat",
    "car",
    "cake",
    "can",
    "cap",
    "cup",
    "corn",
    "coin",
    "comb"
  ],
  D: [
    "dog",
    "duck",
    "dinosaur",
    "drum",
    "doll",
    "door",
    "desk",
    "diamond",
    "dice"
  ],
  E: [
    "egg",
    "elephant",
    "elbow",
    "envelope",
    "engine",
    "elf",
    "end",
    "enter",
    "exit"
  ],
  F: [
    "fish",
    "frog",
    "fan",
    "fire",
    "feather",
    "fork",
    "fox",
    "fence",
    "foot"
  ],
  G: [
    "goat",
    "gift",
    "girl",
    "guitar",
    "gate",
    "grapes",
    "glasses",
    "goose",
    "gloves"
  ],
  H: [
    "hat",
    "hen",
    "house",
    "hippo",
    "hammer",
    "hand",
    "heart",
    "helicopter",
    "hamburger"
  ],
  I: [
    "igloo",
    "insect",
    "ink",
    "iguana",
    "infant",
    "instruments",
    "invitation",
    "inside",
    "internet"
  ],
  J: [
    "jam",
    "jelly",
    "jacket",
    "juice",
    "jump",
    "jug",
    "jet",
    "jeep",
    "jar"
  ],
  K: [
    "kangaroo",
    "kite",
    "key",
    "king",
    "kitten",
    "kettle",
    "kiwi",
    "keyboard",
    "kick"
  ],
  L: [
    "lion",
    "leaf",
    "lamp",
    "ladder",
    "lemon",
    "lollipop",
    "lock",
    "ladybird",
    "log"
  ],
  M: [
    "monkey",
    "moon",
    "mouse",
    "mug",
    "map",
    "milk",
    "magnet",
    "mushroom",
    "mirror"
  ],
  N: [
    "nose",
    "nest",
    "net",
    "nail",
    "nap",
    "neck",
    "nine",
    "notebook",
    "needle"
  ],
  O: [
    "octopus",
    "ostrich",
    "olive",
    "ox",
    "onion",
    "otter",
    "oven",
    "orange",
    "oar"
  ],
  P: [
    "pig",
    "pen",
    "pan",
    "pizza",
    "pencil",
    "peach",
    "panda",
    "pumpkin",
    "popcorn"
  ],
  Q: [
    "queen",
    "quilt",
    "quail",
    "question mark",
    "quick",
    "queue",
    "quack",
    "quiet"
  ],
  R: [
    "rabbit",
    "robot",
    "rainbow",
    "ring",
    "rose",
    "ruler",
    "rocket",
    "raft",
    "radio"
  ],
  S: [
    "sun",
    "sock",
    "sandwich",
    "star",
    "seal",
    "soap",
    "snowman",
    "scarf",
    "snail"
  ],
  T: [
    "tiger",
    "tap",
    "top",
    "tooth",
    "tent",
    "tomato",
    "train",
    "table",
    "tree"
  ],
  U: [
    "umbrella",
    "up",
    "upset",
    "unzip",
    "upstairs",
    "undo"
  ],
  V: [
    "van",
    "vase",
    "violin",
    "vegetables",
    "vest",
    "vulture",
    "volcano",
    "vacuum"
  ],
  W: [
    "whale",
    "watch",
    "watermelon",
    "web",
    "wagon",
    "worm",
    "witch",
    "wheel",
    "window"
  ],
  X: [
    "box",
    "fox",
    "mix",
    "fix",
    "six",
    "axe",
    "ox",
    "wax",
    "T-Rex"
  ],
  Y: [
    "yarn",
    "yam",
    "yak",
    "yawn",
    "yo-yo",
    "yolk",
    "yacht"
  ],
  Z: [
    "zebra",
    "zoo",
    "zip",
    "zipper",
    "zero",
    "zap",
    "zigzag"
  ]
};

// 2. Grab DOM elements
const spinBtn   = document.getElementById('spin-button');
const playBtn   = document.getElementById('play-sound-button');
const imgEl     = document.getElementById('word-image');
const qEl       = document.getElementById('question');
const ansEl     = document.getElementById('answer');
const letterSel = document.getElementById('letter-select');

let currentWord = '';

// 3. Helpers

// Convert a word into a filename-safe base (e.g. "question mark" → "question_mark")
function toFilename(word) {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Return the current pool based on selection ("all" flattens every letter)
function getPool() {
  const sel = letterSel.value;
  if (sel === 'all') {
    return Object.values(spinnerItems).flat();
  }
  const arr = spinnerItems[sel.toUpperCase()];
  return arr ? [...arr] : [];
}

// 4. Spin logic
spinBtn.addEventListener('click', () => {
  // reset
  ansEl.textContent = '';
  playBtn.disabled = false;

  const pool = getPool();
  if (!pool.length) {
    qEl.textContent = `No words for “${letterSel.value.toUpperCase()}”`;
    imgEl.src = 'images/placeholder.png';
    return;
  }

  // pick a random word
  currentWord = pool[Math.floor(Math.random() * pool.length)];
  const baseName = toFilename(currentWord);        // e.g. "bus"
  const letter   = currentWord[0].toLowerCase();   // e.g. "b"
  const webpSrc  = `images/${letter}_${baseName}.webp`;
  const pngSrc   = `images/${letter}_${baseName}.png`;

  // fallback from WebP to PNG
  imgEl.onerror = () => {
    imgEl.onerror = null;
    imgEl.src     = pngSrc;
  };

  imgEl.src       = webpSrc;
  imgEl.alt       = currentWord;
  qEl.textContent = `What is the first sound of “${currentWord}”?`;
});

// 5. Play-sound logic
playBtn.addEventListener('click', () => {
  if (!currentWord) return;
  const letter = currentWord[0].toLowerCase();
  const audio  = new Audio(`audio/${letter}.mp3`);
  audio.play();
  ansEl.textContent = `▶ The first sound is /${letter}/`;
});
