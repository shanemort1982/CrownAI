# 🎮 Draughts/Checkers Game

A modern, browser-based English Draughts (Checkers) game with AI opponents at three difficulty levels. Built with pure HTML, CSS, and JavaScript - no dependencies required!

## 🌟 Features

### Complete Game Rules ✅
- **Regular Pieces**: Move diagonally forward one square
- **Kings**: Move diagonally forward OR backward
- **Captures**: Jump over opponent pieces with multi-jump chains
- **Kinging**: Automatic promotion when reaching opposite end
- **Win Conditions**: Capture all pieces or block all moves

### Three AI Difficulty Levels 🤖
- **Easy**: Random moves, occasionally misses captures (~40% of the time)
- **Medium**: Strategic play with position evaluation and piece protection
- **Hard**: Advanced minimax algorithm with 3-5 move lookahead

### Smooth Animations 🎬
- Sliding piece movements (300-500ms)
- Jump/capture arc animations
- Kinging transformation with flip effect
- Win celebration with confetti
- Pulsing valid move highlights

### Game History & Replay 📹
- Complete move list with standard notation (e.g., "e3-f4", "c3xe5")
- Click any move to jump to that board state
- Automatic replay with pause/resume controls
- Export game as text file

### Modern UI 🎨
- Clean black & white theme
- Responsive design (desktop, tablet, mobile)
- Real-time score tracking
- Status updates and feedback

## 🚀 How to Play

### Quick Start
1. Open `index.html` in any modern web browser
2. Choose your AI difficulty (Easy/Medium/Hard)
3. Select who goes first (Player or AI)
4. Click "Start Game"

### Making Moves
1. **Click a piece** - Your pieces are white/light colored
2. **See valid moves** - Glowing dots show where you can move
3. **Click destination** - Piece smoothly moves to new position
4. **Chain captures** - Continue jumping if multiple captures available

### Game Controls
- **New Game**: Start fresh with new settings
- **Restart**: Reset current game from beginning
- **Settings**: Return to setup screen
- **Replay Game**: Watch the entire game replay automatically
- **Export Game**: Download move history as text file

## 📁 File Structure

```
/workspace/
├── index.html      # Main HTML structure
├── styles.css      # All styling and animations
├── game.js         # Core game logic and rules
├── ai.js           # AI implementation (3 difficulty levels)
├── history.js      # Game history and replay system
└── ui.js           # UI controller and event handlers
```

## 🎯 Game Rules Reference

### Movement Rules
- **Regular Pieces**: Move one square diagonally forward to empty dark squares
- **Kings**: Move one square diagonally in ANY direction (forward/backward)
- **Valid Moves**: Can only move to empty dark squares

### Capture Rules
- Jump diagonally over opponent piece to empty square beyond
- Multiple captures can be chained in same turn
- Captures are NOT forced - you can make any legal move

### Special Rules
- **Kinging**: Piece reaching opposite end becomes King (gets crown)
- **Win by Capture**: Capture all opponent pieces
- **Win by Blocking**: Leave opponent with no legal moves

## 💻 Technical Details

- **Technology**: Pure HTML5, CSS3, Vanilla JavaScript
- **No Dependencies**: No external libraries required
- **Browser-Based**: Runs entirely in browser, no server needed
- **Responsive**: Works on all screen sizes (320px - 1920px+)

### Code Structure
- **Object-Oriented**: Clean class-based architecture
- **Modular**: Separate concerns (game logic, AI, UI, history)
- **Modern JS**: ES6+ with classes, async/await, promises
- **Well-Commented**: Easy to read and understand

## 🎓 Learning Project

This project was designed as a learning project for a 13-year-old developer with:
- ✅ Clean, readable code
- ✅ Modular structure
- ✅ Complete feature implementation
- ✅ Modern JavaScript practices
- ✅ No complex build tools

## 🌐 Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge (Chromium) - Recommended
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Brave

