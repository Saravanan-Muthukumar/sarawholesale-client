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

      setLoading(true);
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
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[99999] overflow-hidden"
        >
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="px-5 py-3 text-[16px] text-gray-500">
                Searching...
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <div className="py-2">
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
                    className="w-full px-6 py-4 text-[16px] active:bg-gray-100 hover:bg-gray-50 text-gray-900 cursor-pointer"
                  >
                    {item.keyword}
                  </div>
                ))}
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="px-5 py-3 text-sm text-gray-500">
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
            className="w-full px-6 py-4 bg-gray-50 active:bg-green-50 hover:bg-green-50 text-sm font-semibold text-green-700 border-t border-gray-100 cursor-pointer"
          >
            View all results for "{query}"
          </div>
        </div>
      )}
    </div>
  );
}