import { Info, ProviderContext, LinkList } from "../types";
import { throwProviderError } from "../providerErrors";

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  const { axios, kvStore } = providerContext;
  try {
    const serverUrl = ((await kvStore.get("serverUrl")) || "").trim().replace(/\/+$/, "");
    const apiKey = ((await kvStore.get("apiKey")) || "").trim();
    const userId = ((await kvStore.get("userId")) || "").trim();

    if (!serverUrl || !apiKey || link === "CONFIGURE_SETTINGS") {
      return {
        title: "Setup Required",
        synopsis: "Open Vega Provider Manager settings to enter your personal Jellyfin/Emby server address and API key.",
        image: "https://cdn.jsdelivr.net/gh/Zenda-Cross/vega-providers@main/assets/jellyfin.png",
        type: "movie",
        linkList: [],
      };
    }

    const itemId = link;
    const res = await axios.get(`${serverUrl}/Users/${userId}/Items/${itemId}`, {
      params: { api_key: apiKey },
      headers: { "X-Emby-Token": apiKey },
      timeout: 15000,
    });

    const item = res.data;
    const title = item.Name + (item.ProductionYear ? ` (${item.ProductionYear})` : "");
    const synopsis = item.Overview || "No overview available from Jellyfin server.";
    const isSeries = item.Type === "Series";
    const type: "movie" | "series" = isSeries ? "series" : "movie";
    const imdbId = item.ProviderIds?.Imdb || "";
    const image = item.ImageTags?.Primary
      ? `${serverUrl}/Items/${itemId}/Images/Primary?fillWidth=800&api_key=${apiKey}`
      : "";

    const linkList: LinkList[] = [];

    if (isSeries) {
      // Fetch seasons
      const seasonsRes = await axios.get(`${serverUrl}/Shows/${itemId}/Seasons`, {
        params: { api_key: apiKey, userId },
        headers: { "X-Emby-Token": apiKey },
        timeout: 15000,
      });

      const seasons = seasonsRes.data?.Items || [];
      for (const season of seasons) {
        linkList.push({
          title: season.Name || `Season ${season.IndexNumber || 1}`,
          episodesLink: `${itemId}:${season.Id}`,
        });
      }
    } else {
      // Movie
      const container = item.Container?.toUpperCase() || "Original";
      linkList.push({
        title: item.Name,
        quality: container,
        directLinks: [
          {
            title: `Direct Play (${container})`,
            link: itemId,
            type: "movie",
          },
        ],
      });
    }

    return {
      title,
      synopsis,
      image,
      imdbId,
      type,
      tags: item.Genres || [],
      rating: item.CommunityRating ? item.CommunityRating.toFixed(1) : undefined,
      linkList,
    };
  } catch (err: any) {
    throwProviderError("Jellyfin", "getMeta", err);
  }
};
