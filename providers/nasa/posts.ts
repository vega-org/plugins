import { Post, ProviderContext } from "../types";
import { throwProviderError } from "../providerErrors";

interface NasaSearchItem {
  href: string;
  data: Array<{
    center?: string;
    title: string;
    nasa_id: string;
    date_created?: string;
    keywords?: string[];
    media_type: string;
    description?: string;
  }>;
  links?: Array<{
    href: string;
    rel: string;
    render?: string;
  }>;
}

function parseNasaItems(items: NasaSearchItem[]): Post[] {
  const posts: Post[] = [];
  for (const item of items) {
    const data = item.data?.[0];
    if (!data || data.media_type !== "video") continue;

    // Find thumbnail image
    const thumbLink = item.links?.find(
      (l) => l.render === "image" || l.rel === "preview" || l.href.includes("thumb") || l.href.includes("small")
    );
    const image = thumbLink?.href || item.links?.[0]?.href || "";

    const year = data.date_created ? data.date_created.slice(0, 4) : "";
    const center = data.center ? data.center.toUpperCase() : "NASA";

    posts.push({
      title: data.title,
      link: data.nasa_id,
      image,
      tag: year ? `${year} • ${center}` : center,
      borderRadius: 8,
    });
  }
  return posts;
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
  const { axios } = providerContext;
  try {
    const query = filter && filter.trim().length > 0 ? filter.trim() : "launch";
    const res = await axios.get("https://images-api.nasa.gov/search", {
      params: {
        media_type: "video",
        q: query,
        page: page || 1,
      },
      timeout: 15000,
    });

    const items: NasaSearchItem[] = res.data?.collection?.items || [];
    return parseNasaItems(items);
  } catch (err: any) {
    throwProviderError("NASA", "getPosts", err);
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
  const { axios } = providerContext;
  try {
    const query = searchQuery && searchQuery.trim().length > 0 ? searchQuery.trim() : "nasa";
    const res = await axios.get("https://images-api.nasa.gov/search", {
      params: {
        media_type: "video",
        q: query,
        page: page || 1,
      },
      timeout: 15000,
    });

    const items: NasaSearchItem[] = res.data?.collection?.items || [];
    return parseNasaItems(items);
  } catch (err: any) {
    throwProviderError("NASA", "getSearchPosts", err);
  }
};
