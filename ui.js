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

        // AI timeout protection
        this.aiMoveTimeout = null;
        this.AI_MAX_THINKING_TIME = 5000; // 5 seconds max
        this.aiThinkingStartTime = null;

        // Multi-jump chain tracking for debugging
        this.chainAttemptCount = 0;
        this.totalChains = 0;

        this.initializeEventListeners();
        this.initializeEmergencyButton();
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

        document.getElementById('force-turn-btn').addEventListener('click', () => {
            console.log('[EMERGENCY BUTTON] User clicked force turn');
            this.forceSwitchToPlayerTurn();
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

    initializeEmergencyButton() {
        // Emergency button shows after 8 seconds of AI thinking
        setInterval(() => {
            const statusText = document.querySelector('.status-text');
            const forceBtn = document.getElementById('force-turn-btn');
            
            if (!statusText || !forceBtn) return;
            
            const status = statusText.textContent;
            const isAIThinking = status.includes('AI') && status.includes('thinking');
            
            if (isAIThinking) {
                if (!this.aiThinkingStartTime) {
                    this.aiThinkingStartTime = Date.now();
                }
                
                const thinkingDuration = Date.now() - this.aiThinkingStartTime;
                if (thinkingDuration > 8000) {
                    forceBtn.style.display = 'block';
                    console.warn(`AI has been thinking for ${Math.round(thinkingDuration/1000)}s - emergency button shown`);
                }
            } else {
                this.aiThinkingStartTime = null;
                forceBtn.style.display = 'none';
            }
        }, 1000);
    }

    validateTurnState() {
        const currentTurn = this.game.currentPlayer;
        console.log(`[TURN VALIDATION] Current player: ${currentTurn}`);
        
        if (currentTurn !== 'player' && currentTurn !== 'ai') {
            console.error(`[TURN VALIDATION] Invalid turn state: ${currentTurn}`);
            this.game.currentPlayer = 'player';
            console.log('[TURN VALIDATION] Reset to player turn');
        }
        
        return currentTurn;
    }

    forceSwitchToPlayerTurn() {
        console.log('[EMERGENCY] Force switching to player turn');
        
        // Clear any AI timeouts
        if (this.aiMoveTimeout) {
            clearTimeout(this.aiMoveTimeout);
            this.aiMoveTimeout = null;
        }
        
        // Force player turn
        this.game.currentPlayer = 'player';
        this.resetChainState();
        this.animating = false;
        this.aiThinkingStartTime = null;
        
        // Update UI
        this.updateStatus('Your turn');
        this.deselectPiece();
        
        // Hide emergency button
        const forceBtn = document.getElementById('force-turn-btn');
        if (forceBtn) {
            forceBtn.style.display = 'none';
        }
        
        console.log('[EMERGENCY] Player turn activated');
    }

    resetChainState() {
        console.log('=== RESETTING CHAIN STATE ===');
        console.log('[RESET] Previous state:', {
            mustContinueCapture: this.game.mustContinueCapture,
            selectedPiece: this.game.selectedPiece,
            chainAttemptCount: this.chainAttemptCount
        });
        
        this.game.mustContinueCapture = false;
        this.game.selectedPiece = null;
        
        if (this.chainAttemptCount > 0) {
            console.log(`[RESET] Chain completed with ${this.chainAttemptCount} jumps`);
            this.totalChains++;
            console.log(`[RESET] Total chains this game: ${this.totalChains}`);
        }
        
        this.chainAttemptCount = 0;
        
        console.log('[RESET] State reset complete');
    }

    showWelcomeScreen() {
        document.getElementById('welcome-screen').classList.remove('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        this.hideWinScreen();
    }

    startGame() {
        console.log('[GAME] Starting new game');
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        this.game.reset();
        this.game.difficulty = this.settings.difficulty;
        this.ai.setDifficulty(this.settings.difficulty);
        this.history.clear();
        
        // Reset chain tracking
        this.chainAttemptCount = 0;
        this.totalChains = 0;
        this.resetChainState();
        
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
        
        console.log('[GAME] New game started');
    }

    restartGame() {
        console.log('[GAME] Restarting game');
        const firstPlayer = this.game.currentPlayer;
        this.game.reset();
        this.history.clear();
        this.game.currentPlayer = this.settings.firstPlayer;
        
        // Reset chain tracking
        this.chainAttemptCount = 0;
        this.totalChains = 0;
        this.resetChainState();
        
        this.renderBoard();
        this.updateScore();
        this.updateMoveList();
        
        if (this.settings.firstPlayer === 'ai') {
            this.updateStatus('AI is thinking...');
            setTimeout(() => this.makeAIMove(), 500);
        } else {
            this.updateStatus('Your turn');
        }
        
        console.log('[GAME] Game restarted');
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
        console.log(`[CLICK] Square clicked: (${row},${col})`);
        console.log(`[CLICK] Animating: ${this.animating}, GameOver: ${this.game.gameOver}, CurrentPlayer: ${this.game.currentPlayer}`);
        console.log(`[CLICK] MustContinueCapture: ${this.game.mustContinueCapture}`);
        
        // Allow clicks during multi-jump chains even if animating just finished
        const isChainContinuation = this.game.mustContinueCapture && this.selectedSquare;
        
        if (this.game.gameOver || this.game.currentPlayer !== 'player' || this.history.isReplaying) {
            console.log('[CLICK] Blocked by: gameOver, wrong player, or replaying');
            return;
        }
        
        // During animation, only block if NOT in chain continuation
        if (this.animating && !isChainContinuation) {
            console.log('[CLICK] Blocked by animation (not in chain)');
            return;
        }

        const piece = this.game.getPiece(row, col);
        const clickedSquare = event.currentTarget;

        console.log(`[CLICK] Piece at clicked square: ${piece ? piece.type : 'none'}`);
        console.log(`[CLICK] Selected square: ${this.selectedSquare ? 'yes' : 'no'}`);
        console.log(`[CLICK] Is valid move square: ${clickedSquare.classList.contains('valid-move')}`);

        // PRIORITY 1: If a square with a valid move is clicked (including chain continuation)
        if (this.selectedSquare && clickedSquare.classList.contains('valid-move')) {
            const fromRow = parseInt(this.selectedSquare.dataset.row);
            const fromCol = parseInt(this.selectedSquare.dataset.col);
            console.log(`[CLICK] Valid move clicked: from (${fromRow},${fromCol}) to (${row},${col})`);
            
            if (isChainContinuation) {
                console.log('[CLICK] This is a CHAIN CONTINUATION move');
            }
            
            this.makeMove(fromRow, fromCol, row, col);
            return;
        }

        // PRIORITY 2: If clicking on player's own piece
        if (piece && piece.type === 'player') {
            console.log('[CLICK] Clicked on player piece');
            
            // If must continue capture with specific piece
            if (this.game.mustContinueCapture && this.game.selectedPiece) {
                console.log(`[CLICK] Must continue capture with piece at (${this.game.selectedPiece.row},${this.game.selectedPiece.col})`);
                if (this.game.selectedPiece.row !== row || this.game.selectedPiece.col !== col) {
                    console.log('[CLICK] Cannot select different piece during chain');
                    return; // Can only select the piece that must continue capturing
                }
            }

            // Check if clicking the same piece again (deselect)
            if (this.selectedSquare && 
                parseInt(this.selectedSquare.dataset.row) === row && 
                parseInt(this.selectedSquare.dataset.col) === col) {
                console.log('[CLICK] Deselecting same piece');
                
                // Don't allow deselection during mandatory chain
                if (this.game.mustContinueCapture) {
                    console.log('[CLICK] Cannot deselect during mandatory chain');
                    return;
                }
                
                this.deselectPiece();
            } else {
                console.log('[CLICK] Selecting piece');
                this.selectPiece(row, col);
            }
        } else {
            console.log('[CLICK] Clicked empty or opponent square - deselecting');
            
            // Don't allow deselection during mandatory chain
            if (this.game.mustContinueCapture) {
                console.log('[CLICK] Cannot deselect during mandatory chain');
                return;
            }
            
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

    selectPiece(row, col, immediate = false) {
        this.deselectPiece();

        // For multi-jump continuation, select immediately without timeout
        if (immediate || this.game.mustContinueCapture) {
            try {
                const validMoves = this.game.getValidMoves(row, col);
                
                if (validMoves.length === 0) {
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

                // Show message for multi-jump
                if (this.game.mustContinueCapture) {
                    const statusText = document.querySelector('.status-text');
                    if (statusText) {
                        statusText.textContent = 'Continue jumping! Click highlighted square.';
                        statusText.style.color = '#ff9800';
                    }
                }
            } catch (error) {
                console.error('Error selecting piece:', error);
            }
            return;
        }

        // Normal selection with loading indicator
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
        console.log(`[MOVE] makeMove called: from (${fromRow},${fromCol}) to (${toRow},${toCol})`);
        console.log(`[MOVE] Currently animating: ${this.animating}`);
        console.log(`[MOVE] MustContinueCapture: ${this.game.mustContinueCapture}`);
        
        // Allow move during chain even if animating flag is set
        const isChainContinuation = this.game.mustContinueCapture;
        
        if (this.animating && !isChainContinuation) {
            console.log('[MOVE] Blocked - already animating (not in chain)');
            return;
        }

        const boardStateBefore = this.game.getBoardState();
        const moveResult = this.game.movePiece(fromRow, fromCol, toRow, toCol);

        console.log('[MOVE] Move result:', moveResult);

        if (!moveResult) {
            console.log('[MOVE] Move rejected by game logic');
            return;
        }

        this.animating = true;
        
        // Only deselect if NOT continuing a chain
        if (!moveResult.canContinueCapture) {
            this.deselectPiece();
        }

        // Animate the move
        console.log('[MOVE] Starting animation...');
        await this.animatePieceMove(fromRow, fromCol, toRow, toCol, moveResult.isCapture);

        // Remove captured piece if any
        if (moveResult.captured) {
            console.log(`[MOVE] Removing captured piece at (${moveResult.captured.row},${moveResult.captured.col})`);
            this.removePiece(moveResult.captured.row, moveResult.captured.col);
        }

        // Handle kinging animation
        if (moveResult.isKing) {
            console.log('[MOVE] Piece kinged!');
            await this.animateKinging(toRow, toCol);
        }

        this.updateScore();

        // Record move in history
        this.history.recordMove(moveResult, boardStateBefore);
        this.updateMoveList();

        // Check if can continue capture
        if (moveResult.canContinueCapture) {
            this.chainAttemptCount++;
            console.log('[MOVE] *** CAN CONTINUE CAPTURE - CHAIN MODE ***');
            console.log(`[MOVE] Chain jump #${this.chainAttemptCount}`);
            console.log(`[MOVE] Selecting piece at new position (${toRow},${toCol})`);
            console.log(`[MOVE] Game state: mustContinueCapture=${this.game.mustContinueCapture}, selectedPiece=${JSON.stringify(this.game.selectedPiece)}`);
            
            this.selectPiece(toRow, toCol, true); // Use immediate selection
            this.animating = false; // Allow next move in chain
            
            console.log('[MOVE] Chain continuation ready - waiting for player click');
            console.log(`[MOVE] Total chains so far this game: ${this.totalChains}`);
            return;
        }

        console.log('[MOVE] Move complete - ending turn');
        console.log(`[MOVE] Chain had ${this.chainAttemptCount} jumps`);

        // Reset chain state before switching turn
        this.resetChainState();

        // Switch player (this also resets mustContinueCapture in game.js)
        this.game.switchPlayer();
        
        // Check win condition
        if (this.game.gameOver) {
            console.log('[MOVE] Game over detected');
            const winner = this.game.checkWinCondition();
            this.animating = false;
            setTimeout(() => this.showWinScreen(winner), 500);
            return;
        }

        this.animating = false;

        // AI turn
        if (this.game.currentPlayer === 'ai') {
            console.log('[MOVE] Switching to AI turn');
            this.updateStatus('AI is thinking...');
            setTimeout(() => this.makeAIMove(), 300);
        } else {
            console.log('[MOVE] Player turn continues');
            this.updateStatus('Your turn');
        }
    }

    async makeAIMove() {
        console.log('=== AI MOVE START ===');
        console.log('[AI] Current player:', this.game.currentPlayer);
        console.log('[AI] Game over:', this.game.gameOver);
        console.log('[AI] Difficulty:', this.game.difficulty);
        
        // Validate state before starting
        if (this.game.gameOver) {
            console.log('[AI] Game is over, aborting AI move');
            return;
        }
        
        if (this.game.currentPlayer !== 'ai') {
            console.log('[AI] Not AI turn, aborting');
            return;
        }

        // Set up timeout failsafe
        console.log(`[AI] Setting ${this.AI_MAX_THINKING_TIME/1000}s timeout`);
        this.aiMoveTimeout = setTimeout(() => {
            console.error('[AI TIMEOUT] AI exceeded time limit - forcing player turn');
            alert('AI timed out. Switching to your turn.');
            this.forceSwitchToPlayerTurn();
        }, this.AI_MAX_THINKING_TIME);

        try {
            console.log('[AI] Calculating move...');
            const move = await this.ai.makeMove();
            
            console.log('[AI] Move calculated:', move);
            
            if (!move) {
                console.error('[AI] No valid move found');
                // AI has no moves - this means player wins
                console.log('[AI] Switching to player turn (no moves available)');
                this.game.switchPlayer();
                this.validateTurnState();
                this.updateStatus();
                return;
            }

            console.log(`[AI] Executing move from (${move.from.row},${move.from.col}) to (${move.to.row},${move.to.col})`);
            await this.makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
            
            console.log('[AI] Move executed successfully');
            
        } catch (error) {
            console.error('[AI ERROR] Exception during AI move:', error);
            console.error('[AI ERROR] Stack:', error.stack);
            alert(`AI encountered an error: ${error.message}\nSwitching to your turn.`);
            
            // Force switch to player on error
            this.forceSwitchToPlayerTurn();
            
        } finally {
            // CRITICAL: Always clear timeout
            if (this.aiMoveTimeout) {
                clearTimeout(this.aiMoveTimeout);
                this.aiMoveTimeout = null;
                console.log('[AI] Timeout cleared');
            }
            
            console.log('=== AI MOVE END ===');
            console.log('[AI] Final player:', this.game.currentPlayer);
        }
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
