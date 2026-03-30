import { SiteConfig, UserVotes } from './types';

const STORAGE_KEY = 'astro_admin_config';
const VOTES_STORAGE_KEY = 'astro_user_votes';
const ADMIN_PASSWORD = 'astro2025'; // Zmień to hasło!

export const defaultConfig: SiteConfig = {
  modules: [
    { id: '1', name: 'NameTags', icon: 'Users', description: 'Wyświetla nazwy graczy przez ściany z dodatkowymi informacjami', category: 'render', available: true },
    { id: '2', name: 'NoPush', icon: 'Hand', description: 'Zapobiega przepychaniu przez innych graczy i moby', category: 'movement', available: true },
    { id: '3', name: 'Tracers', icon: 'Crosshair', description: 'Rysuje linie prowadzące do graczy i mobów', category: 'render', available: true },
    { id: '4', name: 'AutoPlotek', icon: 'FileSignature', description: 'Automatycznie wykrywa i zapisuje plotki na serwerze', category: 'misc', available: true },
    { id: '5', name: 'AutoLever', icon: 'MousePointer', description: 'Automatycznie klika dźwignie w zasięgu', category: 'misc', available: true },
    { id: '6', name: 'NameProtect', icon: 'UserX', description: 'Ukrywa twój nick w grze przed screenshotami', category: 'misc', available: true },
    { id: '7', name: 'AutoTotem', icon: 'Heart', description: 'Automatycznie przenosi totemy do offhanda', category: 'combat', available: true },
    { id: '8', name: 'FastPlace', icon: 'Zap', description: 'Usuwa opóźnienie między stawianiem bloków', category: 'misc', available: true },
    { id: '9', name: 'AutoDripstone', icon: 'Mountain', description: 'Automatycznie wykrywa dripstone trapy', category: 'combat', available: true },
    { id: '10', name: 'ErrorKiller', icon: 'Bug', description: 'Moduł w trakcie naprawy - wkrótce dostępny', category: 'misc', available: false, unavailableReason: 'W trakcie naprawy' },
    { id: '11', name: 'AntiTrap', icon: 'ShieldOff', description: 'Ostrzega przed trapami i niebezpieczeństwami', category: 'combat', available: true },
    { id: '12', name: 'LogoutSpots', icon: 'LogOut', description: 'Zapisuje i pokazuje miejsca wylogowań graczy', category: 'render', available: true },
    { id: '13', name: 'NoJumpDelay', icon: 'ArrowUp', description: 'Usuwa opóźnienie między skokami', category: 'movement', available: true },
    { id: '14', name: 'NoGuiSign', icon: 'FileSignature', description: 'Pozwala pisać na tabliczkach bez otwierania GUI', category: 'misc', available: true },
  ],
  announcements: [],
  clients: [
    {
      id: '1',
      name: 'Astro Legit',
      type: 'legit',
      version: '1.21.4',
      downloadUrl: 'https://megawrzuta.pl/5cuipx0x',
      available: true,
      isNew: false
    },
    {
      id: '2',
      name: 'Astro HVH',
      type: 'hvh',
      version: '1.21.4',
      downloadUrl: 'https://megawrzuta.pl/f7owuytd',
      available: true,
      isNew: true
    }
  ],
  polls: [],
  maintenanceMode: false,
  maintenanceMessage: 'Strona jest chwilowo niedostępna. Wrócimy wkrótce!'
};

export const loadConfig = (): SiteConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      if (!config.polls) {
        config.polls = [];
      }
      return config;
    }
  } catch (e) {
    console.error('Error loading config:', e);
  }
  return defaultConfig;
};

export const saveConfig = (config: SiteConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config:', e);
  }
};

export const loadUserVotes = (): UserVotes => {
  try {
    const saved = localStorage.getItem(VOTES_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading user votes:', e);
  }
  return {};
};

export const saveUserVotes = (votes: UserVotes): void => {
  try {
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votes));
  } catch (e) {
    console.error('Error saving user votes:', e);
  }
};

export const verifyPassword = (password: string): boolean => {
  return password === ADMIN_PASSWORD;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
