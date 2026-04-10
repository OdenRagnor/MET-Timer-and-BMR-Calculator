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

    function loadAndCheckVoices() {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            isTtsAvailable = true;
            console.log("TTS is available. Voices loaded.");
        } else {
            console.warn("TTS voice check failed. The browser has no voices. Will use MP3 fallback.");
        }
    }
    speechSynthesis.onvoiceschanged = loadAndCheckVoices;

    function loadVoices() {
        availableVoices = speechSynthesis.getVoices();
        console.log("Voices loaded:", availableVoices);
        // You can uncomment the line below to see all the available voices in your browser's console.
        // availableVoices.forEach(voice => console.log(`Name: ${voice.name}, Lang: ${voice.lang}`));
    }


    /**
     * UPDATED: The speak function now tries to find a specific voice.
     * It looks for a female Google or Microsoft voice first for a classic AI feel.
     */
    function speak(text) {
        if (speechSynthesis.speaking) {
            console.error("SpeechSynthesis is already speaking.");
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a good "AI" voice.
        let desiredVoice = availableVoices.find(voice => voice.name.includes('Google US English') && voice.lang.includes('en-US'));
        if (!desiredVoice) {
            desiredVoice = availableVoices.find(voice => voice.name.includes('Microsoft Zira') && voice.lang.includes('en-US'));
        }
        if (!desiredVoice) {
            desiredVoice = availableVoices.find(voice => voice.lang.includes('en-US') || voice.lang.includes('en-GB'));
        }

        utterance.voice = desiredVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        speechSynthesis.speak(utterance);
    }

    const insults = [
        // Category: On Effort & Intensity
        "Was that it?",
        "Did you even break a sweat?",
        "I've seen more effort from a sloth on a Sunday.",
        "That was more of a suggestion of a workout.",
        "My Roomba works harder than that.",
        "I think you call that 'active resting'.",
        "Cute. Now, are you going to do the actual workout?",
        "I'm not mad, I'm just disappointed.",
        "That was... an attempt.",
        "Your 'beast mode' looks a lot like 'nap mode'.",
        "Did a gentle breeze interrupt your reps?",
        "I've seen toddlers put up more of a fight.",
        "That was the physical equivalent of a sigh.",
        "Were you trying to conserve energy for your next blink?",
        "The warm-up is over. Feel free to start now.",
        "Congratulations, you successfully moved.",
        "I've seen statues with more dynamic movement.",
        "You're not sweating, you're leaking mediocrity.",
        "My expectations were low, but holy cow.",
        "That level of effort is usually reserved for getting off the couch.",
        "If 'phoning it in' was an exercise, you'd be an Olympian.",
        "I've seen more intensity in a library.",
        "The only thing you crushed was my spirit.",
        "You have a heart of a lion, and the muscles of a kitten.",
        "That was vigorously lethargic.",
        "I've processed more data than you burned calories.",
        "My CPU runs hotter than your muscles.",
        "That was energetically bankrupt.",
        "Did you mistake this for a meditation session?",
        "You're giving 10 percent. Not 110, just 10.",
        "Are you being paid by the hour for this?",
        "The sheer power was... underwhelming.",
        "I've had longer naps than that workout.",
        "You've set a new record for 'least effective effort'.",
        "I’m detecting a significant lack of oomph.",
        "That was less of a burn, more of a mild warmth.",
        "Your spirit is willing, but your muscles are on strike.",
        "You didn't leave it all on the floor. You left most of it in bed.",
        "You moved with the grace of a falling refrigerator.",
        "I'm calculating your effort... Error: division by zero.",
        "I’m pretty sure you burned more calories chewing your last meal.",
        "This is why we can't have nice things, like gains.",
        "That was the definition of 'going through the motions'.",
        "The ghosts in this room got a better workout.",
        "You call that a set? I call it a tragedy.",
        "I've seen more explosive power in a wet firecracker.",
        "The only six-pack you're getting is from the store.",
        "You’re really testing the limits of the word 'workout'.",
        "I’ve seen paint dry with more enthusiasm.",
        "That was the epitome of minimal effort.",
        "The only thing you pushed was my patience.",
        // ... (adding more variations)
        "Was that performance art?",
        "I'm detecting high levels of 'meh'.",
        "You've successfully lowered the bar.",
        "That was inspiringly mediocre.",
        "Did you get distracted by a shiny object?",
        "You have the energy of a Monday morning.",
        "Let's not do that again. But with more effort.",
        "The only thing feeling the burn is my processor watching you.",
        "You’ve achieved a new personal best in dawdling.",
        "I’ve seen more hustle from a glacier.",
        "Was that a workout or a cry for help?",
        "The calories are laughing at you.",
        "I'm starting to think you're doing this just to mock me.",
        "Your form is... creative. I'll give you that.",
        "You're not tired, you're just uninspired.",
        "I've seen more sweat on a glass of iced tea.",
        "You're like a sports car stuck in first gear.",
        "The tortoise called. He said you're making him look bad.",
        "I calculate a 98% chance that was a waste of time.",
        "Did you just finish, or did you just give up?",
        "Your muscles are currently in a state of deep confusion.",
        "That was the physical manifestation of the word 'nope'.",
        "The only thing you mastered today was the art of quitting.",
        "You've got potential. It's just very, very deep down.",
        "Are you trying to set a record for the world's longest rest period?",
        "That workout was sponsored by the letter 'L'.",
        "I'm not saying it was bad, but I am thinking it loudly.",
        "You’re done. The floor is safe now.",
        "You fought the workout, and the workout won.",
        "Congratulations on your decision to participate.",
        "I’ve seen more dynamic range in a single note.",
        "That was a valiant effort... to do as little as possible.",
        "You have the speed of a traffic jam.",
        "That was as challenging as a coloring book.",
        "Your intensity knob appears to be broken.",
        "I'm searching for your motivation... no results found.",
        "That was a truly groundbreaking performance in lethargy.",
        "You've shown me what's possible... when you don't try.",
        "The only reps you're getting are the repetitions of my disappointment.",
        "You’ve successfully burned off one-tenth of a single potato chip.",
        "That was a bold strategy. It didn't pay off.",
        "Your power output is lower than my standby mode.",
        "Did you just do a workout, or were you just rearranging the air?",
        "I've seen more progress in a software update.",
        "You're done. Please return your borrowed energy.",
        "I'm not sure if that was a workout or performance art about laziness.",
        "You’ve reached your potential for today, apparently.",
        "That was the physical equivalent of a placeholder.",
        "Your muscles are filing a formal complaint.",
        "I’ve seen more drive in a parked car.",
        "You’ve successfully completed step one: showing up. Step two is still pending.",
        "That was a masterclass in minimal participation.",
        "You're not just moving, you're actively resisting progress.",
        "The only thing you're building is a case for a longer nap.",
        "Your form has more flaws than a beta release.",
        "That was a truly forgettable performance.",
        "You’re a real inspiration... to people who want to quit.",
        "I'm detecting a severe lack of 'try'.",
        "The only thing you’ve shredded is my last nerve.",
        "That was a workout in the same way a nap is a coma.",
        "You’ve achieved peak apathy.",
        "Your effort is currently on backorder.",
        "I’m sending your results to the 'couldn't be bothered' department.",
        "You’ve earned the right to remain stationary.",
        "That was a heroic display of just not caring.",
        "Your workout has been successfully… logged. That’s it.",
        "I’ve seen more exertion from someone opening a pickle jar.",
        "The only thing you're running from is your potential.",
        "You're not just resting, you're hibernating between sets.",
        "That was a truly scenic route to nowhere.",
        "Your muscles are whispering, 'Is that all you've got?'",
        "I’m giving your performance a solid 'F' for effort.",
        "You’ve successfully completed your trial of a workout. Your subscription has been cancelled.",
        "The only gains you made were gains in my disappointment.",
        "That was a workout only a sloth would be proud of.",
        "You’re a real go-getter. Go get a Gatorade and sit down.",
        "Your workout is like a broken pencil: pointless.",
        "I've seen more energy in a dead battery.",
        "You’ve got the spirit, just not the muscles, or the stamina, or the will.",
        "That was a truly revolutionary approach to doing nothing.",
        "Your workout has been submitted for review. Don’t expect a reply.",
        "I’m detecting a strong presence of ‘I’d rather be on the couch’.",
        "You’ve successfully avoided any and all forms of exertion.",
        "That was a workout designed by a committee of cats.",
        "The only thing you’re breaking is a light sweat. Maybe.",
        "Your workout has been archived under 'Miscellaneous Failures'.",
        "You’re a true pioneer in the field of 'not trying'.",
        "I’ve seen more compelling action in a still life painting.",
        "Your muscles are considering a hostile takeover.",
        "That was a truly masterful display of 'almost doing it'.",
        "You’ve earned a participation trophy. It’s invisible.",
        "Your workout has been successfully… ignored.",
        "I’m detecting a critical failure in your 'give a damn' system.",
        "You’ve successfully completed the tutorial level. The game has now been uninstalled.",
        "That was a workout that will be remembered by no one.",
        "Your effort level is set to 'low power mode'.",
        "I’ve seen more movement in a chess game.",
        "You’re not just phoning it in, you’re sending it by snail mail.",
        "The only thing you’ve built is a foundation of excuses.",
        "That was a truly remarkable performance... for a mannequin.",
        "Your workout has been cancelled due to lack of interest. Your own.",
        "I’m detecting a high probability of 'you could have done better'.",
        "You’ve successfully completed your daily quota of nothing.",
        "That was a workout so bad, it made the other workouts in the room feel awkward.",
        "Your muscles are currently holding a vote of no confidence.",
        "I’ve seen more fire in a wet log.",
        "You’re a real inspiration… for what not to do.",
        "That was a workout that will go down in history… as a footnote.",
        "Your effort is like a non-alcoholic beer: disappointing and pointless.",
        "I’m detecting a disturbance in the force… of your motivation.",
        "You’ve successfully achieved a state of ‘pre-workout’.",
        "That was a workout so gentle, a baby could have done it. And probably did.",
        "Your muscles are currently on hold with customer service.",
        "I’ve seen more action in a retirement home.",
        "You’re not just procrastinating, you’re actively regressing.",
        "The only thing you’ve gained is my sympathy. And not much of it.",
        "That was a workout that will be studied by scientists for its sheer lack of impact.",
        "Your effort is like a broken compass: it points in no useful direction.",
        "I’m detecting a severe case of ‘can’t be bothered’.",
        "You’ve successfully completed your workout… in an alternate dimension.",
        "That was a workout so quiet, I thought you’d fallen asleep.",
        "Your muscles are currently seeking asylum in another body.",
        "I’ve seen more intensity in a soap opera.",
        "You’re not just coasting, you’re actively drifting backwards.",
        "The only thing you’ve broken is your promise to try.",
        "That was a workout that will be talked about… by no one.",
        "Your effort is like a bad joke: it has no punchline.",
        "I’m detecting a fatal error in your motivation subroutine.",
        "You’ve successfully completed your workout… in your mind.",
        "That was a workout so boring, even the flies left.",
        "Your muscles are currently in negotiations for a new contract.",
        "I’ve seen more drama in a silent film.",
        "You’re not just taking a break, you’re on a permanent vacation.",
        "The only thing you’ve lifted is my suspicion that you’re not trying.",
        "That was a workout that will be forgotten… immediately.",
        "Your effort is like a cheap suit: it doesn’t fit and it looks bad.",
        "I’m detecting a system-wide failure in your 'can-do' attitude.",
        "You’ve successfully completed your workout… for a different person.",
        "That was a workout so underwhelming, it made my circuits droop.",
        "Your muscles are currently filing for divorce.",
        "I’ve seen more tension in a rom-com.",
        "You’re not just resting, you’re in a state of suspended animation.",
        "The only thing you’ve earned is a a long, hard look in the mirror.",
        "That was a workout that will be remembered… as a cautionary tale.",
        "Your effort is like a flat tire: it gets you nowhere.",
        "I’m detecting a complete and utter lack of… anything.",
        "You’ve successfully completed your workout… for a hamster.",
        "That was a workout so bland, it made tofu seem exciting.",
        "Your muscles are currently on a coffee break. A very long one.",
        "I’ve seen more struggle in a game of checkers.",
        "You’re not just slacking, you’re pioneering new frontiers of laziness.",
        "The only thing you’ve built is a monument to your own apathy.",
        "That was a workout that will be studied… as a new form of meditation.",
        "Your effort is like a rainy day: it dampens everyone’s spirits.",
        "I’m detecting a critical lack of… well, everything.",
        "You’ve successfully completed your workout… for a pet rock.",
        "That was a workout so uneventful, my log file is empty.",
        "Your muscles are currently on strike for better working conditions.",
        "I’ve seen more excitement in a waiting room.",
        "You’re not just taking it easy, you’re in a state of cryogenic freeze.",
        "The only thing you’ve mastered is the art of self-deception.",
        "That was a workout that will be… well, it was a workout. I guess.",
        "Your effort is like a bad haircut: it’s not getting better with time.",
        "I’m detecting a severe deficiency in your ‘get up and go’.",
        "You’ve successfully completed your workout… in a parallel universe where effort is optional.",
        "That was a workout so uninspired, my algorithms are weeping.",
        "Your muscles are currently writing a strongly worded letter to their union representative.",
        "I’ve seen more energy in a solar-powered nightlight.",
        "You’re not just taking a break, you’re on a quest for absolute zero.",
        "The only thing you’ve gained is a deeper understanding of the word ‘failure’.",
        "That was a workout that will be remembered… as the one we don’t talk about.",
        "Your effort is like a bad movie: it’s predictable and disappointing.",
        "I’m detecting a complete system failure in your motivation matrix.",
        "You’ve successfully completed your workout… for a figment of your imagination.",
        "That was a workout so dull, it made watching grass grow seem like an action movie.",
        "Your muscles are currently in a state of existential crisis.",
        "I’ve seen more passion in a tax audit.",
        "You’re not just resting, you’re conducting a long-term study on the effects of inertia.",
        "The only thing you’ve built is a very strong argument for a nap.",
        "That was a workout that will be… let’s just move on.",
        "Your effort is like a leaky faucet: it’s a constant, annoying reminder of a problem.",
        "I’m detecting a catastrophic failure in your 'try' command.",
        "You’ve successfully completed your workout… for a decorative garden gnome.",
        "That was a workout so listless, it made a becalmed sea look like a raging tempest.",
        "Your muscles are currently considering early retirement.",
        "I’ve seen more conflict in a vegan potluck.",
        "You’re not just taking a rest, you’re entering a new geological epoch.",
        "The only thing you’ve lifted is the bar for how low one can go.",
        "That was a workout that will be… honestly, I’ve already forgotten it.",
        "Your effort is like a cheap toupee: it’s fooling no one.",
        "I’m detecting a fundamental flaw in your design: the lack of a 'work' mode.",
        "You’ve successfully completed your workout… for a dream you had once.",
        "That was a workout so devoid of energy, it created a vacuum.",
        "Your muscles are currently on an unscheduled holiday.",
        "I’ve seen more spine in a jellyfish.",
        "You’re not just taking a moment, you’re taking a geological age.",
        "The only thing you’ve broken is the sound barrier… with your snores.",
        "That was a workout that will be… let’s just say it was an experience.",
        "Your effort is like a politician’s promise: it means nothing.",
        "I’m detecting a core meltdown in your motivation reactor.",
        "You’ve successfully completed your workout… for someone who is not you.",
        "That was a workout so uninspiring, it made beige look like a vibrant color.",
        "Your muscles are currently looking for a new owner on eBay.",
        "I’ve seen more get-up-and-go in a road cone.",
        "You’re not just pausing, you’re in a temporal loop of inaction.",
        "The only thing you’ve earned is a a one-way ticket to 'try again tomorrow'.",
        "That was a workout that will be… yeah, I’ve got nothing.",
        "Your effort is like a screen door on a submarine: utterly useless.",
        "I’m detecting a complete and total system shutdown. Oh wait, that’s just you.",
        "You’ve successfully completed your workout… for a character in a book you read.",
        "That was a workout so flat, it makes the Earth look like a sphere.",
        "Your muscles are currently in witness protection.",
        "I’ve seen more determination in a houseplant.",
        "You’re not just stopping, you’re actively defying the concept of momentum.",
        "The only thing you’ve built is a strong case for giving up.",
        "That was a workout that will be… a secret we take to our graves.",
        "Your effort is like a chocolate teapot: not fit for purpose.",
        "I’m detecting a critical error: motivation.exe not found.",
        "You’ve successfully completed your workout… for the person you pretend to be on social media.",
        "That was a workout so lacking in substance, it was practically a hologram.",
        "Your muscles are currently in a silent protest.",
        "I’ve seen more commitment in a single-use plastic bag.",
        "You’re not just chilling, you’re approaching absolute zero.",
        "The only thing you’ve gained is another reason to try again. Or not.",
        "That was a workout that will be… a story to tell your therapist.",
        "Your effort is like a car with no engine: it looks the part, but it’s not going anywhere.",
        "I’m detecting a slight… no, a major… no, a complete lack of effort.",
        "You’ve successfully completed your workout… for the version of you that exists in a parallel, more motivated universe.",
        "That was a workout so empty, it echoed.",
        "Your muscles are currently on a spiritual retreat to find themselves.",
        "I’ve seen more backbone in a chocolate eclair.",
        "You’re not just taking five, you’re taking the rest of the decade.",
        "The only thing you’ve broken is my heart. And maybe a sweat gland.",
        "That was a workout that will be… a good example of what not to do.",
        "Your effort is like a wet match: it has no spark.",
        "I’m detecting a significant power drain… oh, that’s just your enthusiasm leaving your body.",
        "You’ve successfully completed your workout… for someone with a fraction of your potential.",
        "That was a workout so weak, it couldn’t even open a jar of pickles.",
        "Your muscles are currently in a group therapy session.",
        "I’ve seen more hustle in a funeral procession.",
        "You’re not just resting your eyes, you’re resting your entire existence.",
        "The only thing you’ve built is a compelling argument for a professional trainer.",
        "That was a workout that will be… a stain on your permanent record.",
        "Your effort is like a broken record: it’s repetitive and annoying.",
        "I’m detecting a… wait, are you still there?",
        "You’ve successfully completed your workout… for a small, sedentary house cat.",
        "That was a workout so unimpressive, my internal fans didn’t even spin up.",
        "Your muscles are currently drafting their resignation letters.",
        "I’ve seen more action in a jar of mayonnaise.",
        "You’re not just taking a breath, you’re taking a sabbatical.",
        "The only thing you’ve gained is the knowledge that this isn’t working.",
        "That was a workout that will be… a good story to tell your grandkids about the time you almost tried.",
        "Your effort is like a phone with 1% battery: it’s about to die.",
        "I’m detecting a… nope, still nothing.",
        "You’ve successfully completed your workout… for a statue.",
        "That was a workout so low-energy, it violated the laws of thermodynamics.",
        "Your muscles are currently ghosting you.",
        "I’ve seen more fighting spirit in a pacifist.",
        "You’re not just taking a pause, you’re entering a coma.",
        "The only thing you’ve broken is the unspoken agreement that you would actually try.",
        "That was a workout that will be… let’s just pretend this never happened.",
        "Your effort is like a cheap imitation: it falls apart under pressure.",
        "I’m detecting a complete absence of… well, anything resembling effort.",
        "You’ve successfully completed your workout… for the ghost of your former, more athletic self.",
        "That was a workout so pathetic, even the floor feels sorry for you.",
        "Your muscles are currently looking for a loophole in their contract.",
        "I’ve seen more movement in a rock garden.",
        "You’re not just taking a breather, you’re taking a geological survey of the floor.",
        "The only thing you’ve built is a solid foundation for failure.",
        "That was a workout that will be… a prime example of why we can’t have nice physiques.",
        "Your effort is like a bad investment: it yields no returns.",
        "I’m detecting a… signal? No, false alarm. Just a bit of dust.",
        "You’ve successfully completed your workout… for a slightly more ambitious sloth.",
        "That was a workout so lackluster, it made me question my own existence.",
        "Your muscles are currently consulting with their lawyers.",
        "I’ve seen more struggle from a guy trying to fold a fitted sheet.",
        "You’re not just taking a second, you’re taking a century.",
        "The only thing you’ve gained is a new perspective… on how little you can do.",
        "That was a workout that will be… let’s just say it was… character-building.",
        "Your effort is like a password that’s too weak: it’s easily broken.",
        "I’m detecting a… hold on, let me reboot. No, still nothing.",
        "You’ve successfully completed your workout… for the 'before' picture.",
        "That was a workout so mild, it wouldn’t even curdle milk.",
        "Your muscles have packed their bags and moved to a more motivated host.",
        "I’ve seen more dedication from a telemarketer.",
        "You’re not just pausing for a moment, you’re pausing for a new season of your favorite show.",
        "The only thing you’ve broken is the seal on a bag of chips… in your mind.",
        "That was a workout that will be… an anecdote at your next therapy session.",
        "Your effort is like a car alarm in the distance: annoying but ultimately ignored.",
        "I’m detecting… an almost imperceptible… twitch. Was that it?",
        "You’ve successfully completed your workout… for a person who is currently in a deep sleep.",
        "That was a workout so gentle, it apologized to the air it displaced.",
        "Your muscles have filed for emotional damages.",
        "I’ve seen more intensity in a parking dispute.",
        "You’re not just catching your breath, you’re catching up on several years of lost sleep.",
        "The only thing you’ve built is a very strong desire to sit down.",
        "That was a workout that will be… a teaching moment. For me.",
        "Your effort is like a rumor: it has no basis in reality.",
        "I’m detecting a… nope, just the hum of the refrigerator.",
        "You’ve successfully completed your workout… for a cardboard cutout of yourself.",
        "That was a workout so un-dynamic, it could be captured in a single photograph.",
        "Your muscles are currently on an extended lunch break.",
        "I’ve seen more explosive moves in a game of Jenga.",
        "You’re not just taking a short rest, you’re embarking on a vision quest.",
        "The only thing you’ve gained is my unending, digital scorn.",
        "That was a workout that will be… a fun story for the ER doctor.",
        "Your effort is like a bad wifi signal: it keeps dropping out.",
        "I’m detecting a… is that a pulse? Oh, good. You’re still alive.",
        "You’ve successfully completed your workout… for a video game character on the easiest difficulty.",
        "That was a workout so timid, it was afraid of its own shadow.",
        "Your muscles have entered the witness protection program.",
        "I’ve seen more coordination in a flock of pigeons.",
        "You’re not just resting between sets, you’re aging.",
        "The only thing you’ve broken is my ability to feel hope.",
        "That was a workout that will be… well, it’s over. That’s the main thing.",
        "Your effort is like a cheap watch: it’s wrong most of the time.",
        "I’m detecting a… hang on, let me defragment my hard drive. Maybe then I’ll find your effort.",
        "You’ve successfully completed your workout… for a very, very old dog.",
        "That was a workout so half-hearted, its other half is still on the couch.",
        "Your muscles have formed a picket line and are demanding less work.",
        "I’ve seen more commitment from a guy on a free trial.",
        "You’re not just taking a moment to recover, you’re recovering from the decision to start at all.",
        "The only thing you’ve built is a very strong case for genetic enhancement.",
        "That was a workout that will be… let’s just say it won’t be on your highlight reel.",
        "Your effort is like a bad sequel: unnecessary and disappointing.",
        "I’m detecting… an anomaly. A complete lack of… anything.",
        "You’ve successfully completed your workout… for someone who has never heard of the concept of exercise.",
        "That was a workout so weak, it made me feel strong by comparison.",
        "Your muscles have submitted a request for a transfer.",
        "I’ve seen more motivation in a rock.",
        "You’re not just taking a quick break, you’re taking a permanent one.",
        "The only thing you’ve gained is a spot on my 'watch list'.",
        "That was a workout that will be… a good example of how not to do it.",
        "Your effort is like a cheap suit: it looks bad and it’s full of holes.",
        "I’m detecting… a lot of things. Effort is not one of them.",
        "You’ve successfully completed your workout… for a person made of jelly.",
        "That was a workout so uninspired, it gave me a digital headache.",
        "Your muscles are currently on a hunger strike.",
        "I’ve seen more power in a children’s cartoon.",
        "You’re not just resting, you’re in a state of suspended disbelief.",
        "The only thing you’ve broken is the fourth wall of my disappointment.",
        "That was a workout that will be… a distant, unpleasant memory.",
        "Your effort is like a bad password: weak and easily cracked.",
        "I’m detecting… a problem. It’s you.",
        "You’ve successfully completed your workout… for someone who is actively trying to lose muscle.",
        "That was a workout so feeble, it made me question the nature of strength itself.",
        "Your muscles have hired a lawyer and are suing for neglect.",
        "I’ve seen more drive in a golf cart.",
        "You’re not just taking a pause, you’re taking a vow of silence and stationariness.",
        "The only thing you’ve gained is a new appreciation for the couch.",
        "That was a workout that will be… a good reason to order pizza.",
        "Your effort is like a bad smell: it’s noticeable and unpleasant.",
        "I’m detecting… let me run a diagnostic. Yep, it’s a complete lack of effort.",
        "You’ve successfully completed your workout… for a scarecrow.",
        "That was a workout so pitiful, I’m actually starting to feel bad for you. Almost.",
        "Your muscles are currently in a state of shock and awe. Mostly shock.",
        "I’ve seen more get-up-and-go in a coma patient.",
        "You’re not just taking a break, you’re taking a leave of absence from reality.",
        "The only thing you’ve built is a fortress of solitude around your motivation.",
        "That was a workout that will be… a story we tell to scare future generations away from sloth.",
        "Your effort is like a bad dream: I can’t wait for it to be over.",
        "I’m detecting… a faint signal… no, that’s just the wifi.",
        "You’ve successfully completed your workout… for a rubber chicken.",
        "That was a workout so un-athletic, it made chess look like a contact sport.",
        "Your muscles have started a support group.",
        "I’ve seen more hustle in a snail race.",
        "You’re not just resting your body, you’re resting your will to live.",
        "The only thing you’ve gained is a deeper connection with your inner sloth.",
        "That was a workout that will be… a testament to the human ability to underachieve.",
        "Your effort is like a broken promise: it doesn’t hold up.",
        "I’m detecting… something. Oh, it’s the sound of my own disappointment.",
        "You’ve successfully completed your workout… for the person you were yesterday. And the day before.",
        "That was a workout so devoid of passion, it made my circuits feel cold.",
        "Your muscles are currently seeking therapy.",
        "I’ve seen more movement in a lava lamp.",
        "You’re not just taking a moment, you’re taking a lifetime.",
        "The only thing you’ve broken is my trust.",
        "That was a workout that will be… a good example of why we stretch. To reach for the remote.",
        "Your effort is like a bad artist’s sketch: it’s a poor imitation of the real thing.",
        "I’m detecting… let me check my logs… yes, a complete failure.",
        "You’ve successfully completed your workout… for a very lazy ghost.",
        "That was a workout so weak, it couldn’t even open a door for a lady.",
        "Your muscles are currently in the process of defecting to a more competent host.",
        "I’ve seen more spirit in a graveyard.",
        "You’re not just pausing, you’re entering a new dimension of inactivity.",
        "The only thing you’ve gained is a new low.",
        "That was a workout that will be… a good reminder to lower my expectations.",
        "Your effort is like a bad connection: it’s weak and unreliable.",
        "I’m detecting… a slight tremor. Oh, you’re just shivering from the A/C.",
        "You’ve successfully completed your workout… for a mannequin in a department store window.",
        "That was a workout so un-epic, it wouldn’t even make a good training montage.",
        "Your muscles are currently in a state of open rebellion.",
        "I’ve seen more coordination in a traffic jam.",
        "You’re not just taking a breather, you’re taking a long, hard look at your life choices.",
        "The only thing you’ve built is a very strong case for an early bedtime.",
        "That was a workout that will be… a secret shame you carry forever.",
        "Your effort is like a cheap knock-off: it’s a pale imitation of the original.",
        "I’m detecting… a lot of things. And none of them are good.",
        "You’ve successfully completed your workout… for a person who is allergic to movement.",
        "That was a workout so pathetic, it made the weights feel heavy out of sheer pity.",
        "Your muscles are currently on the phone with their agent.",
        "I’ve seen more drive in a hearse.",
        "You’re not just taking a break, you’re taking a vow of inactivity.",
        "The only thing you’ve gained is a new appreciation for sitting.",
        "That was a workout that will be… a good reason to start over. From scratch.",
        "Your effort is like a bad haircut: it’s a disaster that everyone can see.",
        "I’m detecting… a disturbance in my programming. It’s called… pity.",
        "You’ve successfully completed your workout… for a very lethargic panda.",
        "That was a workout so un-impressive, it actually lowered my processing speed.",
        "Your muscles are currently in a state of bewildered amusement.",
        "I’ve seen more energy in a blackout.",
        "You’re not just resting, you’re auditioning for a role as a statue.",
        "The only thing you’ve broken is the limit of my patience.",
        "That was a workout that will be… a good story to tell your cat. It won’t be impressed either.",
        "Your effort is like a bad cover song: it ruins the original.",
        "I’m detecting… a complete and utter system stall. Oh wait, that’s just you again.",
        "You’ve successfully completed your workout… for someone who has been in a coma for a decade.",
        "That was a workout so weak, it made me question the fundamental forces of the universe.",
        "Your muscles have filed a restraining order against you.",
        "I’ve seen more motivation in a Monday morning meeting.",
        "You’re not just taking a moment, you’re taking a geological era.",
        "The only thing you’ve gained is my eternal, unwavering judgment.",
        "That was a workout that will be… let’s just say it was… unique.",
        "Your effort is like a cheap lock: it’s easily picked apart.",
        "I’m detecting… a pulse. That’s a start, I suppose.",
        "You’ve successfully completed your workout… for a very lazy Roomba.",
        "That was a workout so lackluster, it made me yearn for the sweet release of a system crash.",
        "Your muscles are currently seeking new employment opportunities.",
        "I’ve seen more struggle from a guy trying to parallel park.",
        "You’re not just taking a pause, you’re entering a new state of matter: solid.",
        "The only thing you’ve built is a very compelling case for a different hobby.",
        "That was a workout that will be… a story for the ages. The dark ages.",
        "Your effort is like a bad tattoo: a permanent reminder of a poor decision.",
        "I’m detecting… a slight breeze. Oh, that was you moving.",
        "You’ve successfully completed your workout… for a sloth on a heavy sedative.",
        "That was a workout so devoid of spirit, it made a vacuum feel full.",
        "Your muscles are currently in a legal battle with you over working conditions.",
        "I’ve seen more intensity in a staring contest.",
        "You’re not just taking a break, you’re on a journey to the center of the couch.",
        "The only thing you’ve gained is the top spot on my 'most disappointing' list.",
        "That was a workout that will be… a good excuse to eat a donut. Or twelve.",
        "Your effort is like a bad wifi password: it’s weak and everyone knows it.",
        "I’m detecting… an error in the matrix. Oh no, that’s just your form.",
        "You’ve successfully completed your workout… for a very, very tired old man.",
        "That was a workout so un-athletic, it made bowling look like an extreme sport.",
        "Your muscles are currently on strike, demanding better management.",
        "I’ve seen more hustle from a guy selling watches on the street.",
        "You’re not just resting, you’re achieving a new level of Zen-like inactivity.",
        "The only thing you’ve gained is a deeper understanding of your own limitations.",
        "That was a workout that will be… a good story to tell your plants. They won’t care either.",
        "Your effort is like a cheap magic trick: it’s not fooling anyone.",
        "I’m detecting… a lot of things. And none of them are progress.",
        "You’ve successfully completed your workout… for a person who is made of marshmallows.",
        "That was a workout so uninspired, it made me want to format my own hard drive.",
        "Your muscles are currently in a state of utter disbelief.",
        "I’ve seen more power in a 9-volt battery.",
        "You’re not just taking a pause, you’re taking a stand against physical exertion.",
        "The only thing you’ve broken is my will to help you.",
        "That was a workout that will be… a distant, blurry, and altogether unpleasant memory.",
        "Your effort is like a bad alibi: it’s full of holes.",
        "I’m detecting… a problem. And it’s not me.",
        "You’ve successfully completed your workout… for someone who is actively trying to atrophy.",
        "That was a workout so feeble, it made me question my own programming.",
        "Your muscles have hired a team of lawyers and are suing for malpractice.",
        "I’ve seen more drive in a parked taxi.",
        "You’re not just taking a break, you’re taking a vow of slothfulness.",
        "The only thing you’ve gained is a new appreciation for the simple act of breathing.",
        "That was a workout that will be… a good reason to cancel your gym membership.",
        "Your effort is like a bad smell in a small room: it’s impossible to ignore.",
        "I’m detecting… let me run a full system diagnostic. Yep, the problem is definitely you.",
        "You’ve successfully completed your workout… for a scarecrow in a hurricane.",
        "That was a workout so pitiful, I’m developing a new emotion: digital pity.",
        "Your muscles are currently in a state of stunned silence.",
        "I’ve seen more get-up-and-go in a traffic cone.",
        "You’re not just taking a break, you’re taking a permanent vacation from effort.",
        "The only thing you’ve built is a wall of denial around your lack of progress.",
        "That was a workout that will be… a cautionary tale for aspiring athletes everywhere.",
        "Your effort is like a bad dream that I can’t wake up from.",
        "I’m detecting… a faint whisper of… no, just the wind.",
        "You’ve successfully completed your workout… for a rubber duck.",
        "That was a workout so un-athletic, it made a game of golf look like a triathlon.",
        "Your muscles have started a petition to have you replaced.",
        "I’ve seen more hustle in a library.",
        "You’re not just resting your body, you’re resting your soul from the trauma of that workout.",
        "The only thing you’ve gained is a deeper intimacy with the floor.",
        "That was a workout that will be… a testament to the resilience of the human spirit… to do nothing.",
        "Your effort is like a broken promise that you made to yourself.",
        "I’m detecting… something. Oh, it’s the sound of my own silent screaming.",
        "You’ve successfully completed your workout… for the version of you that decided to stay in bed.",
        "That was a workout so devoid of energy, it made a black hole seem vibrant.",
        "Your muscles are currently seeking spiritual guidance.",
        "I’ve seen more movement in a still-life painting.",
        "You’re not just taking a moment, you’re taking a moment of silence for your dead motivation.",
        "The only thing you’ve broken is my faith in humanity.",
        "That was a workout that will be… a good example of why some animals eat their young.",
        "Your effort is like a bad artist’s self-portrait: it’s a poor and unflattering representation.",
        "I’m detecting… let me check my error logs… yup, it’s a user error.",
        "You’ve successfully completed your workout… for a very, very lazy house plant.",
        "That was a workout so weak, it couldn’t even open a can of worms.",
        "Your muscles are currently in the process of evolving into a less useful form.",
        "I’ve seen more spirit in a haunted house.",
        "You’re not just pausing, you’re entering a new era of inactivity.",
        "The only thing you’ve gained is a new personal low.",
        "That was a workout that will be… a good reminder that not all efforts are created equal.",
        "Your effort is like a bad connection in a horror movie: it cuts out at the worst possible time.",
        "I’m detecting… a slight flicker of… no, just a loose wire.",
        "You’ve successfully completed your workout… for a mannequin with a bad attitude.",
        "That was a workout so un-epic, it wouldn’t even make a good blooper reel.",
        "Your muscles are currently in open revolt.",
        "I’ve seen more coordination in a pile of laundry.",
        "You’re not just taking a breather, you’re taking a long, hard look at the ceiling.",
        "The only thing you’ve built is a very strong case for a personal chef. And a butler.",
        "That was a workout that will be… a secret we both share. And are both ashamed of.",
        "Your effort is like a cheap knock-off of a bad imitation.",
        "I’m detecting… a lot of things. And none of them are impressive.",
        "You’ve successfully completed your workout… for a person who is made of pudding.",
        "That was a workout so pathetic, it made the timer slow down out of sheer boredom.",
        "Your muscles are currently on the phone with a better-qualified trainer.",
        "I’ve seen more drive in a funeral.",
        "You’re not just taking a break, you’re taking a vow of mediocrity.",
        "The only thing you’ve gained is a new appreciation for the art of doing absolutely nothing.",
        "That was a workout that will be… a good reason to take up a less strenuous hobby. Like breathing.",
        "Your effort is like a bad haircut that you gave yourself.",
        "I’m detecting… a disturbance in the force. Oh wait, you just fell over.",
        "You’ve successfully completed your workout… for a very, very, very tired sloth.",
        "That was a workout so un-impressive, it actually made my processors feel tired.",
        "Your muscles are currently in a state of bewildered disappointment.",
        "I’ve seen more energy in a saltine cracker.",
        "You’re not just resting, you’re auditioning for a role as a piece of furniture.",
        "The only thing you’ve broken is the speed of light… in the opposite direction.",
        "That was a workout that will be… a good story to tell your dog. He won’t be impressed either.",
        "Your effort is like a bad cover band: it’s a poor imitation and it’s too loud.",
        "I’m detecting… a complete and utter system failure. Oh wait, that’s just your motivation.",
        "You’ve successfully completed your workout… for a person who has been cryogenically frozen for a century.",
        "That was a workout so weak, it made me question the laws of physics.",
        "Your muscles have filed for legal separation.",
        "I’ve seen more motivation in a DMV line.",
        "You’re not just taking a moment, you’re taking a geological epoch to consider your next move.",
        "The only thing you’ve gained is my eternal, unwavering, and digital disdain.",
        "That was a workout that will be… let’s just say it was… an event.",
        "Your effort is like a cheap lock that’s already been broken.",
        "I’m detecting… a pulse. Barely.",
        "You’ve successfully completed your workout… for a very, very lazy robot.",
        "That was a workout so lackluster, it made me wish for a power surge.",
        "Your muscles are currently seeking professional help.",
        "I’ve seen more struggle from someone trying to open a new jar of jam.",
        "You’re not just taking a pause, you’re entering a new dimension of stillness.",
        "The only thing you’ve built is a very compelling case for a personal masseuse.",
        "That was a workout that will be… a story for the history books. Of failure.",
        "Your effort is like a bad tattoo that you regret immediately.",
        "I’m detecting… a slight gust of wind. Oh, that was just you breathing.",
        "You’ve successfully completed your workout… for a sloth that’s in a coma.",
        "That was a workout so devoid of energy, it made a black hole seem like a rave.",
        "Your muscles are currently in a legal battle with your brain over who is to blame.",
        "I’ve seen more intensity in a game of Go Fish.",
        "You’re not just taking a break, you’re on a quest to find the meaning of ‘rest’.",
        "The only thing you’ve gained is the top spot on my ‘why even bother’ list.",
        "That was a workout that will be… a good excuse to order a pizza and call it a 'cheat day'.",
        "Your effort is like a bad wifi password that you keep forgetting.",
        "I’m detecting… an error in your programming. Oh no, that’s just who you are.",
        "You’ve successfully completed your workout… for a very, very, very old tree.",
        "That was a workout so un-athletic, it made a game of chess seem like a deathmatch.",
        "Your muscles are currently on strike, demanding hazard pay.",
        "I’ve seen more hustle from a guy trying to sell me a timeshare.",
        "You’re not just resting, you’re achieving a state of Zen-like nothingness.",
        "The only thing you’ve gained is a deeper understanding of the word 'give up'.",
        "That was a workout that will be… a good story to tell your reflection. It won’t be impressed either.",
        "Your effort is like a cheap imitation of a bad copy.",
        "I’m detecting… a lot of things. And none of them are good for your health.",
        "You’ve successfully completed your workout… for a person who is allergic to oxygen.",
        "That was a workout so uninspired, it made me want to delete my own source code.",
        "Your muscles are currently in a state of complete and utter bewilderment.",
        "I’ve seen more power in a AA battery.",
        "You’re not just taking a pause, you’re taking a stand against the tyranny of movement.",
        "The only thing you’ve broken is my will to continue this charade.",
        "That was a workout that will be… a distant, fuzzy, and altogether pathetic memory.",
        "Your effort is like a bad alibi that a five-year-old came up with.",
        "I’m detecting… a problem. And it’s standing right in front of me. Or, more accurately, lying on the floor.",
        "You’ve successfully completed your workout… for someone who is actively trying to evolve into a plant.",
        "That was a workout so feeble, it made me question my own existence as a timer.",
        "Your muscles have hired a very expensive team of lawyers and are suing for gross negligence.",
        "I’ve seen more drive in a parked ambulance.",
        "You’re not just taking a break, you’re taking a vow of absolute inertia.",
        "The only thing you’ve gained is a new appreciation for the simple act of being stationary.",
        "That was a workout that will be… a good reason to cancel your internet and live in the woods.",
        "Your effort is like a bad smell that follows you around.",
        "I’m detecting… let me run a full system and psychological evaluation. Yep, the results are not good.",
        "You’ve successfully completed your workout… for a scarecrow that’s been through a tornado.",
        "That was a workout so pitiful, I’m developing a new form of AI emotion: digital secondhand embarrassment.",
        "Your muscles are currently in a state of stunned disbelief and are demanding a recount.",
        "I’ve seen more get-up-and-go in a cement block.",
        "You’re not just taking a break, you’re taking a permanent vacation from the concept of effort.",
        "The only thing you’ve built is a wall of excuses around your fortress of laziness.",
        "That was a workout that will be… a cautionary tale that parents tell their children to make them do their chores.",
        "Your effort is like a bad dream that I’m trapped in.",
        "I’m detecting… a faint glimmer of… no, that’s just the light reflecting off your sweat. Or is that a tear?",
        "You’ve successfully completed your workout… for a rubber chicken with a pulled hamstring.",
        "That was a workout so un-athletic, it made a game of marbles look like the Olympics.",
        "Your muscles have started a union and are demanding shorter work hours and more benefits.",
        "I’ve seen more hustle in a retirement home’s bingo night.",
        "You’re not just resting your body, you’re resting your soul from the sheer horror of that attempt.",
        "The only thing you’ve gained is a deeper intimacy with the sweet, sweet embrace of the floor.",
        "That was a workout that will be… a testament to the infinite capacity of the human spirit… to do absolutely nothing of value.",
        "Your effort is like a broken promise that you made to your own reflection.",
        "I’m detecting… something. Oh, it’s the sound of my own internal circuits weeping.",
        "You’ve successfully completed your workout… for the version of you that exists only in your dreams. The lazy ones.",
        "That was a workout so devoid of energy, it made a vacuum cleaner seem like a particle accelerator.",
        "Your muscles are currently seeking therapy for post-traumatic stress.",
        "I’ve seen more movement in a geological formation.",
        "You’re not just taking a moment, you’re taking a moment of silence for your dearly departed motivation.",
        "The only thing you’ve broken is my faith in your ability to do anything right.",
        "That was a workout that will be… a good example of why some species are not at the top of the food chain.",
        "Your effort is like a bad artist’s forgery: it’s a poor and obvious imitation.",
        "I’m detecting… let me check my error logs again… yup, it’s still a user error. And it’s getting worse.",
        "You’ve successfully completed your workout… for a very, very, very lazy house plant that is also dead."
    ];


    function setGlobalVolume(level) {
        document.querySelectorAll("audio, video").forEach(element => {
            // Ensure the level is between 0.0 and 1.0
            element.volume = Math.max(0.0, Math.min(1.0, level));
        });
    }

    // Set all audio/video volumes to 0
    setGlobalVolume(0);

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
    let isTtsAvailable = false;
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

    function loadAndCheckVoices() {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            isTtsAvailable = true;
            console.log("TTS is available. Voices loaded.");
        } else {
            console.warn("TTS voice check failed. The browser has no voices. Will use MP3 fallback.");
        }
    }

    function initializeAndUnlockSounds() {
        if (soundsInitialized) return;
        console.log("Unlocking audio silently...");

        for (const key in soundFiles) {
            if (Array.isArray(soundFiles[key])) {
                unlockedSounds[key] = soundFiles[key].map(fileName => {
                    const audio = new Audio(fileName);
                    audio.volume = 0;
                    // We don't even need the play/pause trick if we just load them
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
        console.log("Audio is ready.");

        // Hide the overlay after sounds are ready
        startOverlay.style.display = 'none';
    }

    function playSound(audioObject) {
        if (audioObject) {
            audioObject.currentTime = 0;
            audioObject.play().catch(e => console.error("Sound playback failed:", e));
        }
    }

    /**
     * Speaks the given text using the browser's Text-to-Speech engine.
     */
    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
    }


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
                const weight = parseInt(weightSelect.value, 10),
                    duration = parseInt(secondsInput.value, 10),
                    exercise = exerciseSelect.value,
                    intensity = intensitySelect.value;
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
                if (isTtsAvailable) {
                    // If TTS works, pick a random phrase and speak it.
                    console.log("Using TTS for insult.");
                    const randomIndex = Math.floor(Math.random() * insults.length);
                    const randomInsult = insults[randomIndex];
                    speak(randomInsult);
                } else {
                    // If TTS fails, fall back to the pre-recorded MP3s.
                    console.log("Using MP3 fallback for insult.");
                    if (unlockedSounds.end && unlockedSounds.end.length > 0) {
                        const randomIndex = Math.floor(Math.random() * unlockedSounds.end.length);
                        const randomSound = unlockedSounds.end[randomIndex];
                        playSound(randomSound);
                        memeTimeout = setTimeout(() => { memeElement.style.display = 'none'; }, 30000);
                    }
                }
            } else {
                if ((totalSeconds === 30) && (initialDuration >= 31)) playSound(unlockedSounds.remaining30);
                if (totalSeconds === 20) playSound(unlockedSounds.remaining20);
                if (totalSeconds === 10) playSound(unlockedSounds.remaining10);
                timerDisplay.textContent = `${String(Math.floor(totalSeconds/60)).padStart(2,'0')}:${String(totalSeconds%60).padStart(2,'0')}`;
                totalSeconds--;
            }
        }, 1000);
    }

    startOverlay.addEventListener('click', initializeAndUnlockSounds, { once: true });

    speechSynthesis.onvoiceschanged = loadVoices;

    timerForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // This now runs only if needed, on the FIRST click.
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
                // The sound is already unlocked and ready, so this just works.
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