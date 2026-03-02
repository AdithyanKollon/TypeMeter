// ------------------ Typing Test Logic ------------------

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

let timer;
let testDuration = 60;
let timeLeft = testDuration;
let errors = 0;
let typedWords = 0;
let typedCharsTotal = 0;
let currentIndex = 0;
let currentWords = [];
const totalWords = 200;

let isRunning = false;
let timerStarted = false;

const wordContainer = document.getElementById("word-container");
const inputArea = document.getElementById("input-area");
const wpmDisplay = document.getElementById("wpm");
const errorsDisplay = document.getElementById("errors");
const timeDisplay = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const refreshBtn = document.getElementById("refresh-btn");
const endBtn = document.getElementById("end-btn");
const startAgainBtn = document.getElementById("start-again-btn");
const durationPreset = document.getElementById("duration-preset");
const customSecondsInput = document.getElementById("custom-seconds");
const setDurationBtn = document.getElementById("set-duration-btn");
const statsBox = document.getElementById("stats");
const resultsBox = document.getElementById("results");

if (wordContainer && inputArea && startBtn) {
  function generateWords() {
    currentWords = [];
    for (let i = 0; i < totalWords; i++) {
      currentWords.push(words[Math.floor(Math.random() * words.length)]);
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
        setTimeout(() => {
          wordSpan.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }, 0);
      }

      wordContainer.appendChild(wordSpan);
    });
  }

  function resetCounters() {
    errors = 0;
    typedWords = 0;
    typedCharsTotal = 0;
    timeLeft = testDuration;
    currentIndex = 0;
    timerStarted = false;

    wpmDisplay.textContent = "0";
    errorsDisplay.textContent = "0";
    timeDisplay.textContent = String(timeLeft);
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

    startBtn.style.display = "none";
    refreshBtn.style.display = "inline-block";
    endBtn.style.display = "inline-block";
    statsBox.style.display = "block";
    durationPreset.disabled = true;
    customSecondsInput.disabled = true;
    setDurationBtn.disabled = true;
  }

  function endTest() {
    if (!isRunning) return;
    clearInterval(timer);
    inputArea.disabled = true;
    isRunning = false;

    wordContainer.classList.add("finished");
    inputArea.classList.add("finished");
    startBtn.style.display = "inline-block";
    refreshBtn.style.display = "none";
    endBtn.style.display = "none";
    durationPreset.disabled = false;
    customSecondsInput.disabled = false;
    setDurationBtn.disabled = false;

    saveScore().finally(() => {
      resultsBox.style.display = "block";
      try { resultsBox.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    });
  }

  function updateTimer() {
    timeLeft--;
    timeDisplay.textContent = String(timeLeft);
    if (timeLeft <= 0) endTest();
  }

  inputArea.addEventListener("keydown", () => {
    if (!timerStarted && isRunning) {
      timerStarted = true;
      timer = setInterval(updateTimer, 1000);
    }
  });

  inputArea.addEventListener("input", () => {
    const typedText = inputArea.value;
    const currentWordSpan = wordContainer.querySelector(".current");
    if (!currentWordSpan) return;

    const charSpans = currentWordSpan.querySelectorAll("span");
    charSpans.forEach(span => { span.className = ""; });

    [...typedText].forEach((char, idx) => {
      if (!charSpans[idx]) return;
      if (char === charSpans[idx].textContent) {
        charSpans[idx].classList.add("correct-char");
      } else {
        charSpans[idx].classList.add("incorrect-char");
      }
    });
  });

  inputArea.addEventListener("keydown", (e) => {
    if (!isRunning) return;
    if (e.key !== " ") return;
    e.preventDefault();

    const currentWord = currentWords[currentIndex] || "";
    const typed = inputArea.value.trim();
    const maxLen = Math.max(typed.length, currentWord.length);
    let wordErrors = 0;

    for (let i = 0; i < maxLen; i++) {
      const t = typed[i];
      const c = currentWord[i];
      if (t == null || c == null || t !== c) wordErrors++;
    }

    errors += wordErrors;
    errorsDisplay.textContent = String(errors);

    currentIndex++;
    typedWords++;
    typedCharsTotal += typed.length;

    const elapsedSeconds = Math.max(1, testDuration - timeLeft);
    const minutes = elapsedSeconds / 60;
    const correctChars = Math.max(0, typedCharsTotal - errors);
    const netWpm = Math.max(0, Math.round((correctChars / 5) / minutes));
    wpmDisplay.textContent = String(netWpm);

    renderWords();
    inputArea.value = "";
  });

  startBtn.addEventListener("click", startTest);
  refreshBtn.addEventListener("click", startTest);
  endBtn.addEventListener("click", endTest);

  function applyDurationSetting() {
    const fromInput = Number(customSecondsInput.value);
    const rawSeconds = Number.isFinite(fromInput) ? fromInput : Number(durationPreset.value);
    const clamped = Math.min(300, Math.max(10, Math.round(rawSeconds)));

    testDuration = clamped;
    timeLeft = clamped;
    timeDisplay.textContent = String(clamped);
    customSecondsInput.value = String(clamped);

    const matchingOption = [...durationPreset.options].some((option) => option.value === String(clamped));
    durationPreset.value = matchingOption ? String(clamped) : "custom";
  }

  durationPreset.addEventListener("change", () => {
    if (durationPreset.value !== "custom") {
      customSecondsInput.value = durationPreset.value;
      applyDurationSetting();
    }
  });

  setDurationBtn.addEventListener("click", applyDurationSetting);
  customSecondsInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyDurationSetting();
  });

  if (startAgainBtn) {
    startAgainBtn.addEventListener("click", () => {
      resultsBox.style.display = "none";
      startBtn.style.display = "inline-block";
      wordContainer.innerHTML = "";
      inputArea.value = "";
    });
  }

  async function saveScore() {
    const totalTyped = typedCharsTotal;
    const errorsCount = errors;
    const correctChars = Math.max(0, totalTyped - errorsCount);
    const elapsedSeconds = Math.max(1, testDuration - timeLeft);
    const minutes = elapsedSeconds / 60;
    const netWpm = Math.max(0, Math.round((correctChars / 5) / minutes));
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;

    document.getElementById("final-wpm").textContent = String(netWpm);
    document.getElementById("final-errors").textContent = String(errorsCount);
    document.getElementById("final-accuracy").textContent = `${accuracy}%`;

    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value);
    };

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
    } catch (e) {}
  }

  async function loadUserInfo() {
    try {
      const res = await fetch("/auth/me");
      const data = await res.json();
      const userInfoDiv = document.getElementById("user-info");

      if (data.loggedIn) {
        userInfoDiv.innerHTML = `Welcome, <b>${data.username}</b> (Highest WPM: ${data.highestWPM}) <button id="logout-btn">Log Out</button>`;
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) logoutBtn.addEventListener("click", logout);
      } else {
        userInfoDiv.textContent = "Log in to save scores.";
      }
    } catch (e) {}
  }

  async function logout() {
    try {
      await fetch("/auth/logout");
    } finally {
      window.location.reload();
    }
  }

  loadUserInfo();
}
