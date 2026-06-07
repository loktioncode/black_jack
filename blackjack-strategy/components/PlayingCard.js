import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { isRedSuit } from '../utils/cardUtils';

export default function PlayingCard({
  card,
  faceDown = false,
  delay = 0,
  style,
  small = false,
}) {
  const slide = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 1,
        duration: 450,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [card?.id, delay]);

  const size = small ? styles.smallCard : styles.card;
  const red = card && isRedSuit(card.suit);

  return (
    <Animated.View
      style={[
        size,
        style,
        {
          opacity,
          transform: [
            {
              translateY: slide.interpolate({
                inputRange: [0, 1],
                outputRange: [-120, 0],
              }),
            },
            {
              translateX: slide.interpolate({
                inputRange: [0, 1],
                outputRange: [80, 0],
              }),
            },
            { scale },
          ],
        },
      ]}
    >
      {faceDown ? (
        <View style={styles.cardBack}>
          <View style={styles.cardBackInner} />
          <Text style={styles.cardBackPattern}>♠♥</Text>
        </View>
      ) : (
        <>
          <Text style={[styles.rank, red && styles.red, small && styles.rankSmall]}>
            {card.rank}
          </Text>
          <Text style={[styles.suit, red && styles.red, small && styles.suitSmall]}>
            {card.suit}
          </Text>
          <Text style={[styles.rankBottom, red && styles.red, small && styles.rankSmall]}>
            {card.rank}
          </Text>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 62,
    height: 88,
    backgroundColor: '#fffef8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  smallCard: {
    width: 48,
    height: 68,
    backgroundColor: '#fffef8',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 4,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  rank: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  rankSmall: {
    fontSize: 14,
  },
  suit: {
    fontSize: 22,
    textAlign: 'center',
    color: '#1a1a1a',
    marginTop: 2,
  },
  suitSmall: {
    fontSize: 16,
  },
  rankBottom: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    alignSelf: 'flex-end',
    transform: [{ rotate: '180deg' }],
    marginTop: 'auto',
  },
  red: {
    color: '#c0392b',
  },
  cardBack: {
    flex: 1,
    backgroundColor: '#1a3a6e',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardBackInner: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#c9a227',
    borderRadius: 4,
    margin: 4,
  },
  cardBackPattern: {
    color: '#c9a227',
    fontSize: 14,
    opacity: 0.6,
  },
});
