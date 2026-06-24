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
      const value = query.trim();

      if (value.length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      setLoading(true);

      fetch(`${API_URL}/api/search/keywords?q=${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(Array.isArray(data) ? data : []);
          setOpen(true);
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
      }
    };

    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const goToSearch = (value = query) => {
    const searchValue = value.trim();
    if (!searchValue) return;

    setOpen(false);
    inputRef.current?.blur();

    const url = `/search?q=${encodeURIComponent(searchValue)}`;

    if (window.innerWidth < 768) {
      window.location.href = url;
    } else {
      navigate(url);
    }
  };

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
          }}
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
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute left-0 right-0 top-full bg-white border border-[#cfd8e6] shadow-2xl z-99999 overflow-hidden"
        >
          <div className="max-h-[65vh] overflow-y-auto">
            {loading && (
              <div className="px-5 py-3 text-[15px] text-[#071b3a]/50">
                Searching...
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="py-1">
                {suggestions.slice(0, 12).map((item) => (
                  <div
                    key={item.keyword}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      goToSearch(item.keyword);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      goToSearch(item.keyword);
                    }}
                    className="w-full px-5 py-3 text-[15px] active:bg-[#f3f4f6] hover:bg-[#f3f4f6] text-[#071b3a] cursor-pointer border-b border-[#edf1f7] last:border-b-0"
                  >
                    {item.keyword}
                  </div>
                ))}
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="px-5 py-3 text-sm text-[#071b3a]/50">
                No suggestions found
              </div>
            )}
          </div>

          <div
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToSearch();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToSearch();
            }}
            className="w-full px-5 py-3 bg-[#f3f4f6] active:bg-green-50 hover:bg-green-50 text-sm font-bold text-green-700 border-t border-[#d9e2ef] cursor-pointer"
          >
            View all results for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}