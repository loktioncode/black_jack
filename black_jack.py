import sys
import random
import os
from enum import Enum
from typing import List, Dict, Tuple, Optional

class Action(Enum):
    HIT = "H"
    STAND = "ST"
    DOUBLE = "D"
    SPLIT = "SP"

class Rules:
    def __init__(self, dealer_hits_soft_17=False, double_after_split=True, decks=6):
        self.dealer_hits_soft_17 = dealer_hits_soft_17
        self.double_after_split = double_after_split
        self.decks = decks

class Hand:
    def __init__(self, cards: List[str], bet: int = 0):
        self.cards = cards
        self.bet = bet
        self.value, self.is_soft = self._calculate_value()
        self.is_pair = len(cards) == 2 and cards[0] == cards[1]
        self.is_blackjack = len(cards) == 2 and self.value == 21
        self.is_busted = self.value > 21
        self.stood = False

    def _calculate_value(self) -> Tuple[int, bool]:
        value = 0
        aces = 0

        for card in self.cards:
            if card in ['J', 'Q', 'K']:
                value += 10
            elif card == 'A':
                aces += 1
                value += 1  # Start with aces as 1
            else:
                value += int(card)

        # Try to make one ace count as 11 if it doesn't bust
        is_soft = False
        if aces > 0 and value + 10 <= 21:
            value += 10  # Convert one ace from 1 to 11
            # Hand is soft if:
            # 1. We have exactly one ace, OR
            # 2. We have multiple aces but the total is still low (like A,A = 12)
            is_soft = (aces == 1) or (aces > 1 and value <= 12)

        return value, is_soft

    def add_card(self, card: str):
        self.cards.append(card)
        self.value, self.is_soft = self._calculate_value()
        self.is_pair = False  # No longer a pair after adding a card
        self.is_blackjack = False  # No longer blackjack after adding a card
        self.is_busted = self.value > 21

    def stand(self):
        self.stood = True

    def double_bet(self):
        self.bet *= 2

    def __str__(self):
        hand_type = ""
        if self.is_blackjack:
            hand_type = "Blackjack!"
        elif self.is_soft:
            hand_type = "Soft"
        elif self.is_pair:
            hand_type = "Pair"

        status = ""
        if self.is_busted:
            status = "BUSTED"
        elif self.stood:
            status = "STAND"

        return f"{', '.join(self.cards)} (Value: {self.value}{' ' + hand_type if hand_type else ''}{' ' + status if status else ''})"

