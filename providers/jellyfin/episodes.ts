import { EpisodeLink, ProviderContext } from "../types";
import { throwProviderError } from "../providerErrors";

export const getEpisodes = async function ({
  url,
  providerContext,
}: {
  url: string;
  providerContext: ProviderContext;
}): Promise<EpisodeLink[]> {
  const { axios, kvStore } = providerContext;
  try {
    const serverUrl = ((await kvStore.get("serverUrl")) || "").trim().replace(/\/+$/, "");
    const apiKey = ((await kvStore.get("apiKey")) || "").trim();
    const userId = ((await kvStore.get("userId")) || "").trim();

    const [showId, seasonId] = url.split(":");
    const res = await axios.get(`${serverUrl}/Shows/${showId}/Episodes`, {
      params: {
        seasonId,
        userId,
        api_key: apiKey,
        Fields: "IndexNumber,Overview",
      },
      headers: { "X-Emby-Token": apiKey },
      timeout: 15000,
    });

    const episodes = res.data?.Items || [];
    return episodes.map((ep: any) => ({
      title: ep.IndexNumber ? `Episode ${ep.IndexNumber} - ${ep.Name}` : ep.Name,
      link: ep.Id,
    }));
  } catch (err: any) {
    throwProviderError("Jellyfin", "getEpisodes", err);
  }
};
