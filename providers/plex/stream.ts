import { Stream, ProviderContext } from "../types";
import { throwProviderError } from "../providerErrors";

export const getStream = async function ({
  link,
  providerContext,
}: {
  link: string;
  type: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
  isDownload?: boolean;
}): Promise<Stream[]> {
  const { axios, kvStore } = providerContext;
  try {
    const serverUrl = ((await kvStore.get("serverUrl")) || "").trim().replace(/\/+$/, "");
    const token = ((await kvStore.get("token")) || "").trim();
    const playbackMode = (await kvStore.get("playbackMode")) || "both";

    if (!serverUrl || !token) return [];

    const ratingKey = link;
    const res = await axios.get(`${serverUrl}/library/metadata/${ratingKey}`, {
      headers: {
        Accept: "application/json",
        "X-Plex-Token": token,
      },
      timeout: 15000,
    });

    const item = res.data?.MediaContainer?.Metadata?.[0];
    const media = item?.Media?.[0];
    const part = media?.Part?.[0];
    const container = media?.container || "mkv";

    const streams: Stream[] = [];

    if (part?.key) {
      // Direct Play Stream (Original file path on Plex Server)
      const directUrl = `${serverUrl}${part.key}?download=0&X-Plex-Token=${token}`;
      if (playbackMode === "direct" || playbackMode === "both") {
        streams.push({
          server: "Plex Direct Play (Original)",
          link: directUrl,
          type: container,
          quality: media.videoResolution ? `${media.videoResolution}p` : "Original",
        });
      }
    }

    // Universal HLS Transcode Stream
    const transcodeUrl = `${serverUrl}/video/:/transcode/universal/start.m3u8?path=${encodeURIComponent(
      "/library/metadata/" + ratingKey
    )}&mediaIndex=0&partIndex=0&protocol=hls&fastSeek=1&directPlay=1&directStream=1&X-Plex-Token=${token}`;

    if (playbackMode === "transcode" || playbackMode === "both") {
      streams.push({
        server: "Plex HLS Transcode",
        link: transcodeUrl,
        type: "m3u8",
        quality: "Auto",
      });
    }

    return streams;
  } catch (err: any) {
    throwProviderError("Plex", "getStream", err);
  }
};
