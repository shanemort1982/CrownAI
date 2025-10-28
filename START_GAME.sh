#!/bin/bash
# Simple script to start the Draughts/Checkers game

echo "🎮 Starting Draughts/Checkers Game..."
echo ""
echo "Opening game in your default browser..."
echo ""

# Try different methods to open the browser
if command -v xdg-open &> /dev/null; then
    xdg-open index.html
elif command -v open &> /dev/null; then
    open index.html
elif command -v start &> /dev/null; then
    start index.html
else
    echo "❌ Could not automatically open browser"
    echo ""
    echo "📁 Please manually open: $(pwd)/index.html"
    echo ""
    echo "Or start a web server:"
    echo "  python3 -m http.server 8000"
    echo "  Then open: http://localhost:8000/index.html"
fi

echo ""
echo "✅ Game ready!"
echo ""
echo "Controls:"
echo "  - Click a piece to select it"
echo "  - Click a highlighted square to move"
echo "  - Use the buttons to restart, replay, or export"
echo ""
echo "Have fun! 🎉"
