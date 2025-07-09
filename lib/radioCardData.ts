export interface RadioCardData {
  id: number;
  driverName: string;
  teamColor: string;
  teamIcon: string; // Placeholder for the icon component name or ID
  driverResponse: string;
  teamResponse: string;
  responseOrder: 'T' | 'D'; // T for Team first, D for Driver first
}

import { supabase } from './supabase';

// Supabase database type mapping
interface DbRadioCard {
  id: number;
  driver_name: string;
  team_color: string;
  team_icon: string;
  driver_response: string;
  team_response: string;
  response_order: 'T' | 'D';
}

// Transform database row to frontend format
const transformDbCard = (dbCard: DbRadioCard): RadioCardData => ({
  id: dbCard.id,
  driverName: dbCard.driver_name,
  teamColor: dbCard.team_color,
  teamIcon: dbCard.team_icon,
  driverResponse: dbCard.driver_response,
  teamResponse: dbCard.team_response,
  responseOrder: dbCard.response_order,
});

// Fetch all radio cards from Supabase
export const fetchAllRadioCards = async (): Promise<RadioCardData[]> => {
  const { data, error } = await supabase
    .from('radio_cards')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching radio cards:', error);
    return [];
  }

  return data?.map(transformDbCard) || [];
};

// Fetch specific radio card by ID
export const fetchRadioCardById = async (id: number): Promise<RadioCardData | null> => {
  const { data, error } = await supabase
    .from('radio_cards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching radio card ${id}:`, error);
    return null;
  }

  return data ? transformDbCard(data) : null;
};

// Fetch random radio cards from Supabase
export const fetchRandomRadioCards = async (count: number = 2): Promise<RadioCardData[]> => {
  const { data, error } = await supabase.rpc('get_random_radio_cards', { 
    card_count: count 
  });

  if (error) {
    console.error('Error fetching random radio cards:', error);
    // Fallback: get all cards and shuffle client-side
    const allCards = await fetchAllRadioCards();
    const shuffled = [...allCards].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  return data?.map(transformDbCard) || [];
}; 

// Backward compatibility: synchronous function that returns a promise
export const getRandomRadioCards = (count: number = 2): Promise<RadioCardData[]> => {
  return fetchRandomRadioCards(count);
};

// Backward compatibility: access cards by index (used in screenings.tsx)
export const getRadioCardByIndex = async (index: number): Promise<RadioCardData | null> => {
  const allCards = await fetchAllRadioCards();
  return allCards[index] || null;
};

// Create a cached version for synchronous access (temporary)
let cachedRadioCards: RadioCardData[] = [];

// Initialize cache on module load
const initializeCache = async () => {
  try {
    cachedRadioCards = await fetchAllRadioCards();
  } catch (error) {
    console.error('Failed to initialize radio cards cache:', error);
  }
};

// Call initialization
initializeCache();

// Backward compatibility: synchronous access to cached data
export const radioCardData: RadioCardData[] = cachedRadioCards; 