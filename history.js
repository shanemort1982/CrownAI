class GameHistory {
    constructor(game) {
        this.game = game;
        this.moves = [];
        this.boardStates = [];
        this.currentStateIndex = -1;
        this.isReplaying = false;
        this.replayInterval = null;
    }

    recordMove(moveData, boardStateBefore) {
        const move = {
            number: this.moves.length + 1,
            player: this.game.currentPlayer,
            from: moveData.from,
            to: moveData.to,
            isCapture: moveData.isCapture,
            captured: moveData.captured,
            isKing: moveData.isKing,
            notation: this.game.getMoveNotation(moveData.from, moveData.to, moveData.isCapture),
            timestamp: Date.now()
        };

        this.moves.push(move);
        
        // Store board state before move
        if (this.boardStates.length === this.moves.length - 1) {
            this.boardStates.push(boardStateBefore);
        }
        
        // Store board state after move
        this.boardStates.push(this.game.getBoardState());
        this.currentStateIndex = this.boardStates.length - 1;

        return move;
    }

    getMove(index) {
        return this.moves[index];
    }

    getAllMoves() {
        return this.moves;
    }

    clear() {
        this.moves = [];
        this.boardStates = [];
        this.currentStateIndex = -1;
        this.stopReplay();
    }

    jumpToState(index) {
        if (index < 0 || index >= this.boardStates.length) return false;
        
        this.currentStateIndex = index;
        const state = this.boardStates[index];
        this.game.setBoardState(state);
        return true;
    }

    jumpToMove(moveIndex) {
        const stateIndex = moveIndex + 1;
        return this.jumpToState(stateIndex);
    }

    getCurrentMove() {
        if (this.currentStateIndex <= 0) return null;
        return this.moves[this.currentStateIndex - 1];
    }

    startReplay(onMoveCallback) {
        if (this.moves.length === 0) return false;
        
        this.isReplaying = true;
        this.currentStateIndex = 0;
        this.jumpToState(0);
        
        if (onMoveCallback) {
            onMoveCallback(0);
        }

        let moveIndex = 0;
        this.replayInterval = setInterval(() => {
            moveIndex++;
            if (moveIndex >= this.boardStates.length) {
                this.stopReplay();
                return;
            }

            this.jumpToState(moveIndex);
            if (onMoveCallback) {
                onMoveCallback(moveIndex);
            }
        }, 1500);

        return true;
    }

    pauseReplay() {
        if (this.replayInterval) {
            clearInterval(this.replayInterval);
            this.replayInterval = null;
        }
    }

    stopReplay() {
        this.pauseReplay();
        this.isReplaying = false;
        if (this.boardStates.length > 0) {
            this.jumpToState(this.boardStates.length - 1);
        }
    }

    exportAsText() {
        if (this.moves.length === 0) {
            return "No moves recorded.";
        }

        let text = "DRAUGHTS/CHECKERS GAME\n";
        text += "======================\n\n";
        
        const finalState = this.boardStates[this.boardStates.length - 1];
        if (finalState.gameOver) {
            const winner = this.game.checkWinCondition();
            text += `Winner: ${winner === 'player' ? 'Player (White)' : 'AI (Black)'}\n`;
        }
        
        text += `Total Moves: ${this.moves.length}\n`;
        text += `Final Score - Player: ${finalState.playerScore} | AI: ${finalState.aiScore}\n\n`;
        
        text += "MOVE HISTORY\n";
        text += "------------\n";

        for (const move of this.moves) {
            const playerLabel = move.player === 'player' ? 'Player' : 'AI';
            const kingText = move.isKing ? ' (KING!)' : '';
            text += `${move.number}. ${playerLabel}: ${move.notation}${kingText}\n`;
        }

        return text;
    }

    exportAsJSON() {
        const finalState = this.boardStates[this.boardStates.length - 1];
        return {
            game: {
                winner: finalState.gameOver ? this.game.checkWinCondition() : null,
                totalMoves: this.moves.length,
                finalScore: {
                    player: finalState.playerScore,
                    ai: finalState.aiScore
                }
            },
            moves: this.moves.map(move => ({
                number: move.number,
                player: move.player,
                notation: move.notation,
                from: move.from,
                to: move.to,
                isCapture: move.isCapture,
                isKing: move.isKing
            }))
        };
    }

    downloadAsFile(format = 'text') {
        const content = format === 'json' ? 
            JSON.stringify(this.exportAsJSON(), null, 2) : 
            this.exportAsText();
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `checkers-game-${Date.now()}.${format === 'json' ? 'json' : 'txt'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameHistory;
}
