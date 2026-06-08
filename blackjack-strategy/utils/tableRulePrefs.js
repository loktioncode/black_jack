import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_TABLE_RULES } from './tableRules';

export const RULES_STORAGE_KEY = '@bj_strategy_table_rules';

/** Bump when default table rules change so saved prefs reset on upgrade. */
const RULES_PREFS_VERSION = 2;

export async function loadDealerHitsSoft17(
  defaultValue = DEFAULT_TABLE_RULES.dealerHitsSoft17
) {
  try {
    const raw = await AsyncStorage.getItem(RULES_STORAGE_KEY);
    if (!raw) return defaultValue;

    const data = JSON.parse(raw);
    if (data.version !== RULES_PREFS_VERSION) {
      await saveDealerHitsSoft17(defaultValue);
      return defaultValue;
    }

    return typeof data.dealerHitsSoft17 === 'boolean'
      ? data.dealerHitsSoft17
      : defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function saveDealerHitsSoft17(dealerHitsSoft17) {
  await AsyncStorage.setItem(
    RULES_STORAGE_KEY,
    JSON.stringify({ version: RULES_PREFS_VERSION, dealerHitsSoft17 })
  );
}
