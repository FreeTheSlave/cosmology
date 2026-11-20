// Star positions are world coordinates. Add constellations by following this structure.
window.ATLAS_CONSTELLATIONS = [
  {
    id: "lantern",
    name: "The Lantern",
    color: "#ffd166",
    blessing: "Guidance",
    description: "A five-star figure whose light has long been used as a sign of guidance through uncertain journeys.",
    lore: "The Lantern is drawn as a closed frame of light. Its five principal stars are connected in a simple, memorable pattern.",
    stars: [
      { id: "A", x: 120, y: 140 }, { id: "B", x: 200, y: 100 },
      { id: "C", x: 280, y: 140 }, { id: "D", x: 280, y: 240 },
      { id: "E", x: 120, y: 240 }
    ],
    connections: [["A","B"],["B","C"],["C","D"],["D","E"],["E","A"]]
  },
  {
    id: "crown",
    name: "The Crown",
    color: "#ff66cc",
    blessing: "Sovereignty",
    description: "A chain of five stars resembling a crown set above the distant horizon.",
    lore: "The Crown's rising and setting have been used by chart-makers as a marker for the changing celestial seasons.",
    stars: [
      { id: "A", x: 900, y: 1800 }, { id: "B", x: 1050, y: 1600 },
      { id: "C", x: 1200, y: 1750 }, { id: "D", x: 1350, y: 1600 },
      { id: "E", x: 1500, y: 1800 }
    ],
    connections: [["A","B"],["B","C"],["C","D"],["D","E"]]
  },
  {
    id: "serpent",
    name: "The Serpent",
    color: "#06d6a0",
    blessing: "Transformation",
    description: "A long, winding constellation of six stars, like a serpent crossing the dark.",
    lore: "Its broken, angular path is easy to distinguish from the compact figures nearer the first charted horizon.",
    stars: [
      { id: "A", x: 1800, y: 600 }, { id: "B", x: 1950, y: 700 },
      { id: "C", x: 2150, y: 600 }, { id: "D", x: 2350, y: 800 },
      { id: "E", x: 2550, y: 700 }, { id: "F", x: 2750, y: 900 }
    ],
    connections: [["A","B"],["B","C"],["C","D"],["D","E"],["E","F"]]
  }
];
