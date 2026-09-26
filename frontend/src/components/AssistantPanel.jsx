import { useState } from "react";
import { Bot, Send, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { Panel } from "./primitives";
import { askAssistant } from "../services/api";
import { usePreferences } from "../utils/i18n";

const STARTERS = [
  "Why was this action prioritized?",
  "What routes are safe right now?",
  "What conflicts were resolved?",
  "What happens if an ambulance becomes unavailable?",
];

const TAMIL_STARTERS = [
  "இந்த நடவடிக்கைக்கு ஏன் முன்னுரிமை அளிக்கப்பட்டது?",
  "தற்போது எந்த பாதைகள் பாதுகாப்பானவை?",
  "எந்த முரண்பாடுகள் தீர்க்கப்பட்டன?",
  "ஆம்புலன்ஸ் கிடைக்கவில்லை என்றால் என்ன நடக்கும்?",
];

export default function AssistantPanel({ incident, responsePlan, agentReports }) {
  const { language } = usePreferences();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        language === "ta"
          ? "தற்போதைய சம்பவம், முகவர் பரிந்துரைகள், முரண்பாடுகள், பாதைகள் மற்றும் பதில் திட்டத்தை நான் விளக்க முடியும். ஒரு கேள்வியைக் கேளுங்கள்."
          : "I can explain the current incident, agent recommendations, conflicts, routes and response plan. Ask me a question.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const submit = async (value = question) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setLoading(true);

    try {
      const result = await askAssistant(
        trimmed,
        {
          incident,
          response_plan: responsePlan,
          agent_reports: agentReports || [],
        },
        language
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: result.answer, source: result.source },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            err.message ||
            (language === "ta"
              ? "உதவியாளர் தற்காலிகமாக கிடைக்கவில்லை."
              : "Assistant is temporarily unavailable."),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const starters = language === "ta" ? TAMIL_STARTERS : STARTERS;

  return (
    <Panel
      title={language === "ta" ? "AI பதில் உதவியாளர்" : "AI Response Assistant"}
      eyebrow={language === "ta" ? "தரவு சார்ந்த கட்டுப்பாட்டு உதவி" : "Grounded Command Support"}
      icon={Bot}
      className="min-h-[calc(100vh-155px)] border-cyan/20 bg-surface"
    >
      <div className="mb-4 flex items-start gap-3 rounded-lg border border-cyan/15 bg-cyan/[0.04] p-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan/10 text-cyan">
          <Sparkles size={15} />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-text-primary">
            {language === "ta" ? "ஒருங்கிணைப்பாளரிடம் கேளுங்கள்" : "Ask the coordinator"}
          </p>
          <p className="mt-0.5 text-[12px] leading-6 text-text-tertiary">
            {language === "ta"
              ? "பதில்கள் தற்போதைய சம்பவம் மற்றும் ஒருங்கிணைப்பு முடிவை அடிப்படையாகக் கொண்டவை. இது தன்னிச்சையாக வளங்களை அனுப்பாது."
              : "Answers are grounded in the current incident and coordination result. It does not autonomously dispatch resources."}
          </p>
        </div>
        <ShieldCheck size={14} className="ml-auto shrink-0 text-safe" />
      </div>

      <div className="min-h-[50vh] max-h-[62vh] space-y-5 overflow-y-auto border-y border-border/70 py-5 pr-2">
        {messages.map((message, index) => (
          <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                message.role === "user"
                  ? "max-w-[85%] rounded-xl rounded-br-sm bg-coordinator px-3.5 py-2.5 text-[13px] leading-7 text-white"
                  : "max-w-[90%] rounded-xl rounded-bl-sm border border-border bg-surface-2/60 px-3.5 py-2.5 text-[13px] leading-7 text-text-secondary"
              }
            >
              {message.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
            <Loader2 size={13} className="animate-spin text-cyan" />
            {language === "ta" ? "தற்போதைய பதில் சூழலை ஆய்வு செய்கிறது…" : "Analysing current response context…"}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {starters.map((starter) => (
          <button
            key={starter}
            onClick={() => submit(starter)}
            disabled={loading}
            className="rounded-full border border-border bg-surface-2/40 px-2.5 py-1.5 text-[10px] font-medium text-text-tertiary transition-colors hover:border-cyan/30 hover:text-text-secondary disabled:opacity-50"
          >
            {starter}
          </button>
        ))}
      </div>

      <form
        className="mt-5 flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={language === "ta" ? "இந்த அவசர பதிலைப் பற்றி கேளுங்கள்…" : "Ask about this emergency response…"}
          disabled={loading}
          className="min-w-0 flex-1 rounded-xl border border-border bg-base/70 px-4 py-3.5 text-sm text-text-primary outline-none placeholder:text-text-tertiary focus:border-cyan/40"
        />
        <button
          type="submit"
          disabled={!question.trim() || loading}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan/15 text-cyan transition-colors hover:bg-cyan/20 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={language === "ta" ? "உதவியாளரிடம் கேட்கவும்" : "Ask assistant"}
        >
          <Send size={15} />
        </button>
      </form>
    </Panel>
  );
}
