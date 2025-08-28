// ------------------ Typing Test Logic ------------------

// Pool of words
const words = [
  "the", "and", "have", "about", "time", "with", "this", "that", "from", "your",
  "just", "what", "when", "will", "would", "there", "their", "make", "like", "then",
  "look", "more", "some", "could", "other", "into", "over", "only", "think", "know",
  "back", "after", "work", "first", "place", "where", "because", "good", "people", "still",
  "before", "through", "great", "same", "right", "small", "large", "world", "never", "long",
  "house", "while", "every", "those", "again", "under", "point", "thing", "around", "always",
  "school", "number", "system", "water", "power", "light", "group", "start", "money", "story",
  "young", "later", "words", "music", "father", "mother", "friend", "happy", "change", "clear",
  "second", "answer", "simple", "better", "ground", "strong", "family", "little", "public", "paper",
  "person", "night", "today", "maybe", "enough", "though", "together", "nothing", "across", "bring",
  "open", "understand", "important", "without", "control", "window", "listen", "sudden", "reason", "common"
];

// --- State ---
let timer;
let timeLeft = 60;
let errors = 0;                 // cumulative errors across completed words
let typedWords = 0;             // completed words count
let typedCharsTotal = 0;        // total chars attempted across completed words
let currentIndex = 0;           // which word user is on
let currentWords = [];
const totalWords = 200;
const visibleCount = 15;

let isRunning = false;
let timerStarted = false;

// --- DOM ---
const wordContainer = document.getElementById("word-container");
const inputArea = document.getElementById("input-area");

const wpmDisplay = document.getElementById("wpm");
const errorsDisplay = document.getElementById("errors");
const timeDisplay = document.getElementById("time");

const startBtn = document.getElementById("start-btn");
const refreshBtn = document.getElementById("refresh-btn");
const startAgainBtn = document.getElementById("start-again-btn");

const statsBox = document.getElementById("stats");
const resultsBox = document.getElementById("results");

