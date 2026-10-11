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
  try {
    const streamUrl = link.startsWith("http://")
      ? link.replace("http://", "https://")
      : link;

    let quality = "1080";
    if (streamUrl.includes("~orig.mp4")) quality = "2160";
    else if (streamUrl.includes("~large.mp4") || streamUrl.includes("1080p")) quality = "1080";
    else if (streamUrl.includes("~medium.mp4") || streamUrl.includes("720p")) quality = "720";
    else if (streamUrl.includes("~small.mp4") || streamUrl.includes("480p")) quality = "480";
    else if (streamUrl.includes("~mobile.mp4") || streamUrl.includes("360p")) quality = "360";

    return [
      {
        server: "NASA Official CDN (Direct)",
        link: streamUrl,
        type: "mp4",
        quality,
      },
    ];
  } catch (err: any) {
    throwProviderError("NASA", "getStream", err);
  }
};
