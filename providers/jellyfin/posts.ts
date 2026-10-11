import { Post, ProviderContext } from "../types";
import { throwProviderError } from "../providerErrors";

interface JellyfinItem {
  Id: string;
  Name: string;
  Type: "Movie" | "Series" | "Episode" | string;
  ProductionYear?: number;
  CommunityRating?: number;
  Overview?: string;
  ImageTags?: {
    Primary?: string;
    Thumb?: string;
  };
}

async function getAuthDetails(kvStore: any, axios: any) {
  const serverUrl = ((await kvStore.get("serverUrl")) || "").trim().replace(/\/+$/, "");
  const apiKey = ((await kvStore.get("apiKey")) || "").trim();
  let userId = ((await kvStore.get("userId")) || "").trim();

  if (!serverUrl || !apiKey) {
    return null;
  }

  // Auto-fetch userId if not configured
  if (!userId) {
    try {
      const res = await axios.get(`${serverUrl}/Users`, {
        headers: { "X-Emby-Token": apiKey },
        timeout: 8000,
      });
      if (Array.isArray(res.data) && res.data.length > 0) {
        userId = res.data[0].Id;
        await kvStore.set("userId", userId);
      }
    } catch {}
  }

  return { serverUrl, apiKey, userId };
}

function itemToPost(item: JellyfinItem, serverUrl: string, apiKey: string): Post {
  const year = item.ProductionYear ? ` (${item.ProductionYear})` : "";
  const rating = item.CommunityRating ? `${item.CommunityRating.toFixed(1)}★` : undefined;
  const image = item.ImageTags?.Primary
    ? `${serverUrl}/Items/${item.Id}/Images/Primary?fillWidth=400&quality=85&api_key=${apiKey}`
    : "";

  return {
    title: `${item.Name}${year}`,
    link: item.Id,
    image,
    tag: rating || (item.Type === "Series" ? "TV Series" : "Movie"),
    borderRadius: 8,
  };
}

const CONFIG_PROMPT_POST: Post = {
  title: "Please configure Jellyfin Server URL & API Key in Provider Settings",
  link: "CONFIGURE_SETTINGS",
  image: "https://cdn.jsdelivr.net/gh/Zenda-Cross/vega-providers@main/assets/jellyfin.png",
  tag: "Setup Required",
  borderRadius: 8,
};

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
    const auth = await getAuthDetails(kvStore, axios);
    if (!auth) {
      return [CONFIG_PROMPT_POST];
    }
    const { serverUrl, apiKey, userId } = auth;
    const limit = 24;
    const startIndex = (page - 1) * limit;

    let endpoint = `${serverUrl}/Users/${userId}/Items`;
    const params: any = {
      api_key: apiKey,
      Recursive: true,
      StartIndex: startIndex,
      Limit: limit,
      Fields: "PrimaryImageAspectRatio,ProductionYear,CommunityRating",
    };

    if (filter === "latest-movies") {
      endpoint = `${serverUrl}/Users/${userId}/Items/Latest`;
      params.IncludeItemTypes = "Movie";
    } else if (filter === "latest-shows") {
      endpoint = `${serverUrl}/Users/${userId}/Items/Latest`;
      params.IncludeItemTypes = "Series";
    } else if (filter === "all-movies") {
      params.IncludeItemTypes = "Movie";
      params.SortBy = "SortName";
      params.SortOrder = "Ascending";
    } else if (filter === "all-shows") {
      params.IncludeItemTypes = "Series";
      params.SortBy = "SortName";
      params.SortOrder = "Ascending";
    } else if (filter === "resume") {
      endpoint = `${serverUrl}/Users/${userId}/Items/Resume`;
    } else if (filter === "favorites") {
      params.Filters = "IsFavorite";
      params.IncludeItemTypes = "Movie,Series";
    } else if (filter.startsWith("genre:")) {
      const genre = filter.split(":")[1];
      params.Genres = genre;
      params.IncludeItemTypes = "Movie,Series";
    } else {
      params.IncludeItemTypes = "Movie,Series";
      params.SortBy = "DateCreated";
      params.SortOrder = "Descending";
    }

    const res = await axios.get(endpoint, {
      params,
      headers: { "X-Emby-Token": apiKey },
      timeout: 15000,
    });

    const items: JellyfinItem[] = Array.isArray(res.data) ? res.data : res.data?.Items || [];
    return items.map((i) => itemToPost(i, serverUrl, apiKey));
  } catch (err: any) {
    throwProviderError("Jellyfin", "getPosts", err);
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
    const auth = await getAuthDetails(kvStore, axios);
    if (!auth) {
      return [CONFIG_PROMPT_POST];
    }
    const { serverUrl, apiKey, userId } = auth;
    const limit = 30;
    const startIndex = (page - 1) * limit;

    const res = await axios.get(`${serverUrl}/Users/${userId}/Items`, {
      params: {
        api_key: apiKey,
        SearchTerm: searchQuery,
        IncludeItemTypes: "Movie,Series",
        Recursive: true,
        StartIndex: startIndex,
        Limit: limit,
        Fields: "ProductionYear,CommunityRating",
      },
      headers: { "X-Emby-Token": apiKey },
      timeout: 15000,
    });

    const items: JellyfinItem[] = res.data?.Items || [];
    return items.map((i) => itemToPost(i, serverUrl, apiKey));
  } catch (err: any) {
    throwProviderError("Jellyfin", "getSearchPosts", err);
  }
};
