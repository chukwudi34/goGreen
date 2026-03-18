import fs from "fs";
import moment from "moment";
import simpleGit from "simple-git";

const path = "./data.json";
const git = simpleGit();

const startYear = 2020;
const endYear = 2026;

// Helper: get all dates in a year
const getDatesInYear = (year) => {
  let dates = [];
  for (let month = 0; month < 12; month++) {
    const daysInMonth = moment({ year, month }).daysInMonth();
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(moment({ year, month, day }).format());
    }
  }
  return dates;
};

// Commit all dates for a given year
const commitYear = async (year) => {
  console.log(`\n📅 Pushing commits for ${year}...`);
  const dates = getDatesInYear(year);

  for (let date of dates) {
    fs.writeFileSync(path, JSON.stringify({ date }, null, 2));
    await git.add([path]);
    await git.commit(date, { "--date": date });
  }

  // Push after finishing the year
  await git.push();
  console.log(`✅ Finished pushing commits for ${year}`);
};

// Main: loop through each year
const pushAllYears = async () => {
  for (let year = startYear; year <= endYear; year++) {
    await commitYear(year);
  }
  console.log("\n🎉 All commits pushed from 2020 to 2026!");
};

pushAllYears().catch(console.error);
