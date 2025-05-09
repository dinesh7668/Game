const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');
let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let isRestarting = false;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

function createConfetti() {
    const colors = ['#e94560', '#0f3460', '#fff', '#ffd700', '#00ff00'];
    const confettiCount = 150;
    const board = document.getElementById('board');
    const boardRect = board.getBoundingClientRect();
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.position = 'absolute';
        confetti.style.left = (boardRect.left + boardRect.width/2) + 'px';
        confetti.style.top = boardRect.bottom + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(confetti);

        // Randomly decide if this particle will fall back down
        const willFall = Math.random() > 0.5;
        const peakHeight = boardRect.height + 50;
        const fallHeight = willFall ? Math.random() * 100 + 50 : 0; // Random fall distance

        const animation = confetti.animate([
            {
                transform: `translate(0, 0) rotate(0deg)`,
                opacity: 1
            },
            {
                // First keyframe: go up
                transform: `translate(${Math.random() * boardRect.width - boardRect.width/2}px, -${peakHeight}px) rotate(${Math.random() * 720}deg)`,
                opacity: 1
            },
            {
                // Second keyframe: fall down (only for particles that will fall)
                transform: `translate(${Math.random() * boardRect.width - boardRect.width/2}px, -${peakHeight - fallHeight}px) rotate(${Math.random() * 720}deg)`,
                opacity: 0
            }
        ], {
            duration: Math.random() * 2000 + 2000,
            easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
        });

        animation.onfinish = () => confetti.remove();
    }
}

function showWinMessage(player) {
    if (isRestarting) return;
    
    const message = document.createElement('div');
    message.className = 'win-message';
    message.textContent = `Player ${player} Wins!`;
    document.body.appendChild(message);

    // Force a reflow to ensure the initial state is applied
    void message.offsetWidth;

    // Show message with animation
    message.classList.add('show');

    // Remove message after 2 seconds
    setTimeout(() => {
        if (message && message.parentNode) {
            message.classList.remove('show');
            message.classList.add('hide');
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                if (message && message.parentNode) {
                    message.remove();
                }
            }, 400); // Match the CSS transition duration
        }
    }, 2000);
}

function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));

    if (gameState[index] !== '' || !gameActive) return;

    // Reset animation before adding new content
    cell.style.animation = 'none';
    void cell.offsetWidth; // Force reflow

    gameState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    
    // Re-enable animation
    cell.style.animation = '';

    if (checkWin()) {
        gameActive = false;
        status.textContent = `Player ${currentPlayer} wins!`;
        status.style.display = 'none';
        highlightWinningCells();
        createConfetti();
        showWinMessage(currentPlayer);
        return;
    }

    if (checkDraw()) {
        gameActive = false;
        status.textContent = "Game ended in a draw!";
        status.style.display = 'none';
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer}'s turn`;
}

function checkWin() {
    return winningConditions.some(condition => {
        return condition.every(index => {
            return gameState[index] === currentPlayer;
        });
    });
}

function checkDraw() {
    return gameState.every(cell => cell !== '');
}

function highlightWinningCells() {
    winningConditions.forEach((condition, index) => {
        if (condition.every(index => gameState[index] === currentPlayer)) {
            condition.forEach(cellIndex => {
                cells[cellIndex].classList.add(`winning-line-${index + 1}`);
            });
        }
    });
}

function restartGame() {
    isRestarting = true;
    
    // Clear any existing confetti
    document.querySelectorAll('.confetti').forEach(confetti => confetti.remove());
    
    // Remove any existing win message
    const existingMessage = document.querySelector('.win-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Reset game state
    currentPlayer = 'X';
    gameActive = true;
    gameState = ['', '', '', '', '', '', '', '', ''];
    status.textContent = `Player ${currentPlayer}'s turn`;
    status.style.display = 'block';
    
    // Reset all cells instantly
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning-line', 'winning-line-1', 'winning-line-2', 'winning-line-3', 'winning-line-4', 'winning-line-5', 'winning-line-6', 'winning-line-7', 'winning-line-8');
        // Reset any ongoing animations
        cell.style.animation = 'none';
        // Force a reflow
        void cell.offsetWidth;
        // Re-enable animations
        cell.style.animation = '';
    });

    // Reset the restarting flag after a short delay
    setTimeout(() => {
        isRestarting = false;
    }, 100);
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame); 
