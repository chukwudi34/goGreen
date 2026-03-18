import fs from "fs";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";

const path = "./data.json";
const git = simpleGit();

// $5\times 7$ Font Map (Columns as bitmasks, y=0 is top/Sun, y=6 is bottom/Sat)
const FONT = {
  'H': [127, 8, 8, 8, 127],
  'E': [127, 73, 73, 73, 65],
  'L': [127, 64, 64, 64, 64],
  'O': [62, 65, 65, 65, 62],
  ' ': [0, 0, 0],
  '!': [95, 0],
  'G': [62, 65, 73, 73, 58],
  'R': [127, 9, 25, 41, 70],
  'N': [127, 2, 4, 8, 127],
  'A': [126, 9, 9, 9, 126],
  'B': [127, 73, 73, 73, 54],
  'C': [62, 65, 65, 65, 34],
  'D': [127, 65, 65, 65, 62],
  'I': [65, 65, 127, 65, 65],
  'J': [32, 64, 65, 63, 1],
  'K': [127, 8, 20, 34, 65],
  'M': [127, 2, 4, 2, 127],
  'P': [127, 9, 9, 9, 6],
  'S': [70, 73, 73, 73, 49],
  'T': [1, 1, 127, 1, 1],
  'U': [63, 64, 64, 64, 63],
  'V': [31, 32, 64, 32, 31],
  'W': [127, 32, 16, 32, 127],
  'X': [99, 20, 8, 20, 99],
  'Y': [3, 4, 120, 4, 3],
  'Z': [97, 81, 73, 69, 67],
};

const PATTERNS = {
  'HEART': [
    [0, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0],
  ],
  'SMILEY': [
    [0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0],
  ],
};

// Coordinate to Date mapping
const getTargetDate = (year, week, day) => {
  return moment({ year, month: 0, day: 1 })
    .startOf("week")
    .add(week, "weeks")
    .add(day, "days")
    .format();
};

// Commit logic
const performCommits = async (date, count) => {
  for (let i = 0; i < count; i++) {
    fs.writeFileSync(path, JSON.stringify({ date, i }, null, 2));
    await git.add([path]);
    await git.commit(date, { "--date": date });
  }
};

// Draw text on the contribution graph
const drawText = async (text, year, startWeek, density = 1) => {
  let currentWeek = startWeek;
  const upperText = text.toUpperCase();

  for (const char of upperText) {
    const pattern = FONT[char] || FONT[' '];
    for (let x = 0; x < pattern.length; x++) {
      const colMask = pattern[x];
      for (let y = 0; y < 7; y++) {
        if ((colMask >> y) & 1) {
          const date = getTargetDate(year, currentWeek, y);
          console.log(`✍️  Drawing '${char}' at (${currentWeek}, ${y}) on ${date}`);
          await performCommits(date, density);
        }
      }
      currentWeek++;
    }
    currentWeek++; // Gap between characters
  }
};

// Draw a predefined pattern
const drawPattern = async (name, year, startWeek, density = 1) => {
  const pattern = PATTERNS[name.toUpperCase()];
  if (!pattern) return console.error(`❌ Pattern '${name}' not found.`);

  for (let x = 0; x < pattern.length; x++) {
    for (let y = 0; y < 7; y++) {
      if (pattern[x][y]) {
        const date = getTargetDate(year, startWeek + x, y);
        await performCommits(date, density);
      }
    }
  }
};

// Main Execution
const run = async () => {
  const args = process.argv.slice(2);
  const mode = args[0] || "text"; // "text" or "pattern"
  const input = args[1] || "GREEN";
  const year = parseInt(args[2]) || 2024;
  const startWeek = parseInt(args[3]) || 5;
  const density = parseInt(args[4]) || 5;

  console.log(`🚀 Mode: ${mode}, Input: ${input}, Year: ${year}, StartWeek: ${startWeek}, Density: ${density}`);

  if (mode === "text") {
    await drawText(input, year, startWeek, density);
  } else if (mode === "pattern") {
    await drawPattern(input, year, startWeek, density);
  }

  console.log("\n🎉 Commits generated! Run 'git push' to see them on GitHub.");
};

run().catch(console.error);
