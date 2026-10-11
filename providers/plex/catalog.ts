import { Catalog } from "../types";

export const catalog: Catalog[] = [
  { title: "Recently Added Movies", filter: "recent-movies" },
  { title: "All Movies", filter: "all-movies" },
  { title: "Recently Added TV", filter: "recent-shows" },
  { title: "All TV Shows", filter: "all-shows" },
  { title: "On Deck", filter: "on-deck" },
];

export const genres: Catalog[] = [
  { title: "Action", filter: "genre:Action" },
  { title: "Animation", filter: "genre:Animation" },
  { title: "Comedy", filter: "genre:Comedy" },
  { title: "Drama", filter: "genre:Drama" },
  { title: "Horror", filter: "genre:Horror" },
  { title: "Sci-Fi", filter: "genre:Sci-Fi" },
  { title: "Thriller", filter: "genre:Thriller" },
];
