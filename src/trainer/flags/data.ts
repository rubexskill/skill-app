// Daten für den Flaggen-Trainer: anerkannte Staaten (195 = 193 UN-Mitglieder + Vatikanstadt + Palästina), dazu einige bekannte Gebiete.
// Flaggen: SVG aus dem MIT-lizenzierten Paket „flag-icons“, lokal unter public/flags/ (siehe scripts/copy-flags.mjs).

export type Continent = "Europa" | "Asien" | "Afrika" | "Nordamerika" | "Südamerika" | "Ozeanien";
export const CONTINENTS: Continent[] = ["Europa", "Asien", "Afrika", "Nordamerika", "Südamerika", "Ozeanien"];

export interface Flag {
  /** ISO-3166-Code in Großbuchstaben (Kosovo: XK) */
  iso: string;
  name: string;
  capital: string;
  continent: Continent;
  /** Gebiet ohne allgemeine Anerkennung als Staat – lässt sich abschalten */
  territory?: boolean;
}

const E: Continent = "Europa", A: Continent = "Asien", F: Continent = "Afrika", N: Continent = "Nordamerika", S: Continent = "Südamerika", O: Continent = "Ozeanien";
const f = (iso: string, name: string, capital: string, continent: Continent, territory = false): Flag => ({ iso, name, capital, continent, ...(territory ? { territory: true } : {}) });

