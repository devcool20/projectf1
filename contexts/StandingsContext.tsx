import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const StandingsContext = createContext(null);

export const StandingsProvider = ({ children }) => {
  const [driverStandings, setDriverStandings] = useState([]);
  const [teamStandings, setTeamStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const [driversRes, teamsRes] = await Promise.all([
          supabase.from('driver_standings').select('*'),
          supabase.from('team_standings').select('*'),
        ]);
        if (isMounted) {
          setDriverStandings(driversRes.data || []);
          setTeamStandings(teamsRes.data || []);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAll();
    return () => { isMounted = false; };
  }, []);

  return (
    <StandingsContext.Provider value={{ driverStandings, teamStandings, loading, error }}>
      {children}
    </StandingsContext.Provider>
  );
};

export const useStandings = () => useContext(StandingsContext); 