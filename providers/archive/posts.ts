import { Post, ProviderContext } from "../types";

const LEGAL_COLLECTIONS =
  "collection:(feature_films OR Film_Noir OR silent_films OR animationandcartoons OR classic_tv)";
const STREAMABLE_FORMATS =
  'format:(h.264 OR "512Kb MPEG4" OR MPEG4 OR "Ogg Video" OR "WebM")';

export const getPosts = async function ({
  filter,
  page,
  providerContext,
}: {
  filter: string;
  page: number;
  providerValue?: string;
  signal?: any;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const { axios } = providerContext;

  try {
    let query = "collection:(feature_films)";
    let sort = "downloads desc";

    if (filter) {
      const parts = filter.split("&sort=");
      query = parts[0];
      if (parts[1]) {
        sort = parts[1] === "publicdate" ? "publicdate desc" : "downloads desc";
      }
    }

    // Ensure we only query legal collections with streamable video formats
    const fullQuery = `(${query}) AND mediatype:(movies) AND ${STREAMABLE_FORMATS}`;

    const res = await axios.get("https://archive.org/advancedsearch.php", {
      params: {
        q: fullQuery,
        "fl[]": ["identifier", "title", "description", "year", "downloads"],
        "sort[]": sort,
        rows: 30,
        page: page || 1,
        output: "json",
      },
      headers: {
        Accept: "application/json",
      },
    });

    const docs = res.data?.response?.docs || [];
    const posts: Post[] = [];

    for (const doc of docs) {
      if (!doc.identifier) continue;

      posts.push({
        title: doc.title || doc.identifier,
        link: doc.identifier,
        image: `https://archive.org/services/img/${doc.identifier}`,
        tag: doc.year ? `${doc.year}` : undefined,
      });
    }

    return posts;
  } catch (err) {
    console.error("Archive getPosts error:", err);
    return [];
  }
};

export const getSearchPosts = async function ({
  searchQuery,
  page,
  providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue?: string;
  signal?: any;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const { axios } = providerContext;

  try {
    const cleanQuery = searchQuery.replace(/[()[\]{}<>"']/g, " ").trim();
    if (!cleanQuery) return [];

    const words = cleanQuery.split(/\s+/).filter(Boolean);
    const wordsAnd = words.join(" AND ");
    const searchExpr = `(title:("${cleanQuery}") OR title:(${wordsAnd}))`;

    // Strictly limit search to verified legal public domain collections
    const fullQuery = `${LEGAL_COLLECTIONS} AND mediatype:(movies) AND ${STREAMABLE_FORMATS} AND ${searchExpr}`;

    const res = await axios.get("https://archive.org/advancedsearch.php", {
      params: {
        q: fullQuery,
        "fl[]": ["identifier", "title", "year", "downloads"],
        "sort[]": "downloads desc",
        rows: 30,
        page: page || 1,
        output: "json",
      },
      headers: {
        Accept: "application/json",
      },
    });

    const docs = res.data?.response?.docs || [];
    const posts: Post[] = [];

    for (const doc of docs) {
      if (!doc.identifier) continue;

      posts.push({
        title: doc.title || doc.identifier,
        link: doc.identifier,
        image: `https://archive.org/services/img/${doc.identifier}`,
        tag: doc.year ? `${doc.year}` : undefined,
      });
    }

    return posts;
  } catch (err) {
    console.error("Archive getSearchPosts error:", err);
    return [];
  }
};
