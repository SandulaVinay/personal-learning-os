import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Quote } from 'lucide-react';

const FALLBACK_QUOTES = [
  { text: "The only way to learn a new programming language is by writing programs in it.", author: "Dennis Ritchie" },
  { text: "The beautiful thing about learning is nobody can take it away from you.", author: "B.B. King" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Your limit is only your imagination. Keep building, keep learning.", author: "Personal OS" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" }
];

export default function DailyQuoteCard() {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [loading, setLoading] = useState(false);
  const [isAi, setIsAi] = useState(false);

  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  const getRandomFallback = () => {
    const idx = Math.floor(Math.random() * FALLBACK_QUOTES.length);
    return FALLBACK_QUOTES[idx];
  };

  const fetchQuote = async (forceRegen = false) => {
    const apiKey = localStorage.getItem('gemini_api_key');
    const cachedDate = localStorage.getItem('daily_quote_date');
    const cachedText = localStorage.getItem('daily_quote_text');
    const cachedAuthor = localStorage.getItem('daily_quote_author');
    const todayStr = getTodayDateString();

    // 1. Use Cache if valid and not forcing regeneration
    if (!forceRegen && cachedDate === todayStr && cachedText) {
      setQuote({ text: cachedText, author: cachedAuthor || 'Unknown' });
      setIsAi(localStorage.getItem('daily_quote_is_ai') === 'true');
      return;
    }

    // 2. Fetch via Gemini AI if API Key is available
    if (apiKey) {
      setLoading(true);
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Generate a single, short, powerful, and highly motivational quote for someone learning programming, studying, or building projects. Return ONLY the quote text and the author/attribution in the format: '\"quote text\" - Author name'. Do not use markdown syntax, quotes around the entire block, or extra greetings."
              }]
            }]
          })
        });

        if (!response.ok) throw new Error('API request failed');
        const resData = await response.json();
        const parsedText = resData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (parsedText) {
          // Parse format: '"quote text" - Author' or similar
          let text = parsedText;
          let author = 'Unknown';

          const lastDash = parsedText.lastIndexOf('-');
          if (lastDash !== -1) {
            text = parsedText.substring(0, lastDash).trim();
            author = parsedText.substring(lastDash + 1).trim();
            // Remove surrounding quotes if any
            text = text.replace(/^["'“”]/, '').replace(/["'“”]$/, '');
          }

          setQuote({ text, author });
          setIsAi(true);

          // Save to Cache
          localStorage.setItem('daily_quote_date', todayStr);
          localStorage.setItem('daily_quote_text', text);
          localStorage.setItem('daily_quote_author', author);
          localStorage.setItem('daily_quote_is_ai', 'true');
          return;
        }
      } catch (err) {
        console.error("Failed to generate AI quote:", err);
      } finally {
        setLoading(false);
      }
    }

    // 3. Fallback to pre-defined quotes
    const fallback = getRandomFallback();
    setQuote(fallback);
    setIsAi(false);
    localStorage.setItem('daily_quote_date', todayStr);
    localStorage.setItem('daily_quote_text', fallback.text);
    localStorage.setItem('daily_quote_author', fallback.author);
    localStorage.setItem('daily_quote_is_ai', 'false');
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-pink-500 p-6 md:p-8 text-white shadow-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl group mb-8">
      {/* Background Decorative Circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl group-hover:scale-110 transition-transform duration-500"></div>
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-pink-400/20 blur-2xl"></div>

      {/* Ribbon Badge */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black tracking-widest uppercase text-pink-100 ring-1 ring-white/10">
          <Sparkles size={13} className="animate-pulse" />
          {isAi ? 'AI Daily Nudge' : 'Daily Spark'}
        </span>
        
        {localStorage.getItem('gemini_api_key') && (
          <button 
            disabled={loading}
            onClick={() => fetchQuote(true)}
            className="p-2 hover:bg-white/20 active:scale-90 rounded-full transition-all duration-200"
            title="Generate a new AI quote"
          >
            <RefreshCw size={15} className={`text-white/80 hover:text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Quote Content */}
      <div className="relative z-10 flex gap-3.5 items-start mt-2">
        <Quote className="text-white/20 shrink-0 transform -scale-x-100" size={32} />
        <div>
          {loading ? (
            <div className="space-y-2 py-2 w-full min-h-[60px]">
              <div className="h-4 bg-white/25 rounded-md animate-pulse w-3/4"></div>
              <div className="h-4 bg-white/25 rounded-md animate-pulse w-1/2"></div>
            </div>
          ) : (
            <>
              <p className="text-lg md:text-xl font-black leading-relaxed tracking-wide text-white drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.15)] italic font-sans">
                {quote.text}
              </p>
              <p className="text-right text-xs md:text-sm font-extrabold text-pink-100 tracking-wider mt-4">
                — {quote.author}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
