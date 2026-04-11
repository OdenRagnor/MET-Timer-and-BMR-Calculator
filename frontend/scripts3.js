document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const startOverlay = document.getElementById('start-overlay');
    const timerForm = document.getElementById('timerForm');
    const secondsInput = document.getElementById('seconds');
    const timerDisplay = document.getElementById('timerDisplay');
    const memeElement = document.getElementById('meme');
    const weightSelect = document.getElementById('weight');
    const caloriesBurnedDiv = document.getElementById('caloriesBurned');
    const dailyTotalCaloriesDiv = document.getElementById('dailyTotalCalories');
    const weeklyTotalCaloriesDiv = document.getElementById('weeklyTotalCalories');
    const monthlyTotalCaloriesDiv = document.getElementById('monthlyTotalCalories');
    const yearlyTotalCaloriesDiv = document.getElementById('yearlyTotalCalories');
    const totalCaloriesDiv = document.getElementById('allTimeTotalCalories');
    const clearCaloriesBtn = document.getElementById('clearCaloriesBtn');
    const exerciseSelect = document.getElementById('exercise');
    const intensitySelect = document.getElementById('intensity');
    const startStopwatchBtn = document.getElementById('startStopwatchBtn');
    const stopStopwatchBtn = document.getElementById('stopStopwatchBtn');
    const resetStopwatchBtn = document.getElementById('resetStopwatchBtn');
    const stopwatchDisplay = document.getElementById('stopwatchDisplay');

    // --- BMR DOM Elements ---
    const calculateBmrBtn = document.getElementById('calculateBmrBtn');
    const ageInput = document.getElementById('age');
    const sexSelect = document.getElementById('sex');
    const heightFtInput = document.getElementById('height_ft');
    const heightInInput = document.getElementById('height_in');
    const bmrWeightInput = document.getElementById('bmrWeight');
    const bmrResultDiv = document.getElementById('bmrResult');
    const weightInput = document.getElementById('weight');

    // --- State Variables ---
    let preCountdownInterval, mainCountdownInterval, memeTimeout;
    let stopwatchInterval;
    let stopwatchStartTime = 0;
    let stopwatchElapsedTime = 0;
    let isStopwatchRunning = false;
    let soundsInitialized = false;
    let availableVoices = [];
    let isTtsAvailable = false;

    // --- Fallback insult array (required if API fails) ---
    const insults = [
        "Try harder next time.",
        "That was weak.",
        "Do better.",
        "My grandma moves faster than that.",
        "You call that effort?"
    ];

    // --- Voice Loading ---
    function loadAndCheckVoices() {
        availableVoices = speechSynthesis.getVoices();
        isTtsAvailable = availableVoices.length > 0;
    }
    speechSynthesis.onvoiceschanged = loadAndCheckVoices;

    // --- Browser TTS ---
    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);

        // Try to load voices again if empty
        if (availableVoices.length === 0) {
            availableVoices = speechSynthesis.getVoices();
        }

        let desiredVoice =
            availableVoices.find(v => v.name.includes('Google US English')) ||
            availableVoices.find(v => v.name.includes('Microsoft Zira')) ||
            availableVoices.find(v => v.lang.includes('en-US'));

        if (desiredVoice) {
            utterance.voice = desiredVoice;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        speechSynthesis.speak(utterance);
    }

    // --- AI Insult API ---
    async function getAIInsult() {
        try {
            const response = await fetch("https://evilinsult.com/generate_insult.php?lang=en&type=json");
            const data = await response.json();
            return data.insult;
        } catch (e) {
            console.error("Insult API failed, using fallback.", e);
            return insults[Math.floor(Math.random() * insults.length)];
        }
    }

    // --- External TTS API ---
    async function speakWithAPI(text) {
        try {
            const response = await fetch("http://localhost:3001/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text })
            });

            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
            const url = URL.createObjectURL(blob);

            const audio = new Audio(url);
            await audio.play();

        } catch (e) {
            console.error("Backend TTS failed, using browser fallback.", e);
            speak(text);
        }
    }

    // --- Global Volume ---
    function setGlobalVolume(level) {
        document.querySelectorAll("audio, video").forEach(el => {
            el.volume = Math.max(0, Math.min(1, level));
        });
    }
    setGlobalVolume(0);

    // --- Stopwatch ---
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function updateStopwatchDisplay() {
        stopwatchElapsedTime = Date.now() - stopwatchStartTime;
        stopwatchDisplay.textContent = formatTime(stopwatchElapsedTime);
    }

    function startStopwatch() {
        if (isStopwatchRunning) return;
        isStopwatchRunning = true;
        stopwatchStartTime = Date.now() - stopwatchElapsedTime;
        stopwatchInterval = setInterval(updateStopwatchDisplay, 100);
        startStopwatchBtn.disabled = true;
        stopStopwatchBtn.disabled = false;
    }

    function stopStopwatch() {
        if (!isStopwatchRunning) return;
        isStopwatchRunning = false;
        clearInterval(stopwatchInterval);

        const durationInSeconds = stopwatchElapsedTime / 1000;
        const weight = parseInt(weightInput.value, 10);
        const exercise = exerciseSelect.value;
        const intensity = intensitySelect.value;

        if (weight && exercise && durationInSeconds > 0 && metValues[exercise]) {
            const calories = calculateCalories(weight, durationInSeconds, exercise, intensity);
            appData.workout.caloriesThisRound1 = calories;
            appData.workout.dailyTotal += calories;
            appData.workout.weeklyTotal += calories;
            appData.workout.monthlyTotal += calories;
            appData.workout.yearlyTotal += calories;
            appData.workout.total += calories;
            saveData();
            updateDisplay();
            caloriesBurnedDiv.textContent = `Last workout: +${calories.toFixed(2)} calories!`;
        } else {
            caloriesBurnedDiv.textContent = "Please select exercise and weight.";
        }

        startStopwatchBtn.disabled = false;
        stopStopwatchBtn.disabled = true;
    }

    function resetStopwatch() {
        clearInterval(stopwatchInterval);
        isStopwatchRunning = false;
        stopwatchElapsedTime = 0;
        stopwatchDisplay.textContent = "00:00:00";
        startStopwatchBtn.disabled = false;
        stopStopwatchBtn.disabled = false;
    }

    startStopwatchBtn.addEventListener('click', startStopwatch);
    stopStopwatchBtn.addEventListener('click', stopStopwatch);
    resetStopwatchBtn.addEventListener('click', resetStopwatch);

    // --- App Data ---
    let appData = {
        workout: {
            caloriesThisRound1: 0,
            dailyTotal: 0,
            weeklyTotal: 0,
            monthlyTotal: 0,
            yearlyTotal: 0,
            total: 0,
            lastWorkoutDate: null,
            currentWeekStartDate: null,
            currentMonthStartDate: null,
            currentYearStartDate: null
        },
        user: {
            age: null,
            sex: 'male',
            heightFt: null,
            heightIn: null,
            weightLbs: null,
            weight: null
        }
    };

    // --- MET Values ---
    const metValues = {
        pushups: { light: 2.8, moderate: 3.8, vigorous: 8.0 },
        crunches: { light: 2.8, moderate: 3.8, vigorous: 7.5 },
        vups: { light: 3.5, moderate: 5.0, vigorous: 8.0 },
        squats: { light: 3.0, moderate: 3.5, vigorous: 6.5 },
        walkingLunges: { light: 3.0, moderate: 3.8, vigorous: 6.5 },
        ironMikes: { light: 4.0, moderate: 6.0, vigorous: 8.0 },
        jumpSquats: { light: 4.0, moderate: 6.0, vigorous: 8.0 },
        planks: { light: 2.8, moderate: 4.0, vigorous: 5.0 },
        jumpingJacks: { light: 4.0, moderate: 5.0, vigorous: 8.0 },
        sidePlanks: { light: 2.8, moderate: 4.0, vigorous: 5.0 },
        eightCountPushups: { light: 5.0, moderate: 8.0, vigorous: 11.0 },
        burpees: { light: 5.0, moderate: 8.0, vigorous: 11.0 },
        walk: { light: 2.8, moderate: 3.5, vigorous: 7.0 },
        run: { light: 7.0, moderate: 9.8, vigorous: 14.5 },
        legTuckandTwist: { light: 3.5, moderate: 5.0, vigorous: 8.0 }
    };

    // --- Calorie Calculation ---
    const calculateCalories = (weightInPounds, durationInSeconds, exercise, intensity) => {
        const MET = metValues[exercise][intensity] || 7.0;
        const weightKg = weightInPounds / 2.20462;
        const minutes = durationInSeconds / 60;
        return (MET * 3.5 * weightKg / 200) * minutes;
    };

    // --- Sound System ---
    const soundFiles = {
        begin: "begin.mp3",
        elapsed30: "30-seconds-have-elapsed.mp3",
        remaining30: "30-seconds-remaining.mp3",
        remaining20: "20-seconds-remaining.mp3",
        remaining10: "10-seconds-remaining.mp3",
        end: [
            "you-re-weaker-then-jerry-get-your-ass-out-of-the-air-your-stinking-up-the-whole-place.mp3",
            "you-re-fucked-stop-waisting-our-time-and-get-better.mp3",
            "were-you-even-trying-you-were-so-slow.mp3",
            "i-m-worried-about-your-health.mp3"
        ]
    };

    let unlockedSounds = { end: [] };

    function initializeAndUnlockSounds() {
        if (soundsInitialized) return;
        for (const key in soundFiles) {
            if (Array.isArray(soundFiles[key])) {
                unlockedSounds[key] = soundFiles[key].map(file => {
                    const audio = new Audio(file);
                    audio.volume = 0;
                    audio.load();
                    audio.volume = 1;
                    return audio;
                });
            } else {
                const audio = new Audio(soundFiles[key]);
                audio.volume = 0;
                audio.load();
                audio.volume = 1;
                unlockedSounds[key] = audio;
            }
        }
        soundsInitialized = true;
        startOverlay.style.display = 'none';
    }

    function playSound(audioObject) {
        if (!audioObject) return;
        audioObject.currentTime = 0;
        audioObject.play().catch(e => console.error("Sound playback failed:", e));
    }

    // --- Date Helpers ---
    const getTodayISO = () => new Date().toISOString().split('T')[0];

    const getStartOfWeekISO = () => {
        const today = new Date();
        const day = today.getDay();
        const date = new Date(today);
        date.setDate(today.getDate() - day);
        return date.toISOString().split('T')[0];
    };

    const getStartOfMonthISO = () => {
        const today = new Date();
        const d = new Date(today.getFullYear(), today.getMonth(), 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const getStartOfYearISO = () => {
        const today = new Date();
        const d = new Date(today.getFullYear(), 0, 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // --- Data Load ---
    const loadData = () => {
        const saved = JSON.parse(localStorage.getItem('appData'));
        const today = getTodayISO();
        const week = getStartOfWeekISO();
        const month = getStartOfMonthISO();
        const year = getStartOfYearISO();

        if (saved) {
            appData.workout = { ...appData.workout, ...saved.workout };
            appData.user = { ...appData.user, ...saved.user };
        }

        if (appData.workout.currentYearStartDate !== year) {
            appData.workout.yearlyTotal = 0;
            appData.workout.monthlyTotal = 0;
            appData.workout.weeklyTotal = 0;
            appData.workout.dailyTotal = 0;
            appData.workout.caloriesThisRound1 = 0;
            appData.workout.currentYearStartDate = year;
            appData.workout.currentMonthStartDate = month;
            appData.workout.currentWeekStartDate = week;
        } else if (appData.workout.currentMonthStartDate !== month) {
            appData.workout.monthlyTotal = 0;
            appData.workout.weeklyTotal = 0;
            appData.workout.dailyTotal = 0;
            appData.workout.caloriesThisRound1 = 0;
            appData.workout.currentMonthStartDate = month;
            appData.workout.currentWeekStartDate = week;
        } else if (appData.workout.currentWeekStartDate !== week) {
            appData.workout.weeklyTotal = 0;
            appData.workout.dailyTotal = 0;
            appData.workout.currentWeekStartDate = week;
        }

        if (appData.workout.lastWorkoutDate !== today) {
            appData.workout.dailyTotal = 0;
        }

        appData.workout.lastWorkoutDate = today;

        if (appData.user.age) ageInput.value = appData.user.age;
        if (appData.user.sex) sexSelect.value = appData.user.sex;
        if (appData.user.heightFt) heightFtInput.value = appData.user.heightFt;
        if (appData.user.heightIn) heightInInput.value = appData.user.heightIn;
        if (appData.user.weightLbs) bmrWeightInput.value = appData.user.weightLbs;
        if (appData.user.weight) weightInput.value = appData.user.weight;

        saveData();
        updateDisplay();
    };

    const saveData = () => localStorage.setItem('appData', JSON.stringify(appData));

    const updateDisplay = () => {
        caloriesBurnedDiv.textContent = `Last round: ${appData.workout.caloriesThisRound1.toFixed(2)}`;
        dailyTotalCaloriesDiv.textContent = `Today's total: ${appData.workout.dailyTotal.toFixed(2)}`;
        weeklyTotalCaloriesDiv.textContent = `Week's total: ${appData.workout.weeklyTotal.toFixed(2)}`;
        monthlyTotalCaloriesDiv.textContent = `Month's total: ${appData.workout.monthlyTotal.toFixed(2)}`;
        yearlyTotalCaloriesDiv.textContent = `Year's total: ${appData.workout.yearlyTotal.toFixed(2)}`;
        totalCaloriesDiv.textContent = `All time total: ${appData.workout.total.toFixed(2)}`;
    };

    // --- BMR ---
    const calculateBmr = (weight, height, age, sex) => {
        return sex === "male"
            ? (10 * weight) + (6.25 * height) - (5 * age) + 5
            : (10 * weight) + (6.25 * height) - (5 * age) - 161;
    };

    calculateBmrBtn.addEventListener('click', () => {
        appData.user.age = parseInt(ageInput.value, 10);
        appData.user.sex = sexSelect.value;
        appData.user.heightFt = parseInt(heightFtInput.value, 10);
        appData.user.heightIn = parseInt(heightInInput.value, 10) || 0;
        appData.user.weightLbs = parseInt(bmrWeightInput.value, 10);
        appData.user.weight = parseInt(weightInput.value, 10);

        if (!appData.user.age || !appData.user.heightFt || !appData.user.weightLbs) {
            bmrResultDiv.textContent = "Please fill in all BMR fields.";
            return;
        }

        const weightKg = appData.user.weightLbs / 2.20462;
        const totalHeightIn = (appData.user.heightFt * 12) + appData.user.heightIn;
        const heightCm = totalHeightIn * 2.54;

        const bmr = calculateBmr(weightKg, heightCm, appData.user.age, appData.user.sex);
        bmrResultDiv.innerHTML = `Your estimated daily BMR is: <strong>${bmr.toFixed(0)} calories</strong>`;

        saveData();
    });

    // --- Main Timer ---
        async function startMainTimer(initialDuration) {
        let totalSeconds = initialDuration;
        const insult = await getAIInsult();

        mainCountdownInterval = setInterval(() => {
            if (totalSeconds < 0) {
                clearInterval(mainCountdownInterval);
                timerDisplay.textContent = "Time's up!";

                const weight = parseInt(weightSelect.value, 10);
                const duration = parseInt(secondsInput.value, 10);
                const exercise = exerciseSelect.value;
                const intensity = intensitySelect.value;

                if (weight && duration && exercise && intensity) {
                    const caloriesThisRound = calculateCalories(weight, duration, exercise, intensity);

                    appData.workout.caloriesThisRound1 = caloriesThisRound;
                    appData.workout.dailyTotal += caloriesThisRound;
                    appData.workout.weeklyTotal += caloriesThisRound;
                    appData.workout.monthlyTotal += caloriesThisRound;
                    appData.workout.yearlyTotal += caloriesThisRound;
                    appData.workout.total += caloriesThisRound;

                    saveData();
                    updateDisplay();
                }

                memeElement.style.display = 'block';
                speakWithAPI(insult);

                memeTimeout = setTimeout(() => {
                    memeElement.style.display = 'none';
                }, 30000);

            } else {
                if ((totalSeconds === 30) && (initialDuration >= 31)) playSound(unlockedSounds.remaining30);
                if (totalSeconds === 20) playSound(unlockedSounds.remaining20);
                if (totalSeconds === 10) playSound(unlockedSounds.remaining10);

                timerDisplay.textContent =
                    `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;

                totalSeconds--;
            }
        }, 1000);
    }

    // --- Start Overlay ---
    startOverlay.addEventListener('click', () => {
        initializeAndUnlockSounds();

        // Unlock TTS audio context
        const silent = new Audio();
        silent.play().catch(() => {});
    }, { once: true });

    // --- Voice Loading ---
    speechSynthesis.onvoiceschanged = loadAndCheckVoices;

    // --- Timer Form Submit ---
    timerForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!soundsInitialized) {
            alert("Please click the 'Start' screen first to enable audio.");
            return;
        }

        const mainDuration = parseInt(secondsInput.value, 10);
        if (isNaN(mainDuration) || mainDuration <= 0) {
            timerDisplay.textContent = "Please enter a valid number.";
            return;
        }

        clearInterval(preCountdownInterval);
        clearInterval(mainCountdownInterval);
        clearTimeout(memeTimeout);

        let preSeconds = 10;
        timerDisplay.classList.add('pre-countdown');
        timerDisplay.textContent = `Starting in ${preSeconds}...`;

        preCountdownInterval = setInterval(() => {
            preSeconds--;
            timerDisplay.textContent = `Starting in ${preSeconds}...`;

            if (preSeconds <= 0) {
                clearInterval(preCountdownInterval);
                timerDisplay.classList.remove('pre-countdown');
                playSound(unlockedSounds.begin);
                startMainTimer(mainDuration);
            }
        }, 1000);
    });

    // --- Clear Calories ---
    clearCaloriesBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all progress?")) {
            appData.workout.dailyTotal = 0;
            appData.workout.weeklyTotal = 0;
            appData.workout.monthlyTotal = 0;
            appData.workout.yearlyTotal = 0;
            appData.workout.total = 0;

            saveData();
            updateDisplay();
        }
    });

    // --- INITIAL LOAD ---
    loadData();

    // --- Exercise Image Logic ---
    const exerciseImages = {
        crunches: 'image-ee48d671.gif',
        squats: 'squats.gif',
        pushups: 'Pushups.gif',
        run: 'run.png',
        jumpSquats: "jumpSquat.gif",
        vups: 'vUps.gif',
        walkingLunges: 'https://www.inspireusafoundation.org/wp-content/uploads/2023/08/bodyweight-walking-lunge-movement.gif',
        ironMikes: 'https://media.tenor.com/meIUZZ_2oZMAAAAM/lunge-jump.gif',
        planks: "planks.jpg",
        jumpingJacks: "jumpingJacks.gif",
        sidePlanks: "sidePlanks.jpg",
        eightCountPushups: "eightCountPushups.jpg",
        burpees: "burpees.gif",
        walk: "walk.gif",
        legTuckandTwist: "legTuckandTwist.jpg"
    };

    const exerciseContainer = document.getElementById('exercise-container');

    exerciseSelect.addEventListener('change', function () {
        const selected = this.value;
        const imageUrl = exerciseImages[selected];

        if (imageUrl) {
            exerciseContainer.style.backgroundImage = `url('${imageUrl}')`;
        } else {
            exerciseContainer.style.backgroundImage = 'none';
        }
    });

});