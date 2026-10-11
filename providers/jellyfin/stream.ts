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
    const apiKey = ((await kvStore.get("apiKey")) || "").trim();
    const playbackMode = (await kvStore.get("playbackMode")) || "both";

    if (!serverUrl || !apiKey) {
      return [];
    }

    const itemId = link;
    const streams: Stream[] = [];

    // Direct Play Stream (Original file, no server transcoding load)
    const directUrl = `${serverUrl}/Videos/${itemId}/stream?static=true&api_key=${apiKey}`;
    // HLS Stream (Transcoded by Jellyfin/Emby for smooth playback if needed)
    const hlsUrl = `${serverUrl}/Videos/${itemId}/master.m3u8?api_key=${apiKey}&VideoCodec=h264&AudioCodec=aac`;

    if (playbackMode === "direct" || playbackMode === "both") {
      streams.push({
        server: "Jellyfin Direct Play (Original)",
        link: directUrl,
        type: "mkv",
        quality: "Original",
      });
    }

    if (playbackMode === "transcode" || playbackMode === "both") {
      streams.push({
        server: "Jellyfin HLS Transcode",
        link: hlsUrl,
        type: "m3u8",
        quality: "Auto",
      });
    }

    return streams;
  } catch (err: any) {
    throwProviderError("Jellyfin", "getStream", err);
  }
};
