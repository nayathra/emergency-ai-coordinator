import { useEffect, useState } from "react";

export const TAMIL_TRANSLATIONS = {
  "Command Center":"கட்டுப்பாட்டு மையம்",
  "AI Assistant":"AI உதவியாளர்",
  "Voice Briefing":"குரல் விளக்கக்காட்சி",
  "Agent Intelligence":"முகவர் நுண்ணறிவு",
  "Conflict Resolution":"முரண்பாடு தீர்வு",
  "Resource Allocation":"வள ஒதுக்கீடு",
  "What-If Simulation":"என்ன ஆகும்? உருவகப்படுத்தல்",
  "Live Response Map":"நேரடி பதில் வரைபடம்",
  "Operations":"செயல்பாடுகள்",
  "System":"அமைப்பு",
  "Operational":"செயல்பாட்டில்",
  "Offline":"ஆஃப்லைன்",
  "Checking...":"சரிபார்க்கிறது...",
  "Current workspace":"தற்போதைய பணியிடம்",
  "Voice briefing":"குரல் விளக்கம்",
  "Live":"நேரலை",
  "Emergency AI Coordinator":"அவசர AI ஒருங்கிணைப்பாளர்",
  "Government / Disaster Management":"அரசு / பேரிடர் மேலாண்மை",
  "Sign out":"வெளியேறு",
  "Command interface":"கட்டுப்பாட்டு இடைமுகம்",
  "Open Coordination Center":"ஒருங்கிணைப்பு மையத்தைத் திறக்கவும்",
  "Back to role workspace":"பணி இடத்திற்குத் திரும்பவும்",
  "Live response network":"நேரடி பதில் வலையமைப்பு",
  "Current incident":"தற்போதைய சம்பவம்",
  "Severity":"தீவிரம்",
  "Critical":"முக்கியமானது",
  "Affected":"பாதிக்கப்பட்டோர்",
  "Ambulances":"ஆம்புலன்ஸ்கள்",
  "Shelters":"தங்குமிடங்கள்",
  "Blocked routes":"தடைசெய்யப்பட்ட பாதைகள்",
  "affected population":"பாதிக்கப்பட்ட மக்கள் தொகை",
  "ambulances available":"கிடைக்கும் ஆம்புலன்ஸ்கள்",
  "route blocked":"தடைசெய்யப்பட்ட பாதை",
  "Coordinator update":"ஒருங்கிணைப்பாளர் புதுப்பிப்பு",
  "AI-assisted response command":"AI உதவியுடன் பதில் கட்டுப்பாடு",
  "Overall priority":"மொத்த முன்னுரிமை",
  "Human review":"மனித மதிப்பாய்வு",
  "Response modules":"பதில் தொகுதிகள்",
  "Open a focused workspace":"தனி பணியிடத்தைத் திறக்கவும்",
  "Select any module":"எந்த தொகுதியையும் தேர்ந்தெடுக்கவும்",
  "Open focused view":"தனி காட்சியைத் திறக்கவும்",
  "Situational awareness":"நிலைமை பற்றிய விழிப்புணர்வு",
  "Inspect decision reasoning":"முடிவு காரணத்தைப் பார்க்கவும்",
  "AI Response Assistant":"AI பதில் உதவியாளர்",
  "Grounded Command Support":"தரவு சார்ந்த கட்டுப்பாட்டு உதவி",
  "Ask the coordinator":"ஒருங்கிணைப்பாளரிடம் கேளுங்கள்",
  "Ask about this emergency response…":"இந்த அவசர பதிலைப் பற்றி கேளுங்கள்…",
  "Analysing current response context…":"தற்போதைய பதில் சூழலை ஆய்வு செய்கிறது…",
  "Coordinator briefing ready":"ஒருங்கிணைப்பாளர் விளக்கம் தயாராக உள்ளது",
  "Human review remains required before real-world dispatch.":"நிஜ உலக நடவடிக்கைக்கு முன் மனித மதிப்பாய்வு அவசியம்.",
  "Priority":"முன்னுரிமை",
  "Actions":"நடவடிக்கைகள்",
  "Language":"மொழி",
  "Briefing language":"விளக்க மொழி",
  "Speak Decision":"முடிவை குரலாகச் சொல்லுங்கள்",
  "Call authorized number":"அங்கீகரிக்கப்பட்ட எண்ணிற்கு அழைக்கவும்",
  "Generating...":"உருவாக்குகிறது...",
  "Initiating call...":"அழைப்பைத் தொடங்குகிறது...",
  "Coordination Failed":"ஒருங்கிணைப்பு தோல்வியடைந்தது",
  "Coordinating specialist agents...":"சிறப்பு AI முகவர்களை ஒருங்கிணைக்கிறது...",
  "Reconciling routes, resources and response priorities.":"பாதைகள், வளங்கள் மற்றும் பதில் முன்னுரிமைகளைச் சமரசம் செய்கிறது.",
  "MULTILINGUAL DECISION BRIEFING":"பல்மொழி முடிவு விளக்கம்",
  "Voice Response Briefing":"குரல் பதில் விளக்கம்",
  "Turn the current coordinator decision into a concise spoken briefing for response teams.":"தற்போதைய ஒருங்கிணைப்பாளர் முடிவை பதில் குழுக்களுக்கான சுருக்கமான குரல் விளக்கமாக மாற்றுங்கள்.",
  "GROUNDED COMMAND SUPPORT":"தரவு சார்ந்த கட்டுப்பாட்டு உதவி",
  "Ask questions about the current incident, agent reports, conflicts and coordinator decision.":"தற்போதைய சம்பவம், முகவர் அறிக்கைகள், முரண்பாடுகள் மற்றும் ஒருங்கிணைப்பாளர் முடிவு குறித்து கேள்விகள் கேளுங்கள்.",
  "CROSS-AGENCY COORDINATION ENGINE":"பல்துறை ஒருங்கிணைப்பு இயந்திரம்",
  "RESOURCE ALLOCATION":"வள ஒதுக்கீடு",
  "DYNAMIC RE-PLANNING":"மாறும் மறுதிட்டமிடல்",
  "Change a route, resource or capacity constraint and see how the response plan changes.":"ஒரு பாதை, வளம் அல்லது திறன் கட்டுப்பாட்டை மாற்றி பதில் திட்டம் எவ்வாறு மாறுகிறது என்பதைப் பாருங்கள்.",
  "SITUATIONAL AWARENESS":"நிலைமை பற்றிய விழிப்புணர்வு",
  "A focused operational view of the incident location and emergency resources.":"சம்பவ இடம் மற்றும் அவசர வளங்களின் மையப்படுத்தப்பட்ட செயல்பாட்டு காட்சி.",
  "specialist agents":"சிறப்பு முகவர்கள்",
  "coordinator engine":"ஒருங்கிணைப்பாளர் இயந்திரம்",
  "response model":"பதில் மாதிரி",
  "Human-in-the-loop command":"மனித மேற்பார்வையுடன் கூடிய கட்டுப்பாடு",
  "AI recommends and explains. An authorized human remains responsible for real-world action.":"AI பரிந்துரைத்து விளக்குகிறது. நிஜ உலக நடவடிக்கைக்கு அங்கீகரிக்கப்பட்ட மனிதரே பொறுப்பானவர்.",
  "Coordinate the response":"பதிலை ஒருங்கிணைக்கவும்",
  "before dispatch.":"அனுப்புவதற்கு முன்.",
  "Emergency response intelligence":"அவசர பதில் நுண்ணறிவு",
  "Bring hospital, police, transport, relief and government signals into one operational picture. Run the coordinator only when the incident context is ready.":"மருத்துவமனை, காவல், போக்குவரத்து, நிவாரணம் மற்றும் அரசு தகவல்களை ஒரே செயல்பாட்டு காட்சியில் இணைக்கவும். சம்பவத் தகவல் தயாராக இருக்கும் போது மட்டும் ஒருங்கிணைப்பாளரை இயக்கவும்.",
  "AI-assisted decision-support briefing. Human authorization is required for operational action.":"AI உதவியுடன் கூடிய முடிவு ஆதரவு விளக்கம். செயல்பாட்டிற்கு மனித அங்கீகாரம் அவசியம்.",
  "Emergency response decision.":"அவசர பதில் முடிவு.",
  "Decision reasoning.":"முடிவின் காரணம்.",
  "Selected actions.":"தேர்ந்தெடுக்கப்பட்ட நடவடிக்கைகள்.",
  "This is an AI-assisted decision-support briefing. Human authorization is required for operational action.":"இது AI உதவியுடன் கூடிய முடிவு ஆதரவு விளக்கம். செயல்பாட்டிற்கு மனித அங்கீகாரம் அவசியம்.",
  "Call initiated to the configured authorized number.":"கட்டமைக்கப்பட்ட அங்கீகரிக்கப்பட்ட எண்ணிற்கு அழைப்பு தொடங்கப்பட்டது.",
  "Grounded decision support — not an autonomous dispatcher.":"தரவு சார்ந்த முடிவு ஆதரவு — தன்னாட்சி அனுப்பும் அமைப்பு அல்ல.",
  "AI assists decisions. Humans remain accountable for action.":"AI முடிவுகளுக்கு உதவுகிறது. நடவடிக்கைக்கு மனிதர்களே பொறுப்பானவர்கள்."
};

