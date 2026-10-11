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
      label: "Jellyfin / Emby Server URL",
      placeholder: "http://192.168.1.100:8096 or https://jellyfin.domain.com",
      defaultValue: "",
      description: "Base address of your personal Jellyfin or Emby instance",
    },
    {
      key: "apiKey",
      type: "text",
      label: "API Key or Access Token",
      placeholder: "e.g. 4f9b2d8e...",
      defaultValue: "",
      description: "Generated from Jellyfin Dashboard -> API Keys or user token",
    },
    {
      key: "userId",
      type: "text",
      label: "User ID (Optional)",
      placeholder: "Leave empty to auto-detect default user",
      defaultValue: "",
      description: "Optional specific Jellyfin User ID",
    },
    {
      key: "playbackMode",
      type: "select",
      label: "Playback Stream Type",
      description: "Prioritize Direct Play (original file) or HLS stream",
      options: [
        { label: "Direct Play (Original Quality)", value: "direct" },
        { label: "Transcode (HLS Stream)", value: "transcode" },
        { label: "Both (Show All Options)", value: "both" },
      ],
      defaultValue: "both",
    },
  ];
};
