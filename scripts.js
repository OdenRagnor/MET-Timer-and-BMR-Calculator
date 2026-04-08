document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
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
    const calculateBmrBtn = document.getElementById('calculateBmrBtn');
    const ageInput = document.getElementById('age');
    const sexSelect = document.getElementById('sex');
    const heightFtInput = document.getElementById('height_ft');
    const heightInInput = document.getElementById('height_in');
    const bmrWeightInput = document.getElementById('bmrWeight');
    const bmrResultDiv = document.getElementById('bmrResult');

    // --- State Variables & Flags ---
    let preCountdownInterval, mainCountdownInterval, memeTimeout;
    let isAudioUnlocked = false; // Flag to track if the browser allows audio.

    let appData = {
        workout: {
            dailyTotal: 0,
            weeklyTotal: 0,
            monthlyTotal: 0,
            yearlyTotal: 0,
            total: 0, // All-time total
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
            weightLbs: null
        }
    };

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
    };

    // --- Sound Definitions ---
    // IMPORTANT: For best results, place your audio files in a 'sounds' subfolder.
    const soundFiles = {
        begin: "sounds/begin.mp3",
        elapsed30: "sounds/30-seconds-have-elapsed.mp3",
        remaining30: "sounds/30-seconds-remaining.mp3",
        remaining20: "sounds/20-seconds-remaining.mp3",
        remaining10: "sounds/10-seconds-remaining.mp3",
        end: [
            "sounds/you-re-done-bitch.mp3", "sounds/a-workout-only-a-mom-would-be-proud-of.mp3",
            "sounds/get-better-fuck-face.mp3", "sounds/go-back-to-sitting-down-lazy.mp3",
            "sounds/good-work-loser.mp3", "sounds/you-performed-as-good-as-a-dying-cockroach-your-done.mp3",
            "sounds/i-wish-i-could-say-i-was-proud-of-your-performance-just-stop.mp3",
            "sounds/great-work-don-t-forget-to-pick-up-your-pride-on-the-way-out-honey.mp3",
            "sounds/aint-no-one-proud-of-that-deer.mp3"
        ]
    };

    // --- Main Audio Playback Function ---
    function playSound(soundFile) {
        if (!soundFile || !isAudioUnlocked) return; // Don't play if audio is locked or file is missing
        const audio = new Audio(soundFile);
        audio.play().catch(e => console.error(`Playback failed for ${soundFile}:`, e));
    }

    // --- Date Helper Functions ---
    const getTodayISO = () => new Date().toISOString().split('T')[0];
    const getStartOfWeekISO = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const date = new Date(today);
        date.setDate(today.getDate() - dayOfWeek);
        return date.toISOString().split('T')[0];
    };
    const getStartOfMonthISO = () => {
        const today = new Date();
        const d = new Date(today.getFullYear(), today.getMonth(), 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    const getStartOfYearISO = () => {
        const today = new Date();
        return `${today.getFullYear()}-01-01`;
    };

    // --- Data Management ---
    const loadData = () => {
        const savedData = JSON.parse(localStorage.getItem('appData'));
        if (savedData) {
            if (savedData.workout) appData.workout = {...appData.workout, ...savedData.workout };
            if (savedData.user) appData.user = {...appData.user, ...savedData.user };
        }

        const todayISO = getTodayISO(),
            startOfWeekISO = getStartOfWeekISO(),
            startOfMonthISO = getStartOfMonthISO(),
            startOfYearISO = getStartOfYearISO();

        if (appData.workout.currentYearStartDate !== startOfYearISO) {
            appData.workout.yearlyTotal = appData.workout.monthlyTotal = appData.workout.weeklyTotal = appData.workout.dailyTotal = 0;
            appData.workout.currentYearStartDate = startOfYearISO;
            appData.workout.currentMonthStartDate = startOfMonthISO;
            appData.workout.currentWeekStartDate = startOfWeekISO;
        } else if (appData.workout.currentMonthStartDate !== startOfMonthISO) {
            appData.workout.monthlyTotal = appData.workout.weeklyTotal = appData.workout.dailyTotal = 0;
            appData.workout.currentMonthStartDate = startOfMonthISO;
            appData.workout.currentWeekStartDate = startOfWeekISO;
        } else if (appData.workout.currentWeekStartDate !== startOfWeekISO) {
            appData.workout.weeklyTotal = appData.workout.dailyTotal = 0;
            appData.workout.currentWeekStartDate = startOfWeekISO;
        }

        if (appData.workout.lastWorkoutDate !== todayISO) appData.workout.dailyTotal = 0;
        appData.workout.lastWorkoutDate = todayISO;

        if (appData.user.age) ageInput.value = appData.user.age;
        if (appData.user.sex) sexSelect.value = appData.user.sex;
        if (appData.user.heightFt) heightFtInput.value = appData.user.heightFt;
        if (appData.user.heightIn) heightInInput.value = appData.user.heightIn;
        if (appData.user.weightLbs) {
            bmrWeightInput.value = appData.user.weightLbs;
            weightSelect.value = appData.user.weightLbs;
        }

        saveData();
        updateDisplay();
    };

    const saveData = () => localStorage.setItem('appData', JSON.stringify(appData));
    const updateDisplay = () => {
        caloriesBurnedDiv.textContent = '';
        dailyTotalCaloriesDiv.textContent = `Today's total: ${appData.workout.dailyTotal.toFixed(2)}`;
        weeklyTotalCaloriesDiv.textContent = `This week's total: ${appData.workout.weeklyTotal.toFixed(2)}`;
        monthlyTotalCaloriesDiv.textContent = `This month's total: ${appData.workout.monthlyTotal.toFixed(2)}`;
        yearlyTotalCaloriesDiv.textContent = `This year's total: ${appData.workout.yearlyTotal.toFixed(2)}`;
        totalCaloriesDiv.textContent = `All-time total: ${appData.workout.total.toFixed(2)}`;
    };

    // --- BMR Calculation ---
    calculateBmrBtn.addEventListener('click', () => {
        appData.user = {
            age: parseInt(ageInput.value, 10),
            sex: sexSelect.value,
            heightFt: parseInt(heightFtInput.value, 10),
            heightIn: parseInt(heightInInput.value, 10) || 0,
            weightLbs: parseInt(bmrWeightInput.value, 10)
        };
        if (!appData.user.age || !appData.user.heightFt || !appData.user.weightLbs) {
            bmrResultDiv.textContent = "Please fill in all BMR fields.";
            return;
        }
        const weightKg = appData.user.weightLbs / 2.20462;
        const heightCm = ((appData.user.heightFt * 12) + appData.user.heightIn) * 2.54;
        const bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * appData.user.age) + (appData.user.sex === "male" ? 5 : -161);
        bmrResultDiv.innerHTML = `Your estimated daily BMR is: <strong>${bmr.toFixed(0)} calories</strong>`;
        weightSelect.value = appData.user.weightLbs;
        saveData();
    });

    // --- Calorie Calculation ---
    const calculateCalories = (weightInPounds, durationInSeconds, exercise, intensity) => {
        const MET = metValues[exercise] ? .[intensity] || 7.0;
        const weightInKg = weightInPounds / 2.20462;
        const durationInMinutes = durationInSeconds / 60;
        return ((MET * 3.5 * weightInKg) / 200) * durationInMinutes;
    };

    // --- Main Timer Logic ---
    function startMainTimer(initialDuration) {
        let totalSeconds = initialDuration;
        mainCountdownInterval = setInterval(() => {
            if (totalSeconds < 0) {
                clearInterval(mainCountdownInterval);
                const randomIndex = Math.floor(Math.random() * soundFiles.end.length);
                playSound(soundFiles.end[randomIndex]);
                timerDisplay.textContent = "Time's up!";

                const weight = parseInt(weightSelect.value, 10);
                const duration = parseInt(secondsInput.value, 10);
                const exercise = exerciseSelect.value;
                const intensity = intensitySelect.value;
                const caloriesThisRound = calculateCalories(weight, duration, exercise, intensity);

                appData.workout.dailyTotal += caloriesThisRound;
                appData.workout.weeklyTotal += caloriesThisRound;
                appData.workout.monthlyTotal += caloriesThisRound;
                appData.workout.yearlyTotal += caloriesThisRound;
                appData.workout.total += caloriesThisRound;

                saveData();
                updateDisplay();

                memeElement.style.display = 'block';
                timerDisplay.style.display = 'none';
                memeTimeout = setTimeout(() => {
                    memeElement.style.display = 'none';
                    timerDisplay.style.display = 'block';
                }, 30000);
            } else {
                if ((totalSeconds === 30) && (initialDuration >= 31)) playSound(soundFiles.remaining30);
                if (totalSeconds === 20) playSound(soundFiles.remaining20);
                if (totalSeconds === 10) playSound(soundFiles.remaining10);
                if ((initialDuration - totalSeconds === 30) && (initialDuration >= 61)) playSound(soundFiles.elapsed30);

                timerDisplay.textContent = `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
                totalSeconds--;
            }
        }, 1000);
    }

    // --- Form Submission Logic ---
    timerForm.addEventListener('submit', function(event) {
        event.preventDefault();

        if (!isAudioUnlocked) {
            // This is the most reliable way to silently unlock audio.
            // It plays a tiny, silent, built-in audio clip.
            const unlockAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
            unlockAudio.volume = 0;
            unlockAudio.play().then(() => {
                isAudioUnlocked = true;
                console.log("Audio context unlocked successfully.");
            }).catch(e => console.error("Audio context unlock failed.", e));
        }

        const mainDuration = parseInt(secondsInput.value, 10);
        if (isNaN(mainDuration) || mainDuration <= 0) {
            timerDisplay.textContent = "Please enter a valid number of seconds.";
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
                playSound(soundFiles.begin);
                startMainTimer(mainDuration);
            }
        }, 1000);
    });

    // --- Event Listener for the Clear Button ---
    clearCaloriesBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear ALL calorie progress?")) {
            appData.workout = {...appData.workout, dailyTotal: 0, weeklyTotal: 0, monthlyTotal: 0, yearlyTotal: 0, total: 0 };
            saveData();
            updateDisplay();
        }
    });

    // --- INITIAL PAGE LOAD ---
    loadData();
});