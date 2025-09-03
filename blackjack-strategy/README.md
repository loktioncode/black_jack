# Blackjack Strategy Helper

A comprehensive blackjack strategy learning system featuring both a mobile app and a command-line script to help you master basic strategy and improve your blackjack game.

## 📱 Mobile App (React Native)

A clean, intuitive React Native Expo app that provides real-time blackjack strategy recommendations.

### App Features

- **Deck Size Selection**: Choose from 1, 2, 4, 6, or 8 decks (most casinos use 6-8 decks)
- **Interactive Card Interface**: Tap to select your cards and dealer's up card
- **Real-time Strategy**: Instant basic strategy recommendations as you build your hand
- **Hand Analysis**: Shows hand value, soft/hard status, and pair detection
- **Color-coded Actions**: Visual feedback with different colors for each action type
- **Smart UI Flow**: Progressive interface that reveals sections as you add cards
- **Action Guidance**: Detailed explanations for each recommended action
- **Card Addition**: Continue playing a hand by adding cards after hits or doubles

### How the Mobile App Works

1. **Deck Selection**: Start by choosing the number of decks (affects strategy slightly)
2. **Build Your Hand**: Tap cards to add them to your hand (minimum 2 cards required)
3. **Dealer Card**: Once you have 2+ cards, select the dealer's visible card
4. **Get Strategy**: App instantly calculates and displays the mathematically optimal action
5. **Interactive Recommendations**: 
   - For **Hit**: Add the card you drew to see the next recommendation
   - For **Double**: Add the one card you receive to see final hand value
   - For **Split**: Use "New Hand" to evaluate each split hand separately
   - For **Stand**: Hand is complete
6. **New Hand**: Reset everything to start a fresh hand

### App Installation & Running

```bash
# Navigate to the app directory
cd blackjack-strategy

# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run android  # Android device/emulator
npm run ios      # iOS device/simulator  
npm run web      # Web browser
```

### App Technical Details

- Built with **React Native** and **Expo** for cross-platform compatibility
- Implements complete basic strategy tables for pairs, soft hands, and hard hands
- Supports standard casino rules (dealer hits soft 17)
- Clean, modern UI with dark theme
- Bottom sheet modal for recommendations with detailed explanations
- Responsive design optimized for phones and tablets

## 🖥️ Python Script

A comprehensive command-line blackjack strategy tool with two modes: advice mode and interactive play mode.

### Script Features

- **Game Advice Mode**: Quick strategy lookup for any hand situation
- **Interactive Play Mode**: Full blackjack simulation with bankroll management
- **Strategy Validation**: Test different scenarios and see outcomes
- **Bankroll Tracking**: Simulate real casino play with win/loss statistics
- **Hand Simulation**: See what happens after taking recommended actions
- **Bust Analysis**: Analyze hands that have already busted
- **Educational Notes**: Insurance warnings and strategy explanations

### How the Python Script Works

#### Game Advice Mode
- **Quick Input**: Enter your cards (e.g., "K,6") and dealer card
- **Instant Strategy**: Get immediate basic strategy recommendation
- **Action Execution**: Script simulates taking the recommended action
- **Continued Play**: Add cards after hits to see next recommendations
- **Bust Analysis**: Enter "bust K,6,10" to analyze losing hands
- **Statistics**: Track your hypothetical wins/losses over time

#### Interactive Play Mode  
- **Full Simulation**: Complete blackjack game with proper dealing
- **Bankroll System**: Start with R1000, place bets, track winnings
- **Multiple Hands**: Handle splits and multiple hands per round
- **Dealer Play**: Automatic dealer play following casino rules
- **Strategy Guidance**: See recommendations but choose your own actions
- **Game Statistics**: Track hands played, win rate, and bankroll changes

### Script Installation & Running

```bash
# Ensure you have Python 3.6+ installed
python --version

# Run the script directly (no dependencies required)
python black_jack.py

# Or make it executable and run
chmod +x black_jack.py
./black_jack.py
```

### Script Usage Examples

```bash
# Quick strategy lookup
Your cards: A,6
Dealer shows: 5
# Output: A,6 vs 5 → ACTION: D (Double)

# Bust analysis  
bust K,6,8
Dealer shows: 10
# Analyzes the busted hand for learning

# View statistics
stats
# Shows win/loss record and percentages
```

## 🎯 Strategy Actions Explained

- **H (Hit)**: Take another card - used when your hand total is low
- **ST (Stand)**: Keep your current hand - used when risk of busting is high
- **D (Double)**: Double your bet and receive exactly one more card - used on strong starting hands
- **SP (Split)**: Separate a pair into two hands, each with its own bet - used with specific pairs

## 🧮 Basic Strategy Logic

Both tools implement mathematically optimal basic strategy based on:

- **Player Hand Composition**: Pairs, soft hands (with Ace as 11), hard hands
- **Dealer Up Card**: Visible dealer card (2-10, J, Q, K, A)
- **Number of Decks**: Affects strategy slightly (fewer decks = better for player)
- **Standard Casino Rules**: Dealer hits soft 17, doubling after split allowed

The strategy provides the **best statistical chance** of winning each hand according to computer simulations and mathematical analysis developed over decades.

## 🎲 When to Use Each Tool

### Use the Mobile App When:
- Learning basic strategy for the first time
- Quick strategy lookup during actual casino play
- Practicing hand recognition and decision-making
- Teaching others blackjack strategy

### Use the Python Script When:
- Deep practice with realistic game simulation
- Testing your strategy knowledge with bankroll pressure
- Analyzing complex scenarios and hand progressions
- Studying long-term results and win rates

## 🎰 Casino Tips

- **Insurance**: Never take insurance - it's a side bet with ~7% house edge
- **Deck Penetration**: In real casinos, prefer games with deeper deck penetration
- **Table Rules**: Look for tables where dealer stands on soft 17
- **Bankroll Management**: Never bet more than you can afford to lose
- **Practice**: Use these tools to practice until strategy becomes automatic

## 🔧 System Requirements

### Mobile App
- **Android**: Android 5.0+ (API level 21+)
- **iOS**: iOS 10.0+
- **Web**: Modern browser with JavaScript enabled
- **Development**: Node.js 14+ and Expo CLI

### Python Script  
- **Python**: 3.6 or higher
- **Operating System**: Windows, macOS, or Linux
- **Dependencies**: None (uses only Python standard library)
