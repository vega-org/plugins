import { Catalog } from "../types";

export const catalog: Catalog[] = [
  { title: "Recent Missions", filter: "mission" },
  { title: "Rocket Launches", filter: "launch" },
  { title: "Artemis & Lunar Exploration", filter: "artemis" },
  { title: "Mars Exploration", filter: "mars" },
  { title: "James Webb Space Telescope", filter: "webb" },
  { title: "International Space Station", filter: "space station" },
  { title: "Earth from Orbit", filter: "earth orbit" },
  { title: "Deep Space & Nebulae", filter: "hubble nebula" },
];

export const genres: Catalog[] = [
  { title: "Moon & Artemis", filter: "moon" },
  { title: "Sun & Heliophysics", filter: "solar dynamics" },
  { title: "Outer Planets", filter: "jupiter saturn" },
  { title: "Astronaut Operations", filter: "astronaut" },
  { title: "Historic Apollo Missions", filter: "apollo mission" },
  { title: "Space Shuttles", filter: "space shuttle" },
];
