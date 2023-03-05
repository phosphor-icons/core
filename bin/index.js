"use strict";

const CATEGORY_MAP = {
  Arrows: "ARROWS",
  Brands: "BRAND",
  Commerce: "COMMERCE",
  Communication: "COMMUNICATION ",
  Design: "DESIGN",
  Development: "DEVELOPMENT",
  Education: "EDUCATION",
  Games: "GAMES",
  "Health & Wellness": "HEALTH",
  "Maps & Travel": "MAP",
  "Math & Finance": "FINANCE",
  Media: "MEDIA",
  "Office & Editing": "OFFICE",
  People: "PEOPLE",
  "Security & Warnings": "SECURITY",
  "System & Devices": "SYSTEM",
  Time: "TIME",
  "Weather & Nature": "WEATHER",
};

const ALIASES = {
  "file-dashed": "file-dotted",
  "file-magnifying-glass": "file-search",
  "folder-dashed": "folder-dotted",
  "folder-simple-dashed": "folder-simple-dotted",
  pulse: "activity",
  seal: "circle-wavy",
  "seal-check": "circle-wavy-check",
  "seal-question": "circle-wavy-question",
  "seal-warning": "circle-wavy-warning",
  "text-b": "text-bolder",
};

module.exports = { CATEGORY_MAP, ALIASES };
