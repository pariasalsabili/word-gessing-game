class Player {
    constructor(name) {
        this.name = name;
        this.score = 0;
        this.correctWords = [];
        this.wrongWords = [];   
    }

    updateScore(points) {
        this.score += points;
    }

    addCorrectWord(word) {
        this.correctWords.push(word);
    }

    addWrongWord(word) {
        this.wrongWords.push(word);
    }
}

class WordGame {
    constructor(players, rounds, wordCategories) {
        this.players = players;
        this.rounds = rounds;
        this.currentRound = 1;
        this.wordCategories = wordCategories;
        this.currentPlayerIndex = 0;
        this.currentWord = '';
        this.currentCategory = '';
        this.currentHint = ''; 
        this.mistakes = 0;
        this.guessedLetters = [];
        this.timeLeft = 60;
        this.timerInterval = null;
        this.difficulty = 'easy'; 
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty; 
    }

    start_game() {
        document.getElementById('setup').style.display = 'none';
        document.getElementById('game').style.display = 'block';
        this.nextRound();
    }

    nextRound() {
        if (this.currentRound > this.rounds) {
            this.endGame();
            return;
        }
    
        this.mistakes = 0;
        this.guessedLetters = [];
        this.currentPlayer = this.players[this.currentPlayerIndex];
        document.getElementById('currentPlayer').textContent = this.currentPlayer.name;
    
        const categories = Object.keys(this.wordCategories);
        this.currentCategory = categories[Math.floor(Math.random() * categories.length)];
        document.getElementById('currentCategory').textContent = this.currentCategory;
    
        this.chooseWord(this.currentCategory);
        this.displayWord();
        this.updateMistakes();
    
        document.getElementById('hintDisplay').textContent = this.currentHint; 
        document.getElementById('hintDisplay').style.display = 'block'; 
    
        this.createKeyboard();
    
        this.startTimer(60);
    }
       

    chooseWord(category) {
        const wordsInCategory = this.wordCategories[category];
        let filteredWords;

        if (this.difficulty === 'easy') {
            filteredWords = wordsInCategory.filter(word => word.word.length < 4);
        } else if (this.difficulty === 'medium') {
            filteredWords = wordsInCategory.filter(word => word.word.length >= 4 && word.word.length <= 6);
        } else {
            filteredWords = wordsInCategory.filter(word => word.word.length > 6 && word.word.length <= 11);
        }

        const randomIndex = Math.floor(Math.random() * filteredWords.length);
        const chosenWord = filteredWords[randomIndex];
        this.currentWord = chosenWord.word;  
        this.currentHint = chosenWord.hint; 
    }

    displayWord() {
        let display = '';
        for (let letter of this.currentWord) {
            if (this.guessedLetters.includes(letter.toLowerCase())) {
                display += letter + ' ';
            } else {
                display += '_ ';
            }
        }
        document.getElementById('wordDisplay').textContent = display.trim();
    }