export const FLAGS: Flag[] = [
  // Europa
  f("AL", "Albanien", "Tirana", E), f("AD", "Andorra", "Andorra la Vella", E), f("BY", "Belarus", "Minsk", E), f("BE", "Belgien", "Brüssel", E),
  f("BA", "Bosnien und Herzegowina", "Sarajevo", E), f("BG", "Bulgarien", "Sofia", E), f("DK", "Dänemark", "Kopenhagen", E), f("DE", "Deutschland", "Berlin", E),
  f("EE", "Estland", "Tallinn", E), f("FI", "Finnland", "Helsinki", E), f("FR", "Frankreich", "Paris", E), f("GR", "Griechenland", "Athen", E),
  f("IE", "Irland", "Dublin", E), f("IS", "Island", "Reykjavik", E), f("IT", "Italien", "Rom", E), f("HR", "Kroatien", "Zagreb", E),
  f("LV", "Lettland", "Riga", E), f("LI", "Liechtenstein", "Vaduz", E), f("LT", "Litauen", "Vilnius", E), f("LU", "Luxemburg", "Luxemburg", E),
  f("MT", "Malta", "Valletta", E), f("MD", "Moldau", "Chișinău", E), f("MC", "Monaco", "Monaco", E), f("ME", "Montenegro", "Podgorica", E),
  f("NL", "Niederlande", "Amsterdam", E), f("MK", "Nordmazedonien", "Skopje", E), f("NO", "Norwegen", "Oslo", E), f("AT", "Österreich", "Wien", E),
  f("PL", "Polen", "Warschau", E), f("PT", "Portugal", "Lissabon", E), f("RO", "Rumänien", "Bukarest", E), f("RU", "Russland", "Moskau", E),
  f("SM", "San Marino", "San Marino", E), f("SE", "Schweden", "Stockholm", E), f("CH", "Schweiz", "Bern", E), f("RS", "Serbien", "Belgrad", E),
  f("SK", "Slowakei", "Bratislava", E), f("SI", "Slowenien", "Ljubljana", E), f("ES", "Spanien", "Madrid", E), f("CZ", "Tschechien", "Prag", E),
  f("UA", "Ukraine", "Kiew", E), f("HU", "Ungarn", "Budapest", E), f("VA", "Vatikanstadt", "Vatikanstadt", E), f("GB", "Vereinigtes Königreich", "London", E),
  f("CY", "Zypern", "Nikosia", E),
  // Asien
  f("AF", "Afghanistan", "Kabul", A), f("AM", "Armenien", "Eriwan", A), f("AZ", "Aserbaidschan", "Baku", A), f("BH", "Bahrain", "Manama", A),
  f("BD", "Bangladesch", "Dhaka", A), f("BT", "Bhutan", "Thimphu", A), f("BN", "Brunei", "Bandar Seri Begawan", A), f("CN", "China", "Peking", A),
  f("GE", "Georgien", "Tiflis", A), f("IN", "Indien", "Neu-Delhi", A), f("ID", "Indonesien", "Jakarta", A), f("IQ", "Irak", "Bagdad", A),
  f("IR", "Iran", "Teheran", A), f("IL", "Israel", "Jerusalem", A), f("JP", "Japan", "Tokio", A), f("YE", "Jemen", "Sanaa", A),
  f("JO", "Jordanien", "Amman", A), f("KH", "Kambodscha", "Phnom Penh", A), f("KZ", "Kasachstan", "Astana", A), f("QA", "Katar", "Doha", A),
  f("KG", "Kirgisistan", "Bischkek", A), f("KW", "Kuwait", "Kuwait-Stadt", A), f("LA", "Laos", "Vientiane", A), f("LB", "Libanon", "Beirut", A),
  f("MY", "Malaysia", "Kuala Lumpur", A), f("MV", "Malediven", "Malé", A), f("MN", "Mongolei", "Ulan-Bator", A), f("MM", "Myanmar", "Naypyidaw", A),
  f("NP", "Nepal", "Kathmandu", A), f("KP", "Nordkorea", "Pjöngjang", A), f("OM", "Oman", "Maskat", A), f("TL", "Osttimor", "Dili", A),
  f("PK", "Pakistan", "Islamabad", A), f("PS", "Palästina", "Ramallah", A), f("PH", "Philippinen", "Manila", A), f("SA", "Saudi-Arabien", "Riad", A),
  f("SG", "Singapur", "Singapur", A), f("LK", "Sri Lanka", "Sri Jayawardenepura Kotte", A), f("KR", "Südkorea", "Seoul", A), f("SY", "Syrien", "Damaskus", A),
  f("TJ", "Tadschikistan", "Duschanbe", A), f("TH", "Thailand", "Bangkok", A), f("TR", "Türkei", "Ankara", A), f("TM", "Turkmenistan", "Aschgabat", A),
  f("UZ", "Usbekistan", "Taschkent", A), f("AE", "Vereinigte Arabische Emirate", "Abu Dhabi", A), f("VN", "Vietnam", "Hanoi", A),
  // Afrika
  f("EG", "Ägypten", "Kairo", F), f("DZ", "Algerien", "Algier", F), f("AO", "Angola", "Luanda", F), f("GQ", "Äquatorialguinea", "Malabo", F),
  f("ET", "Äthiopien", "Addis Abeba", F), f("BJ", "Benin", "Porto-Novo", F), f("BW", "Botsuana", "Gaborone", F), f("BF", "Burkina Faso", "Ouagadougou", F),
  f("BI", "Burundi", "Gitega", F), f("DJ", "Dschibuti", "Dschibuti", F), f("CD", "DR Kongo", "Kinshasa", F), f("CI", "Elfenbeinküste", "Yamoussoukro", F),
  f("ER", "Eritrea", "Asmara", F), f("SZ", "Eswatini", "Mbabane", F), f("GA", "Gabun", "Libreville", F), f("GM", "Gambia", "Banjul", F),
  f("GH", "Ghana", "Accra", F), f("GN", "Guinea", "Conakry", F), f("GW", "Guinea-Bissau", "Bissau", F), f("CM", "Kamerun", "Jaunde", F),
  f("CV", "Kap Verde", "Praia", F), f("KE", "Kenia", "Nairobi", F), f("KM", "Komoren", "Moroni", F), f("CG", "Republik Kongo", "Brazzaville", F),
  f("LS", "Lesotho", "Maseru", F), f("LR", "Liberia", "Monrovia", F), f("LY", "Libyen", "Tripolis", F), f("MG", "Madagaskar", "Antananarivo", F),
  f("MW", "Malawi", "Lilongwe", F), f("ML", "Mali", "Bamako", F), f("MA", "Marokko", "Rabat", F), f("MR", "Mauretanien", "Nouakchott", F),
  f("MU", "Mauritius", "Port Louis", F), f("MZ", "Mosambik", "Maputo", F), f("NA", "Namibia", "Windhuk", F), f("NE", "Niger", "Niamey", F),
  f("NG", "Nigeria", "Abuja", F), f("RW", "Ruanda", "Kigali", F), f("ZM", "Sambia", "Lusaka", F), f("ST", "São Tomé und Príncipe", "São Tomé", F),
  f("SN", "Senegal", "Dakar", F), f("SC", "Seychellen", "Victoria", F), f("SL", "Sierra Leone", "Freetown", F), f("ZW", "Simbabwe", "Harare", F),
  f("SO", "Somalia", "Mogadischu", F), f("ZA", "Südafrika", "Pretoria", F), f("SS", "Südsudan", "Juba", F), f("SD", "Sudan", "Khartum", F),
  f("TZ", "Tansania", "Dodoma", F), f("TG", "Togo", "Lomé", F), f("TD", "Tschad", "N’Djamena", F), f("TN", "Tunesien", "Tunis", F),
  f("UG", "Uganda", "Kampala", F), f("CF", "Zentralafrikanische Republik", "Bangui", F),
  // Nordamerika (mit Mittelamerika und Karibik)
  f("AG", "Antigua und Barbuda", "Saint John’s", N), f("BS", "Bahamas", "Nassau", N), f("BB", "Barbados", "Bridgetown", N), f("BZ", "Belize", "Belmopan", N),
  f("CR", "Costa Rica", "San José", N), f("DM", "Dominica", "Roseau", N), f("DO", "Dominikanische Republik", "Santo Domingo", N), f("SV", "El Salvador", "San Salvador", N),
  f("GD", "Grenada", "St. George’s", N), f("GT", "Guatemala", "Guatemala-Stadt", N), f("HT", "Haiti", "Port-au-Prince", N), f("HN", "Honduras", "Tegucigalpa", N),
  f("JM", "Jamaika", "Kingston", N), f("CA", "Kanada", "Ottawa", N), f("CU", "Kuba", "Havanna", N), f("MX", "Mexiko", "Mexiko-Stadt", N),
  f("NI", "Nicaragua", "Managua", N), f("PA", "Panama", "Panama-Stadt", N), f("KN", "St. Kitts und Nevis", "Basseterre", N), f("LC", "St. Lucia", "Castries", N),
  f("VC", "St. Vincent und die Grenadinen", "Kingstown", N), f("TT", "Trinidad und Tobago", "Port of Spain", N), f("US", "USA", "Washington, D. C.", N),
  // Südamerika
  f("AR", "Argentinien", "Buenos Aires", S), f("BO", "Bolivien", "Sucre", S), f("BR", "Brasilien", "Brasília", S), f("CL", "Chile", "Santiago de Chile", S),
  f("EC", "Ecuador", "Quito", S), f("GY", "Guyana", "Georgetown", S), f("CO", "Kolumbien", "Bogotá", S), f("PY", "Paraguay", "Asunción", S),
  f("PE", "Peru", "Lima", S), f("SR", "Suriname", "Paramaribo", S), f("UY", "Uruguay", "Montevideo", S), f("VE", "Venezuela", "Caracas", S),
  // Ozeanien
  f("AU", "Australien", "Canberra", O), f("FJ", "Fidschi", "Suva", O), f("KI", "Kiribati", "Tarawa", O), f("MH", "Marshallinseln", "Majuro", O),
  f("FM", "Mikronesien", "Palikir", O), f("NR", "Nauru", "Yaren", O), f("NZ", "Neuseeland", "Wellington", O), f("PW", "Palau", "Ngerulmud", O),
  f("PG", "Papua-Neuguinea", "Port Moresby", O), f("SB", "Salomonen", "Honiara", O), f("WS", "Samoa", "Apia", O), f("TO", "Tonga", "Nukuʻalofa", O),
  f("TV", "Tuvalu", "Funafuti", O), f("VU", "Vanuatu", "Port Vila", O),
  // Gebiete (abschaltbar)
  f("TW", "Taiwan", "Taipeh", A, true), f("XK", "Kosovo", "Pristina", E, true), f("GL", "Grönland", "Nuuk", N, true), f("PR", "Puerto Rico", "San Juan", N, true),
  f("HK", "Hongkong", "Hongkong", A, true), f("MO", "Macau", "Macau", A, true), f("FO", "Färöer", "Tórshavn", E, true), f("GI", "Gibraltar", "Gibraltar", E, true),
  f("BM", "Bermuda", "Hamilton", N, true), f("GU", "Guam", "Hagåtña", O, true), f("NC", "Neukaledonien", "Nouméa", O, true),
  f("PF", "Französisch-Polynesien", "Papeete", O, true), f("IM", "Isle of Man", "Douglas", E, true), f("JE", "Jersey", "Saint Helier", E, true),
];

