# 🎮 Getting Started with Draughts/Checkers

## Quick Start (3 Steps!)

### Step 1: Open the Game
**Option A - Simplest (Double-Click)**
- Just double-click `index.html` in this folder
- Game opens in your default browser

**Option B - Use Startup Script**
- **Windows**: Double-click `START_GAME.bat`
- **Mac/Linux**: Run `bash START_GAME.sh` in terminal

**Option C - Web Server (Recommended)**
```bash
# Open terminal in this folder, then run:
python3 -m http.server 8000

# Open browser and go to:
# http://localhost:8000/index.html
```

### Step 2: Choose Settings
1. **Select AI Difficulty**
   - Easy: Great for beginners
   - Medium: Balanced challenge
   - Hard: Very challenging!

2. **Choose Who Goes First**
   - Player (White): You start
   - AI (Black): AI starts

3. Click **"Start Game"**

### Step 3: Play!
- Click your piece (white) to select it
- Valid moves appear as glowing dots
- Click a valid move to move your piece
- Try to capture all AI pieces or block them!

---

## 📖 Game Rules

### The Basics
- You play as **white pieces** (bottom)
- AI plays as **black pieces** (top)
- Pieces move diagonally on dark squares only

### Movement
- **Regular Pieces**: Move forward diagonally one square
- **Kings** (with crown 👑): Move forward OR backward diagonally

### Capturing
- Jump over opponent's piece to capture it
- Can chain multiple jumps in one turn
- Captures are NOT forced (you choose)

### Winning
- **Capture all** opponent pieces, OR
- **Block** opponent so they have no legal moves

### Becoming a King
- When your piece reaches the opposite end (row 8)
- King gets a gold crown and can move in any diagonal direction

---

## 🎯 Tips for Beginners

### Basic Strategy
1. **Protect your pieces** - Don't leave them exposed
2. **Control the center** - Center pieces are more valuable
3. **King quickly** - Try to get pieces to the opposite end
4. **Plan ahead** - Think about AI's next move

### Against Easy AI
- Good for learning basic moves
- AI will make mistakes, giving you chances

### Against Medium AI
- AI will capture when it can
- Watch for traps and protect your pieces

### Against Hard AI
- Very challenging! Plans several moves ahead
- You need to think strategically

---

## 🎮 Game Controls

### During Game
- **Click Piece** → Shows valid moves
- **Click Destination** → Makes the move
- **New Game** → Return to settings, start fresh
- **Restart** → Reset current game
- **Settings** → Back to welcome screen

### Move History
- **Click any move** → Jump to that point in game
- **Replay Game** → Watch game replay automatically
- **Pause** (⏸) → Pause replay
- **Stop** (⏹) → Stop replay and return to current position
- **Export Game** → Download game history as text file

---

## 🎨 What You'll See

### Animations
- ✨ Pieces slide smoothly when moving
- 🦘 Pieces jump with arc effect when capturing
- 👑 Flip animation when becoming a king
- 🎯 Pulsing dots show valid moves
- 🎉 Confetti celebration when you win!

### Visual Feedback
- Selected piece has blue highlight
- Valid moves show as glowing purple dots
- Move history color-coded (blue=you, black=AI)
- Score updates in real-time
- Status shows whose turn it is

---

## 📱 Works Everywhere!

### Desktop
- Full 640×640px board
- Side panels with controls and history
- Smooth animations and effects

### Tablet
- Panels stack vertically
- 480×480px board
- All features work perfectly

### Mobile
- Optimized for small screens
- 320×320px board minimum
- Touch-friendly controls

---

## 🏆 Challenge Yourself!

### Beginner Goals
- [ ] Beat Easy AI
- [ ] Get your first King
- [ ] Capture 5 pieces in one game
- [ ] Win without losing any pieces

### Intermediate Goals
- [ ] Beat Medium AI
- [ ] Win with chain capture (multi-jump)
- [ ] Get 3 Kings in one game
- [ ] Beat AI in under 30 moves

### Advanced Goals
- [ ] Beat Hard AI (very difficult!)
- [ ] Win with only 1 piece remaining
- [ ] Capture 10+ pieces in one game
- [ ] Master the opening strategies

---

## 🔧 Troubleshooting

### Game Won't Load?
- Make sure all files are in the same folder
- Try opening in a different browser (Chrome recommended)
- Check browser console (F12) for errors

### Can't Move Pieces?
- Make sure it's your turn (white pieces)
- Click the piece first to see valid moves
- Only highlighted squares are valid destinations

### AI Not Moving?
- AI takes a moment to "think" (normal)
- Hard AI may take 2-5 seconds
- Wait for "Your turn" status

### Animations Laggy?
- Close other browser tabs
- Try a different browser
- Reduce browser zoom (Ctrl+0)

---

## 📚 Learn More

### Files in This Folder
- `index.html` - Main game page
- `styles.css` - Visual styling
- `game.js` - Game rules and logic
- `ai.js` - AI brain (3 difficulty levels)
- `history.js` - Move recording and replay
- `ui.js` - User interface controller

### Documentation
- `DRAUGHTS_README.md` - Complete game documentation
- `DRAUGHTS_PROJECT_SUMMARY.md` - Technical details and project info
- `GETTING_STARTED.md` - This file!

---

## 🎓 For Young Developers

### Want to Modify the Game?

**Change Colors** (styles.css):
```css
.piece.player {
    background: radial-gradient(circle at 30% 30%, #your-color, #darker-color);
}
```

**Make AI Easier/Harder** (ai.js):
```javascript
// Easy AI - change miss rate (line ~45)
const shouldMissCapture = Math.random() < 0.4; // Change 0.4 to 0.6 for more mistakes

// Hard AI - change how deep it thinks (line ~112)
const score = this.minimax(move, 3, ...); // Change 3 to 5 for harder
```

**Change Animation Speed** (styles.css):
```css
.piece.moving {
    transition: all 0.4s ...; /* Change 0.4s to 0.2s for faster */
}
```

**Add Sound Effects** (ui.js):
```javascript
// Add this in makeMove function
const moveSound = new Audio('move.mp3');
moveSound.play();
```

---

## 🎉 Have Fun!

Remember:
- It's okay to lose - learn from each game
- Try different strategies
- Watch the replay to see what worked
- Practice makes perfect!

**Ready to play? Open index.html and start your first game!** 🎮

---

## 💬 Questions?

Check the documentation files for more details:
- Game rules → DRAUGHTS_README.md
- Technical info → DRAUGHTS_PROJECT_SUMMARY.md
- Basic rules → This file (you're here!)

**Enjoy the game!** 👑🎉
