import { config } from "dotenv";
config();

async function createPrisma() {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../src/generated/prisma/client.js");
  const pg = await import("pg");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

let prisma: Awaited<ReturnType<typeof createPrisma>>;

async function main() {
  prisma = await createPrisma();

  const fifaToIso: Record<string, string> = {
    MEX: "mx", RSA: "za", KOR: "kr", CZE: "cz",
    CAN: "ca", BIH: "ba", QAT: "qa", SUI: "ch",
    BRA: "br", MAR: "ma", HAI: "ht", SCO: "gb-sct",
    USA: "us", PAR: "py", AUS: "au", TUR: "tr",
    GER: "de", CUW: "cw", CIV: "ci", ECU: "ec",
    NED: "nl", JPN: "jp", TUN: "tn", SWE: "se",
    BEL: "be", EGY: "eg", IRN: "ir", NZL: "nz",
    ESP: "es", CPV: "cv", KSA: "sa", URU: "uy",
    FRA: "fr", SEN: "sn", NOR: "no", IRQ: "iq",
    ARG: "ar", ALG: "dz", AUT: "at", JOR: "jo",
    POR: "pt", UZB: "uz", COL: "co", COD: "cd",
    ENG: "gb-eng", CRO: "hr", GHA: "gh", PAN: "pa",
  };

  const flag = (code: string) => fifaToIso[code] ? `https://flagcdn.com/w40/${fifaToIso[code]}.png` : null;

  const teams = [
    // Group A
    { name: "México", code: "MEX", group: "A", flagUrl: flag("MEX") },
    { name: "Sudáfrica", code: "RSA", group: "A", flagUrl: flag("RSA") },
    { name: "Corea del Sur", code: "KOR", group: "A", flagUrl: flag("KOR") },
    { name: "República Checa", code: "CZE", group: "A", flagUrl: flag("CZE") },
    // Group B
    { name: "Canadá", code: "CAN", group: "B", flagUrl: flag("CAN") },
    { name: "Bosnia y Herzegovina", code: "BIH", group: "B", flagUrl: flag("BIH") },
    { name: "Qatar", code: "QAT", group: "B", flagUrl: flag("QAT") },
    { name: "Suiza", code: "SUI", group: "B", flagUrl: flag("SUI") },
    // Group C
    { name: "Brasil", code: "BRA", group: "C", flagUrl: flag("BRA") },
    { name: "Marruecos", code: "MAR", group: "C", flagUrl: flag("MAR") },
    { name: "Haiti", code: "HAI", group: "C", flagUrl: flag("HAI") },
    { name: "Escocia", code: "SCO", group: "C", flagUrl: flag("SCO") },
    // Group D
    { name: "Estados Unidos", code: "USA", group: "D", flagUrl: flag("USA") },
    { name: "Paraguay", code: "PAR", group: "D", flagUrl: flag("PAR") },
    { name: "Australia", code: "AUS", group: "D", flagUrl: flag("AUS") },
    { name: "Turquia", code: "TUR", group: "D", flagUrl: flag("TUR") },
    // Group E
    { name: "Alemania", code: "GER", group: "E", flagUrl: flag("GER") },
    { name: "Curazao", code: "CUW", group: "E", flagUrl: flag("CUW") },
    { name: "Costa de Marfil", code: "CIV", group: "E", flagUrl: flag("CIV") },
    { name: "Ecuador", code: "ECU", group: "E", flagUrl: flag("ECU") },
    // Group F
    { name: "Paises Bajos", code: "NED", group: "F", flagUrl: flag("NED") },
    { name: "Japon", code: "JPN", group: "F", flagUrl: flag("JPN") },
    { name: "Tunez", code: "TUN", group: "F", flagUrl: flag("TUN") },
    { name: "Suecia", code: "SWE", group: "F", flagUrl: flag("SWE") },
    // Group G
    { name: "Belgica", code: "BEL", group: "G", flagUrl: flag("BEL") },
    { name: "Egipto", code: "EGY", group: "G", flagUrl: flag("EGY") },
    { name: "Iran", code: "IRN", group: "G", flagUrl: flag("IRN") },
    { name: "Nueva Zelanda", code: "NZL", group: "G", flagUrl: flag("NZL") },
    // Group H
    { name: "España", code: "ESP", group: "H", flagUrl: flag("ESP") },
    { name: "Cabo Verde", code: "CPV", group: "H", flagUrl: flag("CPV") },
    { name: "Arabia Saudita", code: "KSA", group: "H", flagUrl: flag("KSA") },
    { name: "Uruguay", code: "URU", group: "H", flagUrl: flag("URU") },
    // Group I
    { name: "Francia", code: "FRA", group: "I", flagUrl: flag("FRA") },
    { name: "Senegal", code: "SEN", group: "I", flagUrl: flag("SEN") },
    { name: "Noruega", code: "NOR", group: "I", flagUrl: flag("NOR") },
    { name: "Iraq", code: "IRQ", group: "I", flagUrl: flag("IRQ") },
    // Group J
    { name: "Argentina", code: "ARG", group: "J", flagUrl: flag("ARG") },
    { name: "Argelia", code: "ALG", group: "J", flagUrl: flag("ALG") },
    { name: "Austria", code: "AUT", group: "J", flagUrl: flag("AUT") },
    { name: "Jordania", code: "JOR", group: "J", flagUrl: flag("JOR") },
    // Group K
    { name: "Portugal", code: "POR", group: "K", flagUrl: flag("POR") },
    { name: "Uzbekistan", code: "UZB", group: "K", flagUrl: flag("UZB") },
    { name: "Colombia", code: "COL", group: "K", flagUrl: flag("COL") },
    { name: "RD Congo", code: "COD", group: "K", flagUrl: flag("COD") },
    // Group L
    { name: "Inglaterra", code: "ENG", group: "L", flagUrl: flag("ENG") },
    { name: "Croacia", code: "CRO", group: "L", flagUrl: flag("CRO") },
    { name: "Ghana", code: "GHA", group: "L", flagUrl: flag("GHA") },
    { name: "Panama", code: "PAN", group: "L", flagUrl: flag("PAN") },
  ];

  console.log("Seeding database...");

  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.scoringConfig.deleteMany();

  const createdTeams: Record<string, string> = {};
  for (const team of teams) {
    const created = await prisma.team.create({ data: team });
    createdTeams[team.code] = created.id;
  }
  console.log(`Created ${teams.length} teams`);

  await prisma.scoringConfig.create({
    data: { exactScore: 5, correctWinner: 3, correctDraw: 2 },
  });

  // All 104 official FIFA World Cup 2026 matches
  // Times in UTC (ET + 4 hours)
  type MatchData = {
    matchNumber: number;
    stage: string;
    group: string | null;
    home: string | null;
    away: string | null;
    dateTime: string;
    venue: string;
  };

  const groupMatches: MatchData[] = [
    // Matchday 1
    { matchNumber: 1, stage: "group", group: "A", home: "MEX", away: "RSA", dateTime: "2026-06-11T19:00:00Z", venue: "Estadio Azteca, Ciudad de México" },
    { matchNumber: 2, stage: "group", group: "A", home: "KOR", away: "CZE", dateTime: "2026-06-12T02:00:00Z", venue: "Estadio Akron, Guadalajara" },
    { matchNumber: 3, stage: "group", group: "B", home: "CAN", away: "BIH", dateTime: "2026-06-12T19:00:00Z", venue: "BMO Field, Toronto" },
    { matchNumber: 4, stage: "group", group: "D", home: "USA", away: "PAR", dateTime: "2026-06-13T01:00:00Z", venue: "SoFi Stadium, Los Ángeles" },
    { matchNumber: 5, stage: "group", group: "B", home: "QAT", away: "SUI", dateTime: "2026-06-13T19:00:00Z", venue: "Levi's Stadium, San Francisco" },
    { matchNumber: 6, stage: "group", group: "C", home: "BRA", away: "MAR", dateTime: "2026-06-13T22:00:00Z", venue: "MetLife Stadium, Nueva York/Nueva Jersey" },
    { matchNumber: 7, stage: "group", group: "C", home: "HAI", away: "SCO", dateTime: "2026-06-14T01:00:00Z", venue: "Gillette Stadium, Boston" },
    { matchNumber: 8, stage: "group", group: "D", home: "AUS", away: "TUR", dateTime: "2026-06-14T04:00:00Z", venue: "BC Place, Vancouver" },
    { matchNumber: 9, stage: "group", group: "E", home: "GER", away: "CUW", dateTime: "2026-06-14T17:00:00Z", venue: "NRG Stadium, Houston" },
    { matchNumber: 10, stage: "group", group: "F", home: "NED", away: "JPN", dateTime: "2026-06-14T20:00:00Z", venue: "AT&T Stadium, Dallas" },
    { matchNumber: 11, stage: "group", group: "E", home: "CIV", away: "ECU", dateTime: "2026-06-14T23:00:00Z", venue: "Lincoln Financial Field, Filadelfia" },
    { matchNumber: 12, stage: "group", group: "F", home: "TUN", away: "SWE", dateTime: "2026-06-15T02:00:00Z", venue: "Estadio BBVA, Monterrey" },
    { matchNumber: 13, stage: "group", group: "H", home: "ESP", away: "CPV", dateTime: "2026-06-15T16:00:00Z", venue: "Mercedes-Benz Stadium, Atlanta" },
    { matchNumber: 14, stage: "group", group: "G", home: "BEL", away: "EGY", dateTime: "2026-06-15T19:00:00Z", venue: "Lumen Field, Seattle" },
    { matchNumber: 15, stage: "group", group: "H", home: "KSA", away: "URU", dateTime: "2026-06-15T22:00:00Z", venue: "Hard Rock Stadium, Miami" },
    { matchNumber: 16, stage: "group", group: "G", home: "IRN", away: "NZL", dateTime: "2026-06-16T01:00:00Z", venue: "SoFi Stadium, Los Ángeles" },
    { matchNumber: 17, stage: "group", group: "I", home: "FRA", away: "SEN", dateTime: "2026-06-16T19:00:00Z", venue: "MetLife Stadium, Nueva York/Nueva Jersey" },
    { matchNumber: 18, stage: "group", group: "I", home: "NOR", away: "IRQ", dateTime: "2026-06-16T22:00:00Z", venue: "Gillette Stadium, Boston" },
    { matchNumber: 19, stage: "group", group: "J", home: "ARG", away: "ALG", dateTime: "2026-06-17T01:00:00Z", venue: "Arrowhead Stadium, Kansas City" },
    { matchNumber: 20, stage: "group", group: "J", home: "AUT", away: "JOR", dateTime: "2026-06-17T04:00:00Z", venue: "Levi's Stadium, San Francisco" },
    { matchNumber: 21, stage: "group", group: "K", home: "POR", away: "COD", dateTime: "2026-06-17T17:00:00Z", venue: "NRG Stadium, Houston" },
    { matchNumber: 22, stage: "group", group: "L", home: "ENG", away: "CRO", dateTime: "2026-06-17T20:00:00Z", venue: "AT&T Stadium, Dallas" },
    { matchNumber: 23, stage: "group", group: "L", home: "GHA", away: "PAN", dateTime: "2026-06-17T23:00:00Z", venue: "BMO Field, Toronto" },
    { matchNumber: 24, stage: "group", group: "K", home: "UZB", away: "COL", dateTime: "2026-06-18T02:00:00Z", venue: "Estadio Azteca, Ciudad de México" },
    // Matchday 2
    { matchNumber: 25, stage: "group", group: "A", home: "RSA", away: "CZE", dateTime: "2026-06-18T16:00:00Z", venue: "Mercedes-Benz Stadium, Atlanta" },
    { matchNumber: 26, stage: "group", group: "B", home: "SUI", away: "BIH", dateTime: "2026-06-18T19:00:00Z", venue: "SoFi Stadium, Los Ángeles" },
    { matchNumber: 27, stage: "group", group: "B", home: "CAN", away: "QAT", dateTime: "2026-06-18T22:00:00Z", venue: "BC Place, Vancouver" },
    { matchNumber: 28, stage: "group", group: "A", home: "MEX", away: "KOR", dateTime: "2026-06-19T01:00:00Z", venue: "Estadio Akron, Guadalajara" },
    { matchNumber: 29, stage: "group", group: "D", home: "USA", away: "AUS", dateTime: "2026-06-19T19:00:00Z", venue: "Lumen Field, Seattle" },
    { matchNumber: 30, stage: "group", group: "C", home: "SCO", away: "MAR", dateTime: "2026-06-19T19:00:00Z", venue: "Gillette Stadium, Boston" },
    { matchNumber: 31, stage: "group", group: "C", home: "BRA", away: "HAI", dateTime: "2026-06-20T01:00:00Z", venue: "Lincoln Financial Field, Filadelfia" },
    { matchNumber: 32, stage: "group", group: "D", home: "TUR", away: "PAR", dateTime: "2026-06-20T04:00:00Z", venue: "Levi's Stadium, San Francisco" },
    { matchNumber: 33, stage: "group", group: "F", home: "NED", away: "SWE", dateTime: "2026-06-20T17:00:00Z", venue: "NRG Stadium, Houston" },
    { matchNumber: 34, stage: "group", group: "E", home: "GER", away: "CIV", dateTime: "2026-06-20T20:00:00Z", venue: "BMO Field, Toronto" },
    { matchNumber: 35, stage: "group", group: "E", home: "ECU", away: "CUW", dateTime: "2026-06-21T00:00:00Z", venue: "Arrowhead Stadium, Kansas City" },
    { matchNumber: 36, stage: "group", group: "F", home: "TUN", away: "JPN", dateTime: "2026-06-21T04:00:00Z", venue: "Estadio BBVA, Monterrey" },
    { matchNumber: 37, stage: "group", group: "H", home: "ESP", away: "KSA", dateTime: "2026-06-21T16:00:00Z", venue: "Mercedes-Benz Stadium, Atlanta" },
    { matchNumber: 38, stage: "group", group: "G", home: "BEL", away: "IRN", dateTime: "2026-06-21T19:00:00Z", venue: "SoFi Stadium, Los Ángeles" },
    { matchNumber: 39, stage: "group", group: "H", home: "URU", away: "CPV", dateTime: "2026-06-21T22:00:00Z", venue: "Hard Rock Stadium, Miami" },
    { matchNumber: 40, stage: "group", group: "G", home: "NZL", away: "EGY", dateTime: "2026-06-22T01:00:00Z", venue: "BC Place, Vancouver" },
    { matchNumber: 41, stage: "group", group: "J", home: "ARG", away: "AUT", dateTime: "2026-06-22T17:00:00Z", venue: "AT&T Stadium, Dallas" },
    { matchNumber: 42, stage: "group", group: "I", home: "FRA", away: "IRQ", dateTime: "2026-06-22T21:00:00Z", venue: "Lincoln Financial Field, Filadelfia" },
    { matchNumber: 43, stage: "group", group: "I", home: "NOR", away: "SEN", dateTime: "2026-06-23T00:00:00Z", venue: "MetLife Stadium, Nueva York/Nueva Jersey" },
    { matchNumber: 44, stage: "group", group: "J", home: "JOR", away: "ALG", dateTime: "2026-06-23T03:00:00Z", venue: "Levi's Stadium, San Francisco" },
    { matchNumber: 45, stage: "group", group: "K", home: "POR", away: "UZB", dateTime: "2026-06-23T17:00:00Z", venue: "NRG Stadium, Houston" },
    { matchNumber: 46, stage: "group", group: "L", home: "ENG", away: "GHA", dateTime: "2026-06-23T20:00:00Z", venue: "Gillette Stadium, Boston" },
    { matchNumber: 47, stage: "group", group: "L", home: "PAN", away: "CRO", dateTime: "2026-06-23T23:00:00Z", venue: "BMO Field, Toronto" },
    { matchNumber: 48, stage: "group", group: "K", home: "COL", away: "COD", dateTime: "2026-06-24T02:00:00Z", venue: "Estadio Akron, Guadalajara" },
    // Matchday 3 (simultaneous kickoffs per group)
    { matchNumber: 49, stage: "group", group: "B", home: "SUI", away: "CAN", dateTime: "2026-06-24T19:00:00Z", venue: "BC Place, Vancouver" },
    { matchNumber: 50, stage: "group", group: "B", home: "BIH", away: "QAT", dateTime: "2026-06-24T19:00:00Z", venue: "Lumen Field, Seattle" },
    { matchNumber: 51, stage: "group", group: "C", home: "SCO", away: "BRA", dateTime: "2026-06-24T22:00:00Z", venue: "Hard Rock Stadium, Miami" },
    { matchNumber: 52, stage: "group", group: "C", home: "MAR", away: "HAI", dateTime: "2026-06-24T22:00:00Z", venue: "Mercedes-Benz Stadium, Atlanta" },
    { matchNumber: 53, stage: "group", group: "A", home: "CZE", away: "MEX", dateTime: "2026-06-25T01:00:00Z", venue: "Estadio Azteca, Ciudad de México" },
    { matchNumber: 54, stage: "group", group: "A", home: "RSA", away: "KOR", dateTime: "2026-06-25T01:00:00Z", venue: "Estadio BBVA, Monterrey" },
    { matchNumber: 55, stage: "group", group: "E", home: "ECU", away: "GER", dateTime: "2026-06-25T20:00:00Z", venue: "MetLife Stadium, Nueva York/Nueva Jersey" },
    { matchNumber: 56, stage: "group", group: "E", home: "CUW", away: "CIV", dateTime: "2026-06-25T20:00:00Z", venue: "Lincoln Financial Field, Filadelfia" },
    { matchNumber: 57, stage: "group", group: "F", home: "TUN", away: "NED", dateTime: "2026-06-25T23:00:00Z", venue: "Arrowhead Stadium, Kansas City" },
    { matchNumber: 58, stage: "group", group: "F", home: "JPN", away: "SWE", dateTime: "2026-06-25T23:00:00Z", venue: "AT&T Stadium, Dallas" },
    { matchNumber: 59, stage: "group", group: "D", home: "TUR", away: "USA", dateTime: "2026-06-26T02:00:00Z", venue: "SoFi Stadium, Los Ángeles" },
    { matchNumber: 60, stage: "group", group: "D", home: "PAR", away: "AUS", dateTime: "2026-06-26T02:00:00Z", venue: "Levi's Stadium, San Francisco" },
    { matchNumber: 61, stage: "group", group: "I", home: "NOR", away: "FRA", dateTime: "2026-06-26T19:00:00Z", venue: "Gillette Stadium, Boston" },
    { matchNumber: 62, stage: "group", group: "I", home: "SEN", away: "IRQ", dateTime: "2026-06-26T19:00:00Z", venue: "BMO Field, Toronto" },
    { matchNumber: 63, stage: "group", group: "H", home: "URU", away: "ESP", dateTime: "2026-06-27T00:00:00Z", venue: "Estadio Akron, Guadalajara" },
    { matchNumber: 64, stage: "group", group: "H", home: "CPV", away: "KSA", dateTime: "2026-06-27T00:00:00Z", venue: "NRG Stadium, Houston" },
    { matchNumber: 65, stage: "group", group: "G", home: "NZL", away: "BEL", dateTime: "2026-06-27T03:00:00Z", venue: "BC Place, Vancouver" },
    { matchNumber: 66, stage: "group", group: "G", home: "EGY", away: "IRN", dateTime: "2026-06-27T03:00:00Z", venue: "Lumen Field, Seattle" },
    { matchNumber: 67, stage: "group", group: "L", home: "PAN", away: "ENG", dateTime: "2026-06-27T21:00:00Z", venue: "MetLife Stadium, Nueva York/Nueva Jersey" },
    { matchNumber: 68, stage: "group", group: "L", home: "CRO", away: "GHA", dateTime: "2026-06-27T21:00:00Z", venue: "Lincoln Financial Field, Filadelfia" },
    { matchNumber: 69, stage: "group", group: "K", home: "COL", away: "POR", dateTime: "2026-06-27T23:30:00Z", venue: "Hard Rock Stadium, Miami" },
    { matchNumber: 70, stage: "group", group: "K", home: "COD", away: "UZB", dateTime: "2026-06-27T23:30:00Z", venue: "Mercedes-Benz Stadium, Atlanta" },
    { matchNumber: 71, stage: "group", group: "J", home: "JOR", away: "ARG", dateTime: "2026-06-28T02:00:00Z", venue: "AT&T Stadium, Dallas" },
    { matchNumber: 72, stage: "group", group: "J", home: "ALG", away: "AUT", dateTime: "2026-06-28T02:00:00Z", venue: "Arrowhead Stadium, Kansas City" },
  ];

  const knockoutMatches: MatchData[] = [
    // Round of 32
    { matchNumber: 73, stage: "round32", group: null, home: null, away: null, dateTime: "2026-06-28T19:00:00Z", venue: "SoFi Stadium, Los Ángeles" },
    { matchNumber: 74, stage: "round32", group: null, home: null, away: null, dateTime: "2026-06-29T17:00:00Z", venue: "NRG Stadium, Houston" },
    { matchNumber: 75, stage: "round32", group: null, home: null, away: null, dateTime: "2026-06-29T20:30:00Z", venue: "Gillette Stadium, Boston" },
    { matchNumber: 76, stage: "round32", group: null, home: null, away: null, dateTime: "2026-06-30T01:00:00Z", venue: "Estadio BBVA, Monterrey" },
    { matchNumber: 77, stage: "round32", group: null, home: null, away: null, dateTime: "2026-06-30T17:00:00Z", venue: "AT&T Stadium, Dallas" },
    { matchNumber: 78, stage: "round32", group: null, home: null, away: null, dateTime: "2026-06-30T21:00:00Z", venue: "MetLife Stadium, Nueva York/Nueva Jersey" },
    { matchNumber: 79, stage: "round32", group: null, home: null, away: null, dateTime: "2026-07-01T01:00:00Z", venue: "Estadio Azteca, Ciudad de México" },
    { matchNumber: 80, stage: "round32", group: null, home: null, away: null, dateTime: "2026-07-01T16:00:00Z", venue: "Mercedes-Benz Stadium, Atlanta" },
    { matchNumber: 81, stage: "round32", group: null, home: null, away: null, dateTime: "2026-07-01T20:00:00Z", venue: "Lumen Field, Seattle" },
    { matchNumber: 82, stage: "round32", group: null, home: null, away: null, dateTime: "2026-07-02T00:00:00Z", venue: "Levi's Stadium, San Francisco" },
    { matchNumber: 83, stage: "round32", group: null, home: null, away: null, dateTime: "2026-07-02T19:00:00Z", venue: "SoFi Stadium, Los Ángeles" },
    { matchNumber: 84, stage: "round32", group: null, home: null, away: null, dateTime: "2026-07-02T23:00:00Z", venue: "BMO Field, Toronto" },
    { matchNumber: 85, stage: "round32", group: null, home: null, away: null, dateTime: "2026-07-03T03:00:00Z", venue: "BC Place, Vancouver" },
    { matchNumber: 86, stage: "round32", group: null, home: null, away: null, dateTime: "2026-07-03T18:00:00Z", venue: "AT&T Stadium, Dallas" },
    { matchNumber: 87, stage: "round32", group: null, home: null, away: null, dateTime: "2026-07-03T22:00:00Z", venue: "Hard Rock Stadium, Miami" },
    { matchNumber: 88, stage: "round32", group: null, home: null, away: null, dateTime: "2026-07-04T01:30:00Z", venue: "Arrowhead Stadium, Kansas City" },
    // Round of 16
    { matchNumber: 89, stage: "round16", group: null, home: null, away: null, dateTime: "2026-07-04T17:00:00Z", venue: "NRG Stadium, Houston" },
    { matchNumber: 90, stage: "round16", group: null, home: null, away: null, dateTime: "2026-07-04T21:00:00Z", venue: "Lincoln Financial Field, Filadelfia" },
    { matchNumber: 91, stage: "round16", group: null, home: null, away: null, dateTime: "2026-07-05T20:00:00Z", venue: "MetLife Stadium, Nueva York/Nueva Jersey" },
    { matchNumber: 92, stage: "round16", group: null, home: null, away: null, dateTime: "2026-07-06T00:00:00Z", venue: "Estadio Azteca, Ciudad de México" },
    { matchNumber: 93, stage: "round16", group: null, home: null, away: null, dateTime: "2026-07-06T19:00:00Z", venue: "AT&T Stadium, Dallas" },
    { matchNumber: 94, stage: "round16", group: null, home: null, away: null, dateTime: "2026-07-07T00:00:00Z", venue: "Lumen Field, Seattle" },
    { matchNumber: 95, stage: "round16", group: null, home: null, away: null, dateTime: "2026-07-07T16:00:00Z", venue: "Mercedes-Benz Stadium, Atlanta" },
    { matchNumber: 96, stage: "round16", group: null, home: null, away: null, dateTime: "2026-07-07T20:00:00Z", venue: "BC Place, Vancouver" },
    // Quarterfinals
    { matchNumber: 97, stage: "quarter", group: null, home: null, away: null, dateTime: "2026-07-09T20:00:00Z", venue: "Gillette Stadium, Boston" },
    { matchNumber: 98, stage: "quarter", group: null, home: null, away: null, dateTime: "2026-07-10T19:00:00Z", venue: "SoFi Stadium, Los Ángeles" },
    { matchNumber: 99, stage: "quarter", group: null, home: null, away: null, dateTime: "2026-07-11T21:00:00Z", venue: "Hard Rock Stadium, Miami" },
    { matchNumber: 100, stage: "quarter", group: null, home: null, away: null, dateTime: "2026-07-12T01:00:00Z", venue: "Arrowhead Stadium, Kansas City" },
    // Semifinals
    { matchNumber: 101, stage: "semi", group: null, home: null, away: null, dateTime: "2026-07-14T19:00:00Z", venue: "AT&T Stadium, Dallas" },
    { matchNumber: 102, stage: "semi", group: null, home: null, away: null, dateTime: "2026-07-15T19:00:00Z", venue: "Mercedes-Benz Stadium, Atlanta" },
    // Third place
    { matchNumber: 103, stage: "third", group: null, home: null, away: null, dateTime: "2026-07-18T21:00:00Z", venue: "Hard Rock Stadium, Miami" },
    // Final
    { matchNumber: 104, stage: "final", group: null, home: null, away: null, dateTime: "2026-07-19T19:00:00Z", venue: "MetLife Stadium, Nueva York/Nueva Jersey" },
  ];

  const allMatches = [...groupMatches, ...knockoutMatches];

  for (const m of allMatches) {
    await prisma.match.create({
      data: {
        matchNumber: m.matchNumber,
        stage: m.stage,
        group: m.group,
        homeTeamId: m.home ? createdTeams[m.home] : null,
        awayTeamId: m.away ? createdTeams[m.away] : null,
        dateTime: new Date(m.dateTime),
        venue: m.venue,
      },
    });
  }

  console.log(`Total: ${allMatches.length} matches created`);
  console.log("Seed completed!");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
