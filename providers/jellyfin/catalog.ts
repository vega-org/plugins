import { Catalog } from "../types";

export const catalog: Catalog[] = [
  { title: "Latest Movies", filter: "latest-movies" },
  { title: "All Movies", filter: "all-movies" },
  { title: "Latest TV Shows", filter: "latest-shows" },
  { title: "All TV Shows", filter: "all-shows" },
  { title: "Resume Watching", filter: "resume" },
  { title: "Favorites", filter: "favorites" },
];

export const genres: Catalog[] = [
  { title: "Action", filter: "genre:Action" },
  { title: "Animation", filter: "genre:Animation" },
  { title: "Comedy", filter: "genre:Comedy" },
  { title: "Drama", filter: "genre:Drama" },
  { title: "Horror", filter: "genre:Horror" },
  { title: "Sci-Fi", filter: "genre:Science Fiction" },
  { title: "Thriller", filter: "genre:Thriller" },
];
