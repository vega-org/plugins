import { ProviderContext, SettingsField } from "../types";

export const getSettingsSchema = async function ({
  providerContext,
}: {
  providerContext: ProviderContext;
}): Promise<SettingsField[]> {
  return [
    {
      key: "preferredQuality",
      type: "select",
      label: "Preferred Video Quality",
      description: "Default playback quality for Internet Archive classic movies",
      options: [
        { label: "Auto (Best Available)", value: "auto" },
        { label: "High (720p / 1080p)", value: "720" },
        { label: "Standard (480p)", value: "480" },
        { label: "Low (240p / 360p)", value: "360" },
      ],
      defaultValue: "auto",
    },
    {
      key: "autoSubtitles",
      type: "toggle",
      label: "Auto-enable Subtitles",
      description: "Attach English subtitles and captions when available",
      defaultValue: true,
    },
  ];
};
