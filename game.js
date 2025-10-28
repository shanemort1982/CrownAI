class Game {
    constructor() {
        this.board = [];
        this.currentPlayer = 'player';
        this.selectedPiece = null;
        this.validMoves = [];
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameOver = false;
        this.difficulty = 'medium';
        this.moveCount = 0;
        this.capturedInTurn = false;
        this.mustContinueCapture = false;
        
        // Performance optimization settings
        this.MAX_JUMP_DEPTH = 20; // Maximum consecutive jumps
        this.MOVE_CALC_TIMEOUT = 2000; // 2 seconds timeout
        this.moveCache = new Map(); // Cache for move calculations
        this.calculationStartTime = null;
        
        this.initializeBoard();
    }

    initializeBoard() {
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place player pieces (white) on rows 0-2
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    this.board[row][col] = { type: 'player', isKing: false };
                }
            }
        }
        
        // Place AI pieces (black) on rows 5-7
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    this.board[row][col] = { type: 'ai', isKing: false };
                }
            }
        }
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getPiece(row, col) {
        if (!this.isValidPosition(row, col)) return null;
        return this.board[row][col];
    }

    setPiece(row, col, piece) {
        if (this.isValidPosition(row, col)) {
            this.board[row][col] = piece;
        }
    }

    checkTimeout() {
        if (this.calculationStartTime && 
            Date.now() - this.calculationStartTime > this.MOVE_CALC_TIMEOUT) {
            console.warn('Move calculation timeout reached');
            throw new Error('Move calculation timeout');
        }
    }

    clearMoveCache() {
        this.moveCache.clear();
    }

    getBoardHash() {
        // Create a simple hash of the board state for caching
        return JSON.stringify(this.board);
    }

    getValidMoves(row, col, depth = 0) {
        // Check for timeout
        this.checkTimeout();
        
        // Check depth limit to prevent infinite recursion
        if (depth >= this.MAX_JUMP_DEPTH) {
            console.warn(`Max jump depth ${this.MAX_JUMP_DEPTH} reached at position (${row}, ${col})`);
            return [];
        }

        const piece = this.getPiece(row, col);
        if (!piece) return [];

        // Check cache for this position (only if not in a capture chain)
        if (!this.mustContinueCapture && depth === 0) {
            const cacheKey = `${row},${col},${this.getBoardHash()}`;
            if (this.moveCache.has(cacheKey)) {
                return this.moveCache.get(cacheKey);
            }
        }

        const moves = [];
        const captures = [];

        // Determine directions based on piece type
        let directions;
        if (piece.isKing) {
            directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        } else if (piece.type === 'player') {
            directions = [[1, -1], [1, 1]]; // Player moves down
        } else {
            directions = [[-1, -1], [-1, 1]]; // AI moves up
        }

        // Check each direction
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            // Simple move (only if not in capture chain)
            if (!this.mustContinueCapture && depth === 0) {
                if (this.isValidPosition(newRow, newCol) && !this.getPiece(newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol, isCapture: false });
                }
            }

            // Capture move
            const captureRow = newRow;
            const captureCol = newCol;
            const landRow = row + dRow * 2;
            const landCol = col + dCol * 2;

            if (this.isValidPosition(landRow, landCol)) {
                const capturedPiece = this.getPiece(captureRow, captureCol);
                const landSquare = this.getPiece(landRow, landCol);

                if (capturedPiece && capturedPiece.type !== piece.type && !landSquare) {
                    captures.push({
                        row: landRow,
                        col: landCol,
                        isCapture: true,
                        capturedRow: captureRow,
                        capturedCol: captureCol
                    });
                }
            }
        }

        // Determine which moves to return
        let result;
        if (this.mustContinueCapture) {
            result = captures;
        } else {
            result = captures.length > 0 ? captures : moves;
        }

        // Cache result (only for depth 0 and not in capture chain)
        if (!this.mustContinueCapture && depth === 0) {
            const cacheKey = `${row},${col},${this.getBoardHash()}`;
            this.moveCache.set(cacheKey, result);
        }

        return result;
    }

    canPieceCapture(row, col) {
        const moves = this.getValidMoves(row, col);
        return moves.some(move => move.isCapture);
    }

    hasAnyCaptures(playerType) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.type === playerType) {
                    if (this.canPieceCapture(row, col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        // Start timeout timer
        this.calculationStartTime = Date.now();
        
        try {
            const piece = this.getPiece(fromRow, fromCol);
            if (!piece) {
                this.calculationStartTime = null;
                return null;
            }

            const validMoves = this.getValidMoves(fromRow, fromCol);
            const move = validMoves.find(m => m.row === toRow && m.col === toCol);
            
            if (!move) {
                this.calculationStartTime = null;
                return null;
            }

            const moveResult = {
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol },
                isCapture: move.isCapture,
                captured: null,
                isKing: false,
                canContinueCapture: false
            };

            // Move the piece
            this.setPiece(toRow, toCol, piece);
            this.setPiece(fromRow, fromCol, null);

            // Clear move cache since board state changed
            this.clearMoveCache();

            // Handle capture
            if (move.isCapture) {
                const capturedPiece = this.getPiece(move.capturedRow, move.capturedCol);
                moveResult.captured = {
                    row: move.capturedRow,
                    col: move.capturedCol,
                    piece: capturedPiece
                };
                this.setPiece(move.capturedRow, move.capturedCol, null);

                // Update score
                if (piece.type === 'player') {
                    this.aiScore++;
                } else {
                    this.playerScore++;
                }

                // Check for additional captures
                this.mustContinueCapture = false;
                const additionalCaptures = this.getValidMoves(toRow, toCol).filter(m => m.isCapture);
                if (additionalCaptures.length > 0) {
                    moveResult.canContinueCapture = true;
                    this.mustContinueCapture = true;
                    this.selectedPiece = { row: toRow, col: toCol };
                }
            }

            // Check for kinging
            if (!piece.isKing) {
                if ((piece.type === 'player' && toRow === 7) || (piece.type === 'ai' && toRow === 0)) {
                    piece.isKing = true;
                    moveResult.isKing = true;
                }
            }

            // Check win condition
            this.checkWinCondition();

            this.calculationStartTime = null;
            return moveResult;
        } catch (error) {
            console.error('Error during movePiece:', error);
            this.calculationStartTime = null;
            return null;
        }
    }

    getAllPieces(playerType) {
        const pieces = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.type === playerType) {
                    pieces.push({ row, col, piece });
                }
            }
        }
        return pieces;
    }

    hasAnyValidMoves(playerType) {
        // Start timeout timer
        this.calculationStartTime = Date.now();
        
        try {
            const pieces = this.getAllPieces(playerType);
            for (const { row, col } of pieces) {
                // Check timeout periodically
                this.checkTimeout();
                
                // Early termination - return true as soon as we find one valid move
                if (this.getValidMoves(row, col).length > 0) {
                    this.calculationStartTime = null;
                    return true;
                }
            }
            this.calculationStartTime = null;
            return false;
        } catch (error) {
            console.error('Error checking valid moves:', error);
            this.calculationStartTime = null;
            // Return true to be safe - don't end game on error
            return true;
        }
    }

    checkWinCondition() {
        const playerPieces = this.getAllPieces('player');
        const aiPieces = this.getAllPieces('ai');

        // Check if either player has no pieces
        if (playerPieces.length === 0) {
            this.gameOver = true;
            return 'ai';
        }
        if (aiPieces.length === 0) {
            this.gameOver = true;
            return 'player';
        }

        // Check if either player has no valid moves
        if (!this.hasAnyValidMoves('player')) {
            this.gameOver = true;
            return 'ai';
        }
        if (!this.hasAnyValidMoves('ai')) {
            this.gameOver = true;
            return 'player';
        }

        return null;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'player' ? 'ai' : 'player';
        this.mustContinueCapture = false;
        this.capturedInTurn = false;
    }

    getBoardState() {
        return {
            board: JSON.parse(JSON.stringify(this.board)),
            currentPlayer: this.currentPlayer,
            playerScore: this.playerScore,
            aiScore: this.aiScore,
            gameOver: this.gameOver,
            moveCount: this.moveCount
        };
    }

    setBoardState(state) {
        this.board = JSON.parse(JSON.stringify(state.board));
        this.currentPlayer = state.currentPlayer;
        this.playerScore = state.playerScore;
        this.aiScore = state.aiScore;
        this.gameOver = state.gameOver;
        this.moveCount = state.moveCount;
    }

    reset() {
        this.board = [];
        this.currentPlayer = 'player';
        this.selectedPiece = null;
        this.validMoves = [];
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameOver = false;
        this.moveCount = 0;
        this.capturedInTurn = false;
        this.mustContinueCapture = false;
        this.initializeBoard();
    }

    positionToNotation(row, col) {
        const columns = 'abcdefgh';
        return columns[col] + (row + 1);
    }

    getMoveNotation(from, to, isCapture) {
        const fromNotation = this.positionToNotation(from.row, from.col);
        const toNotation = this.positionToNotation(to.row, to.col);
        return isCapture ? `${fromNotation}x${toNotation}` : `${fromNotation}-${toNotation}`;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game;
}
