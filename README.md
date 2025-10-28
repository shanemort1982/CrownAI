# 👑 CrownAI - Draughts/Checkers Game

A modern, AI-powered English Draughts (Checkers) game with three difficulty levels, smooth animations, and complete game replay functionality. Built with pure HTML, CSS, and JavaScript.

![Status](https://img.shields.io/badge/status-complete-success)
![JavaScript](https://img.shields.io/badge/language-JavaScript-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![No Dependencies](https://img.shields.io/badge/dependencies-none-green)

## ✨ Features

### 🎮 Complete Game Implementation
- **Full English/American Draughts rules**
- 8×8 board with proper setup
- Regular pieces and Kings
- Multi-jump capture chains
- Automatic kinging
- Win detection (capture all or block)

### 🤖 Three AI Difficulty Levels
- **Easy**: Random moves, makes mistakes (~40% miss rate)
- **Medium**: Strategic positioning and piece protection
- **Hard**: Minimax algorithm with 3-5 move lookahead

### 🎬 Smooth Animations
- Sliding piece movements
- Jump capture animations
- Kinging transformation effect
- Valid move highlights
- Win celebration with confetti

### 📹 Game History & Replay
- Complete move notation (e.g., "e3-f4", "c3xe5")
- Interactive move list
- Automatic replay system
- Export game history as text

### 🎨 Modern Design
- Clean black & white theme
- Responsive layout (desktop, tablet, mobile)
- Purple gradient accents
- Professional UI/UX

## 🚀 Quick Start

### Play Locally (Simplest)
```bash
# Clone the repository
git clone https://github.com/shanemort1982/CrownAI.git
cd CrownAI

# Open in browser
open index.html
# or double-click index.html
```

### Run with Web Server (Recommended)
```bash
# Python 3
python3 -m http.server 8000

# Then open: http://localhost:8000/index.html
```

### Deploy to Server
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete Linux server deployment instructions.

## 📖 Documentation

- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Beginner-friendly guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - One-page reference card
- **[DRAUGHTS_README.md](DRAUGHTS_README.md)** - Complete documentation
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Server deployment guide

## 🎯 How to Play

1. **Select AI difficulty** (Easy/Medium/Hard)
2. **Choose who goes first** (Player or AI)
3. **Click "Start Game"**
4. **Click your piece** (white) to see valid moves
5. **Click destination** to move
6. **Capture all AI pieces** or block them to win!

## 🛠️ Technology Stack

- **HTML5** - Structure
- **CSS3** - Styling & animations
- **Vanilla JavaScript** - Game logic
- **No dependencies** - Pure browser-based

## 📁 Project Structure

```
CrownAI/
├── index.html              # Main game page
├── styles.css              # All styling
├── game.js                 # Core game logic
├── ai.js                   # AI implementation
├── history.js              # Move history & replay
├── ui.js                   # UI controller
├── README.md               # This file
├── GETTING_STARTED.md      # Beginner guide
├── QUICK_REFERENCE.md      # Quick reference
├── DRAUGHTS_README.md      # Full documentation
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
└── .gitignore              # Git ignore file
```

## 🌐 Browser Support

- ✅ Chrome/Edge (Chromium) - Recommended
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Any modern browser (2020+)

## 🎓 Learning Project

Perfect for learning:
- Game development
- AI algorithms (Minimax)
- JavaScript OOP
- CSS animations
- Responsive design
- Clean code practices

## 🤝 Contributing

This is a learning project. Feel free to:
- Fork and modify
- Add new features
- Create different themes
- Improve AI algorithms
- Add sound effects
- Submit pull requests

## 📜 License

MIT License - Feel free to use this project for learning, modification, and distribution.

## 🎉 Features to Add

Future enhancement ideas:
- [ ] Sound effects
- [ ] Undo button
- [ ] Different board themes
- [ ] Timer/clock
- [ ] Online multiplayer
- [ ] User accounts
- [ ] Statistics tracking
- [ ] Tournament mode

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information

## 🙏 Acknowledgments

Built as a learning project to demonstrate:
- Clean, modular code structure
- Modern JavaScript practices
- Game development concepts
- AI algorithm implementation

## 📞 Contact

For questions or suggestions, please open an issue on GitHub.

---

**Enjoy playing CrownAI! May the best strategist win!** 👑🎮

*Built with ❤️ and JavaScript*
