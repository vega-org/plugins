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
    const token = ((await kvStore.get("token")) || "").trim();

    if (!serverUrl || !token || link === "CONFIGURE_SETTINGS") {
      return {
        title: "Setup Required",
        synopsis: "Open Vega Provider Manager settings to enter your personal Plex Server URL and X-Plex-Token.",
        image: "https://cdn.jsdelivr.net/gh/Zenda-Cross/vega-providers@main/assets/plex.png",
        type: "movie",
        linkList: [],
      };
    }

    const ratingKey = link;
    const headers = {
      Accept: "application/json",
      "X-Plex-Token": token,
    };

    const res = await axios.get(`${serverUrl}/library/metadata/${ratingKey}`, {
      headers,
      timeout: 15000,
    });

    const item = res.data?.MediaContainer?.Metadata?.[0] || {};
    const title = item.title + (item.year ? ` (${item.year})` : "");
    const synopsis = item.summary || "No overview available from Plex Media Server.";
    const isSeries = item.type === "show";
    const type: "movie" | "series" = isSeries ? "series" : "movie";
    const image = item.thumb ? `${serverUrl}${item.thumb}?X-Plex-Token=${token}` : "";

    // Extract IMDb ID if present in Guids
    let imdbId = "";
    if (Array.isArray(item.Guid)) {
      const imdbEntry = item.Guid.find((g: any) => g.id?.startsWith("imdb://"));
      if (imdbEntry) {
        imdbId = imdbEntry.id.replace("imdb://", "");
      }
    }

    const linkList: LinkList[] = [];

    if (isSeries) {
      // Fetch seasons
      const childrenRes = await axios.get(`${serverUrl}/library/metadata/${ratingKey}/children`, {
        headers,
        timeout: 15000,
      });

      const seasons = childrenRes.data?.MediaContainer?.Metadata || [];
      for (const season of seasons) {
        linkList.push({
          title: season.title || `Season ${season.index || 1}`,
          episodesLink: String(season.ratingKey),
        });
      }
    } else {
      // Movie
      const media = item.Media?.[0];
      const quality = media?.videoResolution ? `${media.videoResolution}p` : "Direct Play";
      linkList.push({
        title: item.title,
        quality,
        directLinks: [
          {
            title: `Play (${quality})`,
            link: String(ratingKey),
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
      tags: (item.Genre || []).map((g: any) => g.tag),
      rating: item.rating ? item.rating.toFixed(1) : undefined,
      linkList,
    };
  } catch (err: any) {
    throwProviderError("Plex", "getMeta", err);
  }
};
