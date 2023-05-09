import type { PluginExtensionElementConfig, PluginExtensionLinkConfig } from '@grafana/data';

// The information that is stored in the registry
export type PluginExtensionRegistryItem = {
  // Any additional meta information that we would like to store about the extension in the registry
  pluginId: string;

  config: PluginExtensionLinkConfig | PluginExtensionElementConfig;
};

// A map of placement names to a list of extensions
export type PluginExtensionRegistry = Record<string, PluginExtensionRegistryItem[]>;