class BasicStrategy:
    def __init__(self, rules: Rules):
        self.rules = rules

    def get_recommendation(self, player_hand: Hand, dealer_card: str) -> Action:
        dealer_value = self._card_value(dealer_card)

        # Check for pairs
        if player_hand.is_pair:
            return self._pair_strategy(player_hand.cards[0], dealer_value)

        # Check for soft hands
        if player_hand.is_soft:
            return self._soft_strategy(player_hand.value, dealer_value)

        # Hard hands
        return self._hard_strategy(player_hand.value, dealer_value)

    def _card_value(self, card: str) -> int:
        if card in ['J', 'Q', 'K']:
            return 10
        elif card == 'A':
            return 11  # For dealer strategy, we treat Ace as 11
        else:
            return int(card)

    def _pair_strategy(self, pair_card: str, dealer_value: int) -> Action:
        if pair_card == 'A':
            return Action.SPLIT
        elif pair_card == '8':
            return Action.SPLIT
        elif pair_card == '9':
            if dealer_value in [7, 10, 11]:  # vs 7, 10, or Ace
                return Action.STAND
            else:
                return Action.SPLIT
        elif pair_card in ['2', '3']:
            if dealer_value <= 7:  # vs 2-7 only
                return Action.SPLIT
            else:
                return Action.HIT
        elif pair_card == '7':
            if dealer_value <= 7:  # vs 2-7
                return Action.SPLIT
            else:
                return Action.HIT
        elif pair_card == '6':
            if dealer_value <= 6:  # vs 2-6
                return Action.SPLIT
            else:
                return Action.HIT
        elif pair_card == '5':  # Pair of 5s should double like hard 10
            if dealer_value <= 9:
                return Action.DOUBLE
            else:
                return Action.HIT
        elif pair_card == '4':
            if dealer_value in [5, 6]:
                return Action.SPLIT
            else:
                return Action.HIT
        else:  # 10, J, Q, K
            return Action.STAND

    def _soft_strategy(self, hand_value: int, dealer_value: int) -> Action:
        if hand_value == 19:  # A,8 (soft 19)
            # Always stand on soft 19 - too strong to risk
            return Action.STAND
        elif hand_value >= 20:  # A,9 (soft 20)
            return Action.STAND
        elif hand_value == 18:  # A,7 (soft 18)
            if dealer_value in [3, 4, 5, 6]:  # Double vs 3-6
                return Action.DOUBLE
            elif dealer_value in [2, 7, 8]:  # Stand vs 2, 7, 8
                return Action.STAND
            else:  # Hit vs 9, 10, or Ace
                return Action.HIT
        else:  # 17 or less (A,2 through A,6)
            if dealer_value in [5, 6]:
                return Action.DOUBLE
            else:
                return Action.HIT

    def _hard_strategy(self, hand_value: int, dealer_value: int) -> Action:
        if hand_value >= 17:
            return Action.STAND
        elif hand_value == 16:
            if dealer_value <= 6:
                return Action.STAND
            else:
                return Action.HIT
        elif hand_value == 15:
            if dealer_value <= 6:
                return Action.STAND
            else:
                return Action.HIT
        elif hand_value >= 13:
            if dealer_value <= 6:
                return Action.STAND
            else:
                return Action.HIT
        elif hand_value == 12:
            if dealer_value in [4, 5, 6]:
                return Action.STAND
            else:
                return Action.HIT
        elif hand_value == 11:
            return Action.DOUBLE  # Always double 11 vs any dealer card
        elif hand_value == 10:
            if dealer_value <= 9:  # Don't double vs 10 or Ace
                return Action.DOUBLE
            else:
                return Action.HIT
        elif hand_value == 9:
            if dealer_value in [3, 4, 5, 6]:
                return Action.DOUBLE
            else:
                return Action.HIT
        else:  # 8 or less
            return Action.HIT

class GameStats:
    def __init__(self):
        self.total_hands = 0
        self.wins = 0
        self.losses = 0
        self.pushes = 0


    def add_result(self, result):
        self.total_hands += 1
        if result > 0:
            self.wins += 1
        elif result < 0:
            self.losses += 1
        else:
            self.pushes += 1

    def get_win_percentage(self):
        return (self.wins / self.total_hands * 100) if self.total_hands > 0 else 0

    def display_stats(self):
        print("\n" + "="*50)
        print("GAME STATISTICS")
        print("="*50)
        
        win_pct = self.get_win_percentage()
        print(f"Total: {self.total_hands} hands | Wins: {self.wins} | Losses: {self.losses} | Pushes: {self.pushes}")
        print(f"Win Rate: {win_pct:.1f}%")
        
        print("="*50)





