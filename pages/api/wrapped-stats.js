import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'usa_athletes.json');
  
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    const athletes = data.athletes;
    
    // 1. Total records
    const totalRecords = athletes.length;
    
    // 2. Breakdown by Sport
    const sportsCount = {};
    athletes.forEach(a => {
      sportsCount[a.sport] = (sportsCount[a.sport] || 0) + 1;
    });
    const topSports = Object.entries(sportsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => ({ sport: entry[0], count: entry[1] }));
    
    // 3. Tallest & Shortest Athlete records
    let tallest = null;
    let shortest = null;
    athletes.forEach(a => {
      if (a.height_cm) {
        if (!tallest || a.height_cm > tallest.height_cm) tallest = a;
        if (!shortest || a.height_cm < shortest.height_cm) shortest = a;
      }
    });

    // 4. Breakdown by Year
    const yearCount = {};
    athletes.forEach(a => {
      if (a.games_year) {
        yearCount[a.games_year] = (yearCount[a.games_year] || 0) + 1;
      }
    });

    // 5. Breakdown by Host State
    const stateCount = {};
    athletes.forEach(a => {
      if (a.state && a.state !== "Unknown") {
        stateCount[a.state] = (stateCount[a.state] || 0) + 1;
      }
    });

    // 6. Medal Distribution
    const medalDistribution = { Gold: 0, Silver: 0, Bronze: 0, Participated: 0 };
    athletes.forEach(a => {
      if (medalDistribution[a.medal] !== undefined) {
        medalDistribution[a.medal]++;
      }
    });

    // 7. Season Distribution
    const seasonDistribution = { Summer: 0, Winter: 0 };
    athletes.forEach(a => {
      if (seasonDistribution[a.games_season] !== undefined) {
        seasonDistribution[a.games_season]++;
      }
    });

    res.status(200).json({
      metadata: data.metadata,
      summary: {
        totalRecords,
        topSports,
        tallestRecord: tallest,
        shortestRecord: shortest,
        yearDistribution: yearCount,
        stateDistribution: stateCount,
        medalDistribution,
        seasonDistribution
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to read athletes data' });
  }
}
