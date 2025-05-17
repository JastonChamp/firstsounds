// Full A–Z list
const words = [
  'ant','alligator','apple','anchor','arrow','ax',
  'bag','bat','bed','bell','bin','bird','bus','box','bug','bun',
  'cab','can','cap','car','cat','cop','cup','cut','cow','corn',
  'dad','dog','dig','duck','dot','den','dish','drum','doll','door',
  'egg','elk','elf','end','engine','envelope','exit',
  'fan','fig','fin','fish','fox','fork','frog','foot','flag','fire',
  'gap','gas','gift','goat','gum','gun','girl','goose','grapes','grass',
  'hat','hen','hop','hot','hut','hill','horse','heart','hammer','hand',
  'igloo','insect','ink','iguanodon','inch','inn',
  'jam','jet','jug','jump','jelly','jacket','jar','jeans','juice','jigsaw',
  'kangaroo','kite','key','kid','kitten','kettle','kick','king','koala','knee',
  'ladder','ladybug','lamp','leaf','lemon','lion','lock','log','lollipop',
  'monkey','mop','mug','map','moon','mat','mouse','milk','mittens',
  'nose','nest','net','nail','nap','neck','nine','notebook','needle',
  'octopus','ostrich','olive','ox','onion','otter','oven','orange','oar',
  'pig','pen','pan','pizza','pencil','peach','panda','pumpkin','popcorn',
  'queen','quilt','quail','question mark','quick','queue','quack','quiet',
  'rabbit','robot','rainbow','ring','rose','ruler','rocket','raft','radio',
  'sun','sock','sandwich','star','seal','soap','snowman','scarf','snail',
  'tiger','tap','top','tooth','tent','tomato','train','table','tree',
  'umbrella','up','upset','unzip','upstairs','undo',
  'van','vase','violin','vegetables','vest','vulture','volcano','vacuum',
  'whale','watch','watermelon','web','wagon','worm','witch','wheel','window',
  'box','fox','mix','fix','six','axe','ox','wax','t-rex',
  'yarn','yam','yak','yawn','yo-yo','yolk','yacht',
  'zebra','zoo','zip','zipper','zero','zap','zigzag'
];

const spinBtn    = document.getElementById('spin-button');
const playBtn    = document.getElementById('play-sound-button');
const imgEl      = document.getElementById('word-image');
const qEl        = document.getElementById('question');
const ansEl      = document.getElementById('answer');
const letterSel  = document.getElementById('letter-select');
let currentWord  = '';

// Normalize a word into a filename-safe string
function toFilename(word) {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Filter by selected letter
function getPool() {
  const sel = letterSel.value;
  if (sel === 'all') return words;
  return words.filter(w => w[0].toLowerCase() === sel);
}

spinBtn.addEventListener('click', () => {
  ansEl.textContent = '';
  playBtn.disabled = false;

  const pool = getPool();
  if (!pool.length) {
    qEl.textContent = `No words for “${letterSel.value.toUpperCase()}”`;
    imgEl.src = 'images/placeholder.png';
    return;
  }

  currentWord = pool[Math.floor(Math.random() * pool.length)];
  const baseName = toFilename(currentWord);
  const webpSrc  = `images/${baseName}.webp`;
  const pngSrc   = `images/${baseName}.png`;

  // Fallback: try .webp first, if it 404s, switch to .png
  imgEl.onerror = () => {
    imgEl.onerror = null;        // only fallback once
    imgEl.src = pngSrc;
  };

  imgEl.src       = webpSrc;    // primary attempt
  imgEl.alt       = currentWord;
  qEl.textContent = `What is the first sound of “${currentWord}”?`;
});

playBtn.addEventListener('click', () => {
  if (!currentWord) return;
  const letter = currentWord[0].toLowerCase();
  const audio  = new Audio(`audio/${letter}.mp3`);
  audio.play();
  ansEl.textContent = `▶ The first sound is /${letter}/`;
});