class BlackjackGame:
    def __init__(self, rules: Rules, strategy: BasicStrategy, base_bet=10):
        self.rules = rules
        self.strategy = strategy
        self.base_bet = base_bet
        self.shoe = self._create_shoe()
        self.discard_pile = []
        self.bankroll = 1000  # Starting bankroll in Rands
        self.hands_played = 0

        self.player_hands = []
        self.dealer_hand = None

    def _create_shoe(self) -> List[str]:
        deck = []
        for _ in range(self.rules.decks):
            # Add 4 copies of each card value (proper deck composition)
            for _ in range(4):
                for value in ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']:
                    deck.append(value)

        random.shuffle(deck)
        return deck

    def _draw_card(self) -> str:
        if len(self.shoe) < 20:  # Reshuffle when shoe is low
            print("Reshuffling the shoe...")
            self.shoe = self._create_shoe()
            self.discard_pile = []

        card = self.shoe.pop()
        self.discard_pile.append(card)
        return card

    def _dealer_play(self) -> Hand:
        while self.dealer_hand.value < 17 or (self.dealer_hand.is_soft and self.dealer_hand.value == 17 and self.rules.dealer_hits_soft_17):
            self.dealer_hand.add_card(self._draw_card())
        return self.dealer_hand

    def _determine_winner(self, player_hand: Hand, dealer_hand: Hand) -> int:
        # Use a default bet of 1 for calculation if bet is 0 (advice mode)
        bet_amount = player_hand.bet if player_hand.bet > 0 else 1
        
        # Player busts
        if player_hand.is_busted:
            return -bet_amount

        # Dealer busts
        if dealer_hand.is_busted:
            return bet_amount

        # Player has blackjack
        if player_hand.is_blackjack:
            if dealer_hand.is_blackjack:
                return 0  # Push
            else:
                return int(bet_amount * 1.5)  # Blackjack pays 3:2

        # Dealer has blackjack
        if dealer_hand.is_blackjack:
            return -bet_amount

        # Compare values
        if player_hand.value > dealer_hand.value:
            return bet_amount
        elif player_hand.value < dealer_hand.value:
            return -bet_amount
        else:
            return 0  # Push

    def start_new_hand(self, bet: int):
        # Deal initial cards
        self.player_hands = [Hand([self._draw_card(), self._draw_card()], bet)]
        self.dealer_hand = Hand([self._draw_card(), self._draw_card()])

        # Check for dealer blackjack
        if self.dealer_hand.is_blackjack:
            print("Dealer has Blackjack!")
            for hand in self.player_hands:
                if hand.is_blackjack:
                    print("You also have Blackjack! It's a push.")
                else:
                    print("You lose this hand.")

    def player_action(self, hand_index: int, action: Action) -> bool:
        """Perform player action and return True if hand is complete"""
        hand = self.player_hands[hand_index]

        if action == Action.HIT:
            hand.add_card(self._draw_card())
            print(f"You draw: {hand.cards[-1]}")
            print(f"Your hand: {hand}")
            if hand.is_busted:
                print("BUST! This hand is complete.")
            return hand.is_busted or hand.stood

        elif action == Action.STAND:
            hand.stand()
            print(f"You stand with: {hand}")
            return True

        elif action == Action.DOUBLE:
            if len(hand.cards) == 2:  # Can only double on first two cards
                hand.double_bet()
                hand.add_card(self._draw_card())
                hand.stand()
                print(f"You double and draw: {hand.cards[-1]}")
                print(f"Your hand: {hand}")
                if hand.is_busted:
                    print("BUST! This doubled hand is complete.")
                return True
            else:
                print("Cannot double after hitting")
                return False

        elif action == Action.SPLIT:
            if hand.is_pair and len(hand.cards) == 2:
                # Split the hand
                card1 = hand.cards[0]
                card2 = hand.cards[1]

                # Create two new hands
                new_hand1 = Hand([card1, self._draw_card()], hand.bet)
                new_hand2 = Hand([card2, self._draw_card()], hand.bet)

                # Replace the current hand with the new hands
                self.player_hands.pop(hand_index)
                self.player_hands.insert(hand_index, new_hand2)
                self.player_hands.insert(hand_index, new_hand1)

                print(f"💫 SPLIT SUCCESSFUL! Original pair {card1},{card2} split into two hands:")
                print(f"   Hand {hand_index + 1}: {new_hand1}")
                print(f"   Hand {hand_index + 2}: {new_hand2}")
                print(f"   Each hand maintains the original bet of R{hand.bet}")
                print(f"   Cards drawn: {new_hand1.cards[1]} and {new_hand2.cards[1]}")
                return False
            else:
                print("Cannot split this hand")
                return False



        return False

    def determine_hand_outcome(self, player_hand: Hand, dealer_hand: Hand) -> str:
        """Determine the outcome of a completed hand"""
        result = self._determine_winner(player_hand, dealer_hand)
        
        if result > 0:
            if player_hand.is_blackjack and not dealer_hand.is_blackjack:
                return "BLACKJACK WIN"
            else:
                return "WIN"
        elif result < 0:
            if player_hand.is_busted:
                return "BUST LOSS"
            elif dealer_hand.is_blackjack and not player_hand.is_blackjack:
                return "DEALER BLACKJACK LOSS"
            else:
                return "LOSS"
        else:
            return "PUSH"

    def complete_round(self) -> int:
        """Complete the round after all player actions and return the net result"""
        # Play dealer's hand
        self._dealer_play()
        print(f"Dealer's hand: {self.dealer_hand}")
        
        # Check if dealer busted
        if self.dealer_hand.is_busted:
            print("Dealer busted!")

        # Determine results for all player hands
        total_result = 0
        for i, hand in enumerate(self.player_hands):
            result = self._determine_winner(hand, self.dealer_hand)
            total_result += result

            if result > 0:
                print(f"Hand {i+1} wins R{result}!")
            elif result < 0:
                print(f"Hand {i+1} loses R{abs(result)}!")
            else:
                print(f"Hand {i+1} pushes!")

        return total_result

