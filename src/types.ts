export enum IconStyle {
  REGULAR = "regular",
  THIN = "thin",
  LIGHT = "light",
  BOLD = "bold",
  FILL = "fill",
  DUOTONE = "duotone",
}

export enum IconCategory {
  ARROWS = "arrows",
  BRAND = "brands",
  COMMERCE = "commerce",
  COMMUNICATION = "communications",
  DESIGN = "design",
  DEVELOPMENT = "technology & development",
  OFFICE = "office",
  EDITOR = "editor",
  FINANCE = "finances",
  GAMES = "games",
  HEALTH = "health & wellness",
  MAP = "maps & travel",
  MEDIA = "media",
  NATURE = "nature",
  OBJECTS = "objects",
  PEOPLE = "people",
  SYSTEM = "system",
  WEATHER = "weather",
}

export interface IconEntry {
  name: string;
  pascal_name: string;
  categories: IconCategory[];
  tags: string[];
  published_in: number;
}