// Guard: only run test logic if we are on the test page
if (wordContainer && inputArea && startBtn) {

  // --- Words ---
  function generateWords() {
    currentWords = [];
    for (let i = 0; i < totalWords; i++) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      currentWords.push(randomWord);
    }
    renderWords();
  }

  function renderWords() {
    wordContainer.innerHTML = "";

    currentWords.forEach((word, i) => {
      const wordSpan = document.createElement("span");
      wordSpan.classList.add("word");

      [...word].forEach(char => {
        const charSpan = document.createElement("span");
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
      });

      const space = document.createElement("span");
      space.textContent = " ";
      wordSpan.appendChild(space);

      if (i === currentIndex) {
        wordSpan.classList.add("current");

        // 🔑 ensure current word is visible
        setTimeout(() => {
          wordSpan.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }, 0);
      }

      wordContainer.appendChild(wordSpan);
    });
  }


  // --- Test lifecycle ---
  function resetCounters() {
    errors = 0;
    typedWords = 0;
    typedCharsTotal = 0;
    timeLeft = 60;
    currentIndex = 0;
    timerStarted = false;

    wpmDisplay.textContent = 0;
    errorsDisplay.textContent = 0;
    timeDisplay.textContent = timeLeft;
    inputArea.value = "";

    wordContainer.classList.remove("finished");
    inputArea.classList.remove("finished");
    resultsBox.style.display = "none";
  }

  function startTest() {
    resetCounters();
    inputArea.disabled = false;
    inputArea.focus();

    generateWords();
    clearInterval(timer);

    isRunning = true;

    // UI
    startBtn.style.display = "none";
    refreshBtn.style.display = "inline-block";
    statsBox.style.display = "block";
  }

  function endTest() {
    clearInterval(timer);
    inputArea.disabled = true;
    isRunning = false;

    // Visual cue the test ended
    wordContainer.classList.add("finished");
    inputArea.classList.add("finished");

    // Show Start and hide Refresh
    startBtn.style.display = "inline-block";
    refreshBtn.style.display = "none";

    // Save + show results
    saveScore().finally(() => {
      resultsBox.style.display = "block";
      // Scroll results into view for clarity
      try { resultsBox.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { }
    });
  }

  function updateTimer() {
    timeLeft--;
    timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) endTest();
  }

  // --- Start timer on first key press ---
  inputArea.addEventListener("keydown", () => {
    if (!timerStarted && isRunning) {
      timerStarted = true;
      timer = setInterval(updateTimer, 1000);
    }
  });

  // --- Character-by-character highlight (live preview) ---
  inputArea.addEventListener("input", () => {
    const typedText = inputArea.value;
    const currentWordSpan = wordContainer.querySelector(".current");
    if (!currentWordSpan) return;

    const charSpans = currentWordSpan.querySelectorAll("span");
    // reset classes
    charSpans.forEach(span => (span.className = ""));

    // paint as the user types (does not commit errors yet)
    [...typedText].forEach((char, idx) => {
      if (!charSpans[idx]) return;
      if (char === charSpans[idx].textContent) {
        charSpans[idx].classList.add("correct-char");
      } else {
        charSpans[idx].classList.add("incorrect-char");
      }
    });
  });
  // --- On space: commit the word, count errors, move on ---
  inputArea.addEventListener("keydown", (e) => {
    if (e.key !== " ") return;
    e.preventDefault();

    const currentWord = currentWords[currentIndex] || "";
    const typed = inputArea.value.trim(); // ignore trailing spaces

    // Count errors
    const maxLen = Math.max(typed.length, currentWord.length);
    let wordErrors = 0;
    for (let i = 0; i < maxLen; i++) {
      const t = typed[i];
      const c = currentWord[i];
      if (t == null || c == null || t !== c) {
        wordErrors++;
      }
    }

    errors += wordErrors;
    errorsDisplay.textContent = errors;

    // Stats
    currentIndex++;
    typedWords++;
    typedCharsTotal += typed.length; // only count typed chars

    // Update WPM live (net WPM, not inflated)
    const minutes = (60 - timeLeft) / 60 || 1 / 60;
    const correctChars = Math.max(0, typedCharsTotal - errors);
    const netWpm = Math.max(0, Math.round((correctChars / 5) / minutes));
    wpmDisplay.textContent = netWpm;

    // Re-render words
    renderWords();
    inputArea.value = "";
  });

  // --- Buttons ---
  startBtn.addEventListener("click", startTest);

  // Refresh mid-test (new set, timer resets, starts fresh)
  refreshBtn.addEventListener("click", () => {
    startTest();
  });

  // After results → return to initial state (show Start button)
  if (startAgainBtn) {
    startAgainBtn.addEventListener("click", () => {
      resultsBox.style.display = "none";
      startBtn.style.display = "inline-block";
      // clear the test area
      wordContainer.innerHTML = "";
      inputArea.value = "";
    });
  }

  async function saveScore() {
    const totalTyped = typedCharsTotal;
    const errorsCount = errors;
    const correctChars = Math.max(0, totalTyped - errorsCount);

    const minutes = (60 - timeLeft) / 60 || 1 / 60;
    const netWpm = Math.max(0, Math.round((correctChars / 5) / minutes));
    const accuracy = totalTyped > 0
      ? Math.round((correctChars / totalTyped) * 100)
      : 0;

    document.getElementById("final-wpm").textContent = ` ${netWpm}`;
    document.getElementById("final-errors").textContent = ` ${errorsCount}`;
    document.getElementById("final-accuracy").textContent = `${accuracy}%`;

    // Summary
    const elapsed = 60 - timeLeft;
    const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
    setText("sum-time", `${elapsed}s`);
    setText("sum-words", typedWords);
    setText("sum-chars", totalTyped);
    setText("sum-correct", correctChars);
    setText("sum-errors", errorsCount);
    setText("sum-net-wpm", netWpm);

    try {
      await fetch("/auth/save-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wpm: netWpm })
      });
    } catch (_) { }
  }


  // --- Auth UI ---
  async function loadUserInfo() {
    try {
      const res = await fetch("/auth/me");
      const data = await res.json();
      const userInfoDiv = document.getElementById("user-info");

      if (data.loggedIn) {
        userInfoDiv.innerHTML = `👋 Welcome, <b>${data.username}</b>! (Highest WPM: ${data.highestWPM}) 
          <button id="logout-btn">Logout</button>`;

        const lb = document.getElementById("logout-btn");
        if (lb) lb.addEventListener("click", logout);
      } else {
        userInfoDiv.innerHTML = "⚠️ Login to save scores.";
      }
    } catch (e) {
      // optional
    }
  }

  async function logout() {
    try {
      await fetch("/auth/logout");
    } finally {
      window.location.reload();
    }
  }

  // On load
  loadUserInfo();
}
document.getElementById("final-wpm").textContent = netWpm;
document.getElementById("final-errors").textContent = errorsCount;
document.getElementById("final-accuracy").textContent = `${accuracy}%`;
