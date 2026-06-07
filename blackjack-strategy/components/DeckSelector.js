import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DeckSelector({ title, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Select number of decks:</Text>

      <View style={styles.options}>
        {[1, 2, 4, 6, 8].map((size) => (
          <TouchableOpacity
            key={size}
            style={styles.button}
            onPress={() => onSelect(size)}
          >
            <Text style={styles.buttonText}>
              {size} Deck{size > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.note}>
        Most casinos use 6–8 decks. Single deck is best for counting practice.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 30,
  },
  button: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    margin: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    color: '#bbb',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
