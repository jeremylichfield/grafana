import { PluginExtension, PluginExtensionElement, PluginExtensionLink, PluginExtensionTypes } from '@grafana/data';

export function isPluginExtensionLink(extension: PluginExtension | undefined): extension is PluginExtensionLink {
  if (!extension) {
    return false;
  }
  return extension.type === PluginExtensionTypes.link && ('path' in extension || 'onClick' in extension);
}

export function isPluginExtensionElement(extension: PluginExtension | undefined): extension is PluginExtensionElement {
  if (!extension) {
    return false;
  }
  return extension.type === PluginExtensionTypes.element && 'element' in extension;
}