def validate_card(card: str) -> bool:
    valid_cards = [str(i) for i in range(2, 11)] + ['J', 'Q', 'K', 'A']
    return card.upper() in valid_cards

def get_user_cards(prompt: str) -> List[str]:
    while True:
        try:
            cards_input = input(prompt).strip().upper()
            if cards_input == 'QUIT':
                sys.exit(0)
            elif cards_input == 'BACK':
                return ['BACK']

            if not cards_input:
                continue

            cards = [c.strip() for c in cards_input.split(',')]

            # Validate all cards
            valid = True
            for card in cards:
                if not validate_card(card):
                    print(f"Invalid card: {card}. Please use 2-10, J, Q, K, A")
                    valid = False
                    break

            if valid:
                return cards

        except KeyboardInterrupt:
            print("\nGoodbye!")
            sys.exit(0)
        except Exception as e:
            print(f"Error: {e}")

def get_integer_input(prompt: str, min_val: int = 1, max_val: int = 1000) -> int:
    while True:
        try:
            value = input(prompt).strip()
            if value == 'QUIT':
                sys.exit(0)
            elif value == 'BACK':
                return -1

            value = int(value)
            if min_val <= value <= max_val:
                return value
            else:
                print(f"Please enter a value between {min_val} and {max_val}")

        except ValueError:
            print("Please enter a valid number")
        except KeyboardInterrupt:
            print("\nGoodbye!")
            sys.exit(0)

def get_action_input(prompt: str) -> Action:
    while True:
        try:
            action = input(prompt).strip().upper()
            if action == 'QUIT':
                sys.exit(0)
            elif action == 'BACK':
                return None

            if action == 'H':
                return Action.HIT
            elif action == 'ST':
                return Action.STAND
            elif action == 'D':
                return Action.DOUBLE
            elif action == 'SP':
                return Action.SPLIT
            else:
                print("Invalid action. Please use H (Hit), ST (Stand), D (Double), SP (Split)")

        except KeyboardInterrupt:
            print("\nGoodbye!")
            sys.exit(0)

def execute_recommended_action(player_hand: Hand, dealer_card: str, action: Action, game=None):
    """Execute the recommended action - minimal output"""
    if action == Action.HIT:
        # If game is provided, draw from the shoe automatically
        if game is not None:
            card = game._draw_card()
            print(f"Card drawn: {card}")
        else:
            # Fallback to manual input if no game provided
            card_input = input("Card drawn: ").strip().upper()
            
            # Check for bust indicator
            if card_input.startswith('B,') or card_input.startswith('B '):
                card = card_input[2:].strip()
                if validate_card(card):
                    player_hand.add_card(card)
                    print("BUST")
                    return
            
            # Normal card handling
            if card_input == 'RANDOM' or not validate_card(card_input):
                cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
                card = random.choice(cards)
            else:
                card = card_input
        
        player_hand.add_card(card)
        print(f"New: {player_hand}")
        
        if player_hand.is_busted:
            print("BUST")
        else:
            strategy = BasicStrategy(Rules(dealer_hits_soft_17=True))
            next_rec = strategy.get_recommendation(player_hand, dealer_card)
            print(f"Next: {next_rec.value}")
    
    elif action == Action.STAND:
        print("Standing")
    
    elif action == Action.DOUBLE:
        if len(player_hand.cards) == 2:
            # If game is provided, draw from the shoe automatically
            if game is not None:
                card = game._draw_card()
                print(f"Final card: {card}")
            else:
                # Fallback to manual input if no game provided
                card_input = input("Final card: ").strip().upper()
                
                # Check for bust indicator
                if card_input.startswith('B,') or card_input.startswith('B '):
                    card = card_input[2:].strip()
                    if validate_card(card):
                        player_hand.add_card(card)
                        player_hand.double_bet()
                        print("BUST")
                        return
                
                # Normal card handling
                if card_input == 'RANDOM' or not validate_card(card_input):
                    cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
                    card = random.choice(cards)
                else:
                    card = card_input
            
            player_hand.add_card(card)
            player_hand.double_bet()
            print(f"Final: {player_hand}")
            if player_hand.is_busted:
                print("BUST")
        else:
            print("Can't double, hitting")
            execute_recommended_action(player_hand, dealer_card, Action.HIT, game)
    
    elif action == Action.SPLIT:
        if player_hand.is_pair:
            # If game is provided, draw from the shoe automatically
            if game is not None:
                card1 = game._draw_card()
                card2 = game._draw_card()
                print(f"Card 1: {card1}")
                print(f"Card 2: {card2}")
            else:
                # Fallback to manual input if no game provided
                card1 = input(f"Card 1: ").strip().upper()
                if card1 == 'RANDOM' or not validate_card(card1):
                    cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
                    card1 = random.choice(cards)
                
                card2 = input(f"Card 2: ").strip().upper()
                if card2 == 'RANDOM' or not validate_card(card2):
                    cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
                    card2 = random.choice(cards)
            
            hand1 = Hand([player_hand.cards[0], card1], player_hand.bet)
            hand2 = Hand([player_hand.cards[1], card2], player_hand.bet)
            
            print(f"H1: {hand1}")
            print(f"H2: {hand2}")
            
            strategy = BasicStrategy(Rules(dealer_hits_soft_17=True))
            rec1 = strategy.get_recommendation(hand1, dealer_card)
            rec2 = strategy.get_recommendation(hand2, dealer_card)
            print(f"H1 next: {rec1.value} | H2 next: {rec2.value}")
        else:
            print("Can't split, hitting")
            execute_recommended_action(player_hand, dealer_card, Action.HIT, game)
    


