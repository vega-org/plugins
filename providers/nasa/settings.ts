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
      label: "Preferred Quality",
      description: "Default resolution for NASA mission videos",
      options: [
        { label: "Auto (Highest Available)", value: "auto" },
        { label: "4K / Original", value: "2160" },
        { label: "1080p (Full HD)", value: "1080" },
        { label: "720p (HD)", value: "720" },
        { label: "480p (Standard)", value: "480" },
      ],
      defaultValue: "auto",
    },
  ];
};
