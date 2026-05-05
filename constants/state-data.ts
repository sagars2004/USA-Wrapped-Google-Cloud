export const STATE_DATA: Record<string, { 
  olympic: number; 
  para: number; 
  topSport: string;
  gold: number;
  silver: number;
  bronze: number;
  insight: string;
  sports: { name: string; count: number }[] 
}> = {
  "California": { 
    olympic: 342, para: 156, topSport: "Swimming", 
    gold: 124, silver: 82, bronze: 64,
    insight: "A dominant force in the pool, accounting for nearly 15% of all US swimming golds.",
    sports: [{name: "Swimming", count: 82}, {name: "Track & Field", count: 64}, {name: "Water Polo", count: 45}] 
  },
  "Texas": { 
    olympic: 218, para: 92, topSport: "Track & Field", 
    gold: 86, silver: 54, bronze: 42,
    insight: "The spiritual home of American sprinting and high-jump excellence.",
    sports: [{name: "Track & Field", count: 58}, {name: "Swimming", count: 42}, {name: "Basketball", count: 31}] 
  },
  "Florida": { 
    olympic: 184, para: 76, topSport: "Swimming", 
    gold: 52, silver: 38, bronze: 24,
    insight: "Consistently produces world-record breakers in short-distance freestyle.",
    sports: [{name: "Swimming", count: 45}, {name: "Tennis", count: 28}, {name: "Track & Field", count: 26}] 
  },
  "New York": { 
    olympic: 165, para: 84, topSport: "Fencing", 
    gold: 34, silver: 22, bronze: 18,
    insight: "The traditional epicenter for Olympic fencing and tactical precision.",
    sports: [{name: "Fencing", count: 38}, {name: "Rowing", count: 24}, {name: "Wrestling", count: 22}] 
  },
  "Pennsylvania": { 
    olympic: 142, para: 58, topSport: "Wrestling", 
    gold: 42, silver: 28, bronze: 22,
    insight: "Home to a century-long tradition of dominant freestyle wrestling.",
    sports: [{name: "Wrestling", count: 34}, {name: "Track & Field", count: 28}, {name: "Swimming", count: 22}] 
  },
  "Ohio": { 
    olympic: 128, para: 45, topSport: "Track & Field", 
    gold: 38, silver: 24, bronze: 18,
    insight: "Famous for the historic 1936 sweep and modern hurdles dominance.",
    sports: [{name: "Gymnastics", count: 28}, {name: "Track & Field", count: 24}, {name: "Swimming", count: 20}] 
  },
  "Illinois": { 
    olympic: 115, para: 52, topSport: "Basketball", 
    gold: 28, silver: 4, bronze: 6,
    insight: "A primary pipeline for the 'Dream Team' and modern Olympic hoops.",
    sports: [{name: "Basketball", count: 26}, {name: "Track & Field", count: 22}, {name: "Swimming", count: 18}] 
  },
  "Colorado": { 
    olympic: 98, para: 64, topSport: "Skiing", 
    gold: 31, silver: 22, bronze: 18,
    insight: "The high-altitude foundation for Team USA's winter gold rushes.",
    sports: [{name: "Skiing", count: 35}, {name: "Snowboarding", count: 28}, {name: "Cycling", count: 15}] 
  },
  "Washington": { 
    olympic: 88, para: 38, topSport: "Rowing", 
    gold: 19, silver: 12, bronze: 8,
    insight: "Historic success in heavyweight eights and technical shell racing.",
    sports: [{name: "Rowing", count: 24}, {name: "Sailing", count: 18}, {name: "Track & Field", count: 15}] 
  },
  "Massachusetts": { 
    olympic: 92, para: 34, topSport: "Ice Hockey", 
    gold: 14, silver: 8, bronze: 6,
    insight: "A fundamental contributor to the 'Miracle on Ice' and winter legacy.",
    sports: [{name: "Sailing", count: 22}, {name: "Rowing", count: 18}, {name: "Ice Hockey", count: 15}] 
  },
  "Georgia": { 
    olympic: 86, para: 32, topSport: "Track & Field", 
    gold: 18, silver: 12, bronze: 10,
    insight: "Accelerated development in speed events following the 1996 Games.",
    sports: [{name: "Basketball", count: 24}, {name: "Track & Field", count: 22}, {name: "Gymnastics", count: 14}] 
  },
  "North Carolina": { 
    olympic: 74, para: 28, topSport: "Basketball", 
    gold: 22, silver: 2, bronze: 4,
    insight: "Renowned for producing the most consistent Olympic scoring legends.",
    sports: [{name: "Basketball", count: 22}, {name: "Swimming", count: 18}, {name: "Track & Field", count: 14}] 
  }
};