def simulate_action(player_hand: Hand, dealer_card: str, action: Action):
    """Simulate taking an action and show the result"""
    print(f"\nSimulating {action.value}...")
    
    if action == Action.HIT:
        # Simulate drawing a card
        card_choice = input("Enter the card you drew (or 'random' for random card): ").strip().upper()
        if card_choice == 'RANDOM':
            # Generate a random card (weighted by remaining cards in deck)
            cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
            new_card = random.choice(cards)
            print(f"Random card drawn: {new_card}")
        else:
            if validate_card(card_choice):
                new_card = card_choice
            else:
                print("Invalid card, using random card")
                cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
                new_card = random.choice(cards)
        
        # Add card to hand
        player_hand.add_card(new_card)
        
        print(f"Your new hand: {player_hand}")
        
        if player_hand.is_busted:
            print("BUST! Hand is over.")
        else:
            # Get new recommendation
            strategy = BasicStrategy(Rules(dealer_hits_soft_17=True))
            new_recommendation = strategy.get_recommendation(player_hand, dealer_card)
            print(f"New recommendation: {new_recommendation.value}")
            
            # Ask if they want to continue simulating
            continue_sim = input("Continue simulating actions? (Y/N): ").strip().upper()
            if continue_sim == 'Y':
                simulate_action(player_hand, dealer_card, new_recommendation)
    
    elif action == Action.STAND:
        print("You stand with your current hand.")
        print("Hand is complete. Dealer would now play their hand.")
    
    elif action == Action.DOUBLE:
        print("You double your bet and receive exactly one more card.")
        card_choice = input("Enter the card you drew (or 'random' for random card): ").strip().upper()
        if card_choice == 'RANDOM':
            cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
            new_card = random.choice(cards)
            print(f"Random card drawn: {new_card}")
        else:
            if validate_card(card_choice):
                new_card = card_choice
            else:
                print("Invalid card, using random card")
                cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
                new_card = random.choice(cards)
        
        player_hand.add_card(new_card)
        player_hand.double_bet()
        
        print(f"Your final hand: {player_hand}")
        if player_hand.is_busted:
            print("BUST! You lose double the bet.")
        else:
            print("Hand is complete. Dealer would now play their hand.")
    
    elif action == Action.SPLIT:
        if player_hand.is_pair and len(player_hand.cards) == 2:
            print("You split your pair into two hands.")
            print(f"Original pair: {player_hand.cards[0]}, {player_hand.cards[1]}")
            
            # Ask for the cards drawn to each split hand
            card1_drawn = input(f"Enter the card drawn to the first {player_hand.cards[0]} (or 'random'): ").strip().upper()
            if card1_drawn == 'RANDOM':
                cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
                card1_drawn = random.choice(cards)
                print(f"Random card drawn: {card1_drawn}")
            elif not validate_card(card1_drawn):
                print("Invalid card, using random card")
                cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
                card1_drawn = random.choice(cards)
            
            card2_drawn = input(f"Enter the card drawn to the second {player_hand.cards[1]} (or 'random'): ").strip().upper()
            if card2_drawn == 'RANDOM':
                cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
                card2_drawn = random.choice(cards)
                print(f"Random card drawn: {card2_drawn}")
            elif not validate_card(card2_drawn):
                print("Invalid card, using random card")
                cards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
                card2_drawn = random.choice(cards)
            
            # Create the two split hands
            hand1 = Hand([player_hand.cards[0], card1_drawn], player_hand.bet)
            hand2 = Hand([player_hand.cards[1], card2_drawn], player_hand.bet)
            
            print(f"\n💫 SPLIT RESULTS:")
            print(f"   Hand 1: {hand1}")
            print(f"   Hand 2: {hand2}")
            print(f"   Cards drawn: {card1_drawn} and {card2_drawn}")
            
            # Get recommendations for each hand
            strategy = BasicStrategy(Rules(dealer_hits_soft_17=True))
            rec1 = strategy.get_recommendation(hand1, dealer_card)
            rec2 = strategy.get_recommendation(hand2, dealer_card)
            
            print(f"\n📋 STRATEGY RECOMMENDATIONS:")
            print(f"   Hand 1 recommendation: {rec1.value}")
            print(f"   Hand 2 recommendation: {rec2.value}")
            
            # Ask if they want to continue simulating each hand
            sim_hand1 = input("Simulate actions for Hand 1? (Y/N): ").strip().upper()
            if sim_hand1 == 'Y':
                print("\n--- SIMULATING HAND 1 ---")
                simulate_action(hand1, dealer_card, rec1)
            
            sim_hand2 = input("Simulate actions for Hand 2? (Y/N): ").strip().upper()
            if sim_hand2 == 'Y':
                print("\n--- SIMULATING HAND 2 ---")
                simulate_action(hand2, dealer_card, rec2)
        else:
            print("Cannot split: hand is not a pair or has more than 2 cards.")
    


