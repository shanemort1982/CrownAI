class GameUI {
    constructor() {
        this.game = new Game();
        this.ai = new AI(this.game, 'medium');
        this.history = new GameHistory(this.game);
        this.selectedSquare = null;
        this.animating = false;
        this.settings = {
            difficulty: 'medium',
            firstPlayer: 'player'
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Welcome screen
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.settings.difficulty = e.target.dataset.difficulty;
            });
        });

        document.querySelectorAll('.first-move-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.first-move-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.settings.firstPlayer = e.target.dataset.first;
            });
        });

        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Game controls
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.showWelcomeScreen();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showWelcomeScreen();
        });

        // Replay controls
        document.getElementById('replay-btn').addEventListener('click', () => {
            this.startReplay();
        });

        document.getElementById('replay-pause-btn').addEventListener('click', () => {
            this.pauseReplay();
        });

        document.getElementById('replay-stop-btn').addEventListener('click', () => {
            this.stopReplay();
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exportGame();
        });

        // Win screen
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.hideWinScreen();
            this.showWelcomeScreen();
        });
    }

    showWelcomeScreen() {
        document.getElementById('welcome-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        this.hideWinScreen();
    }

    startGame() {
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        this.game.reset();
        this.game.difficulty = this.settings.difficulty;
        this.ai.setDifficulty(this.settings.difficulty);
        this.history.clear();
        
        this.renderBoard();
        this.updateScore();
        this.updateMoveList();

        if (this.settings.firstPlayer === 'ai') {
            this.game.currentPlayer = 'ai';
            this.updateStatus('AI is thinking...');
            setTimeout(() => this.makeAIMove(), 500);
        } else {
            this.game.currentPlayer = 'player';
            this.updateStatus('Your turn');
        }
    }

    restartGame() {
        const firstPlayer = this.game.currentPlayer;
        this.game.reset();
        this.history.clear();
        this.game.currentPlayer = this.settings.firstPlayer;
        this.renderBoard();
        this.updateScore();
        this.updateMoveList();
        
        if (this.settings.firstPlayer === 'ai') {
            this.updateStatus('AI is thinking...');
            setTimeout(() => this.makeAIMove(), 500);
        } else {
            this.updateStatus('Your turn');
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('game-board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.game.getPiece(row, col);
                if (piece) {
                    const pieceElement = this.createPieceElement(piece, row, col);
                    square.appendChild(pieceElement);
                }

                square.addEventListener('click', (e) => this.handleSquareClick(row, col, e));
                boardElement.appendChild(square);
            }
        }
    }

    createPieceElement(piece, row, col) {
        const pieceElement = document.createElement('div');
        pieceElement.className = `piece ${piece.type} ${piece.isKing ? 'king' : ''}`;
        pieceElement.dataset.row = row;
        pieceElement.dataset.col = col;
        return pieceElement;
    }

    handleSquareClick(row, col, event) {
        if (this.animating || this.game.gameOver || this.game.currentPlayer !== 'player' || this.history.isReplaying) {
            return;
        }

        const piece = this.game.getPiece(row, col);
        const clickedSquare = event.currentTarget;

        // If a square with a valid move is clicked
        if (this.selectedSquare && clickedSquare.classList.contains('valid-move')) {
            const fromRow = parseInt(this.selectedSquare.dataset.row);
            const fromCol = parseInt(this.selectedSquare.dataset.col);
            this.makeMove(fromRow, fromCol, row, col);
            return;
        }

        // If clicking on player's own piece
        if (piece && piece.type === 'player') {
            // If must continue capture with specific piece
            if (this.game.mustContinueCapture && this.game.selectedPiece) {
                if (this.game.selectedPiece.row !== row || this.game.selectedPiece.col !== col) {
                    return; // Can only select the piece that must continue capturing
                }
            }

            // Check if clicking the same piece again (deselect)
            if (this.selectedSquare && 
                parseInt(this.selectedSquare.dataset.row) === row && 
                parseInt(this.selectedSquare.dataset.col) === col) {
                this.deselectPiece();
            } else {
                this.selectPiece(row, col);
            }
        } else {
            this.deselectPiece();
        }
    }

    showLoadingMessage(message = 'Calculating moves...') {
        const statusText = document.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = message;
            statusText.style.color = '#ff9800'; // Orange for "thinking"
        }
    }

    hideLoadingMessage() {
        this.updateStatus();
    }

    selectPiece(row, col) {
        this.deselectPiece();

        // Show loading indicator for complex calculations
        this.showLoadingMessage('Calculating moves...');

        // Use setTimeout to let UI update before heavy calculation
        setTimeout(() => {
            try {
                const validMoves = this.game.getValidMoves(row, col);
                
                if (validMoves.length === 0) {
                    this.hideLoadingMessage();
                    return;
                }

                const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                square.classList.add('selected');
                this.selectedSquare = square;

                // Highlight valid moves
                validMoves.forEach(move => {
                    const targetSquare = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
                    targetSquare.classList.add('valid-move');
                });

                this.hideLoadingMessage();
            } catch (error) {
                console.error('Error selecting piece:', error);
                this.hideLoadingMessage();
            }
        }, 10);
    }

    deselectPiece() {
        if (this.selectedSquare) {
            this.selectedSquare.classList.remove('selected');
            this.selectedSquare = null;
        }

        document.querySelectorAll('.valid-move').forEach(square => {
            square.classList.remove('valid-move');
        });
    }

    async makeMove(fromRow, fromCol, toRow, toCol) {
        if (this.animating) return;

        const boardStateBefore = this.game.getBoardState();
        const moveResult = this.game.movePiece(fromRow, fromCol, toRow, toCol);

        if (!moveResult) return;

        this.animating = true;
        this.deselectPiece();

        // Animate the move
        await this.animatePieceMove(fromRow, fromCol, toRow, toCol, moveResult.isCapture);

        // Remove captured piece if any
        if (moveResult.captured) {
            this.removePiece(moveResult.captured.row, moveResult.captured.col);
        }

        // Handle kinging animation
        if (moveResult.isKing) {
            await this.animateKinging(toRow, toCol);
        }

        this.updateScore();

        // Record move in history
        this.history.recordMove(moveResult, boardStateBefore);
        this.updateMoveList();

        // Check if can continue capture
        if (moveResult.canContinueCapture) {
            this.selectPiece(toRow, toCol);
            this.animating = false;
            return;
        }

        // Switch player
        this.game.switchPlayer();
        
        // Check win condition
        if (this.game.gameOver) {
            const winner = this.game.checkWinCondition();
            this.animating = false;
            setTimeout(() => this.showWinScreen(winner), 500);
            return;
        }

        this.animating = false;

        // AI turn
        if (this.game.currentPlayer === 'ai') {
            this.updateStatus('AI is thinking...');
            setTimeout(() => this.makeAIMove(), 300);
        } else {
            this.updateStatus('Your turn');
        }
    }

    async makeAIMove() {
        if (this.game.gameOver || this.game.currentPlayer !== 'ai') return;

        const move = await this.ai.makeMove();
        
        if (!move) {
            console.error('AI could not find a valid move');
            return;
        }

        await this.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
    }

    async animatePieceMove(fromRow, fromCol, toRow, toCol, isJump) {
        const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
        const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
        const pieceElement = fromSquare.querySelector('.piece');

        if (!pieceElement) return;

        const fromRect = fromSquare.getBoundingClientRect();
        const toRect = toSquare.getBoundingClientRect();

        const deltaX = toRect.left - fromRect.left;
        const deltaY = toRect.top - fromRect.top;

        pieceElement.classList.add(isJump ? 'jumping' : 'moving');
        pieceElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        await this.delay(isJump ? 500 : 400);

        // Update DOM
        toSquare.appendChild(pieceElement);
        pieceElement.style.transform = '';
        pieceElement.classList.remove('jumping', 'moving');
        pieceElement.dataset.row = toRow;
        pieceElement.dataset.col = toCol;
    }

    removePiece(row, col) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const piece = square.querySelector('.piece');
        if (piece) {
            piece.style.opacity = '0';
            piece.style.transform = 'scale(0.5)';
            setTimeout(() => piece.remove(), 300);
        }
    }

    async animateKinging(row, col) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const piece = square.querySelector('.piece');
        
        if (piece) {
            piece.classList.add('being-kinged');
            await this.delay(800);
            piece.classList.remove('being-kinged');
            piece.classList.add('king');
        }
    }

    updateScore() {
        document.getElementById('player-score').textContent = this.game.playerScore;
        document.getElementById('ai-score').textContent = this.game.aiScore;
    }

    updateStatus(message) {
        document.getElementById('game-status').textContent = message;
    }

    updateMoveList() {
        const moveList = document.getElementById('move-list');
        moveList.innerHTML = '';

        const moves = this.history.getAllMoves();
        moves.forEach((move, index) => {
            const moveItem = document.createElement('div');
            moveItem.className = `move-item ${move.player}-move`;
            moveItem.innerHTML = `
                <span class="move-number">${move.number}.</span>
                <span class="move-notation">${move.notation}</span>
                ${move.isKing ? ' 👑' : ''}
            `;
            
            moveItem.addEventListener('click', () => {
                if (!this.animating && !this.history.isReplaying) {
                    this.history.jumpToMove(index);
                    this.renderBoard();
                    this.updateScore();
                }
            });

            moveList.appendChild(moveItem);
        });

        // Scroll to bottom
        moveList.scrollTop = moveList.scrollHeight;
    }

    startReplay() {
        if (this.history.moves.length === 0) return;

        document.getElementById('replay-btn').classList.add('hidden');
        document.getElementById('replay-player').classList.remove('hidden');

        this.history.startReplay((stateIndex) => {
            this.renderBoard();
            this.updateScore();
            
            // Highlight current move in list
            document.querySelectorAll('.move-item').forEach((item, index) => {
                item.classList.remove('active');
                if (index === stateIndex - 1) {
                    item.classList.add('active');
                }
            });
        });
    }

    pauseReplay() {
        this.history.pauseReplay();
    }

    stopReplay() {
        this.history.stopReplay();
        this.renderBoard();
        this.updateScore();
        
        document.getElementById('replay-btn').classList.remove('hidden');
        document.getElementById('replay-player').classList.add('hidden');
        
        document.querySelectorAll('.move-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    exportGame() {
        this.history.downloadAsFile('text');
    }

    showWinScreen(winner) {
        const overlay = document.getElementById('win-overlay');
        const message = document.getElementById('win-message');
        const stats = document.getElementById('win-stats');

        message.textContent = winner === 'player' ? 'You Win! 🎉' : 'AI Wins! 🤖';
        
        stats.innerHTML = `
            <p>Total Moves: ${this.history.moves.length}</p>
            <p>Pieces Captured - You: ${this.game.aiScore} | AI: ${this.game.playerScore}</p>
        `;

        overlay.classList.remove('hidden');
        this.animateConfetti();
    }

    hideWinScreen() {
        document.getElementById('win-overlay').classList.add('hidden');
    }

    animateConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const confetti = [];
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

        for (let i = 0; i < 100; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                r: Math.random() * 6 + 4,
                d: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 10
            });
        }

        let animationId;
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            confetti.forEach((p, index) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                p.y += p.d;
                p.x += Math.sin(p.y / 50) * 2;

                if (p.y > canvas.height) {
                    confetti[index] = {
                        x: Math.random() * canvas.width,
                        y: -10,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: p.tilt
                    };
                }
            });

            animationId = requestAnimationFrame(draw);
        }

        draw();

        setTimeout(() => {
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 5000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const gameUI = new GameUI();
});
