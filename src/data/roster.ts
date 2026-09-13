// County seats and terrain classes for the 159-county board.
// Seats are modern seats used as a placeholder pending historical verification
// (GDD §3.2, issue #1). Terrain is a county-level strategic abstraction (§3.1).

export const SEATS: Readonly<Record<string, string>> = {
  Appling: "Baxley", Atkinson: "Pearson", Bacon: "Alma", Baker: "Newton", Baldwin: "Milledgeville",
  Banks: "Homer", Barrow: "Winder", Bartow: "Cartersville", "Ben Hill": "Fitzgerald", Berrien: "Nashville",
  Bibb: "Macon", Bleckley: "Cochran", Brantley: "Nahunta", Brooks: "Quitman", Bryan: "Pembroke",
  Bulloch: "Statesboro", Burke: "Waynesboro", Butts: "Jackson", Calhoun: "Morgan", Camden: "Woodbine",
  Candler: "Metter", Carroll: "Carrollton", Catoosa: "Ringgold", Charlton: "Folkston", Chatham: "Savannah",
  Chattahoochee: "Cusseta", Chattooga: "Summerville", Cherokee: "Canton", Clarke: "Athens", Clay: "Fort Gaines",
  Clayton: "Jonesboro", Clinch: "Homerville", Cobb: "Marietta", Coffee: "Douglas", Colquitt: "Moultrie",
  Columbia: "Appling", Cook: "Adel", Coweta: "Newnan", Crawford: "Knoxville", Crisp: "Cordele",
  Dade: "Trenton", Dawson: "Dawsonville", Decatur: "Bainbridge", DeKalb: "Decatur", Dodge: "Eastman",
  Dooly: "Vienna", Dougherty: "Albany", Douglas: "Douglasville", Early: "Blakely", Echols: "Statenville",
  Effingham: "Springfield", Elbert: "Elberton", Emanuel: "Swainsboro", Evans: "Claxton", Fannin: "Blue Ridge",
  Fayette: "Fayetteville", Floyd: "Rome", Forsyth: "Cumming", Franklin: "Carnesville", Fulton: "Atlanta",
  Gilmer: "Ellijay", Glascock: "Gibson", Glynn: "Brunswick", Gordon: "Calhoun", Grady: "Cairo",
  Greene: "Greensboro", Gwinnett: "Lawrenceville", Habersham: "Clarkesville", Hall: "Gainesville", Hancock: "Sparta",
  Haralson: "Buchanan", Harris: "Hamilton", Hart: "Hartwell", Heard: "Franklin", Henry: "McDonough",
  Houston: "Perry", Irwin: "Ocilla", Jackson: "Jefferson", Jasper: "Monticello", "Jeff Davis": "Hazlehurst",
  Jefferson: "Louisville", Jenkins: "Millen", Johnson: "Wrightsville", Jones: "Gray", Lamar: "Barnesville",
  Lanier: "Lakeland", Laurens: "Dublin", Lee: "Leesburg", Liberty: "Hinesville", Lincoln: "Lincolnton",
  Long: "Ludowici", Lowndes: "Valdosta", Lumpkin: "Dahlonega", Macon: "Oglethorpe", Madison: "Danielsville",
  Marion: "Buena Vista", McDuffie: "Thomson", McIntosh: "Darien", Meriwether: "Greenville", Miller: "Colquitt",
  Mitchell: "Camilla", Monroe: "Forsyth", Montgomery: "Mount Vernon", Morgan: "Madison", Murray: "Chatsworth",
  Muscogee: "Columbus", Newton: "Covington", Oconee: "Watkinsville", Oglethorpe: "Lexington", Paulding: "Dallas",
  Peach: "Fort Valley", Pickens: "Jasper", Pierce: "Blackshear", Pike: "Zebulon", Polk: "Cedartown",
  Pulaski: "Hawkinsville", Putnam: "Eatonton", Quitman: "Georgetown", Rabun: "Clayton", Randolph: "Cuthbert",
  Richmond: "Augusta", Rockdale: "Conyers", Schley: "Ellaville", Screven: "Sylvania", Seminole: "Donalsonville",
  Spalding: "Griffin", Stephens: "Toccoa", Stewart: "Lumpkin", Sumter: "Americus", Talbot: "Talbotton",
  Taliaferro: "Crawfordville", Tattnall: "Reidsville", Taylor: "Butler", Telfair: "McRae", Terrell: "Dawson",
  Thomas: "Thomasville", Tift: "Tifton", Toombs: "Lyons", Towns: "Hiawassee", Treutlen: "Soperton",
  Troup: "LaGrange", Turner: "Ashburn", Twiggs: "Jeffersonville", Union: "Blairsville", Upson: "Thomaston",
  Walker: "LaFayette", Walton: "Monroe", Ware: "Waycross", Warren: "Warrenton", Washington: "Sandersville",
  Wayne: "Jesup", Webster: "Preston", Wheeler: "Alamo", White: "Cleveland", Whitfield: "Dalton",
  Wilcox: "Abbeville", Wilkes: "Washington", Wilkinson: "Irwinton", Worth: "Sylvester",
};

export const MOUNTAIN = new Set([
  "Rabun", "Towns", "Union", "Fannin", "Gilmer", "Lumpkin", "White", "Habersham", "Dawson", "Pickens",
  "Murray", "Dade", "Walker", "Catoosa", "Chattooga", "Stephens", "Whitfield", "Gordon",
]);

export const WETLAND = new Set(["Charlton", "Ware", "Clinch", "Echols", "Brantley", "Camden", "McIntosh", "Glynn", "Chatham", "Bryan", "Liberty", "Long"]);

// Fall line: counties north of roughly 33.0°N (Piedmont) vs coastal plain (south).
export const PIEDMONT_MIN_LAT = 32.95;

// Twelve major settlements shown at state scale (GDD §8.1 zoom behavior).
export const MAJOR_SETTLEMENTS: ReadonlyArray<readonly [string, number, number]> = [
  ["Atlanta", -84.388, 33.749], ["Marietta", -84.5499, 33.9526], ["Savannah", -81.0912, 32.0809],
  ["Columbus", -84.9877, 32.461], ["Macon", -83.6324, 32.8407], ["Augusta", -82.0105, 33.4735],
  ["Albany", -84.1557, 31.5785], ["Athens", -83.3576, 33.9519], ["Rome", -85.1647, 34.257],
  ["Brunswick", -81.4915, 31.1499], ["Valdosta", -83.2785, 30.8327], ["Waycross", -82.354, 31.2136],
];
