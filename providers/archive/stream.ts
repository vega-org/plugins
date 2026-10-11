import { Stream, ProviderContext } from "../types";

export const getStream = async function ({
  link,
  signal,
  providerContext,
}: {
  link: string;
  type: string;
  signal: any;
  providerContext: ProviderContext;
  isDownload?: boolean;
}): Promise<Stream[]> {
  const { axios, kvStore } = providerContext;

  try {
    const res = await axios.get(`https://archive.org/metadata/${link}`, {
      headers: {
        Accept: "application/json",
      },
    });

    const files = res.data?.files || [];
    const streams: Stream[] = [];

    // 1. Gather subtitles
    const subtitles: { file: string; label: string; kind?: string }[] = [];
    for (const f of files) {
      const name = (f.name || "").toLowerCase();
      if (name.endsWith(".srt") || name.endsWith(".vtt")) {
        const subUrl = `https://archive.org/download/${link}/${encodeURIComponent(f.name)}`;
        const label = f.name.includes(".asr.")
          ? "English (Auto-Captions)"
          : "English Subtitles";
        subtitles.push({
          file: subUrl,
          label,
          kind: "subtitles",
        });
      }
    }

    // 2. Gather video streams
    interface ScoredFile {
      name: string;
      format: string;
      quality: string;
      score: number;
      type: string;
    }

    const scoredFiles: ScoredFile[] = [];

    for (const f of files) {
      const name = (f.name || "").toLowerCase();
      const format = (f.format || "").toLowerCase();

      // Only valid video files
      const isVideo =
        name.endsWith(".mp4") ||
        name.endsWith(".mkv") ||
        name.endsWith(".webm") ||
        name.endsWith(".ogv") ||
        format.includes("h.264") ||
        format.includes("mpeg4");

      if (!isVideo) continue;

      let score = 500;
      let quality = "480";
      const h = parseInt(f.height || "0", 10);

      if (h >= 1080) {
        quality = "1080";
        score = 1000;
      } else if (h >= 720) {
        quality = "720";
        score = 800;
      } else if (h >= 480) {
        quality = "480";
        score = 600;
      } else if (h >= 360) {
        quality = "360";
        score = 400;
      } else {
        if (format.includes("h.264")) {
          quality = "480";
          score = 550;
        } else if (format.includes("512kb")) {
          quality = "240";
          score = 300;
        }
      }

      // Bonus for standard MP4 container
      if (name.endsWith(".mp4")) {
        score += 50;
      }

      scoredFiles.push({
        name: f.name,
        format: f.format || "MP4",
        quality,
        score,
        type: name.endsWith(".mkv") ? "mkv" : "mp4",
      });
    }

    // Sort highest score first
    scoredFiles.sort((a, b) => b.score - a.score);

    for (const sf of scoredFiles) {
      const streamUrl = `https://archive.org/download/${link}/${encodeURIComponent(sf.name)}`;
      streams.push({
        server: `Internet Archive (${sf.quality}p ${sf.format})`,
        link: streamUrl,
        type: sf.type,
        quality: sf.quality,
        subtitles: subtitles.length > 0 ? subtitles : undefined,
      });
    }

    return streams;
  } catch (err) {
    console.error("Archive getStream error:", err);
    return [];
  }
};
