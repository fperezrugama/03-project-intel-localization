// Get the root <html> element.
const root = document.documentElement;

// Remember the original language of the website.
const originalLanguage = root.lang || "en";

// Languages that use right-to-left writing.
const rtlLanguages = new Set(["ar", "fa", "he", "ur"]);

// --------------------------------------------------
// Detect the language used by Google Translate
// --------------------------------------------------

function getTranslatedLanguage() {
    // Google Translate may store the target language in the
    // "googtrans" cookie.
    const match = document.cookie.match(
        /(?:^|;\s*)googtrans=\/[^/]+\/([a-z-]+)/i
    );

    if (match) {
        return match[1].toLowerCase();
    }

    return null;
}

// --------------------------------------------------
// Detect RTL language from the translated text.
// This is a fallback for browser translation when the
// language is not available through an HTML attribute
// or Google Translate cookie.
// --------------------------------------------------

function detectRtlFromText() {
    const text = document.body.innerText || "";

    // Look for common Arabic/Persian/Urdu characters.
    const arabicScript = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;

    // Look for Hebrew characters.
    const hebrewScript = /[\u0590-\u05FF]/g;

    const arabicMatches = text.match(arabicScript) || [];
    const hebrewMatches = text.match(hebrewScript) || [];

    if (hebrewMatches.length > arabicMatches.length && hebrewMatches.length > 10) {
        return "he";
    }

    if (arabicMatches.length > 10) {
        // Persian-specific characters.
        if (/[پچژگ]/.test(text)) {
            return "fa";
        }

        // If the exact language cannot be determined,
        // Arabic is used as the generic Arabic-script RTL language.
        return "ar";
    }

    return null;
}

// --------------------------------------------------
// Determine the current language.
// --------------------------------------------------

function detectLanguage() {
    // First try the Google Translate cookie.
    const translatedLanguage = getTranslatedLanguage();

    if (translatedLanguage) {
        return translatedLanguage;
    }

    // Next check the HTML lang attribute.
    const htmlLanguage = (root.lang || originalLanguage)
        .toLowerCase()
        .split("-")[0];

    // If the HTML language itself is RTL, use it.
    if (rtlLanguages.has(htmlLanguage)) {
        return htmlLanguage;
    }

    // Finally, look at the translated text.
    const textLanguage = detectRtlFromText();

    if (textLanguage) {
        return textLanguage;
    }

    // Otherwise keep the original language.
    return originalLanguage;
}

// --------------------------------------------------
// Update the page direction.
// --------------------------------------------------

function updateDirection() {
    const language = detectLanguage();

    const languageCode = language
        .toLowerCase()
        .split("-")[0];

    const isRtl = rtlLanguages.has(languageCode);

    const newDirection = isRtl ? "rtl" : "ltr";

    const emailInput = document.getElementById("email");

    if (emailInput) {
        emailInput.placeholder = languageCode === "ar"
            ? "أدخل بريدك الإلكتروني"
            : languageCode === "fa"
                ? "ایمیل خود را وارد کنید"
                : "you@example.com";
    }

    // Only change the attributes if they actually changed.
    // This prevents unnecessary DOM mutations.
    if (root.lang !== language) {
        root.lang = language;
    }

    if (root.dir !== newDirection) {
        root.dir = newDirection;
    }
}

// --------------------------------------------------
// Watch for browser/Google Translate changes.
// --------------------------------------------------

// We observe the BODY instead of <html>.
//
// This is important because our own changes to
// root.lang and root.dir will not trigger this observer.
const translationObserver = new MutationObserver(() => {

    // Wait briefly so that many translation changes
    // are grouped into one update.
    clearTimeout(translationObserver.timer);

    translationObserver.timer = setTimeout(() => {
        updateDirection();
    }, 300);
});

translationObserver.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true
});

// Run once when the page first loads.
updateDirection();