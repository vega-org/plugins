import { Info, ProviderContext } from "../types";

export const getMeta = async function ({
  link,
  providerContext,
}: {
  link: string;
  providerValue?: string;
  providerContext: ProviderContext;
}): Promise<Info> {
  const { axios } = providerContext;

  try {
    const res = await axios.get(`https://archive.org/metadata/${link}`, {
      headers: {
        Accept: "application/json",
      },
    });

    const metadata = res.data?.metadata || {};
    const files = res.data?.files || [];

    const rawTitle = metadata.title || link;
    let synopsis = metadata.description || "";
    // Clean HTML tags from synopsis
    synopsis = synopsis.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    // Extract IMDb ID if present in metadata or description
    let imdbId: string | undefined = undefined;
    if (metadata.imdb_id) {
      imdbId = metadata.imdb_id;
    } else {
      const match = (metadata.description || "").match(/tt\d{7,8}/i);
      if (match) {
        imdbId = match[0];
      }
    }

    // Determine type (series if classic_tv, else movie)
    const isTv =
      metadata.collection === "classic_tv" ||
      (Array.isArray(metadata.collection) &&
        metadata.collection.includes("classic_tv"));
    const type: "movie" | "series" = isTv ? "series" : "movie";

    // Find best video resolution among files
    let bestQuality = "Standard";
    for (const f of files) {
      const h = parseInt(f.height || "0", 10);
      if (h >= 1080) {
        bestQuality = "1080p";
        break;
      } else if (h >= 720) {
        bestQuality = "720p";
      } else if (h >= 480 && bestQuality !== "720p") {
        bestQuality = "480p";
      }
    }

    return {
      title: rawTitle,
      synopsis,
      image: `https://archive.org/services/img/${link}`,
      imdbId,
      type,
      linkList: [
        {
          title: "Public Domain Feature",
          quality: bestQuality,
          directLinks: [
            {
              title: "Watch Movie",
              link: link,
              type: "movie",
            },
          ],
        },
      ],
    };
  } catch (err) {
    console.error("Archive getMeta error:", err);
    return {
      title: link,
      synopsis: "Internet Archive classic film.",
      image: `https://archive.org/services/img/${link}`,
      type: "movie",
      linkList: [
        {
          title: "Public Domain Feature",
          directLinks: [
            {
              title: "Watch Movie",
              link: link,
              type: "movie",
            },
          ],
        },
      ],
    };
  }
};
