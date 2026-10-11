import { ProviderContext, SettingsField } from "../types";

export const getSettingsSchema = async function ({
  providerContext,
}: {
  providerContext: ProviderContext;
}): Promise<SettingsField[]> {
  return [
    {
      key: "serverUrl",
      type: "text",
      label: "Plex Media Server URL",
      placeholder: "http://192.168.1.100:32400 or https://plex.domain.com",
      defaultValue: "",
      description: "Direct IP:Port or custom domain of your Plex Media Server",
    },
    {
      key: "token",
      type: "text",
      label: "X-Plex-Token",
      placeholder: "e.g. sK_9x... (Find in Plex Web XML or Account)",
      defaultValue: "",
      description: "Plex authentication token",
    },
    {
      key: "playbackMode",
      type: "select",
      label: "Streaming Playback Mode",
      description: "Direct Play original file or HLS transcode",
      options: [
        { label: "Direct Play (Original)", value: "direct" },
        { label: "Transcode (HLS Stream)", value: "transcode" },
        { label: "Both (Show All Options)", value: "both" },
      ],
      defaultValue: "both",
    },
  ];
};
