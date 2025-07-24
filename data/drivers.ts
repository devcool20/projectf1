// Driver data for 2025 F1 season
export interface DriverBio {
  name: string;
  team: string;
  image: string;
  number: number;
  country: string;
  points: number;
  wins: number;
  podiums: number;
  poles: number;
  about: string;
}

export const drivers: DriverBio[] = [
    {
      name: 'Max Verstappen',
      team: 'Red Bull',
      image: require('../assets/images/drivers/max.png'),
      number: 1,
      country: 'Netherlands',
      points: 165,
      wins: 2,
      podiums: 5,
      poles: 4, // Max Verstappen has 4 poles as of July 2025 (Saudi Arabia, British GP and two others)
      about: 'Max Verstappen is a Dutch racing driver currently competing in Formula One for Red Bull Racing. He is a multiple world champion and known for his aggressive driving style, precise car control, and relentless pursuit of victory.'
    },
    {
      name: 'Oscar Piastri',
      team: 'McLaren',
      image: require('../assets/images/drivers/oscar.png'),
      number: 81,
      country: 'Australia',
      points: 234,
      wins: 3, 
      podiums: 7, 
      poles: 2, // Oscar Piastri has 2 poles (British GP 2025 provisional pole, but Verstappen took it; earlier in the season as well)
      about: 'Oscar Piastri is an Australian racing driver competing in Formula One for McLaren. A highly talented young driver, he quickly made an impact in the sport with impressive performances and a mature approach, leading the 2025 championship as of July.'
    },
    {
      name: 'Lando Norris',
      team: 'McLaren',
      image: require('../assets/images/drivers/lando.png'),
      number: 4,
      country: 'United Kingdom',
      points: 226,
      wins: 1, 
      podiums: 6, 
      poles: 3, 
      about: 'Lando Norris is a British-Belgian racing driver currently competing in Formula One for McLaren. Known for his charismatic personality and impressive speed, he is a consistent front-runner and fan favorite, closely battling for the 2025 championship.'
    },
    {
      name: 'George Russell',
      team: 'Mercedes',
      image: require('../assets/images/drivers/george.png'),
      number: 63,
      country: 'United Kingdom',
      points: 147,
      wins: 0, 
      podiums: 4, 
      poles: 1, 
      about: 'George Russell is a British racing driver for Mercedes-AMG Petronas F1 Team. A highly regarded talent, he consistently extracts maximum performance from his car and is a strong qualifier, leading Mercedes\' charge in 2025.'
    },
    {
      name: 'Charles Leclerc',
      team: 'Ferrari',
      image: require('../assets/images/drivers/charles.png'),
      number: 16,
      country: 'Monaco',
      points: 119,
      wins: 0, 
      podiums: 3, 
      poles: 2, 
      about: 'Charles Leclerc is a Monegasque racing driver competing in Formula One for Scuderia Ferrari. Renowned for his raw speed and qualifying prowess, he is a key part of Ferrari\'s future and a formidable competitor.'
    },
    {
      name: 'Lewis Hamilton',
      team: 'Ferrari',
      image: require('../assets/images/drivers/lewis.png'),
      number: 44,
      country: 'United Kingdom',
      points: 103,
      wins: 0, 
      podiums: 2, 
      poles: 0, 
      about: 'Lewis Hamilton is a British racing driver who is one of the most successful in the history of Formula One, a multiple world champion, and now drives for Scuderia Ferrari, embarking on a new chapter in his illustrious career.'
    },
    {
      name: 'Kimi Antonelli',
      team: 'Mercedes',
      image: require('../assets/images/drivers/kimi.png'),
      number: 12,
      country: 'Italy',
      points: 63,
      wins: 0,
      podiums: 1, 
      poles: 0,
      about: 'Andrea Kimi Antonelli is a highly anticipated Italian rookie driver making his Formula One debut with Mercedes. He has a stellar junior career record and is seen as a future star, quickly adapting to the demands of F1.'
    },
    {
      name: 'Alex Albon',
      team: 'Williams',
      image: require('../assets/images/drivers/alex.png'),
      number: 23,
      country: 'Thailand',
      points: 46,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Alexander Albon is a Thai-British racing driver competing in Formula One for Williams Racing. Known for his strong race craft and ability to extract performance from challenging machinery, he is a vital asset to Williams.'
    },
    {
      name: 'Nico Hulkenberg',
      team: 'Stake F1 Team Kick Sauber',
      image: require('../assets/images/drivers/nico.png'),
      number: 27,
      country: 'Germany',
      points: 37,
      wins: 0,
      podiums: 1, // Nico Hulkenberg achieved his first-ever F1 podium at the British GP in July 2025.
      poles: 0,
      about: 'Nico Hülkenberg is a German racing driver who brings a wealth of experience to the Stake F1 Team Kick Sauber. He is known for his consistent performances and strong qualifying pace, finally achieving a long-awaited podium in 2025.'
    },
    {
      name: 'Esteban Ocon',
      team: 'Haas',
      image: require('../assets/images/drivers/esteban.png'),
      number: 31,
      country: 'France',
      points: 23,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Esteban Ocon is a French racing driver competing in Formula One for Haas F1 Team. A fierce competitor, he consistently battles hard and aims for strong results, bringing his experience to the American team.'
    },
    {
      name: 'Isack Hadjar',
      team: 'Racing Bulls',
      image: require('../assets/images/drivers/isack.png'),
      number: 6, // Number for Isack Hadjar at Racing Bulls (confirmed in F1 info)
      country: 'France',
      points: 21,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Isack Hadjar is a French racing driver competing in Formula One for Racing Bulls. A promising young talent, he is making his mark in the sport with his aggressive driving style and impressive points finishes.'
    },
    {
      name: 'Lance Stroll',
      team: 'Aston Martin',
      image: require('../assets/images/drivers/lance.png'),
      number: 18,
      country: 'Canada',
      points: 20,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Lance Stroll is a Canadian racing driver for Aston Martin Aramco F1 Team. He brings consistent pace and experience to the team, aiming for competitive results alongside his experienced teammate.'
    },
    {
      name: 'Pierre Gasly',
      team: 'Alpine',
      image: require('../assets/images/drivers/pierre.png'),
      number: 10,
      country: 'France',
      points: 19,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Pierre Gasly is a French racing driver competing in Formula One for BWT Alpine F1 Team. Known for his talent and determination, he consistently pushes to extract the maximum from his car, leading Alpine\'s efforts.'
    },
    {
      name: 'Fernando Alonso',
      team: 'Aston Martin',
      image: require('../assets/images/drivers/fernando.png'),
      number: 14,
      country: 'Spain',
      points: 16,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Fernando Alonso is a Spanish racing driver and a two-time Formula One World Champion, currently competing for Aston Martin. He is renowned for his aggressive driving style, tactical prowess, and unwavering determination, even in his advanced F1 career.'
    },
    {
      name: 'Carlos Sainz',
      team: 'Williams',
      image: require('../assets/images/drivers/carlos.png'),
      number: 55,
      country: 'Spain',
      points: 13,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Carlos Sainz is a Spanish racing driver currently competing in Formula One for Williams Racing. Known for his consistent performances and tactical intelligence, he is a valuable asset to Williams, bringing strong race pace.'
    },
    {
      name: 'Liam Lawson',
      team: 'Red Bull', // Liam Lawson is at Red Bull for 2025 according to updated lineups
      image: require('../assets/images/drivers/liam.png'),
      number: 30, 
      country: 'New Zealand',
      points: 12,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Liam Lawson is a New Zealand racing driver promoted to Red Bull Racing for the 2025 season. A highly promising talent, he has shown great adaptability and speed in his F1 appearances, now stepping into a top-tier seat.'
    },
    {
      name: 'Yuki Tsunoda',
      team: 'Racing Bulls', // Yuki Tsunoda is at Racing Bulls for 2025 according to updated lineups
      image: require('../assets/images/drivers/yuki.png'),
      number: 22, 
      country: 'Japan',
      points: 10,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Yuki Tsunoda is a Japanese racing driver competing in Formula One for Racing Bulls. Known for his aggressive style and quick learning, he is a fiery competitor on track, aiming for consistent points finishes.'
    },
    {
      name: 'Oliver Bearman',
      team: 'Haas',
      image: require('../assets/images/drivers/oliver.png'),
      number: 87,
      country: 'United Kingdom',
      points: 6,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Oliver Bearman is a British racing driver making his full-time Formula One debut with Haas F1 Team. He impressed with his initial F1 outings and is considered a bright prospect for the future, bringing youthful energy to Haas.'
    },
    {
      name: 'Gabriel Bortoleto',
      team: 'Stake F1 Team Kick Sauber',
      image: require('../assets/images/drivers/gabriel.png'),
      number: 5,
      country: 'Brazil',
      points: 4,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Gabriel Bortoleto is a Brazilian racing driver and F2 champion, making his Formula One debut with Stake F1 Team Kick Sauber. He is expected to bring fresh talent and a strong competitive edge to the team.'
    },
    {
      name: 'Franco Colapinto',
      team: 'Alpine',
      image: require('../assets/images/drivers/franco.png'),
      number: 43, 
      country: 'Argentina',
      points: 0,
      wins: 0,
      podiums: 0,
      poles: 0,
      about: 'Franco Colapinto is an Argentine racing driver competing in Formula One for BWT Alpine F1 Team. He made his way to F1 through the Alpine Academy and is a determined young talent, looking to score his first F1 points.'
    }
  ];