const ATTRIBUTES = ["placeholder", "aria-label", "title"];

export function translateNode(root = document) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);
  for (const textNode of nodes) {
    const parent = textNode.parentElement;
    if (!parent || ["SCRIPT","STYLE","NOSCRIPT"].includes(parent.tagName)) continue;
    const raw = textNode.nodeValue;
    const key = raw.replace(/\s+/g, " ").trim();
    if (!key || !TAMIL_TRANSLATIONS[key]) continue;
    const translated = raw.replace(key, TAMIL_TRANSLATIONS[key]);
    if (translated !== raw) textNode.nodeValue = translated;
  }
  document.querySelectorAll(ATTRIBUTES.map(a => "[" + a + "]").join(",")).forEach((el) => {
    for (const attr of ATTRIBUTES) {
      const value = el.getAttribute(attr);
      if (value && TAMIL_TRANSLATIONS[value]) el.setAttribute(attr, TAMIL_TRANSLATIONS[value]);
    }
  });
}

export function applyPreferences(theme, language) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.lang = language;
  root.style.colorScheme = theme === "light" ? "light" : "dark";
  if (language === "ta") translateNode();
}

export function usePreferences() {
  const [theme, setThemeState] = useState(() => localStorage.getItem("eac-theme") || "dark");
  const [language, setLanguageState] = useState(() => localStorage.getItem("eac-language") || "en");

  useEffect(() => {
    const sync = () => {
      setThemeState(localStorage.getItem("eac-theme") || "dark");
      setLanguageState(localStorage.getItem("eac-language") || "en");
    };
    window.addEventListener("eac-preferences-changed", sync);
    return () => window.removeEventListener("eac-preferences-changed", sync);
  }, []);

  useEffect(() => {
    applyPreferences(theme, language);
    const observer = new MutationObserver(() => {
      if (document.documentElement.dataset.lang === "ta") translateNode();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [theme, language]);

  const setTheme = (next) => {
    localStorage.setItem("eac-theme", next);
    applyPreferences(next, language);
    window.dispatchEvent(new Event("eac-preferences-changed"));
  };

  const setLanguage = (next) => {
    localStorage.setItem("eac-language", next);
    applyPreferences(theme, next);
    window.dispatchEvent(new Event("eac-preferences-changed"));
    window.location.reload();
  };

  return { theme, language, setTheme, setLanguage };
}
