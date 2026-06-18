import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function AdvancedSearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, []);

  const fetchSuggestions = async () => {
    const searchValue = query.trim();

    if (searchValue.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/search/keywords?q=${encodeURIComponent(searchValue)}`
      );

      const data = await res.json();

      setSuggestions(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch (err) {
      console.error("Search suggestion error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const submitSearch = (value = query) => {
    const searchValue = value.trim();
    if (!searchValue) return;

    inputRef.current?.blur();
    setOpen(false);

    setTimeout(() => {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
    }, 50);
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch();
        }}
        className="relative"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="Search products, SKU, category..."
          className="w-full h-12 pl-5 pr-24 rounded-lg border border-gray-300 text-[16px] focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-500"
          >
            <X size={24} />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-green-700"
        >
          <Search size={26} />
        </button>
      </form>

      {open && query.trim().length >= 2 && (
        <div
          onTouchMove={() => inputRef.current?.blur()}
          className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[9999] overflow-hidden"
        >
          <div className="max-h-[70vh] overflow-y-auto">
            {loading && (
              <div className="px-5 py-3 text-[16px] text-gray-500">
                Searching...
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="py-2">
                {suggestions.slice(0, 12).map((item) => (
                  <button
                    key={item.keyword}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      submitSearch(item.keyword);
                    }}
                    className="w-full text-left px-6 py-3 text-[16px] hover:bg-gray-50 text-gray-900"
                  >
                    {item.keyword}
                  </button>
                ))}
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="px-5 py-3 text-sm text-gray-500">
                No suggestions found
              </div>
            )}
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              submitSearch();
            }}
            className="w-full px-6 py-3 bg-gray-50 hover:bg-green-50 text-sm font-semibold text-green-700 border-t border-gray-100"
          >
            View all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}