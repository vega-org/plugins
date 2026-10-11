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
    const token = ((await kvStore.get("token")) || "").trim();

    const seasonRatingKey = url;
    const res = await axios.get(`${serverUrl}/library/metadata/${seasonRatingKey}/children`, {
      headers: {
        Accept: "application/json",
        "X-Plex-Token": token,
      },
      timeout: 15000,
    });

    const episodes = res.data?.MediaContainer?.Metadata || [];
    return episodes.map((ep: any) => ({
      title: ep.index !== undefined ? `Episode ${ep.index} - ${ep.title}` : ep.title,
      link: String(ep.ratingKey),
    }));
  } catch (err: any) {
    throwProviderError("Plex", "getEpisodes", err);
  }
};