def clear_console():
    """Clear the console screen"""
    os.system('cls' if os.name == 'nt' else 'clear')

def game_advice_mode():
    clear_console()
    print("GAME ADVICE MODE")
    print("=" * 50)

    # Initialize with standard rules and bankroll system
    rules = Rules(dealer_hits_soft_17=True)
    strategy = BasicStrategy(rules)
    game_stats = GameStats()
    game = BlackjackGame(rules, strategy)
    
    # Bankroll system for advice mode
    bankroll = 1000  # Starting bankroll R1000
    fixed_bet = 10   # Fixed bet amount R10

    # Show options once at start
    print(f"\nBANKROLL: R{bankroll} | BET: R{fixed_bet}")
    print("\nQuick commands:")
    print("- Just enter your cards for normal analysis")
    print("- Type 'bust' then your cards for bust analysis") 
    print("- Type 'stats' to view win/loss statistics")
    print("- Type 'bankroll' to view current bankroll")
    print("- Type 'back' to return to main menu")
    print("- Type 'help' to see this again")
    
    while True:
        try:
            # Direct card input - no menu selection needed
            player_input = input("\nYour cards: ").strip().upper()
            
            if player_input == 'BACK':
                return
            elif player_input == 'HELP':
                print(f"\nBANKROLL: R{bankroll} | BET: R{fixed_bet}")
                print("\nQuick commands:")
                print("- Just enter your cards (e.g., 'K,6' or 'A,A')")
                print("- Type 'bust K,6,10' for bust analysis")
                print("- Type 'stats' to view win/loss statistics")
                print("- Type 'bankroll' to view current bankroll")
                print("- Type 'back' to return to main menu")
                continue
            elif player_input == 'BANKROLL':
                print(f"\n💰 CURRENT BANKROLL: R{bankroll}")
                print(f"   Fixed bet: R{fixed_bet}")
                if bankroll <= 0:
                    print("   ⚠️  You're out of money!")
                elif bankroll < 100:
                    print("   ⚠️  Low bankroll warning!")
                continue
            elif player_input == 'STATS':
                game_stats.display_stats()
                continue
            elif player_input.startswith('BUST '):
                # Handle bust analysis
                cards_part = player_input[5:].strip()
                player_cards = [c.strip() for c in cards_part.split(',')]
                if all(validate_card(card) for card in player_cards):
                    player_hand = Hand(player_cards, fixed_bet)
                    if not player_hand.is_busted:
                        print("Warning: These cards don't result in a bust. Continuing anyway...")
                else:
                    print("Invalid cards. Please use format: bust K,6,10")
                    continue
            else:
                # Normal card input
                if not player_input:
                    continue
                player_cards = [c.strip() for c in player_input.split(',')]
                if all(validate_card(card) for card in player_cards):
                    player_hand = Hand(player_cards, fixed_bet)
                else:
                    print("Invalid cards. Use format: K,6 or A,A")
                    continue

            # Get dealer's up card
            dealer_input = input("Dealer shows: ").strip().upper()
            if dealer_input == 'BACK':
                return
            elif not validate_card(dealer_input):
                print("Invalid dealer card")
                continue
            
            dealer_card = dealer_input

            # Educational note about insurance when dealer shows Ace
            if dealer_card == 'A' and not player_hand.is_busted:
                print("\n" + "=" * 50)
                print(f"Your hand: {player_hand}")
                print(f"Dealer shows: {dealer_card}")
                print(f"\n💡 INSURANCE NOTE:")
                print("Insurance is available but NOT recommended")
                print("- Side bet with ~7% house edge")
                print("- Basic strategy: Never take insurance")
                print("- Only profitable for advanced card counters in specific situations")
                print("=" * 50)

            # Get strategy recommendation
            recommendation = strategy.get_recommendation(player_hand, dealer_card)

            # Clean, minimal display
            print(f"\n{player_hand} vs {dealer_card}")
            print(f"ACTION: {recommendation.value}")
            
            # Auto-execute if not busted
            if not player_hand.is_busted:
                execute_recommended_action(player_hand, dealer_card, recommendation, game)
            else:
                print("BUSTED")

            # Dealer cards for outcome determination
            print(f"\nDealer cards:")
            hole_input = input("Hole card (or 'skip'): ").strip().upper()
            if hole_input not in ['BACK', 'SKIP', '']:
                if validate_card(hole_input):
                    dealer_hole = hole_input
                    
                    dealer_hand_cards = [dealer_card, dealer_hole]
                    dealer_temp_hand = Hand(dealer_hand_cards)
                    
                    needs_to_hit = (dealer_temp_hand.value < 17 or 
                                  (dealer_temp_hand.is_soft and dealer_temp_hand.value == 17 and rules.dealer_hits_soft_17))
                    
                    if needs_to_hit:
                        additional_input = input("Additional cards (or 'none'): ").strip().upper()
                        if additional_input not in ['BACK', 'NONE', '']:
                            additional_cards = [c.strip() for c in additional_input.split(',')]
                            if all(validate_card(card) for card in additional_cards):
                                # Add additional cards to dealer hand
                                for card in additional_cards:
                                    dealer_temp_hand.add_card(card)
                    
                    # Determine outcome
                    print(f"\nDealer final hand: {dealer_temp_hand}")
                    outcome = game.determine_hand_outcome(player_hand, dealer_temp_hand)
                    result = game._determine_winner(player_hand, dealer_temp_hand)
                    
                    # Track the result
                    game_stats.add_result(result)
                    
                    # Update bankroll
                    old_bankroll = bankroll
                    bankroll += result
                    
                    # Display outcome with color coding and bankroll changes
                    if "WIN" in outcome:
                        print(f"🎉 RESULT: {outcome} (+R{result})")
                    elif "LOSS" in outcome:
                        print(f"❌ RESULT: {outcome} (R{result})")
                    else:
                        print(f"🤝 RESULT: {outcome} (R{result})")
                    
                    # Bankroll display
                    bankroll_change = bankroll - old_bankroll
                    if bankroll_change > 0:
                        print(f"💰 BANKROLL: R{old_bankroll} → R{bankroll} (+R{bankroll_change})")
                    elif bankroll_change < 0:
                        print(f"💰 BANKROLL: R{old_bankroll} → R{bankroll} (R{bankroll_change})")
                    else:
                        print(f"💰 BANKROLL: R{bankroll} (no change)")
                    
                    # Quick stats summary
                    win_pct = game_stats.get_win_percentage()
                    print(f"Session: {game_stats.total_hands} hands, {win_pct:.1f}% win rate")
                    
                    # Check for bankruptcy
                    if bankroll <= 0:
                        print("\n🚨 BANKRUPT! Game Over!")
                        print("Type 'back' to return to menu or continue analyzing hands without bankroll tracking.")

            print()

        except KeyboardInterrupt:
            print("\n\nThanks for using Blackjack Strategy Helper!")
            sys.exit(0)
        except Exception as e:
            print(f"Error: {e}")

