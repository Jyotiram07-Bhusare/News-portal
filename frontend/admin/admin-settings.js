/**
 * LOKMANGAL ADMIN PANEL — FOOTER DETAILS
 * Sidebar > "फूटर माहिती": the office address (Marathi + English), phone and e-mail that the website shows in its footer under
 * "कार्यालय संपर्क". A detail left empty is not shown on the website.
 *
 * Uses the helpers of admin.js (apiFetch, appState, showToast, setFormLang, updateLangDots, msg). Page texts are translated by
 * admin-i18n.js; the backend's answers (English sentences) are translated by it too.
 */

const settingsEl = (id) => document.getElementById(id);

async function fetchSettings() {
  try {
    const res = await apiFetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      appState.settings = data.settings;
      appState.settingsLoaded = true;
      appState.settingsFailed = false;
      fillSettingsForm();
    } else {
      appState.settingsFailed = true;
    }
  } catch (err) {
    console.error('Error fetching footer details:', err);
    appState.settingsFailed = true;
  }
}

function fillSettingsForm() {
  const s = appState.settings || {};
  settingsEl('form-settings-address').value = s.office_address || '';
  settingsEl('form-settings-address-en').value = s.office_address_en || '';
  settingsEl('form-settings-phone').value = s.office_phone || '';
  settingsEl('form-settings-email').value = s.office_email || '';
  updateLangDots(settingsEl('footer-settings-card'));
}

// the dot on the English tab is green when an English address was typed (the form is not a modal, so admin.js does not watch it)
(function initSettingsForm() {
  const card = settingsEl('footer-settings-card');
  if (card) card.addEventListener('input', () => updateLangDots(card));
})();

async function handleSettingsSubmit(e) {
  e.preventDefault();
  // Without the saved details the backend is not reachable: say so now, never save over details that were not read
  if (!appState.settingsLoaded) {
    showToast('फूटर माहिती अजून लोड झाली नाही — बॅकएंड तपासा आणि "पुन्हा तपासा" दाबा.', 'error');
    return;
  }
  const payload = {
    office_address: settingsEl('form-settings-address').value.trim(),
    office_address_en: settingsEl('form-settings-address-en').value.trim(),
    office_phone: settingsEl('form-settings-phone').value.trim(),
    office_email: settingsEl('form-settings-email').value.trim()
  };
  const btn = settingsEl('btn-save-settings');
  btn.disabled = true;
  try {
    const res = await apiFetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      appState.settings = data.settings;
      fillSettingsForm();
      showToast('फूटर माहिती जतन झाली!', 'success');
    } else {
      showToast(data.error || 'त्रुटी आली.', 'error');
    }
  } catch (err) {
    console.error('Error saving footer details:', err);
    showToast('सर्व्हर त्रुटी: फूटर माहिती जतन होऊ शकली नाही.', 'error');
  } finally {
    btn.disabled = false;
  }
}
