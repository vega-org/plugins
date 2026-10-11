import { Info, ProviderContext, LinkList } from "../types";
import { throwProviderError } from "../providerErrors";

function detectQuality(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("2160p") || lower.includes("4k")) return "4K (2160p)";
  if (lower.includes("1080p")) return "1080p";
  if (lower.includes("720p")) return "720p";
  if (lower.includes("480p")) return "480p";
  return "Direct";
}

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  try {
    if (link === "CONFIGURE_SETTINGS" || link === "EMPTY") {
      return {
        title: "WebDAV Network Share",
        synopsis: "Configure your WebDAV or local network storage address in Vega Provider Settings to stream video files.",
        image: "https://cdn.jsdelivr.net/gh/Zenda-Cross/vega-providers@main/assets/webdav.png",
        type: "movie",
        linkList: [],
      };
    }

    const decodedHref = decodeURIComponent(link);
    const filename = decodedHref.split("/").pop() || "Video";
    const quality = detectQuality(filename);
    const cleanTitle = filename.replace(/\.[^/.]+$/, "").replace(/[._]/g, " ").trim();

    const linkList: LinkList[] = [
      {
        title: cleanTitle,
        quality,
        directLinks: [
          {
            title: `Stream (${quality})`,
            link,
            type: "movie",
          },
        ],
      },
    ];

    return {
      title: cleanTitle,
      synopsis: `File: ${filename}\nPath: ${decodedHref}`,
      image: "https://cdn.jsdelivr.net/gh/Zenda-Cross/vega-providers@main/assets/video_placeholder.png",
      type: "movie",
      linkList,
    };
  } catch (err: any) {
    throwProviderError("WebDAV", "getMeta", err);
  }
};
