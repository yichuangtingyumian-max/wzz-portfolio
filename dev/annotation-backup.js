(() => {
  if (window.WZZAnnotationBackup) return;
  const script = document.currentScript;
  window.WZZAnnotationBackup = (async () => {
    const storage = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (/agentation|feedback-|wzz-portfolio-annotations/i.test(key)) {
        storage[key] = localStorage.getItem(key);
      }
    }
    const response = await fetch('/__dev/annotation-backup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WZZ-Backup-Token': script.dataset.backupToken,
      },
      body: JSON.stringify({ origin: location.origin, storage }),
    });
    if (!response.ok) throw new Error('Annotation backup failed; tool was not mounted.');
    return response.json();
  })();
  window.WZZAnnotationBackup.catch(error => console.error('[WZZ preview]', error));
})();
