export const catalog = [
  {
    title: "Curated Feature Films",
    filter: "collection:(feature_films)&sort=downloads",
  },
  {
    title: "Film Noir Collection",
    filter: "collection:(Film_Noir)&sort=downloads",
  },
  {
    title: "Silent Era Masterpieces",
    filter: "collection:(silent_films)&sort=downloads",
  },
  {
    title: "Classic Animation & Cartoons",
    filter: "collection:(animationandcartoons)&sort=downloads",
  },
  {
    title: "Classic TV Shows",
    filter: "collection:(classic_tv)&sort=downloads",
  },
  {
    title: "Recently Added Classics",
    filter: "collection:(feature_films)&sort=publicdate",
  },
];

export const genres = [
  {
    title: "Horror Classics",
    filter: "collection:(feature_films) AND subject:(horror)&sort=downloads",
  },
  {
    title: "Sci-Fi & Fantasy",
    filter: "collection:(feature_films) AND subject:(science fiction OR sci-fi)&sort=downloads",
  },
  {
    title: "Comedy Classics",
    filter: "collection:(feature_films) AND subject:(comedy)&sort=downloads",
  },
  {
    title: "Westerns",
    filter: "collection:(feature_films) AND subject:(western)&sort=downloads",
  },
  {
    title: "Drama",
    filter: "collection:(feature_films) AND subject:(drama)&sort=downloads",
  },
  {
    title: "Mystery & Crime",
    filter: "collection:(feature_films) AND subject:(mystery OR crime)&sort=downloads",
  },
  {
    title: "War & History",
    filter: "collection:(feature_films) AND subject:(war OR history)&sort=downloads",
  },
];
