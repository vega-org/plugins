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
  const { kvStore } = providerContext;
  try {
    const serverUrl = ((await kvStore.get("serverUrl")) || "").trim().replace(/\/+$/, "");
    const username = ((await kvStore.get("username")) || "").trim();
    const password = ((await kvStore.get("password")) || "").trim();

    if (!serverUrl || link === "CONFIGURE_SETTINGS" || link === "EMPTY") {
      return [];
    }

    let streamUrl = link;
    if (!streamUrl.startsWith("http://") && !streamUrl.startsWith("https://")) {
      const cleanPath = streamUrl.startsWith("/") ? streamUrl.slice(1) : streamUrl;
      streamUrl = new URL(cleanPath, `${serverUrl}/`).href;
    }

    // Embed Basic Auth credentials into URL for video player streaming if configured
    if (username || password) {
      try {
        const u = new URL(streamUrl);
        u.username = encodeURIComponent(username);
        u.password = encodeURIComponent(password);
        streamUrl = u.href;
      } catch {}
    }

    const ext = streamUrl.split(".").pop()?.toLowerCase() || "mp4";

    return [
      {
        server: "WebDAV Network Stream",
        link: streamUrl,
        type: ext,
        quality: "Original",
      },
    ];
  } catch (err: any) {
    throwProviderError("WebDAV", "getStream", err);
  }
};
