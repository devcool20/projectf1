// Team data for 2025 F1 season
export interface TeamBio {
  name: string;
  logo: string;
  car_model: string;
  about: string;
  facts: string[];
  driverNumbers: number[];
  country: string;
}

export const teams: TeamBio[] = [
  {
    name: 'Red Bull',
    logo: require('../assets/images/team/redbull.png'),
    car_model: 'RB21',
    driverNumbers: [1, 30],
    country: 'United Kingdom',
    about: 'Red Bull Racing is a Formula One team based in Milton Keynes, England. The team has won multiple Constructors\' and Drivers\' Championships, known for their aggressive design philosophy and strong performance.',
    facts: [
      'Founded in 2005 after purchasing Jaguar Racing.',
      'Known for their innovative aerodynamics and strong race strategies, often leading to dominant periods.',
      'Powered by Honda RBPT power units, a highly successful partnership.',
      'Secured four consecutive Constructors\' Championships from 2010 to 2013 and again in 2022, 2023, and 2024.',
    ]
  },
  {
    name: 'McLaren',
    logo: require('../assets/images/team/mclaren.png'),
    car_model: 'MCL39', // 2025 car model, evolution of MCL38
    driverNumbers: [4, 81],
    country: 'United Kingdom',
    about: 'McLaren Formula 1 Team is a British racing team based at the McLaren Technology Centre in Woking, Surrey, England. One of the most successful teams in F1 history, they are experiencing a resurgence in 2025.',
    facts: [
      'Founded by New Zealand racing driver Bruce McLaren in 1963.',
      'Won their first F1 World Championship in 1974 with Emerson Fittipaldi.',
      'Known for their iconic papaya livery and pioneering carbon fibre chassis in F1.',
      'Won the Constructors\' Championship in 2024, their first since 1998.',
    ]
  },
  {
    name: 'Ferrari',
    logo: require('../assets/images/team/ferrari.png'),
    car_model: 'SF-25', // 2025 car model
    driverNumbers: [16, 44],
    country: 'Italy',
    about: 'Scuderia Ferrari is the racing division of the Italian luxury sports car manufacturer Ferrari and the oldest surviving and most successful team in Formula One history.',
    facts: [
      'The only team to have competed in every Formula One World Championship season since its inception in 1950.',
      'Holds the record for the most Constructors\' Championships (16) and Drivers\' Championships (15).',
      'Based in Maranello, Italy, and known for their passionate Tifosi fanbase.',
      'Their 2025 car, the SF-25, features a darker shade of Racing Red, inspired by the Scuderia\'s early days.',
    ]
  },
  {
    name: 'Mercedes',
    logo: require('../assets/images/team/mercedes.png'),
    car_model: 'F1 W16 E Performance', // 2025 car model
    driverNumbers: [63, 12],
    country: 'Germany',
    about: 'Mercedes-AMG Petronas F1 Team is a German racing team based in Brackley, United Kingdom, and is the works team of Mercedes-Benz. They were dominant in the hybrid era of F1.',
    facts: [
      'Returned to Formula One as a works team in 2010 after a long absence.',
      'Achieved an unprecedented eight consecutive Constructors\' Championships from 2014 to 2021.',
      'Known as the "Silver Arrows" due to their traditional silver racing colours.',
      'Their 2025 car, the W16, continues to feature black in its livery, a scheme introduced by Lewis Hamilton.',
    ]
  },
  {
    name: 'Williams',
    logo: require('../assets/images/team/williams.png'),
    car_model: 'FW47', // 2025 car model
    driverNumbers: [23, 55],
    country: 'United Kingdom',
    about: 'Williams Racing is a British Formula One motor racing team and constructor based in Grove, Oxfordshire, United Kingdom. Founded by Sir Frank Williams and Patrick Head, it is one of the most historic teams in F1.',
    facts: [
      'Founded in 1977 by Frank Williams and Patrick Head.',
      'Has won 9 Constructors\' Championships and 7 Drivers\' Championships.',
      'Known for their strong engineering and developing young talent.',
      'Their 2025 car, the FW47, features a new pushrod rear suspension layout as part of their Mercedes supply deal.',
    ]
  },
  {
    name: 'Kick Sauber',
    logo: require('../assets/images/team/stake.png'),
    car_model: 'C45', // 2025 car model
    driverNumbers: [27, 5],
    country: 'Switzerland',
    about: 'Stake F1 Team Kick Sauber is a Swiss Formula One team based in Hinwil, Switzerland. The team is undergoing a transition period ahead of becoming the Audi factory team in 2026.',
    facts: [
      'Originally founded by Peter Sauber in 1970 as a sports car racing team, entering F1 in 1993.',
      'Known for its long-standing presence in F1 and its strong engineering base in Switzerland.',
      'The team is set to become the Audi factory team from the 2026 season.',
      'Their 2025 car, the C45, features a distinctive green and black livery.',
    ]
  },
  {
    name: 'Racing Bulls',
    logo: require('../assets/images/team/racingbulls.png'),
    car_model: 'VCARB 02', // 2025 car model
    driverNumbers: [10, 6],
    country: 'Italy',
    about: 'Visa Cash App Racing Bulls F1 Team, often shortened to Racing Bulls, is an Italian Formula One racing team and constructor. It serves as Red Bull GmbH\'s sister team, focusing on developing talent.',
    facts: [
      'Formerly known as Scuderia Toro Rosso (2006-2019) and Scuderia AlphaTauri (2020-2023).',
      'Known for nurturing future Red Bull Racing drivers, including Sebastian Vettel and Max Verstappen.',
      'Based in Faenza, Italy, with a strong connection to Red Bull Racing in Milton Keynes.',
      'Their 2025 car, the VCARB 02, continues to use Honda RBPT power units.',
    ]
  },
  {
    name: 'Aston Martin',
    logo: require('../assets/images/team/astonmartin.png'),
    car_model: 'AMR25', // 2025 car model
    driverNumbers: [14, 18],
    country: 'United Kingdom',
    about: 'Aston Martin Aramco F1 Team is a British Formula One team based in Silverstone, United Kingdom. The iconic automotive brand re-entered F1 as a constructor in 2021, aiming for championship success.',
    facts: [
      'The Aston Martin name returned to Formula One as a constructor in 2021, evolving from the Racing Point team.',
      'Owned by Canadian billionaire Lawrence Stroll, who also owns the Aston Martin Lagonda car company.',
      'Their 2025 car, the AMR25, features significant aerodynamic developments and a reprofiled bodywork.',
      'They use Mercedes-AMG F1 power units.',
    ]
  },
  {
    name: 'Haas',
    logo: require('../assets/images/team/haas.png'),
    car_model: 'VF-25', // 2025 car model
    driverNumbers: [31, 87],
    country: 'United States',
    about: 'MoneyGram Haas F1 Team is an American Formula One racing team based in Kannapolis, North Carolina, United States. They are the newest team on the F1 grid, having debuted in 2016.',
    facts: [
      'The only American-owned team on the Formula One grid.',
      'Founded by industrialist Gene Haas, also owner of the NASCAR team Stewart-Haas Racing.',
      'Known for its unique operational model, outsourcing many components from Ferrari and Dallara.',
      'Their 2025 car, the VF-25, is powered by a Ferrari V6 turbo-hybrid power unit.',
    ]
  },
  {
    name: 'Alpine',
    logo: require('../assets/images/team/alpine.png'),
    car_model: 'A525', // 2025 car model
    driverNumbers: [31, 10],
    country: 'France',
    about: 'BWT Alpine F1 Team is a French Formula One racing team based in Enstone, United Kingdom. The team is owned by the French automotive company Renault and competes under its Alpine brand.',
    facts: [
      'Rebranded from Renault F1 Team in 2021 to promote the Alpine sports car brand.',
      'Has a long history in Formula One under various guises, including Toleman and Benetton.',
      'Known for its distinctive blue and pink livery.',
      'Their 2025 car, the A525, is the last Alpine F1 car to use Renault engines before switching to Mercedes in 2026.',
    ]
  },
];