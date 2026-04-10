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

    // --- Mute All ---
    function muteAll() {
        document.querySelectorAll("audio, video").forEach(element => {
            element.muted = true;
        });
    }

    function unmuteAll() {
        document.querySelectorAll("audio, video").forEach(element => {
            element.muted = false;
        });
    }

    // --- Stopwatch Helper Functions ---

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    function updateStopwatchDisplay() {
        stopwatchElapsedTime = Date.now() - stopwatchStartTime;
        stopwatchDisplay.textContent = formatTime(stopwatchElapsedTime);
    }

    function startStopwatch() {
        if (isStopwatchRunning) return; // Don't do anything if it's already running

        isStopwatchRunning = true;
        // If starting from a paused state, adjust the start time
        stopwatchStartTime = Date.now() - stopwatchElapsedTime;

        stopwatchInterval = setInterval(updateStopwatchDisplay, 100); // Update every 100ms for smoothness

        // Visually disable the start button
        startStopwatchBtn.disabled = true;
        stopStopwatchBtn.disabled = false;
    }

    function stopStopwatch() {
        if (!isStopwatchRunning) return; // Don't do anything if it's not running

        isStopwatchRunning = false;
        clearInterval(stopwatchInterval);

        // --- This is the key part: Calculate and save calories ---
        const durationInSeconds = stopwatchElapsedTime / 1000;

        // Make sure an exercise and weight are selected
        const weight = parseInt(weightInput.value, 10);
        const exercise = exerciseSelect.value;
        const intensity = intensitySelect.value;

        if (weight && exercise && durationInSeconds > 0 && metValues[exercise]) {
            console.log(`Calculating calories for ${durationInSeconds.toFixed(2)} seconds...`);

            const caloriesThisRound = calculateCalories(weight, durationInSeconds, exercise, intensity);

            // Add to totals
            appData.workout.caloriesThisRound1 = caloriesThisRound;
            appData.workout.dailyTotal += caloriesThisRound;
            appData.workout.weeklyTotal += caloriesThisRound;
            appData.workout.monthlyTotal += caloriesThisRound;
            appData.workout.yearlyTotal += caloriesThisRound;
            appData.workout.total += caloriesThisRound;

            saveData(); // Save the updated totals
            updateDisplay(); // Refresh the display on the page

            // Show a temporary confirmation message
            caloriesBurnedDiv.textContent = `Last workout: +${caloriesThisRound.toFixed(2)} calories!`;
        } else {
            console.warn("Could not calculate calories. Ensure weight, exercise, and intensity are set.");
            caloriesBurnedDiv.textContent = "Please select exercise and weight.";
        }

        // Visually disable the stop button
        startStopwatchBtn.disabled = false;
        stopStopwatchBtn.disabled = true;
    }

    function resetStopwatch() {
        clearInterval(stopwatchInterval);
        isStopwatchRunning = false;
        stopwatchElapsedTime = 0;
        stopwatchDisplay.textContent = "00:00:00";

        // Re-enable the start button
        startStopwatchBtn.disabled = false;
        stopStopwatchBtn.disabled = false;
    }

    // --- Add Event Listeners for the new Stopwatch buttons ---
    startStopwatchBtn.addEventListener('click', startStopwatch);
    stopStopwatchBtn.addEventListener('click', stopStopwatch);
    resetStopwatchBtn.addEventListener('click', resetStopwatch);

    // Combined state object for all user and workout data
    let appData = {
        workout: {
            caloriesThisRound1: 0,
            dailyTotal: 0,
            weeklyTotal: 0,
            monthlyTotal: 0, // <-- ADD THIS
            yearlyTotal: 0, // <-- ADD THIS
            total: 0,
            lastWorkoutDate: null,
            currentWeekStartDate: null,
            currentMonthStartDate: null, // <-- ADD THIS
            currentYearStartDate: null // <-- ADD THIS
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


    // --- Sound Definitions ---
    const soundFiles = {
        begin: "begin.mp3",
        elapsed30: "30-seconds-have-elapsed.mp3",
        remaining30: "30-seconds-remaining.mp3",
        remaining20: "20-seconds-remaining.mp3",
        remaining10: "10-seconds-remaining.mp3",
        end: ["you-re-done-bitch.mp3", "a-workout-only-a-mom-would-be-proud-of.mp3", "get-better-fuck-face.mp3", "go-back-to-sitting-down-lazy.mp3", "good-work-loser.mp3", "you-re-done-bitch.mp3", "you-performed-as-good-as-a-dying-cockroach-your-done.mp3", "i-wish-i-could-say-i-was-proud-of-your-performance-just-stop.mp3", "great-work-don-t-forget-to-pick-up-your-pride-on-the-way-out-honey.mp3", "aint-no-one-proud-of-that-deer.mp3"]
    };
    let unlockedSounds = { end: [] };

    // --- Helper Function: playSound ---
    function playSound(audioObject) {
        if (audioObject) {
            audioObject.currentTime = 0;
            audioObject.play().catch(e => console.error(`Sound playback failed:`, e));
        }
    }

    // --- Date Helper Functions ---
    const getTodayISO = () => new Date().toISOString().split('T')[0];
    const getStartOfWeekISO = () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, etc.
        const date = new Date(today);
        date.setDate(today.getDate() - dayOfWeek);
        return date.toISOString().split('T')[0];
    };
    const getStartOfMonthISO = () => {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        // The toISOString method can have timezone issues, creating a "day before" bug.
        // This simple workaround correctly formats the date regardless of timezone.
        const year = firstDayOfMonth.getFullYear();
        const month = String(firstDayOfMonth.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(firstDayOfMonth.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    const getStartOfYearISO = () => {
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1); // Month 0 is January
        // Applying the same timezone-safe formatting
        const year = firstDayOfYear.getFullYear();
        const month = String(firstDayOfYear.getMonth() + 1).padStart(2, '0');
        const day = String(firstDayOfYear.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- Data Management ---
    const loadData = () => {
        const savedData = JSON.parse(localStorage.getItem('appData'));
        const todayISO = getTodayISO();
        const startOfWeekISO = getStartOfWeekISO();
        const startOfMonthISO = getStartOfMonthISO();
        const startOfYearISO = getStartOfYearISO(); // Corrected variable name from your example

        if (savedData) {
            // Merge saved data with the default structure to avoid errors if the structure changes
            if (savedData.workout) {
                appData.workout = {...appData.workout, ...savedData.workout };
            }
            if (savedData.user) {
                appData.user = {...appData.user, ...savedData.user };
            }
        }

        // --- Date-based Resets (Hierarchical) ---

        // 1. Check for a new Year
        if (appData.workout.currentYearStartDate !== startOfYearISO) {
            console.log("New Year Detected! Resetting all totals.");
            appData.workout.yearlyTotal = 0;
            appData.workout.monthlyTotal = 0;
            appData.workout.weeklyTotal = 0;
            appData.workout.dailyTotal = 0;
            appData.workout.caloriesThisRound1 = 0;
            appData.workout.currentYearStartDate = startOfYearISO;
            appData.workout.currentMonthStartDate = startOfMonthISO; // Also update month/week starts
            appData.workout.currentWeekStartDate = startOfWeekISO;
        }
        // 2. Else, check for a new Month
        else if (appData.workout.currentMonthStartDate !== startOfMonthISO) {
            console.log("New Month Detected! Resetting month, week, and day totals.");
            appData.workout.monthlyTotal = 0;
            appData.workout.weeklyTotal = 0;
            appData.workout.dailyTotal = 0;
            appData.workout.caloriesThisRound1 = 0;
            appData.workout.currentMonthStartDate = startOfMonthISO;
            appData.workout.currentWeekStartDate = startOfWeekISO; // Also update week start
        }
        // 3. Else, check for a new Week
        else if (appData.workout.currentWeekStartDate !== startOfWeekISO) {
            console.log("New Week Detected! Resetting week and day totals.");
            appData.workout.weeklyTotal = 0;
            appData.workout.dailyTotal = 0;
            appData.workout.currentWeekStartDate = startOfWeekISO;
        }

        // 4. Always check for a new Day (This can be separate)
        if (appData.workout.lastWorkoutDate !== todayISO) {
            console.log("New Day Detected! Resetting day total.");
            appData.workout.dailyTotal = 0;
        }

        // Finally, always set the last workout date to today
        appData.workout.lastWorkoutDate = todayISO;


        // Populate form fields with loaded user data (this part is unchanged)
        if (appData.user.age) ageInput.value = appData.user.age;
        if (appData.user.sex) sexSelect.value = appData.user.sex;
        if (appData.user.heightFt) heightFtInput.value = appData.user.heightFt;
        if (appData.user.heightIn) heightInInput.value = appData.user.heightIn;
        if (appData.user.weightLbs) bmrWeightInput.value = appData.user.weightLbs;
        if (appData.user.weight) weightInput.value = appData.user.weight;

        saveData(); // Save back any corrections (like date resets)
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

    // --- BMR Calculation (Mifflin-St Jeor Formula) ---
    const calculateBmr = (weight, height, age, sex) => {
        if (sex === "male") {
            return (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            return (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
    };

    calculateBmrBtn.addEventListener('click', () => {
        // Update state from inputs
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

        // Convert to metric for calculation
        const weightKg = appData.user.weightLbs / 2.20462;
        const totalHeightIn = (appData.user.heightFt * 12) + appData.user.heightIn;
        const heightCm = totalHeightIn * 2.54;

        const bmrValue = calculateBmr(weightKg, heightCm, appData.user.age, appData.user.sex);
        bmrResultDiv.innerHTML = `Your estimated daily BMR is: <strong>${bmrValue.toFixed(0)} calories</strong>`;

        // Save the new user data to localStorage
        saveData();
    });

    // --- Calorie Calculation (MET Formula) ---
    const calculateCalories = (weightInPounds, durationInSeconds, exercise, intensity) => {
        const MET = metValues[exercise][intensity] || 7.0; // Default to 7.0 if not found
        const weightInKg = weightInPounds / 2.20462;
        const durationInMinutes = durationInSeconds / 60;
        const caloriesPerMinute = (MET * 3.5 * weightInKg) / 200;
        return caloriesPerMinute * durationInMinutes;
    };

    // --- Main Timer Logic ---
    function startMainTimer(initialDuration) {
        let totalSeconds = initialDuration;
        mainCountdownInterval = setInterval(() => {
            if (totalSeconds < 0) {
                clearInterval(mainCountdownInterval);
                timerDisplay.textContent = "Time's up!";
                loadData();

                const weight = parseInt(weightSelect.value, 10);
                const duration = parseInt(secondsInput.value, 10);
                const exercise = exerciseSelect.value;
                const intensity = intensitySelect.value;

                const caloriesThisRound = calculateCalories(weight, duration, exercise, intensity);

                appData.workout.caloriesThisRound1 = caloriesThisRound;
                appData.workout.dailyTotal += caloriesThisRound;
                appData.workout.weeklyTotal += caloriesThisRound;
                appData.workout.monthlyTotal += caloriesThisRound;
                appData.workout.yearlyTotal += caloriesThisRound;
                appData.workout.total += caloriesThisRound;
                saveData();
                updateDisplay();

                memeElement.style.display = 'block';
                timerDisplay.style.display = 'block';

                if (unlockedSounds.end.length > 0) {
                    const randomIndex = Math.floor(Math.random() * unlockedSounds.end.length);
                    playSound(unlockedSounds.end[randomIndex]);
                    memeTimeout = setTimeout(() => {
                        memeElement.style.display = 'none';
                    }, 30000);
                }

                timerDisplay.classList.remove('pre-countdown');
            } else {
                if ((totalSeconds === 30) && (initialDuration >= 31)) playSound(unlockedSounds.remaining30);
                if (totalSeconds === 20) playSound(unlockedSounds.remaining20);
                if (totalSeconds === 10) playSound(unlockedSounds.remaining10);
                if ((initialDuration - totalSeconds === 30) && (initialDuration >= 61)) playSound(unlockedSounds.elapsed30);

                const mins = Math.floor(totalSeconds / 60);
                const secs = totalSeconds % 60;
                timerDisplay.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
                totalSeconds--;
            }
        }, 1000);

    }
    document.body.addEventListener("click", () => {
        if (!unlockedSounds._initialized) {
            initializeSounds();
        }
    }, { once: true });

    muteAll();
    // --- Form Submission Logic ---
    timerForm.addEventListener('submit', function(event) {
        event.preventDefault();
        muteAll();
        if (!unlockedSounds.begin) {


            for (const key in soundFiles) {
                const fileOrFiles = soundFiles[key];
                if (Array.isArray(fileOrFiles)) {
                    fileOrFiles.forEach(fileName => {
                        muteAll();
                        const audio = new Audio(fileName);
                        audio.play().then(() => audio.pause()).catch(e => {});
                        unlockedSounds.end.push(audio);
                    });
                } else {
                    muteAll();
                    const audio = new Audio(fileOrFiles);
                    audio.play().then(() => audio.pause()).catch(e => {});
                    unlockedSounds[key] = audio;
                }
            }
        }

        const mainDuration = parseInt(secondsInput.value, 10);
        if (isNaN(mainDuration) || mainDuration <= 0) {
            timerDisplay.textContent = "Please enter a valid number of seconds.";
            muteAll();
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
                unmuteAll();
                playSound(unlockedSounds.begin);
                startMainTimer(mainDuration);
            }
        }, 1000);
    });

    // --- Event Listener for the Clear Button ---
    clearCaloriesBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all progress?")) {
            appData.workout.dailyTotal = 0;
            appData.workout.weeklyTotal = 0;
            appData.workout.monthlyTotal = 0;
            appData.workout.yearlyTotal = 0;
            appData.workout.total = 0;
            saveData();
            updateDisplay();
            console.log("Weekly progress has been cleared.");
        }
    });

    // --- INITIAL PAGE LOAD ---
    loadData();
});


document.addEventListener('DOMContentLoaded', function() {

    // 1. Define the mapping of exercise values to image URLs
    const exerciseImages = {
        'crunches': 'image-ee48d671.gif',
        'squats': 'squats.gif',
        'pushups': 'Pushups.gif',
        'run': 'run.png',
        'jumpSquats': "jumpSquat.gif",
        'vups': 'vUps.gif',
        'walkingLunges': 'https://www.inspireusafoundation.org/wp-content/uploads/2023/08/bodyweight-walking-lunge-movement.gif',
        "ironMikes": 'https://media.tenor.com/meIUZZ_2oZMAAAAM/lunge-jump.gif',
        "planks": "planks.jpg",
        "jumpingJacks": "jumpingJacks.gif",
        "sidePlanks": "sidePlanks.jpg",
        "eightCountPushups": "eightCountPushups.jpg",
        "burpees": "burpees.gif",
        "walk": "walk.gif",
        "legTuckandTwist": "legTuckandTwist.jpg",
    };

    // 2. Get the elements we need to work with
    const exerciseSelect = document.getElementById('exercise');
    const container = document.getElementById('exercise-container');

    // 3. Listen for the 'change' event on the dropdown
    exerciseSelect.addEventListener('change', function() {
        // Get the value of the currently selected option
        const selectedValue = this.value;

        // Find the corresponding image URL from our map
        const imageUrl = exerciseImages[selectedValue];

        // 4. Update the background image
        if (imageUrl) {
            // If an image is found, set it as the background
            container.style.backgroundImage = `url('${imageUrl}')`;
        } else {
            // If no image is mapped for the selected option, remove the background
            container.style.backgroundImage = 'none';
        }
    });

});