    createKeyboard() {
        const keyboardDiv = document.getElementById('keyboard');
        keyboardDiv.innerHTML = ''; 

        const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        alphabet.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter.toUpperCase();
            button.addEventListener('click', () => this.handleGuess(letter));
            keyboardDiv.appendChild(button);
        });
    }

    handleGuess(guess) {
        const buttons = document.querySelectorAll('#keyboard button');
        buttons.forEach(button => {
            if (button.textContent.toLowerCase() === guess.toLowerCase()) {
                button.classList.add('disabled');
                button.disabled = true;
            }
        });

        this.checkGuess(guess);
    }

    checkGuess(guess) {
        guess = guess.toLowerCase();
        if (this.currentWord.toLowerCase().includes(guess)) {
            this.guessedLetters.push(guess);
            this.displayWord();

            if (!document.getElementById('wordDisplay').textContent.includes('_')) {
                alert(`${this.currentPlayer.name} guessed the word!`);
                this.currentPlayer.updateScore(100 - this.mistakes * 20); 
                this.endRound();
            }
        } else {
            this.mistakes++;
            this.updateMistakes();
            if (this.mistakes >= this.getAllowedMistakes()) {
                alert(`Too many mistakes! The word was: ${this.currentWord}`);
                this.endRound();
            }
        }
    }

    updateMistakes() {
        document.getElementById('mistakesDisplay').textContent = this.mistakes;
    }

    getAllowedMistakes() {
        if (this.currentWord.length < 3) return 1;
        if (this.currentWord.length < 6) return 2;
        return 3;
    }

    endRound() {
        clearInterval(this.timerInterval);

        if (this.mistakes < this.getAllowedMistakes()) {
            this.currentPlayer.addCorrectWord(this.currentWord);
        } else {
            this.currentPlayer.addWrongWord(this.currentWord);
        }

        this.currentPlayerIndex++;

        if (this.currentPlayerIndex >= this.players.length) {
            this.currentPlayerIndex = 0;
            this.currentRound++;
        }

        this.nextRound();
    }

    startTimer(seconds) {
        this.timeLeft = seconds;
        document.getElementById('timer').style.display = 'block';
        document.getElementById('timeLeft').textContent = this.timeLeft;

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timeLeft').textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                alert(`Time's up! The word was: ${this.currentWord}`);
                this.endRound();
            }
        }, 1000);
    }

    endGame() {
        document.getElementById('game').style.display = 'none';
        document.getElementById('leaderboard').style.display = 'block';

        const leaderboard = document.getElementById('leaderboardList');
        leaderboard.innerHTML = ''; 

        this.players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = `${player.name}: ${player.score} points`;
            leaderboard.appendChild(li);

            const correctLi = document.createElement('li');
            correctLi.textContent = `${player.name} guessed correctly: ${player.correctWords.join(', ')}`;
            leaderboard.appendChild(correctLi);

            const wrongLi = document.createElement('li');
            wrongLi.textContent = `${player.name} guessed incorrectly: ${player.wrongWords.join(', ')}`;
            leaderboard.appendChild(wrongLi);
        });
    }

    restart_game() {
        this.currentRound = 1;
        this.players.forEach(player => {
            player.score = 0;
            player.correctWords = [];
            player.wrongWords = [];
        });
        this.start_game();
    }

    revealHintLetter() {
        let unrevealedLetters = this.currentWord
            .split('')
            .filter(letter => !this.guessedLetters.includes(letter.toLowerCase()));
        
        if (unrevealedLetters.length === 0) return null;

        const hintLetter = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
        return hintLetter.toLowerCase();
    }
}

const words = {
    Job: [
        { word: "CEO", hint: "Chief Executive Officer." },
        { word: "Nurse", hint: "Cares for patients in healthcare." },
        { word: "Chef", hint: "Prepares meals in a kitchen." },
        { word: "Pilot", hint: "Flies an aircraft." },
        { word: "Engineer", hint: "Designs buildings and structures." },
        { word: "Teacher", hint: "Imparts knowledge to students." },
        { word: "Doctor", hint: "Helps people stay healthy." },
        { word: "Lawyer", hint: "Practices law and defends clients." }
    ],
    Sport: [
        { word: "Run", hint: "To move quickly on foot." },
        { word: "Gym", hint: "A place for physical training." },
        { word: "Golf", hint: "A sport played on a green course." },
        { word: "Surf", hint: "To ride on waves." },
        { word: "Basketball", hint: "A sport played with a hoop." },
        { word: "Football", hint: "A game played with a round ball." },
        { word: "Tennis", hint: "Played on a court with rackets." },
        { word: "Swimming", hint: "Involves moving through water." }
    ],
    Country: [
        { word: "USA", hint: "Known as the United States." },
        { word: "Iran", hint: "Country in the Middle East." },
        { word: "Cuba", hint: "An island nation in the Caribbean." },
        { word: "Italy", hint: "Known for pizza and pasta." },
        { word: "France", hint: "Famous for the Eiffel Tower." },
        { word: "Germany", hint: "Known for its beer and sausages." },
        { word: "Canada", hint: "Has maple syrup and a lot of snow." },
        { word: "Brazil", hint: "Famous for the Amazon rainforest." }
    ],
    Animal: [
        { word: "Dog", hint: "Known as man's best friend." },
        { word: "Cat", hint: "A common household pet." },
        { word: "Bat", hint: "A flying mammal." },
        { word: "Owl", hint: "A nocturnal bird." },
        { word: "Elephant", hint: "The largest land animal." },
        { word: "Tiger", hint: "A big cat with stripes." },
        { word: "Lion", hint: "Known as the king of the jungle." },
        { word: "Giraffe", hint: "The tallest land animal." }
    ],
    Food: [
        { word: "Pie", hint: "A baked dish typically with a pastry crust." },
        { word: "Egg", hint: "Common breakfast item." },
        { word: "Beef", hint: "Meat from a cow." },
        { word: "Rice", hint: "A staple food in many cultures." },
        { word: "Pizza", hint: "Has a round shape and is topped with cheese." },
        { word: "Burger", hint: "Has circle-shaped bread." },
        { word: "Sushi", hint: "Japanese dish made with rice and fish." },
        { word: "Pasta", hint: "A staple food of Italy, usually served with sauce." }
    ]
};



let game;

document.getElementById('start_game').addEventListener('click', () => {
    const number_player = document.getElementById('number_player').value;
    const number_round = document.getElementById('number_round').value;
    const selectedDifficulty = document.getElementById('difficulty').value; 
    const players = [];
    for (let i = 1; i <= number_player; i++) {
        players.push(new Player(`Player ${i}`));
    }

    game = new WordGame(players, number_round, words);
    game.setDifficulty(selectedDifficulty); 
    game.start_game();
});

document.getElementById('restart_game').addEventListener('click', () => {
    game.restart_game();
});

document.getElementById('getLetter').addEventListener('click', () => {
    const hintLetter = game.revealHintLetter();
    if (hintLetter) {
        game.guessedLetters.push(hintLetter);
        game.displayWord();
    }
});

document.getElementById('getTime').addEventListener('click', () => {
    if (game.timeLeft > 0) {
        game.timeLeft += 10;
        document.getElementById('timeLeft').textContent = game.timeLeft;
    }
});