def interactive_play_mode():
    clear_console()
    print("INTERACTIVE PLAY MODE")
    print("=" * 50)

    rules = Rules(dealer_hits_soft_17=True)
    strategy = BasicStrategy(rules)

    base_bet = get_integer_input("Enter your base bet amount (R10-R100): ", 10, 100)
    if base_bet == -1:
        return

    game = BlackjackGame(rules, strategy, base_bet)

    while game.bankroll > 0:
        print(f"\nBankroll: R{game.bankroll}")

        bet = get_integer_input(f"Enter your bet (min R{base_bet}, max R{min(game.bankroll, 1000)}): ", base_bet, min(game.bankroll, 1000))
        if bet == -1:
            break

        # Start new hand
        game.start_new_hand(bet)

        print(f"\nDealer shows: {game.dealer_hand.cards[0]}")
        
        # Educational note about insurance when dealer shows Ace
        if game.dealer_hand.cards[0] == 'A':
            print(f"\n💡 NOTE: Dealer shows Ace")
            print("Insurance is available but NOT recommended - it's a side bet with ~7% house edge")
            print("Basic strategy: Never take insurance")
        
        # Check for dealer blackjack
        if game.dealer_hand.is_blackjack:
            print("Dealer has Blackjack!")
            result = game.complete_round()
            game.bankroll += result
            game.hands_played += 1
            continue

        # Play each hand
        i = 0
        while i < len(game.player_hands):
            hand = game.player_hands[i]
            print(f"\nHand {i+1}: {hand}")

            # Check if hand is already complete (blackjack or busted)
            if hand.is_blackjack:
                print("Blackjack!")
                i += 1
                continue
            elif hand.is_busted:
                print("Hand busted!")
                i += 1
                continue

            # Get strategy recommendation
            recommendation = strategy.get_recommendation(hand, game.dealer_hand.cards[0])
            print(f"Strategy recommendation: {recommendation.value}")
            
            # Add explanation for complex decisions
            if recommendation == Action.DOUBLE and len(hand.cards) > 2:
                print("  Note: Cannot double after hitting. Recommend Hit instead.")
            elif recommendation == Action.SPLIT and not hand.is_pair:
                print("  Note: Cannot split non-pairs. Recommend Hit instead.")
            
            # Get player action
            action = get_action_input("Enter action (H: Hit, ST: Stand, D: Double, SP: Split): ")
            if action is None:
                break

            # Perform action
            hand_complete = game.player_action(i, action)

            # Check if hand busted after action and automatically move to next hand
            if hand.is_busted:
                print("Hand busted! Moving to next hand...")
                i += 1
                continue

            # Move to next hand if current hand is complete
            if hand_complete:
                i += 1

        if i < len(game.player_hands):  # User chose to go back
            continue

        # Complete the round
        result = game.complete_round()
        game.bankroll += result
        game.hands_played += 1

        print(f"\nRound result: {'+' if result > 0 else ''}{result}")
        print(f"New bankroll: R{game.bankroll}")

        if game.bankroll <= 0:
            print("You're out of money!")
            break

        continue_playing = input("\nPlay another hand? (Y/N): ").strip().upper()
        if continue_playing != 'Y':
            break

    print(f"\nGame over! Final bankroll: R{game.bankroll}")
    print(f"Hands played: {game.hands_played}")
    input("\nPress Enter to return to menu...")
    clear_console()

def main_menu():
    while True:
        clear_console()
        print("BLACKJACK STRATEGY HELPER")
        print("=" * 50)
        print("1. Game Advice Mode")
        print("2. Interactive Play Mode")
        print("3. Exit")
        print("=" * 50)

        choice = input("Please select an option (1-3): ").strip()

        if choice == '1':
            game_advice_mode()
        elif choice == '2':
            interactive_play_mode()
        elif choice == '3' or choice.upper() == 'QUIT':
            clear_console()
            print("Thanks for using Blackjack Strategy Helper!")
            sys.exit(0)
        else:
            print("Invalid choice. Please select 1, 2, or 3.")
            input("Press Enter to continue...")  # Brief pause before clearing again

def main():
    clear_console()
    print("Welcome to Blackjack Strategy Helper!")
    input("Press Enter to continue...")
    main_menu()

if __name__ == "__main__":
    main()
