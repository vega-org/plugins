import { Post, ProviderContext } from "../types";
import { throwProviderError } from "../providerErrors";

const VIDEO_EXTENSIONS = new Set(["mp4", "mkv", "avi", "mov", "webm", "m4v", "ts", "flv"]);

const CONFIG_PROMPT_POST: Post = {
  title: "Please configure WebDAV Server URL in Provider Settings",
  link: "CONFIGURE_SETTINGS",
  image: "https://cdn.jsdelivr.net/gh/vega-org/plugins@main/assets/webdav.png",
  tag: "Setup Required",
  borderRadius: 8,
};

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function cleanFilename(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "") // remove extension
    .replace(/[._]/g, " ")
    .trim();
}

export const getPosts = async function ({
  filter,
  page = 1,
  providerContext,
}: {
  filter: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  const { axios, cheerio, kvStore } = providerContext;
  try {
    const serverUrl = ((await kvStore.get("serverUrl")) || "").trim().replace(/\/+$/, "");
    const username = ((await kvStore.get("username")) || "").trim();
    const password = ((await kvStore.get("password")) || "").trim();
    const baseFolder = ((await kvStore.get("baseFolder")) || "/").trim();

    if (!serverUrl) return [CONFIG_PROMPT_POST];

    let targetPath = filter && filter.startsWith("/") ? filter : `/${filter || ""}`;
    if (targetPath === "/" && baseFolder !== "/") {
      targetPath = baseFolder;
    }

    const headers: Record<string, string> = {
      Depth: "1",
      Accept: "*/*",
    };

    if (username || password) {
      const token = Buffer.from(`${username}:${password}`).toString("base64");
      headers["Authorization"] = `Basic ${token}`;
    }

    const fullUrl = new URL(targetPath.startsWith("/") ? targetPath.slice(1) : targetPath, `${serverUrl}/`).href;

    let resData = "";
    try {
      const res = await axios({
        method: "PROPFIND",
        url: fullUrl,
        headers,
        timeout: 15000,
      });
      resData = res.data;
    } catch (e: any) {
      // Some servers only accept GET or return standard directory listing
      const getRes = await axios.get(fullUrl, { headers, timeout: 15000 });
      resData = getRes.data;
    }

    const $ = cheerio.load(resData, { xmlMode: true });
    const posts: Post[] = [];

    // Parse WebDAV XML PROPFIND response
    $("response, d\\:response, D\\:response").each((_, el) => {
      const href = $(el).find("href, d\\:href, D\\:href").first().text().trim();
      if (!href) return;

      const isCollection = $(el).find("collection, d\\:collection, D\\:collection").length > 0;
      const contentLengthStr = $(el).find("getcontentlength, d\\:getcontentlength, D\\:getcontentlength").first().text().trim();
      const contentLength = parseInt(contentLengthStr, 10) || 0;

      // Extract filename from href
      const decodedHref = decodeURIComponent(href);
      const parts = decodedHref.split("/").filter(Boolean);
      const filename = parts.pop() || "";
      const ext = filename.split(".").pop()?.toLowerCase() || "";

      // Skip the folder itself (which is returned as the first response element)
      if (isCollection) {
        return;
      }

      if (VIDEO_EXTENSIONS.has(ext)) {
        const sizeTag = formatBytes(contentLength);
        posts.push({
          title: cleanFilename(filename),
          link: href,
          image: "https://cdn.jsdelivr.net/gh/vega-org/plugins@main/assets/video_placeholder.png",
          tag: sizeTag ? `${ext.toUpperCase()} • ${sizeTag}` : ext.toUpperCase(),
          borderRadius: 8,
        });
      }
    });

    if (posts.length === 0) {
      posts.push({
        title: `No video files found in ${targetPath}`,
        link: "EMPTY",
        image: "",
        tag: "Folder Empty",
      });
    }

    return posts;
  } catch (err: any) {
    throwProviderError("WebDAV", "getPosts", err);
  }
};

export const getSearchPosts = async function ({
  searchQuery,
  page = 1,
  providerContext,
}: {
  searchQuery: string;
  page: number;
  providerValue: string;
  signal: AbortSignal;
  providerContext: ProviderContext;
}): Promise<Post[]> {
  try {
    const allPosts = await getPosts({
      filter: "/",
      page: 1,
      providerValue: "webdav",
      signal: {} as any,
      providerContext,
    });

    const q = searchQuery.toLowerCase().trim();
    return allPosts.filter((p) => p.title.toLowerCase().includes(q));
  } catch (err: any) {
    throwProviderError("WebDAV", "getSearchPosts", err);
  }
};
