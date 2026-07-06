import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function AdvancedSearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const navigate = useNavigate();
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const value = query.trim();

      if (value.length < 2) {
        setSuggestions([]);
        setOpen(false);
        setActiveIndex(-1);
        return;
      }

      setLoading(true);

      fetch(`${API_URL}/api/search/keywords?q=${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(Array.isArray(data) ? data : []);
          setOpen(true);
          setActiveIndex(-1);
        })
        .catch((err) => {
          console.error("Search suggestion error:", err);
          setSuggestions([]);
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const goToSearch = (value = query) => {
    const searchValue = String(value || "").trim();
    if (!searchValue) return;

    setQuery(searchValue);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();

    navigate(`/search?q=${encodeURIComponent(searchValue)}`);
  };

  const handleKeyDown = (e) => {
    if (!open) return;

    const visibleSuggestions = suggestions.slice(0, 12);
    const totalItems = visibleSuggestions.length + 1; // +1 for View all results

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % totalItems);
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (activeIndex >= 0 && activeIndex < visibleSuggestions.length) {
        goToSearch(visibleSuggestions[activeIndex].keyword);
      } else {
        goToSearch(query);
      }
    }

    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const visibleSuggestions = suggestions.slice(0, 12);

  return (
    <div ref={boxRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToSearch();
        }}
        className="relative"
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2) setOpen(true);
          }}
          placeholder="Search products, SKU, category..."
          className="w-full h-14 pl-5 pr-24 border border-[#cfd8e6] bg-white text-[16px] text-[#071b3a] shadow-md placeholder:text-[#071b3a]/35 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setOpen(false);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-16 top-1/2 -translate-y-1/2 text-[#071b3a]/45 hover:text-red-600"
          >
            <X size={22} />
          </button>
        )}

        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#071b3a] hover:text-green-700"
        >
          <Search size={26} strokeWidth={2.4} />
        </button>
      </form>

      {open && query.trim().length >= 2 && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute left-0 right-0 top-full bg-white border border-[#cfd8e6] shadow-2xl z-[99999] overflow-hidden"
        >
          <div className="max-h-[65vh] overflow-y-auto">
            {loading && (
              <div className="px-5 py-3 text-[15px] text-[#071b3a]/50">
                Searching...
              </div>
            )}

            {!loading && visibleSuggestions.length > 0 && (
              <div className="py-1">
                {visibleSuggestions.map((item, index) => (
                  <button
                    type="button"
                    key={`${item.keyword}-${index}`}
                    onClick={() => goToSearch(item.keyword)}
                    className={`w-full text-left px-5 py-3 text-[15px] text-[#071b3a] cursor-pointer border-b border-[#edf1f7] last:border-b-0 ${
                      activeIndex === index
                        ? "bg-green-50 font-semibold"
                        : "hover:bg-[#f3f4f6]"
                    }`}
                  >
                    {item.keyword}
                  </button>
                ))}
              </div>
            )}

            {!loading && visibleSuggestions.length === 0 && (
              <div className="px-5 py-3 text-sm text-[#071b3a]/50">
                No suggestions found
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => goToSearch()}
            className={`w-full text-left px-5 py-3 text-sm font-bold text-green-700 border-t border-[#d9e2ef] cursor-pointer ${
              activeIndex === visibleSuggestions.length
                ? "bg-green-50"
                : "bg-[#f3f4f6] hover:bg-green-50"
            }`}
          >
            View all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}