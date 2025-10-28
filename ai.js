class AI {
    constructor(game, difficulty = 'medium') {
        this.game = game;
        this.difficulty = difficulty;
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    async makeMove() {
        await this.delay(800);

        let move;
        switch (this.difficulty) {
            case 'easy':
                move = this.getEasyMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getHardMove();
                break;
            default:
                move = this.getMediumMove();
        }

        return move;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getAllAIPieces() {
        return this.game.getAllPieces('ai');
    }

    getAllPossibleMoves() {
        const pieces = this.getAllAIPieces();
        const allMoves = [];

        for (const { row, col } of pieces) {
            const moves = this.game.getValidMoves(row, col);
            for (const move of moves) {
                allMoves.push({
                    from: { row, col },
                    to: { row: move.row, col: move.col },
                    isCapture: move.isCapture,
                    capturedRow: move.capturedRow,
                    capturedCol: move.capturedCol
                });
            }
        }

        return allMoves;
    }

    getEasyMove() {
        const allMoves = this.getAllPossibleMoves();
        if (allMoves.length === 0) return null;

        // 40% chance to miss a capture
        const captures = allMoves.filter(m => m.isCapture);
        const shouldMissCapture = Math.random() < 0.4;
        
        if (captures.length > 0 && !shouldMissCapture) {
            return this.randomChoice(captures);
        }

        // Otherwise make a random move
        return this.randomChoice(allMoves);
    }

    getMediumMove() {
        const allMoves = this.getAllPossibleMoves();
        if (allMoves.length === 0) return null;

        // Prioritize captures
        const captures = allMoves.filter(m => m.isCapture);
        if (captures.length > 0) {
            return this.randomChoice(captures);
        }

        // Score each move
        const scoredMoves = allMoves.map(move => ({
            move,
            score: this.evaluateMoveStrategic(move)
        }));

        // Sort by score and pick from top moves
        scoredMoves.sort((a, b) => b.score - a.score);
        
        // Pick from top 30% of moves to add some randomness
        const topMoves = scoredMoves.slice(0, Math.max(1, Math.floor(scoredMoves.length * 0.3)));
        return this.randomChoice(topMoves).move;
    }

    evaluateMoveStrategic(move) {
        let score = 0;
        const piece = this.game.getPiece(move.from.row, move.from.col);

        // Prefer moves toward kinging
        if (!piece.isKing) {
            score += (7 - move.to.row) * 2;
        }

        // Prefer center positions
        const centerDistance = Math.abs(move.to.row - 3.5) + Math.abs(move.to.col - 3.5);
        score += (7 - centerDistance);

        // Avoid edges (easier to trap)
        if (move.to.col === 0 || move.to.col === 7) {
            score -= 3;
        }

        // Check if move would put piece in danger
        if (this.wouldBeInDanger(move.to.row, move.to.col, 'ai')) {
            score -= 10;
        }

        // Prefer protecting other pieces
        if (this.helpsProtectPiece(move)) {
            score += 5;
        }

        return score;
    }

    getHardMove() {
        const allMoves = this.getAllPossibleMoves();
        if (allMoves.length === 0) return null;

        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of allMoves) {
            const score = this.minimax(move, 3, -Infinity, Infinity, true);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    minimax(move, depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluateBoard(move);
        }

        // Simulate the move
        const originalState = this.game.getBoardState();
        this.game.movePiece(move.from.row, move.from.col, move.to.row, move.to.col);

        if (this.game.gameOver) {
            const winner = this.game.checkWinCondition();
            this.game.setBoardState(originalState);
            return winner === 'ai' ? 10000 : -10000;
        }

        let score;
        if (isMaximizing) {
            score = -Infinity;
            const aiMoves = this.getAllPossibleMoves();
            for (const aiMove of aiMoves) {
                score = Math.max(score, this.minimax(aiMove, depth - 1, alpha, beta, false));
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        } else {
            score = Infinity;
            const playerMoves = this.getAllPlayerMoves();
            for (const playerMove of playerMoves) {
                score = Math.min(score, this.minimax(playerMove, depth - 1, alpha, beta, true));
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
        }

        this.game.setBoardState(originalState);
        return score;
    }

    getAllPlayerMoves() {
        const pieces = this.game.getAllPieces('player');
        const allMoves = [];

        for (const { row, col } of pieces) {
            const moves = this.game.getValidMoves(row, col);
            for (const move of moves) {
                allMoves.push({
                    from: { row, col },
                    to: { row: move.row, col: move.col },
                    isCapture: move.isCapture,
                    capturedRow: move.capturedRow,
                    capturedCol: move.capturedCol
                });
            }
        }

        return allMoves;
    }

    evaluateBoard(lastMove = null) {
        let score = 0;

        // Count pieces and evaluate positions
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.game.getPiece(row, col);
                if (!piece) continue;

                let pieceValue = piece.isKing ? 30 : 10;
                let positionBonus = 0;

                // Position bonuses
                if (!piece.isKing) {
                    if (piece.type === 'ai') {
                        positionBonus = (7 - row) * 2; // Closer to kinging
                    } else {
                        positionBonus = row * 2;
                    }
                }

                // Center control bonus
                const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
                positionBonus += (7 - centerDistance) * 0.5;

                // Edge penalty
                if (col === 0 || col === 7) {
                    positionBonus -= 2;
                }

                const totalValue = pieceValue + positionBonus;
                score += piece.type === 'ai' ? totalValue : -totalValue;
            }
        }

        // Bonus for captures
        if (lastMove && lastMove.isCapture) {
            score += 15;
        }

        // Mobility evaluation
        const aiMoves = this.getAllPossibleMoves();
        const playerMoves = this.getAllPlayerMoves();
        score += (aiMoves.length - playerMoves.length) * 0.5;

        return score;
    }

    wouldBeInDanger(row, col, pieceType) {
        const opponentType = pieceType === 'ai' ? 'player' : 'ai';
        
        // Check if any opponent piece can capture at this position
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.game.getPiece(r, c);
                if (piece && piece.type === opponentType) {
                    // Temporarily place a piece at the target position
                    const originalPiece = this.game.getPiece(row, col);
                    this.game.setPiece(row, col, { type: pieceType, isKing: false });
                    
                    const moves = this.game.getValidMoves(r, c);
                    const canCapture = moves.some(m => 
                        m.isCapture && m.capturedRow === row && m.capturedCol === col
                    );
                    
                    this.game.setPiece(row, col, originalPiece);
                    
                    if (canCapture) return true;
                }
            }
        }
        return false;
    }

    helpsProtectPiece(move) {
        const allies = this.getAllAIPieces();
        for (const { row, col } of allies) {
            if (row === move.from.row && col === move.from.col) continue;
            
            const distance = Math.abs(move.to.row - row) + Math.abs(move.to.col - col);
            if (distance <= 2) return true;
        }
        return false;
    }

    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AI;
}
