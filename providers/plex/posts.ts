import { Post, ProviderContext } from "../types";
import { throwProviderError } from "../providerErrors";

interface PlexMetadata {
  ratingKey: string;
  title: string;
  type: "movie" | "show" | "episode" | string;
  year?: number;
  thumb?: string;
  rating?: number;
}

const CONFIG_PROMPT_POST: Post = {
  title: "Please configure Plex Server URL & X-Plex-Token in Provider Settings",
  link: "CONFIGURE_SETTINGS",
  image: "https://cdn.jsdelivr.net/gh/Zenda-Cross/vega-providers@main/assets/plex.png",
  tag: "Setup Required",
  borderRadius: 8,
};

async function getPlexConfig(kvStore: any) {
  const serverUrl = ((await kvStore.get("serverUrl")) || "").trim().replace(/\/+$/, "");
  const token = ((await kvStore.get("token")) || "").trim();
  if (!serverUrl || !token) return null;
  return { serverUrl, token };
}

function plexItemToPost(item: PlexMetadata, serverUrl: string, token: string): Post {
  const year = item.year ? ` (${item.year})` : "";
  const rating = item.rating ? `${item.rating.toFixed(1)}★` : undefined;
  const image = item.thumb
    ? `${serverUrl}${item.thumb}?X-Plex-Token=${token}`
    : "";

  return {
    title: `${item.title}${year}`,
    link: String(item.ratingKey),
    image,
    tag: rating || (item.type === "show" ? "TV Series" : "Movie"),
    borderRadius: 8,
  };
}

export const getPosts = async function ({
  filter,
  page = 1,
  providerContext,
}: {
  filter: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const { axios, kvStore } = providerContext;
  try {
    const config = await getPlexConfig(kvStore);
    if (!config) return [CONFIG_PROMPT_POST];
    const { serverUrl, token } = config;

    const headers = {
      Accept: "application/json",
      "X-Plex-Token": token,
    };

    // 1. Fetch library sections to locate movie and TV libraries
    const sectionsRes = await axios.get(`${serverUrl}/library/sections`, {
      headers,
      timeout: 10000,
    });
    const directories: any[] = sectionsRes.data?.MediaContainer?.Directory || [];
    const movieSections = directories.filter((d) => d.type === "movie").map((d) => d.key);
    const showSections = directories.filter((d) => d.type === "show").map((d) => d.key);

    let items: PlexMetadata[] = [];
    const limit = 25;
    const start = (page - 1) * limit;

    if (filter === "on-deck") {
      const res = await axios.get(`${serverUrl}/library/onDeck`, {
        headers,
        params: { "X-Plex-Container-Start": start, "X-Plex-Container-Size": limit },
        timeout: 15000,
      });
      items = res.data?.MediaContainer?.Metadata || [];
    } else if (filter === "recent-movies" && movieSections.length > 0) {
      const res = await axios.get(`${serverUrl}/library/sections/${movieSections[0]}/recentlyAdded`, {
        headers,
        params: { "X-Plex-Container-Start": start, "X-Plex-Container-Size": limit },
        timeout: 15000,
      });
      items = res.data?.MediaContainer?.Metadata || [];
    } else if (filter === "recent-shows" && showSections.length > 0) {
      const res = await axios.get(`${serverUrl}/library/sections/${showSections[0]}/recentlyAdded`, {
        headers,
        params: { "X-Plex-Container-Start": start, "X-Plex-Container-Size": limit },
        timeout: 15000,
      });
      items = res.data?.MediaContainer?.Metadata || [];
    } else if (filter === "all-movies" && movieSections.length > 0) {
      const res = await axios.get(`${serverUrl}/library/sections/${movieSections[0]}/all`, {
        headers,
        params: { "X-Plex-Container-Start": start, "X-Plex-Container-Size": limit, sort: "titleSort:asc" },
        timeout: 15000,
      });
      items = res.data?.MediaContainer?.Metadata || [];
    } else if (filter === "all-shows" && showSections.length > 0) {
      const res = await axios.get(`${serverUrl}/library/sections/${showSections[0]}/all`, {
        headers,
        params: { "X-Plex-Container-Start": start, "X-Plex-Container-Size": limit, sort: "titleSort:asc" },
        timeout: 15000,
      });
      items = res.data?.MediaContainer?.Metadata || [];
    } else {
      // Default: Recently added across the server
      const res = await axios.get(`${serverUrl}/library/recentlyAdded`, {
        headers,
        params: { "X-Plex-Container-Start": start, "X-Plex-Container-Size": limit },
        timeout: 15000,
      });
      items = res.data?.MediaContainer?.Metadata || [];
    }

    return items.map((i) => plexItemToPost(i, serverUrl, token));
  } catch (err: any) {
    throwProviderError("Plex", "getPosts", err);
  }
};

export const getSearchPosts = async function ({
  searchQuery,
  page = 1,
  providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const { axios, kvStore } = providerContext;
  try {
    const config = await getPlexConfig(kvStore);
    if (!config) return [CONFIG_PROMPT_POST];
    const { serverUrl, token } = config;

    const res = await axios.get(`${serverUrl}/hubs/search`, {
      params: { query: searchQuery, limit: 30 },
      headers: {
        Accept: "application/json",
        "X-Plex-Token": token,
      },
      timeout: 15000,
    });

    const hubs: any[] = res.data?.MediaContainer?.Hub || [];
    const results: PlexMetadata[] = [];
    for (const hub of hubs) {
      if (hub.type === "movie" || hub.type === "show") {
        const metadata = hub.Metadata || [];
        results.push(...metadata);
      }
    }

    return results.map((i) => plexItemToPost(i, serverUrl, token));
  } catch (err: any) {
    throwProviderError("Plex", "getSearchPosts", err);
  }
};
