import AsyncStorage from '@react-native-async-storage/async-storage';

export const RULES_STORAGE_KEY = '@bj_strategy_table_rules';

export async function loadDealerHitsSoft17(defaultValue = true) {
  try {
    const raw = await AsyncStorage.getItem(RULES_STORAGE_KEY);
    if (!raw) return defaultValue;
    const data = JSON.parse(raw);
    return typeof data.dealerHitsSoft17 === 'boolean' ? data.dealerHitsSoft17 : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function saveDealerHitsSoft17(dealerHitsSoft17) {
  await AsyncStorage.setItem(
    RULES_STORAGE_KEY,
    JSON.stringify({ dealerHitsSoft17 })
  );
}
