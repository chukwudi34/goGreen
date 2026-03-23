import fs from "fs";
import moment from "moment";
import simpleGit from "simple-git";

const path = "./data.json";
const git = simpleGit();

/**
 * FONT MAP
 */
const FONT = {
  'H': [127, 8, 8, 8, 127],
  'E': [127, 73, 73, 73, 65],
  'L': [127, 64, 64, 64, 64],
  'O': [62, 65, 65, 65, 62],
  ' ': [0, 0, 0],
  'G': [62, 65, 73, 73, 58],
  'R': [127, 9, 25, 41, 70],
  'N': [127, 2, 4, 8, 127],
  'A': [126, 9, 9, 9, 126],
};

/**
 * PATTERNS
 */
const PATTERNS = {
  HEART: [
    [0, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0],
  ],
};

/**
 * HELPERS
 */

// Map grid → date
const getTargetDate = (year, week, day) => {
  return moment({ year, month: 0, day: 1 })
    .startOf("week")
    .add(week, "weeks")
    .add(day, "days");
};

// Prevent future commits
const isFutureDate = (date) => {
  return moment(date).isAfter(moment());
};

// Random commit time (9am–9pm)
const randomTime = (date) => {
  const base = moment(date);

  const hour = Math.floor(Math.random() * 12) + 9; // 9am–9pm
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);

  return base.hour(hour).minute(minute).second(second).format();
};

// Natural density variation
const getNaturalDensity = (base) => {
  const variance = Math.floor(Math.random() * 3);
  const direction = Math.random() > 0.5 ? 1 : -1;
  return Math.max(1, base + direction * variance);
};

// Weekend check
const isWeekend = (date) => {
  const day = moment(date).day();
  return day === 0 || day === 6;
};

// Commit messages
const messages = [
  "fix bug",
  "update logic",
  "refactor code",
  "improve UI",
  "cleanup",
  "add feature",
];

/**
 * CORE COMMIT FUNCTION
 */
const performCommits = async (date, baseDensity) => {
  if (isFutureDate(date)) return;

  let count = getNaturalDensity(baseDensity);

  if (isWeekend(date)) {
    count = Math.max(1, Math.floor(count / 2));
  }

  for (let i = 0; i < count; i++) {
    const commitDate = randomTime(date);
    const msg = messages[Math.floor(Math.random() * messages.length)];

    fs.writeFileSync(
      path,
      JSON.stringify({ date: commitDate, i }, null, 2)
    );

    await git.add([path]);
    await git.commit(msg, { "--date": commitDate });
  }
};

/**
 * DRAW TEXT
 */
const drawText = async (text, year, startWeek, density = 3) => {
  let currentWeek = startWeek;

  for (const char of text.toUpperCase()) {
    const pattern = FONT[char] || FONT[" "];

    for (let x = 0; x < pattern.length; x++) {
      const colMask = pattern[x];

      for (let y = 0; y < 7; y++) {
        if ((colMask >> y) & 1) {
          // Skip some pixels (imperfection)
          if (Math.random() < 0.15) continue;

          const date = getTargetDate(year, currentWeek, y);
          await performCommits(date, density);
        }
      }

      currentWeek++;
    }

    currentWeek++; // space between letters
  }
};

/**
 * DRAW PATTERN
 */
const drawPattern = async (name, year, startWeek, density = 3) => {
  const pattern = PATTERNS[name.toUpperCase()];
  if (!pattern) return console.error("Pattern not found");

  for (let x = 0; x < pattern.length; x++) {
    for (let y = 0; y < 7; y++) {
      if (pattern[x][y]) {
        if (Math.random() < 0.15) continue;

        const date = getTargetDate(year, startWeek + x, y);
        await performCommits(date, density);
      }
    }
  }
};

/**
 * ADD BACKGROUND NOISE
 */
const addNoise = async (year, intensity = 0.15) => {
  let start = moment(`${year}-01-01`);
  let end = moment(`${year}-12-31`);

  while (start.isBefore(end)) {
    if (Math.random() < intensity) {
      await performCommits(start, Math.floor(Math.random() * 3) + 1);
    }
    start.add(1, "day");
  }
};

/**
 * MAIN
 */
const run = async () => {
  const args = process.argv.slice(2);

  const mode = args[0] || "text";
  const input = args[1] || "HELLO";
  const year = parseInt(args[2]) || 2024;
  const startWeek = parseInt(args[3]) || 5;
  const density = parseInt(args[4]) || 3;

  console.log(`🚀 ${mode} | ${input} | ${year}`);

  if (mode === "text") {
    await drawText(input, year, startWeek, density);
  } else if (mode === "pattern") {
    await drawPattern(input, year, startWeek, density);
  }

  // Add natural background activity
  await addNoise(year, 0.12);

  console.log("✅ Done. Now push:");
  console.log("git push origin master");
};

run().catch(console.error);