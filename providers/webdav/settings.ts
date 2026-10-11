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
      label: "WebDAV Server URL",
      placeholder: "http://192.168.1.100:8080 or https://cloud.domain.com/dav/",
      defaultValue: "",
      description: "URL of your local WebDAV share (NAS, Nextcloud, TrueNAS, rclone)",
    },
    {
      key: "username",
      type: "text",
      label: "Username",
      placeholder: "admin",
      defaultValue: "",
      description: "WebDAV HTTP Basic Auth username (if required)",
    },
    {
      key: "password",
      type: "text",
      label: "Password",
      placeholder: "••••••••",
      defaultValue: "",
      description: "WebDAV HTTP Basic Auth password (if required)",
    },
    {
      key: "baseFolder",
      type: "text",
      label: "Root Media Path",
      placeholder: "/",
      defaultValue: "/",
      description: "Starting folder path on your WebDAV share",
    },
  ];
};
