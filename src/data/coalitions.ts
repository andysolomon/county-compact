// Eight deliberately small fictional coalitions (GDD §4.3). Chair listed first.
export interface CoalitionDefinition {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly members: readonly string[]; // county names, chair first
  readonly priority: string;
}

export const COALITIONS: readonly CoalitionDefinition[] = [
  { id: "metro-atlanta", name: "Metro Atlanta Coalition", color: "#6F9793", members: ["Fulton", "Cobb", "DeKalb", "Clayton", "Gwinnett"], priority: "Industrial infrastructure and coordination" },
  { id: "northwest-transport", name: "Northwest Transport League", color: "#7D8998", members: ["Floyd", "Bartow", "Gordon", "Whitfield"], priority: "Freight connections and mutual defense" },
  { id: "northeast-mutual", name: "Northeast Mutual Association", color: "#BFA05A", members: ["Clarke", "Jackson", "Madison", "Oglethorpe"], priority: "Local autonomy and exchange" },
  { id: "central-rail", name: "Central Rail Compact", color: "#8E9463", members: ["Bibb", "Houston", "Peach", "Twiggs"], priority: "Transport and federal logistics" },
  { id: "savannah-trade", name: "Savannah Trade League", color: "#B77E62", members: ["Chatham", "Effingham", "Bryan"], priority: "Port access and construction" },
  { id: "coastal-production", name: "Coastal Production Association", color: "#8C6E86", members: ["Glynn", "McIntosh", "Camden"], priority: "Shipbuilding and services" },
  { id: "chattahoochee-works", name: "Chattahoochee Works Compact", color: "#9AA88A", members: ["Muscogee", "Harris", "Chattahoochee"], priority: "Industry and defensive access" },
  { id: "flint-agricultural", name: "Flint Agricultural Accord", color: "#7A8AA3", members: ["Dougherty", "Lee", "Mitchell", "Worth"], priority: "Agricultural trade and workforce retention" },
];

// Economic rank tiers: explicit design estimates, not historical output (GDD §3.2).
export const ECONOMIC_TIERS = {
  industrial: ["Fulton", "Chatham", "Muscogee", "Bibb", "Richmond", "Floyd", "Whitfield", "Glynn"],
  mixed: ["Cobb", "Clarke", "Dougherty", "Troup", "Hall", "Lowndes", "Ware", "Spalding", "Carroll", "Polk", "Baldwin", "Laurens"],
  agricultural: [
    "Colquitt", "Tift", "Brooks", "Thomas", "Decatur", "Grady", "Mitchell", "Worth", "Sumter", "Terrell", "Bulloch", "Burke",
    "Jefferson", "Washington", "Coffee", "Berrien", "Cook", "Turner", "Crisp", "Dooly", "Macon", "Houston", "Screven", "Emanuel",
    "Toombs", "Tattnall", "Early", "Miller", "Seminole", "Lee", "Calhoun", "Randolph", "Stewart", "Webster", "Wilcox", "Pulaski",
    "Dodge", "Telfair", "Ben Hill", "Irwin",
  ],
} as const;
