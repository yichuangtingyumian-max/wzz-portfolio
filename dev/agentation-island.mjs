import React from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';

function copyForEmbeddedPreview(output) {
  if (!output) return;
  // Preserve the old preview's clipboard compatibility for embedded browsers.
  // Agentation still performs its own Clipboard API copy before this callback.
  const field = document.createElement('textarea');
  const focused = document.activeElement;
  field.value = output;
  field.setAttribute('aria-hidden', 'true');
  field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  document.body.appendChild(field);
  field.select();
  document.execCommand('copy');
  field.remove();
  focused?.focus({ preventScroll: true });
}

async function mount() {
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname)) return;
  if (window.WZZAgentationIsland || document.querySelector('agentation-toolbar, [data-ui-annotator-host]')) return;
  // Reserve the single mount before the asynchronous, durable storage backup.
  window.WZZAgentationIsland = { status: 'backing-up' };
  try {
    if (!window.WZZAnnotationBackup) throw new Error('Missing local annotation backup.');
    await window.WZZAnnotationBackup;
    const host = document.createElement('div');
    host.id = 'wzz-agentation-island';
    document.body.appendChild(host);
    const root = createRoot(host);
    // Keep the complete official component, including Layout Mode and native copy.
    // No endpoint: annotations stay local and no MCP service is configured.
    root.render(React.createElement(Agentation, { appName: 'WZZ Portfolio', onCopy: copyForEmbeddedPreview }));
    window.WZZAgentationIsland = { status: 'mounted', root };
  } catch (error) {
    delete window.WZZAgentationIsland;
    console.error('[WZZ preview] Agentation could not start:', error);
  }
}

mount();
