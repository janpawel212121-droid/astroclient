import { createClient } from '@supabase/supabase-js';
import { SiteConfig } from './types';
import { defaultConfig } from './config';

// 🔑 WKLEJ TUTAJ SWOJE DANE Z SUPABASE 🔑
const SUPABASE_URL = 'https://auttesbltghvcjdpcfrg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHRlc2JsdGdodmNqZHBjZnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTY3OTUsImV4cCI6MjA5MDQ3Mjc5NX0.IoQmZp56adEdtJHWTeu76JRPg8jEJApwA6HbMY0o0o4';

// Utwórz klienta Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Pobierz konfigurację z bazy danych
 */
export const getConfig = async (): Promise<SiteConfig | null> => {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('config')
      .eq('id', 'main')
      .single();

    if (error) {
      console.error('Błąd pobierania konfiguracji:', error);
      return null;
    }

    return data?.config as SiteConfig;
  } catch (error) {
    console.error('Błąd:', error);
    return null;
  }
};

/**
 * Zapisz konfigurację do bazy danych
 */
export const saveConfig = async (config: SiteConfig): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('site_config')
      .upsert({
        id: 'main',
        config: config,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Błąd zapisywania:', error);
      return false;
    }

    console.log('✅ Konfiguracja zapisana');
    return true;
  } catch (error) {
    console.error('Błąd:', error);
    return false;
  }
};

/**
 * Nasłuchuj zmian w czasie rzeczywistym
 * Gdy ktoś zagłosuje lub admin coś zmieni - wszyscy zobaczą od razu
 */
export const subscribeToConfig = (
  callback: (config: SiteConfig) => void
): (() => void) => {
  const channel = supabase
    .channel('site_config_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'site_config',
        filter: 'id=eq.main'
      },
      (payload) => {
        console.log('🔄 Zmiana w bazie:', payload);
        if (payload.new && (payload.new as any).config) {
          callback((payload.new as any).config as SiteConfig);
        }
      }
    )
    .subscribe();

  // Zwróć funkcję do anulowania subskrypcji
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Głosuj w ankiecie
 */
export const voteInPoll = async (pollId: string): Promise<boolean> => {
  try {
    // Pobierz aktualną konfigurację
    const currentConfig = await getConfig();
    
    if (!currentConfig) {
      console.error('Brak konfiguracji');
      return false;
    }

    // Zaktualizuj głosy w ankiecie
    const updatedPolls = currentConfig.polls.map(poll => {
      if (poll.id === pollId && poll.yesVotes < poll.maxVotes && poll.active) {
        const newVotes = poll.yesVotes + 1;
        const isCompleted = newVotes >= poll.maxVotes;
        
        return {
          ...poll,
          yesVotes: newVotes,
          active: !isCompleted,
          endedAt: isCompleted ? Date.now() : undefined
        };
      }
      return poll;
    });

    // Zapisz zaktualizowaną konfigurację
    return await saveConfig({
      ...currentConfig,
      polls: updatedPolls
    });
  } catch (error) {
    console.error('Błąd głosowania:', error);
    return false;
  }
};

/**
 * Inicjalizuj bazę danych z domyślną konfiguracją
 */
export const initializeDatabase = async (): Promise<void> => {
  const existingConfig = await getConfig();
  
  if (!existingConfig) {
    console.log('📦 Inicjalizacja bazy danych...');
    await saveConfig(defaultConfig);
    console.log('✅ Baza zainicjalizowana');
  }
};