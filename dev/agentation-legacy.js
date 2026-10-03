(() => {
  if (window.WZZLegacyAnnotator || document.querySelector('agentation-toolbar, [data-ui-annotator-host]')) return;
  window.WZZLegacyAnnotator = { status: 'backing-up' };
  window.WZZAnnotationBackup.then(() => {
    window.WZZLegacyAnnotator = window.AgentationVanilla.createAnnotator({
      enabled: false,
      position: 'bottom-right',
      storageKey: 'wzz-portfolio-annotations',
      onCopy(markdown) {
        if (!markdown) return;
        const field = document.createElement('textarea');
        field.value = markdown;
        field.setAttribute('aria-hidden', 'true');
        field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
      },
    });
    window.WZZLegacyAnnotator.mount();
  }).catch(error => {
    delete window.WZZLegacyAnnotator;
    console.error('[WZZ preview] Legacy annotator could not start:', error);
  });
})();
