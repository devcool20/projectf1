// Team data for 2025 F1 season
export interface TeamBio {
  name: string;
  logo: string;
  car_model: string;
  points: number;
  about: string;
  facts: string[];
}

export const teams: TeamBio[] = [
  {
    name: 'Red Bull',
    logo: require('../team-logos/redbull.png'),
    car_model: 'RB21',
    points: 177,
    about: 'Red Bull Racing is a Formula One team based in Milton Keynes, England. The team has won multiple Constructors and Drivers Championships.',
    facts: [
      'Founded in 2005 after purchasing Jaguar Racing.',
      'Known for their innovative aerodynamics and strong race strategies.'
    ]
  },
  // ... Add all other teams here with correct info and placeholder about/facts ...
]; 