export const BY_ISO = new Map(FLAGS.map((x) => [x.iso, x]));
export const flagOf = (iso: string): Flag => BY_ISO.get(iso)!;

/** Gruppen leicht verwechselbarer Flaggen (ISO-Codes). Eine Flagge darf in mehreren Gruppen stehen. */
export const CONFUSABLE: string[][] = [
  ["SI", "SK", "RU", "RS", "HR"],
  ["MD", "RO", "TD", "AD"],
  ["ID", "MC", "PL", "SG"],
  ["IE", "CI", "IT", "MX", "HU"],
  ["NE", "IN"],
  ["AU", "NZ", "FJ", "TV"],
  ["LU", "NL", "FR", "PY"],
  ["VE", "CO", "EC", "AM"],
  ["CM", "SN", "ML", "GN", "GH", "BJ", "ET"],
  ["YE", "EG", "SY", "IQ", "SD"],
  ["NO", "IS", "DK", "SE", "FI"],
  ["BO", "GH"],
  ["AT", "LV", "PE", "LB"],
  ["CU", "PR", "CL", "CZ"],
  ["HN", "SV", "NI"],
  ["DZ", "MR", "PK"],
  ["BH", "QA"],
  ["CZ", "PL"],
  ["DE", "BE", "BG"],
  ["TH", "CR"],
  ["AE", "KW", "JO", "SD", "PS"],
  ["US", "LR", "MY"],
  ["CH", "TO"],
  ["GB", "AU", "NZ"],
  ["EE", "BW", "SL"],
  ["TN", "TR"],
  ["LT", "MM"],
];

/** Flaggen, die im 4:3-Ausschnitt praktisch gleich aussehen – sie stehen nie zusammen in einer Frage. */
export const LOOKALIKE_PAIRS: [string, string][] = [["ID", "MC"]];

export const lookalikes = (iso: string): string[] => LOOKALIKE_PAIRS.flatMap(([a, b]) => (a === iso ? [b] : b === iso ? [a] : []));

/** Alle Flaggen, mit denen `iso` in einer Gruppe steht. */
export function confusedWith(iso: string): string[] {
  const out = new Set<string>();
  for (const g of CONFUSABLE) if (g.includes(iso)) for (const x of g) if (x !== iso) out.add(x);
  return [...out];
}

export const inSimilarGroup = (iso: string): boolean => CONFUSABLE.some((g) => g.includes(iso));

/** Adresse der lokal eingebundenen Flagge (public/flags/xx.svg; läuft auch unter einem Unterpfad). */
export const flagUrl = (iso: string): string => `${import.meta.env.BASE_URL}flags/${iso.toLowerCase()}.svg`;
