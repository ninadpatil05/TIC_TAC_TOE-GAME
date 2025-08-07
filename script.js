document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const statusMessage = document.getElementById('status-message');
    const subMessage = document.getElementById('sub-message');
    const restartButton = document.getElementById('restart-button');
    const playerVsPlayerBtn = document.getElementById('player-vs-player');
    const playerVsComputerBtn = document.getElementById('player-vs-computer');
    const difficultyEasyBtn = document.getElementById('difficulty-easy');
    const difficultyHardBtn = document.getElementById('difficulty-hard');
    const chooseXBtn = document.getElementById('choose-x');
    const chooseOBtn = document.getElementById('choose-o');
    
    // Back buttons
    const backFromDifficultyBtn = document.getElementById('back-from-difficulty');
    const backFromChoiceBtn = document.getElementById('back-from-choice');
    const backFromGameBtn = document.getElementById('back-from-game');

    // UI containers
    const gameModeSelection = document.getElementById('game-mode-selection');
    const difficultySelection = document.getElementById('difficulty-selection');
    const playerChoiceContainer = document.getElementById('player-choice-container');
    const gameContainer = document.getElementById('game-container');

    let currentPlayer = 'X';
    let playerSymbol = 'X';
    let computerSymbol = 'O';
    let gameBoard = ['', '', '', '', '', '', '', '', ''];
    let isGameActive = true;
    let isPlayerVsComputer = false;
    let difficultyLevel = 'easy';

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const messages = {
        win: (player) => `Player ${player} wins!`,
        youWin: 'You win!',
        youLose: 'You lose!',
        draw: 'It\'s a draw!',
        playerTurn: (player) => `Player ${player}'s turn`,
        yourTurn: 'Your turn',
        computerTurn: 'The computer\'s turn',
        winQuote: 'Awesome! You\'re a pro!',
        loseQuote: 'Don\'t give up! You\'ll get it next time!',
        drawQuote: 'A worthy opponent!',
        easy: 'You picked easy mode. The computer will make random moves.',
        hard: 'You picked hard mode. This computer is unbeatable!'
    };

    const resetState = () => {
        gameBoard = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        currentPlayer = 'X';
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('winning-cell');
        });
        subMessage.textContent = '';
    };

    const startGame = () => {
        gameModeSelection.classList.add('hidden');
        difficultySelection.classList.add('hidden');
        playerChoiceContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        resetState();
        
        if (isPlayerVsComputer) {
            statusMessage.textContent = (playerSymbol === 'X') ? messages.yourTurn : messages.computerTurn;
            if (playerSymbol === 'O') {
                currentPlayer = 'X';
                setTimeout(handleComputerMove, 500);
            }
        } else {
            statusMessage.textContent = messages.playerTurn('X');
        }
    };

    const handlePlayerMove = (cell, index) => {
        gameBoard[index] = currentPlayer;
        cell.textContent = currentPlayer;
        
        const winningCombination = checkWin(gameBoard, currentPlayer);

        if (winningCombination) {
            endGame(currentPlayer, winningCombination);
            return;
        }

        if (!gameBoard.includes('')) {
            endGame(null); // Draw
            return;
        }
        
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
        
        if (isPlayerVsComputer) {
            statusMessage.textContent = (currentPlayer === playerSymbol) ? messages.yourTurn : messages.computerTurn;
        } else {
            statusMessage.textContent = messages.playerTurn(currentPlayer);
        }
        
        // This is the key change: Call the computer move handler here.
        if (isGameActive && isPlayerVsComputer && currentPlayer !== playerSymbol) {
            setTimeout(handleComputerMove, 500);
        }
    };

    const handleCellClick = (e) => {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));

        if (gameBoard[clickedCellIndex] !== '' || !isGameActive) {
            return;
        }
        
        // Prevent player from clicking during computer's turn
        if (isPlayerVsComputer && currentPlayer !== playerSymbol) {
            return;
        }

        handlePlayerMove(clickedCell, clickedCellIndex);
    };

    const checkWin = (board, player) => {
        for (const condition of winningConditions) {
            if (board[condition[0]] === player && board[condition[1]] === player && board[condition[2]] === player) {
                return condition;
            }
        }
        return null;
    };

    const endGame = (winner, winningCombination = null) => {
        isGameActive = false;
        if (winner) {
            if (isPlayerVsComputer && winner === playerSymbol) {
                statusMessage.textContent = messages.youWin;
                subMessage.textContent = messages.winQuote;
            } else if (isPlayerVsComputer && winner === computerSymbol) {
                statusMessage.textContent = messages.youLose;
                subMessage.textContent = messages.loseQuote;
            } else {
                statusMessage.textContent = messages.win(winner);
                subMessage.textContent = messages.winQuote;
            }
            highlightWinningCells(winningCombination);
        } else {
            statusMessage.textContent = messages.draw;
            subMessage.textContent = messages.drawQuote;
        }
    };

    const highlightWinningCells = (winningCombination) => {
        winningCombination.forEach(index => {
            cells[index].classList.add('winning-cell');
        });
    };
    
    // --- Computer AI Logic ---
    const handleComputerMove = () => {
        if (!isGameActive || currentPlayer === playerSymbol) return;

        let moveIndex;
        if (difficultyLevel === 'easy') {
            moveIndex = getEasyMove();
        } else { // Hard difficulty using Minimax
            moveIndex = minimax(gameBoard, computerSymbol).index;
        }

        // Check if a valid move was found before making the move
        if (moveIndex !== undefined) {
             handlePlayerMove(cells[moveIndex], moveIndex);
        }
    };

    const getEasyMove = () => {
        const availableCells = gameBoard
            .map((cell, index) => cell === '' ? index : null)
            .filter(index => index !== null);
        
        if (availableCells.length > 0) {
            return availableCells[Math.floor(Math.random() * availableCells.length)];
        }
        return undefined; // Return undefined if no moves are available
    };
    
    // Minimax algorithm
    const minimax = (newBoard, player) => {
        const availSpots = newBoard.map((val, i) => (val === '') ? i : null).filter(v => v !== null);

        if (checkWin(newBoard, playerSymbol)) {
            return { score: -10 };
        } else if (checkWin(newBoard, computerSymbol)) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];
        for (let i = 0; i < availSpots.length; i++) {
            const move = {};
            move.index = availSpots[i];
            newBoard[availSpots[i]] = player;

            if (player === computerSymbol) {
                const result = minimax(newBoard, playerSymbol);
                move.score = result.score;
            } else {
                const result = minimax(newBoard, computerSymbol);
                move.score = result.score;
            }

            newBoard[availSpots[i]] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === computerSymbol) {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }
        return moves[bestMove];
    };
    
    // --- Navigation Functions ---
    const showGameMode = () => {
        gameContainer.classList.add('hidden');
        difficultySelection.classList.add('hidden');
        playerChoiceContainer.classList.add('hidden');
        gameModeSelection.classList.remove('hidden');
    };

    const showDifficultySelection = () => {
        playerChoiceContainer.classList.add('hidden');
        difficultySelection.classList.remove('hidden');
    };

    const showPlayerChoice = () => {
        difficultySelection.classList.add('hidden');
        playerChoiceContainer.classList.remove('hidden');
    };

    // --- Event Listeners ---
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    restartButton.addEventListener('click', startGame);

    // Game mode selection buttons
    playerVsPlayerBtn.addEventListener('click', () => {
        isPlayerVsComputer = false;
        gameModeSelection.classList.add('hidden');
        showPlayerChoice();
    });

    playerVsComputerBtn.addEventListener('click', () => {
        isPlayerVsComputer = true;
        gameModeSelection.classList.add('hidden');
        showDifficultySelection();
    });

    // Difficulty selection buttons
    difficultyEasyBtn.addEventListener('click', () => {
        difficultyLevel = 'easy';
        showPlayerChoice();
    });

    difficultyHardBtn.addEventListener('click', () => {
        difficultyLevel = 'hard';
        showPlayerChoice();
    });
    
    // Player symbol choice buttons
    chooseXBtn.addEventListener('click', () => {
        playerSymbol = 'X';
        computerSymbol = 'O';
        startGame();
    });

    chooseOBtn.addEventListener('click', () => {
        playerSymbol = 'O';
        computerSymbol = 'X';
        startGame();
    });
    
    // Back buttons
    backFromDifficultyBtn.addEventListener('click', showGameMode);
    backFromChoiceBtn.addEventListener('click', () => {
        isPlayerVsComputer ? showDifficultySelection() : showGameMode();
    });
    backFromGameBtn.addEventListener('click', showGameMode);
});