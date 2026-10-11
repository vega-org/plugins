import { Info, ProviderContext, LinkList } from "../types";
import { throwProviderError } from "../providerErrors";

function formatQuality(url: string): string {
  if (url.includes("~orig.mp4")) return "4K (Original)";
  if (url.includes("~large.mp4") || url.includes("1080p")) return "1080p";
  if (url.includes("~medium.mp4") || url.includes("720p")) return "720p";
  if (url.includes("~small.mp4") || url.includes("480p")) return "480p";
  if (url.includes("~mobile.mp4") || url.includes("360p")) return "360p";
  return "HD";
}

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  const { axios } = providerContext;
  try {
    const nasaId = link;

    // Fetch video details and video files in parallel
    const [searchRes, assetRes] = await Promise.all([
      axios.get("https://images-api.nasa.gov/search", {
        params: { nasa_id: nasaId },
        timeout: 15000,
      }),
      axios.get(`https://images-api.nasa.gov/asset/${encodeURIComponent(nasaId)}`, {
        timeout: 15000,
      }),
    ]);

    const item = searchRes.data?.collection?.items?.[0];
    const data = item?.data?.[0];
    const title = data?.title || nasaId;
    const synopsis = data?.description || "Official NASA Mission Video Archive.";
    const keywords = data?.keywords || ["NASA", "Space"];

    // Find highest quality preview image
    const thumbLink = item?.links?.find((l: any) => l.render === "image" || l.rel === "preview");
    let image = thumbLink?.href || "";

    // Parse video stream URLs
    const assetItems: Array<{ href: string }> = assetRes.data?.collection?.items || [];
    const mp4Links = assetItems
      .map((i) => i.href)
      .filter((h) => h && typeof h === "string" && h.endsWith(".mp4"));

    // Deduplicate
    const uniqueMp4 = Array.from(new Set(mp4Links));

    // Convert http to https for playback
    const secureLinks = uniqueMp4.map((url) =>
      url.startsWith("http://") ? url.replace("http://", "https://") : url
    );

    const linkList: LinkList[] = [];
    for (const videoUrl of secureLinks) {
      const q = formatQuality(videoUrl);
      linkList.push({
        title: `NASA Video - ${q}`,
        quality: q,
        directLinks: [
          {
            title: `Play (${q})`,
            link: videoUrl,
            type: "movie",
          },
        ],
      });
    }

    if (linkList.length === 0 && secureLinks.length > 0) {
      linkList.push({
        title: "NASA Video",
        directLinks: [
          {
            title: "Play",
            link: secureLinks[0],
            type: "movie",
          },
        ],
      });
    }

    return {
      title,
      synopsis,
      image,
      type: "movie",
      tags: keywords.slice(0, 5),
      linkList,
      webUrl: `https://images.nasa.gov/details/${encodeURIComponent(nasaId)}`,
    };
  } catch (err: any) {
    throwProviderError("NASA", "getMeta", err);
  }
};
