// Daten für die Mini-Trainer: Morse-Alphabet, Wörter, Länder.

export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
  K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
  U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
};

export const MORSE_EASY = ["E", "T", "A", "N", "I", "M"];
export const MORSE_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const MORSE_ALL = [...MORSE_LETTERS, ..."0123456789".split("")];

export const MORSE_WORDS_EASY = ["SOS", "TAG", "ROT", "MEER", "BALL", "HAUS", "MOND", "BAUM", "HUND", "BROT", "BUCH", "NACHT"];
export const MORSE_WORDS = [
  "HALLO", "MORSE", "LERNEN", "KARTE", "WASSER", "SONNE", "STERN", "TISCH", "STUHL", "LAMPE", "KATZE", "SCHULE", "FREUND",
  "MUSIK", "SPIEL", "BERG", "WALD", "BLAU", "FENSTER", "GARTEN", "BRUECKE", "FLUGZEUG", "SCHIFF", "KOMPASS", "SIGNAL", "FUNK",
  "NOTRUF", "INSEL", "STRAND", "WOLKE",
];

export function morseOf(word: string): string {
  return word.split("").map((c) => MORSE[c] ?? "").join(" ");
}

export interface Country {
  iso: string;
  name: string;
  capital: string;
  region: "Europa" | "Asien" | "Afrika" | "Amerika" | "Ozeanien";
}

const E = "Europa", A = "Asien", F = "Afrika", M = "Amerika", O = "Ozeanien";
const c = (iso: string, name: string, capital: string, region: Country["region"]): Country => ({ iso, name, capital, region });

