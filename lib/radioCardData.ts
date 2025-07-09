export interface RadioCardData {
  id: number;
  driverName: string;
  teamColor: string;
  teamIcon: string; // Placeholder for the icon component name or ID
  driverResponse: string;
  teamResponse: string;
}

export const radioCardData: RadioCardData[] = [
  {
    id: 1,
    driverName: 'Nico Hulkenberg', // stake
    teamColor: '#00b722', // Kick Sauber
    teamIcon: 'stake',
    driverResponse: '"I HAVE A PROBLEM WITH THE CAR!"',
    teamResponse: '"COPY, WE ARE CHECKING. BOX, BOX."',
  },
  {
    id: 2,
    driverName: 'Gabriel Bortoleto', // stake
    teamColor: '#00b722', // Kick Sauber
    teamIcon: 'stake',
    driverResponse: '"THE TYRES ARE GONE, MAN!"',
    teamResponse: '"OKAY, PUSH NOW. THREE LAPS TO GO."',
  },
  {
    id: 3,
    driverName: 'Charles Leclerc', // Ferrari
    teamColor: '#E8002D',
    teamIcon: 'ferrari',
    driverResponse: '"HE JUST TURNED IN ON ME!"',
    teamResponse: '"WE SAW THAT. WE ARE REPORTING IT."',
  },
  {
    id: 4,
    driverName: 'Lewis Hamilton', // Ferrari
    teamColor: '#E8002D',
    teamIcon: 'ferrari',
    driverResponse: '"I AM FASTER THAN HIM. LET ME PASS."',
    teamResponse: '"LET HIM GO. DON\'T FIGHT HIM."',
  },
  {
    id: 5,
    driverName: 'Lando Norris', // McLaren
    teamColor: '#FF8700',
    teamIcon: 'mclaren',
    driverResponse: '"GREAT JOB EVERYONE! WHAT A RACE!"',
    teamResponse: '"P1, MATE! FANTASTIC DRIVE!"',
  },
  {
    id: 6,
    driverName: 'Oscar Piastri', // McLaren
    teamColor: '#FF8700',
    teamIcon: 'mclaren',
    driverResponse: '"IS THE RAIN COMING?"',
    teamResponse: '"WE EXPECT LIGHT DRIZZLE IN 5 MINUTES."',
  },
  {
    id: 7,
    driverName: 'Carlos Sainz', // Williams
    teamColor: '#6e90d8',
    teamIcon: 'williams',
    driverResponse: '"BLUE FLAGS! BLUE FLAGS!"',
    teamResponse: '"HE HAS BEEN SHOWN THE FLAGS."',
  },
  {
    id: 8,
    driverName: 'Alexander Albon', // Williams
    teamColor: '#6e90d8',
    teamIcon: 'williams',
    driverResponse: '"THE CAR FEELS GOOD. REALLY GOOD."',
    teamResponse: '"COPY THAT. KEEP THIS PACE."',
  },
  {
    id: 9,
    driverName: 'Fernando Alonso', // Aston Martin
    teamColor: '#2cc2af',
    teamIcon: 'astonmartin',
    driverResponse: '"I\'M STUCK BEHIND HIM."',
    teamResponse: '"USE YOUR OVERTAKE BUTTON NOW."',
  },
  {
    id: 10,
    driverName: 'Lance Stroll', // Aston Martin
    teamColor: '#2cc2af',
    teamIcon: 'astonmartin',
    driverResponse: '"WHAT A MOVE! DID YOU SEE THAT?"',
    teamResponse: '"WE SAW IT! INCREDIBLE STUFF!"',
  },
  {
    id: 11,
    driverName: 'Pierre Gasly', // Alpine
    teamColor: '#ca3980',
    teamIcon: 'alpine',
    driverResponse: '"I THINK I HAVE A PUNCTURE."',
    teamResponse: '"BOX THIS LAP, BOX, BOX."',
  },
  {
    id: 12,
    driverName: 'Franco Colapinto', // Alpine
    teamColor: '#ca3980',
    teamIcon: 'alpine',
    driverResponse: '"LEAVE ME ALONE, I KNOW WHAT I\'M DOING."',
    teamResponse: '"...COPY."',
  },
  {
    id: 13,
    driverName: 'Yuki Tsunoda', // Red Bull
    teamColor: '#3272c5',
    teamIcon: 'redbull',
    driverResponse: '"SAFETY CAR, SAFETY CAR. STAY OUT."',
    teamResponse: '"STAY OUT, CONFIRMED."',
  },
  {
    id: 14,
    driverName: 'Max Verstappen', // Red Bull
    teamColor: '#3272c5',
    teamIcon: 'redbull',
    driverResponse: '"THAT WAS A BIT DANGEROUS, NO?"',
    teamResponse: '"WE AGREE. RACE CONTROL HAS IT NOTED."',
  },
  {
    id: 15,
    driverName: 'Esteban Ocon', // Haas
    teamColor: '#b6b6b6',
    teamIcon: 'haas',
    driverResponse: '"HOW ARE WE ON FUEL?"',
    teamResponse: '"FUEL IS GOOD. YOU CAN PUSH."',
  },
  {
    id: 16,
    driverName: 'Oliver Bearman', // Haas
    teamColor: '#b6b6b6',
    teamIcon: 'haas',
    driverResponse: '"I\'M LOSING POWER!"',
    teamResponse: '"TRY MODE 8. TRY MODE 8."',
  },
  {
    id: 17,
    driverName: 'George Russell', // Mercedes
    teamColor: '#1ee6fd',
    teamIcon: 'mercedes',
    driverResponse: '"PLAN B? ARE WE ON PLAN B?"',
    teamResponse: '"AFFIRMATIVE. WE ARE ON PLAN B."',
  },
  {
    id: 18,
    driverName: 'Kimi Antolnelli', // Mercedes
    teamColor: '#1ee6fd',
    teamIcon: 'mercedes',
    driverResponse: '"THANKS FOR THE HELP, TEAM."',
    teamResponse: '"NO PROBLEM. GREAT DRIVE."',
  },
  {
    id: 19,
    driverName: 'Isack Hadjar', // Racing Bulls
    teamColor: '#052b8a',
    teamIcon: 'racingbulls',
    driverResponse: '"THE BALANCE IS AWFUL."',
    teamResponse: '"OKAY, WE\'LL ADJUST AT THE NEXT STOP."',
  },
  {
    id: 20,
    driverName: 'Liam Lawson', // Racing Bulls
    teamColor: '#052b8a',
    teamIcon: 'racingbulls',
    driverResponse: '"YES! GET IN THERE! HAHA!"',
    teamResponse: '"BRILLIANT, MATE! SIMPLY BRILLIANT!"',
  },
]; 

// Helper function to get random radio cards
export const getRandomRadioCards = (count: number = 2): RadioCardData[] => {
  const shuffled = [...radioCardData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}; 