## 🎮 AI Strategy Details

### Easy AI
- Makes random legal moves
- 40% chance to miss available captures
- Ignores strategic positioning
- Good for beginners

### Medium AI
- Prioritizes captures
- Evaluates piece safety
- Moves toward kinging opportunities
- Prefers center control
- Avoids obvious traps

### Hard AI
- Minimax algorithm with alpha-beta pruning
- 3-5 move lookahead
- Advanced position evaluation:
  - Piece count advantage
  - King value (3x regular piece)
  - Board control
  - Mobility
  - Potential capture chains
- Near-optimal play

## 🎨 Design Choices

### Color Scheme
- Dark squares: Pure black (#000)
- Light squares: Pure white (#fff)
- Player pieces: White/light with gradient
- AI pieces: Black/dark with gradient
- Accents: Purple gradient (#667eea → #764ba2)

### Animations
- **Move Duration**: 400ms cubic-bezier easing
- **Jump Duration**: 500ms with bounce effect
- **Kinging**: 800ms flip animation with gold crown
- **Highlights**: 1.5s pulsing animation
- **Confetti**: 5s particle animation on win

## 🔧 Customization

### Change Board Size
In `styles.css`, modify `.game-board`:
```css
.game-board {
    width: 640px;  /* Change this */
    height: 640px; /* And this */
}
```

### Change Colors
In `styles.css`, search for color values:
- Background: `background: linear-gradient(...)`
- Pieces: `.piece.player` and `.piece.ai`
- Accents: `#667eea`, `#764ba2`

### Adjust AI Difficulty
In `ai.js`, modify parameters:
- Easy: Change miss probability (line ~45)
- Medium: Adjust evaluation weights (line ~85)
- Hard: Change lookahead depth (line ~112)

## 🐛 Troubleshooting

### Game Won't Load
- Check browser console (F12) for errors
- Ensure all files are in same directory
- Try a different browser

### Pieces Won't Move
- Make sure it's your turn (white pieces)
- Click piece first, then valid move destination
- Check if game is in replay mode

### AI Takes Too Long
- Hard AI needs time to think (2-5 seconds normal)
- Consider using Medium or Easy difficulty
- Check browser isn't frozen (background tab)

## 🚀 Future Enhancements

Potential features for future versions:
- [ ] Online multiplayer (player vs player)
- [ ] User accounts and statistics
- [ ] Different board themes
- [ ] Sound effects
- [ ] Undo button
- [ ] Timer/clock for timed games
- [ ] Opening book for AI
- [ ] Endgame tablebase
- [ ] Tournament mode

## 📝 Move Notation

The game uses standard checkers notation:
- **Simple Move**: `e3-f4` (from e3 to f4)
- **Capture**: `c3xe5` (from c3 captures at e5)
- **Multi-Jump**: `c3xe5xg3` (chain capture)
- **Kinging**: Move notation followed by crown emoji 👑

Board coordinates:
```
  a b c d e f g h
8 □ ■ □ ■ □ ■ □ ■  8
7 ■ □ ■ □ ■ □ ■ □  7
6 □ ■ □ ■ □ ■ □ ■  6
5 ■ □ ■ □ ■ □ ■ □  5
4 □ ■ □ ■ □ ■ □ ■  4
3 ■ □ ■ □ ■ □ ■ □  3
2 □ ■ □ ■ □ ■ □ ■  2
1 ■ □ ■ □ ■ □ ■ □  1
  a b c d e f g h
```

## 🤝 Contributing

This is a learning project! Feel free to:
- Use it to learn web development
- Modify it for your own projects
- Add new features
- Share with friends

## 📜 License

This is a learning project - free to use, modify, and learn from!

## 🎉 Enjoy Playing!

Have fun playing Draughts/Checkers! Try to beat the Hard AI - it's quite challenging! 🏆

---

**Made with ❤️ as a learning project**
