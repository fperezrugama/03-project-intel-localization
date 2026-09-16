const root = document.documentElement;
const originalLanguage = root.lang || 'en';
const rtlLanguages = new Set(['ar', 'fa', 'he', 'ur']);

// Read the language from the HTML attribute or Google Translate's cookie/class markers.
function detectLanguage() {
  const translatedLanguage = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/]+\/([a-z]{2,3})/i);
  const htmlLanguage = root.lang.toLowerCase().split('-')[0];

  if (translatedLanguage) {
    return translatedLanguage[1].toLowerCase();
  }

  // Google Translate adds these classes when it changes the page direction.
  const translatedRtl = root.classList.contains('translated-rtl')
    || document.body.classList.contains('translated-rtl');
  const translatedLtr = root.classList.contains('translated-ltr')
    || document.body.classList.contains('translated-ltr');

  if (translatedRtl) {
    return rtlLanguages.has(htmlLanguage) ? htmlLanguage : 'ar';
  }

  if (translatedLtr) {
    return originalLanguage;
  }

  if (htmlLanguage !== originalLanguage) {
    return htmlLanguage;
  }

  return originalLanguage;
}

// RTL languages need right-to-left direction; all other detected languages use LTR.
function updateDirection() {
  const language = detectLanguage();
  const languageCode = language.toLowerCase().split('-')[0];
  const isRtl = rtlLanguages.has(languageCode);

  root.lang = language;
  root.dir = isRtl ? 'rtl' : 'ltr';
}

// Watch for translation changes to language, direction, classes, or translated DOM content.
const translationObserver = new MutationObserver(() => {
  updateDirection();
});

translationObserver.observe(root, {
  attributes: true,
  attributeFilter: ['class', 'dir', 'lang'],
  characterData: true,
  childList: true,
  subtree: true
});

updateDirection();