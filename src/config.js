const dotenv = require("dotenv");
dotenv.config();

const RAPID_BASE_API_URL = process.env.RAPID_BASE_API_URL;
const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_API_HOST = process.env.RAPID_API_HOST;
const PREMIER_LEAGUE_ID = process.env.PREMIER_LEAGUE_ID;
const PREMIER_LEAGUE_SEASON = process.env.PREMIER_LEAGUE_SEASON;
const PREMIER_LEAGUE_COUNTRY = process.env.PREMIER_LEAGUE_COUNTRY;
const TIMEZONE = process.env.TIMEZONE;

module.exports = {
  RAPID_BASE_API_URL,
  RAPID_API_KEY,
  RAPID_API_HOST,
  PREMIER_LEAGUE_ID,
  PREMIER_LEAGUE_SEASON,
  TIMEZONE,
  PREMIER_LEAGUE_COUNTRY,
};
