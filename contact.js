(() => {
  const section = document.getElementById('contact');
  const form = section?.querySelector('[data-contact-form]');
  if (!form) return;

  const fields = [...form.querySelectorAll('[data-contact-field]')];
  const submit = form.querySelector('[type="submit"]');
  const submitLabel = submit.querySelector('[data-submit-label]');
  const status = form.querySelector('[data-form-status]');
  const draftLink = form.querySelector('[data-draft-link]');
  const copyFeedback = section.querySelector('[data-contact-feedback]');
  const feedbackTimers = new WeakMap();
  const recipient = new URL(form.action).pathname;
  form.noValidate = true;

  function validateField(field) {
    const value = field.value.trim();
    let message = '';
    if (!value) message = { name: '请填写你的名字。', email: '请填写你的邮箱。', message: '写一点你想说的话吧。' }[field.name];
    else if (field.type === 'email' && !field.validity.valid) message = '请填写完整的邮箱地址，例如 name@example.com。';
    const error = document.getElementById(field.getAttribute('aria-describedby'));
    error.textContent = message;
    error.hidden = !message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    return !message;
  }

  function validate() {
    const invalid = fields.filter(field => !validateField(field));
    if (invalid.length) {
      status.textContent = '还有内容需要补充，请检查上方的提示。';
      draftLink.hidden = true;
      invalid[0].focus();
      return false;
    }
    return true;
  }

  function getDraft() {
    const values = Object.fromEntries(fields.map(field => [field.name, field.value.trim()]));
    const subject = '来自作品集的留言 · ' + values.name;
    const body = `姓名：${values.name}\n回复邮箱：${values.email}\n\n${values.message}`;
    return { subject, body, href: `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` };
  }

  async function copyText(value) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      const previousFocus = document.activeElement;
      const scrollPosition = { top: window.scrollY, left: window.scrollX };
      const selection = window.getSelection();
      const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : [];
      const area = document.createElement('textarea');
      area.value = value;
      area.readOnly = true;
      area.style.cssText = 'position:fixed;inset:0 auto auto 0;width:1px;height:1px;opacity:0;pointer-events:none';
      document.body.append(area);
      area.focus({ preventScroll: true });
      area.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* The visible value remains available for manual copying. */ }
      area.remove();
      previousFocus?.focus({ preventScroll: true });
      window.scrollTo({ ...scrollPosition, behavior: 'instant' });
      if (selection) { selection.removeAllRanges(); ranges.forEach(range => selection.addRange(range)); }
      return copied;
    }
  }

  function showCopyState(button, copied) {
    clearTimeout(feedbackTimers.get(button));
    const label = button.querySelector('[data-copy-label]') || button;
    label.textContent = copied ? '已复制 ✓' : '未复制';
    feedbackTimers.set(button, setTimeout(() => { label.textContent = button.dataset.copyIdle; }, 1800));
  }

  section.querySelectorAll('[data-contact-copy]').forEach(button => {
    button.dataset.copyIdle = button.querySelector('[data-copy-label]').textContent;
    button.addEventListener('click', async () => {
      if (button.getAttribute('aria-disabled') === 'true') return;
      button.setAttribute('aria-disabled', 'true');
      button.setAttribute('aria-busy', 'true');
      const copied = await copyText(button.dataset.contactCopy);
      button.removeAttribute('aria-disabled');
      button.removeAttribute('aria-busy');
      showCopyState(button, copied);
      copyFeedback.textContent = copied ? `${button.dataset.copyName}已复制。` : '无法自动复制，请选中联系方式手动复制。';
      if (!copied) {
        const range = document.createRange();
        range.selectNodeContents(button.closest('dd').querySelector('a'));
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  });

  fields.forEach(field => {
    field.addEventListener('blur', () => { if (field.value || field.hasAttribute('aria-invalid')) validateField(field); });
    field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) validateField(field);
      status.textContent = '';
      draftLink.hidden = true;
      submitLabel.textContent = '打开邮件草稿';
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (submit.getAttribute('aria-busy') === 'true') return;
    if (!validate()) return;
    submit.setAttribute('aria-disabled', 'true');
    submit.setAttribute('aria-busy', 'true');
    submitLabel.textContent = '正在准备草稿…';
    try {
      draftLink.href = getDraft().href;
      draftLink.hidden = false;
      status.textContent = '草稿已准备好，请在邮件应用中确认发送。没有打开的话，可以复制留言后自行发邮件。';
      draftLink.click();
    } catch {
      status.textContent = '未能打开邮件草稿。你可以复制留言，直接发送到上方邮箱。';
    } finally {
      submit.removeAttribute('aria-disabled');
      submit.removeAttribute('aria-busy');
      submitLabel.textContent = '再次打开草稿';
    }
  });

  const draftCopy = form.querySelector('[data-copy-draft]');
  draftCopy.hidden = false;
  draftCopy.dataset.copyIdle = draftCopy.textContent;
  draftCopy.addEventListener('click', async () => {
    if (draftCopy.getAttribute('aria-disabled') === 'true') return;
    if (!validate()) return;
    const draft = getDraft();
    draftCopy.setAttribute('aria-disabled', 'true');
    draftCopy.setAttribute('aria-busy', 'true');
    const copied = await copyText(`收件人：${recipient}\n主题：${draft.subject}\n\n${draft.body}`);
    draftCopy.removeAttribute('aria-disabled');
    draftCopy.removeAttribute('aria-busy');
    showCopyState(draftCopy, copied);
    status.textContent = copied ? '留言已复制，可以粘贴到邮件应用中，确认后发送。' : '无法自动复制，请手动选中留言并复制。';
    if (!copied) { const message = fields.find(field => field.name === 'message'); message.focus(); message.select(); }
  });
})();
