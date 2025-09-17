import { CopyConfig, DEFAULT_COPY_CONFIG } from '@/types/copyConfig';

const COPY_CONFIG_KEY = 'copyConfig';

export const saveCopyConfig = (config: CopyConfig): void => {
  try {
    localStorage.setItem(COPY_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save copy config:', error);
  }
};

export const loadCopyConfig = (): CopyConfig => {
  try {
    const stored = localStorage.getItem(COPY_CONFIG_KEY);
    if (stored) {
      return { ...DEFAULT_COPY_CONFIG, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Failed to load copy config:', error);
  }
  return DEFAULT_COPY_CONFIG;
};

export const resetCopyConfig = (): void => {
  try {
    localStorage.removeItem(COPY_CONFIG_KEY);
  } catch (error) {
    console.error('Failed to reset copy config:', error);
  }
};