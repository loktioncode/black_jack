# Blackjack Basic Strategy App

A clean, intuitive React Native Expo app that helps users learn and apply basic blackjack strategy.

## Features

- **Deck Size Selection**: Choose from 1, 2, 4, 6, or 8 decks (most casinos use 6-8 decks)
- **Clean Card Interface**: Easy-to-use card selection with visual feedback
- **Real-time Strategy**: Get instant basic strategy recommendations
- **Hand Analysis**: Shows hand value, soft/hard status, and pair detection
- **Color-coded Actions**: Different colors for Hit, Stand, Double, and Split recommendations
- **One-page Design**: Everything accessible on a single, scrollable interface
- **Fresh Start**: "New Hand" button resets everything for the next hand

## How to Use

1. **Start the App**: Select your preferred number of decks
2. **Add Your Cards**: Tap cards in the "Your Cards" section to build your hand
3. **Select Dealer Card**: Choose the dealer's up card
4. **Get Recommendation**: The app automatically shows the optimal basic strategy action
5. **New Hand**: Tap "New Hand" to start fresh after each recommendation

## Strategy Actions

- **H (Hit)**: Take another card
- **ST (Stand)**: Keep your current hand
- **D (Double)**: Double your bet and take exactly one more card
- **SP (Split)**: Separate a pair into two hands

## Installation & Running

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platforms
npm run android  # Android
npm run ios      # iOS
npm run web      # Web browser
```

## Technical Details

- Built with React Native and Expo
- Implements standard basic strategy rules
- Supports dealer hits soft 17 (most common casino rule)
- Handles pairs, soft hands, and hard hands correctly
- Responsive design works on phones and tablets

## Basic Strategy Logic

The app implements mathematically optimal basic strategy based on:
- Player hand value and composition (pairs, soft/hard)
- Dealer up card
- Number of decks in play
- Standard casino rules (dealer hits soft 17)

This gives you the best statistical chance of winning each hand according to decades of mathematical analysis.
