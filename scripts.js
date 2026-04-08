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

    // --- App Data ---
    let appData = {
        workout: {
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
            weightLbs: null
        }
    };

    // --- MET & Sound Definitions ---
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
    const soundFiles = {
        begin: "sounds/begin.mp3",
        elapsed30: "sounds/30-seconds-have-elapsed.mp3",
        remaining30: "sounds/30-seconds-remaining.mp3",
        remaining20: "sounds/20-seconds-remaining.mp3",
        remaining10: "sounds/10-seconds-remaining.mp3",
        end: ["sounds/you-re-done-bitch.mp3", "sounds/a-workout-only-a-mom-would-be-proud-of.mp3", "sounds/get-better-fuck-face.mp3" /* ...etc */ ]
    };

    // --- Main Audio Playback Function ---
    function playSound(soundFile) {
        if (!soundFile || !isAudioUnlocked) return;
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
        const MET = metValues[exercise][intensity] || 7.0;
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
                // ... (rest of your timer end logic)
            } else {
                if ((totalSeconds === 30)) playSound(soundFiles.remaining30);
                if (totalSeconds === 20) playSound(soundFiles.remaining20);
                if (totalSeconds === 10) playSound(soundFiles.remaining10);
                // ... (rest of your countdown display logic)
                totalSeconds--;
            }
        }, 1000);
    }


    // --- Form Submission Logic (The Corrected Part) ---
    timerForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // --- 1. Clear any old timers ---
        clearInterval(preCountdownInterval);
        clearInterval(mainCountdownInterval);
        clearTimeout(memeTimeout);

        // --- 2. Attempt to unlock and start the timer ---
        // We will try to play the 'begin.mp3' file.
        const beginAudio = new Audio(soundFiles.begin);
        beginAudio.play().then(() => {
            // SUCCESS! The browser allowed the sound.
            console.log("Audio unlocked and 'begin' sound played successfully.");
            isAudioUnlocked = true; // Set the flag for all future sounds.

            // Now that we know audio works, start the main timer.
            const mainDuration = parseInt(secondsInput.value, 10);
            if (!isNaN(mainDuration) && mainDuration > 0) {
                startMainTimer(mainDuration);
            } else {
                timerDisplay.textContent = "Please enter a valid number of seconds.";
            }

        }).catch(error => {
            // FAILURE. The browser blocked the first sound.
            console.error("CRITICAL: The initial audio playback was blocked by the browser.", error);
            console.error("This usually means the user needs to interact with the page more, or there is a file path error.");

            // Inform the user, as sounds will not work.
            alert("Audio is blocked by your browser. Sounds will not play. Please check for a permissions pop-up or try clicking on the page again.");

            // You could optionally start the timer silently here if you want.
            // const mainDuration = parseInt(secondsInput.value, 10);
            // startMainTimer(mainDuration); 
        });
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