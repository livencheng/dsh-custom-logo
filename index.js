/**
 * Host half of the dsh-custom-brand-logo bundle.
 *
 * Everything this plugin does happens in the browser: the Client half
 * (`client.js`) renders the custom brand mark and the Brand Logo settings
 * page, and persists the chosen logo in the browser's localStorage. The Host
 * half therefore stays inert; it exists because a DSH bundle row must resolve
 * to a Host plugin module.
 */
export function apply() {}