export const COUNTRIES: Country[] = [
  // Europa
  c("DE", "Deutschland", "Berlin", E), c("FR", "Frankreich", "Paris", E), c("IT", "Italien", "Rom", E), c("ES", "Spanien", "Madrid", E),
  c("PT", "Portugal", "Lissabon", E), c("GB", "Vereinigtes Königreich", "London", E), c("IE", "Irland", "Dublin", E), c("NL", "Niederlande", "Amsterdam", E),
  c("BE", "Belgien", "Brüssel", E), c("LU", "Luxemburg", "Luxemburg", E), c("CH", "Schweiz", "Bern", E), c("AT", "Österreich", "Wien", E),
  c("DK", "Dänemark", "Kopenhagen", E), c("SE", "Schweden", "Stockholm", E), c("NO", "Norwegen", "Oslo", E), c("FI", "Finnland", "Helsinki", E),
  c("IS", "Island", "Reykjavik", E), c("PL", "Polen", "Warschau", E), c("CZ", "Tschechien", "Prag", E), c("SK", "Slowakei", "Bratislava", E),
  c("HU", "Ungarn", "Budapest", E), c("SI", "Slowenien", "Ljubljana", E), c("HR", "Kroatien", "Zagreb", E), c("RS", "Serbien", "Belgrad", E),
  c("BA", "Bosnien und Herzegowina", "Sarajevo", E), c("ME", "Montenegro", "Podgorica", E), c("MK", "Nordmazedonien", "Skopje", E), c("AL", "Albanien", "Tirana", E),
  c("GR", "Griechenland", "Athen", E), c("BG", "Bulgarien", "Sofia", E), c("RO", "Rumänien", "Bukarest", E), c("MD", "Moldau", "Chișinău", E),
  c("UA", "Ukraine", "Kiew", E), c("BY", "Belarus", "Minsk", E), c("LT", "Litauen", "Vilnius", E), c("LV", "Lettland", "Riga", E),
  c("EE", "Estland", "Tallinn", E), c("MT", "Malta", "Valletta", E), c("CY", "Zypern", "Nikosia", E), c("RU", "Russland", "Moskau", E),
  // Asien
  c("TR", "Türkei", "Ankara", A), c("GE", "Georgien", "Tiflis", A), c("AM", "Armenien", "Eriwan", A), c("AZ", "Aserbaidschan", "Baku", A),
  c("IL", "Israel", "Jerusalem", A), c("JO", "Jordanien", "Amman", A), c("LB", "Libanon", "Beirut", A), c("SA", "Saudi-Arabien", "Riad", A),
  c("AE", "Vereinigte Arabische Emirate", "Abu Dhabi", A), c("QA", "Katar", "Doha", A), c("IR", "Iran", "Teheran", A), c("IQ", "Irak", "Bagdad", A),
  c("AF", "Afghanistan", "Kabul", A), c("PK", "Pakistan", "Islamabad", A), c("IN", "Indien", "Neu-Delhi", A), c("BD", "Bangladesch", "Dhaka", A),
  c("NP", "Nepal", "Kathmandu", A), c("CN", "China", "Peking", A), c("JP", "Japan", "Tokio", A), c("KR", "Südkorea", "Seoul", A),
  c("KP", "Nordkorea", "Pjöngjang", A), c("MN", "Mongolei", "Ulan-Bator", A), c("KZ", "Kasachstan", "Astana", A), c("TH", "Thailand", "Bangkok", A),
  c("VN", "Vietnam", "Hanoi", A), c("KH", "Kambodscha", "Phnom Penh", A), c("MY", "Malaysia", "Kuala Lumpur", A), c("SG", "Singapur", "Singapur", A),
  c("ID", "Indonesien", "Jakarta", A), c("PH", "Philippinen", "Manila", A),
  // Afrika
  c("EG", "Ägypten", "Kairo", F), c("MA", "Marokko", "Rabat", F), c("DZ", "Algerien", "Algier", F), c("TN", "Tunesien", "Tunis", F),
  c("LY", "Libyen", "Tripolis", F), c("NG", "Nigeria", "Abuja", F), c("GH", "Ghana", "Accra", F), c("SN", "Senegal", "Dakar", F),
  c("CI", "Elfenbeinküste", "Yamoussoukro", F), c("ET", "Äthiopien", "Addis Abeba", F), c("KE", "Kenia", "Nairobi", F), c("TZ", "Tansania", "Dodoma", F),
  c("UG", "Uganda", "Kampala", F), c("RW", "Ruanda", "Kigali", F), c("CD", "DR Kongo", "Kinshasa", F), c("AO", "Angola", "Luanda", F),
  c("ZM", "Sambia", "Lusaka", F), c("ZW", "Simbabwe", "Harare", F), c("MZ", "Mosambik", "Maputo", F), c("ZA", "Südafrika", "Pretoria", F),
  c("NA", "Namibia", "Windhuk", F), c("BW", "Botsuana", "Gaborone", F), c("MG", "Madagaskar", "Antananarivo", F), c("SD", "Sudan", "Khartum", F),
  c("SO", "Somalia", "Mogadischu", F), c("CM", "Kamerun", "Jaunde", F),
  // Amerika
  c("US", "USA", "Washington, D. C.", M), c("CA", "Kanada", "Ottawa", M), c("MX", "Mexiko", "Mexiko-Stadt", M), c("CU", "Kuba", "Havanna", M),
  c("JM", "Jamaika", "Kingston", M), c("DO", "Dominikanische Republik", "Santo Domingo", M), c("HT", "Haiti", "Port-au-Prince", M),
  c("GT", "Guatemala", "Guatemala-Stadt", M), c("CR", "Costa Rica", "San José", M), c("PA", "Panama", "Panama-Stadt", M), c("CO", "Kolumbien", "Bogotá", M),
  c("VE", "Venezuela", "Caracas", M), c("EC", "Ecuador", "Quito", M), c("PE", "Peru", "Lima", M), c("BO", "Bolivien", "Sucre", M),
  c("CL", "Chile", "Santiago de Chile", M), c("AR", "Argentinien", "Buenos Aires", M), c("UY", "Uruguay", "Montevideo", M), c("PY", "Paraguay", "Asunción", M),
  c("BR", "Brasilien", "Brasília", M),
  // Ozeanien
  c("AU", "Australien", "Canberra", O), c("NZ", "Neuseeland", "Wellington", O), c("FJ", "Fidschi", "Suva", O), c("PG", "Papua-Neuguinea", "Port Moresby", O),
];

/** Flaggen-Emoji aus dem Ländercode (Windows zeigt dafür nur Buchstaben, iOS die Flagge) */
export function flagOf(iso: string): string {
  return String.fromCodePoint(...iso.split("").map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
}
