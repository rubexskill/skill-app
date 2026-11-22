/** Doomsday-Methode (John Conway) für den Wochentag im Kopf. Index: 0 = Sonntag bis 6 = Samstag. */

export const DAY_NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const mod7 = (n: number) => ((n % 7) + 7) % 7;

/** Anker-Wochentag des Jahrhunderts: 1800er Freitag, 1900er Mittwoch, 2000er Dienstag, 2100er Sonntag. */
export const centuryAnchor = (year: number) => mod7(5 * (Math.floor(year / 100) % 4) + 2);

/** Doomsday des Jahres (der Wochentag von 4.4., 6.6., 8.8., 10.10., 12.12. usw.). */
export function yearDoomsday(year: number): number {
  const yy = year % 100;
  const a = Math.floor(yy / 12);
  const b = yy % 12;
  return mod7(centuryAnchor(year) + a + b + Math.floor(b / 4));
}

/** Merktag im Monat, der im selben Jahr auf den Doomsday fällt. */
export function monthAnchor(month0: number, year: number): number {
  const leap = isLeap(year);
  return [leap ? 4 : 3, leap ? 29 : 28, 14, 4, 9, 6, 11, 8, 5, 10, 7, 12][month0];
}

export function weekdayOf(year: number, month0: number, day: number): number {
  return mod7(yearDoomsday(year) + day - monthAnchor(month0, year));
}

/** Rechenweg in Schritten, für die Erklärung nach einer falschen Antwort. */
export function doomsdaySteps(year: number, month0: number, day: number): string[] {
  const yy = year % 100;
  const a = Math.floor(yy / 12), b = yy % 12, c = Math.floor(b / 4);
  const anchor = centuryAnchor(year);
  const dd = yearDoomsday(year);
  const m = monthAnchor(month0, year);
  const diff = day - m;
  const res = weekdayOf(year, month0, day);
  const off = mod7(diff);
  return [
    `Jahrhundert: Die ${Math.floor(year / 100) * 100}er haben den Anker ${DAY_NAMES[anchor]}.`,
    `Jahr ${yy}: ${yy} ÷ 12 = ${a}, Rest ${b}; Rest ÷ 4 = ${c}. ${a} + ${b} + ${c} = ${a + b + c}.`,
    `${DAY_NAMES[anchor]} + ${a + b + c} Tage = ${DAY_NAMES[dd]}. Das ist der Doomsday ${year}.`,
    `Merktag im ${MONTHS[month0]}: der ${m}. fällt auf einen ${DAY_NAMES[dd]}.`,
    `${day} − ${m} = ${diff}, das sind ${off} Tage Abstand (mod 7): ${DAY_NAMES[dd]} + ${off} = ${DAY_NAMES[res]}.`,
  ];
}
