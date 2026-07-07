"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDebouncedValue } from "./useDebouncedValue";
import { stripDiacritics } from "@/lib/search";

export interface Suggestion {
  _id: string;
  label: string;
  sub?: string;
  type?: "word" | "definition" | "user" | string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** apelat când userul alege o sugestie (click / Enter pe un element evidențiat) */
  onSelect: (s: Suggestion) => void;
  /** sursa de sugestii: remotă (fetch) sau locală (filtrare în memorie) */
  fetchSuggestions: (q: string, signal: AbortSignal) => Promise<Suggestion[]>;
  /** apelat la Enter FĂRĂ o sugestie evidențiată (căutare liberă) */
  onSubmit?: (v: string) => void;
  placeholder?: string;
  minLength?: number;
  debounceMs?: number;
  className?: string; // wrapper (form)
  inputClassName?: string;
  leading?: React.ReactNode; // ex. lupă
  ariaLabel?: string;
  autoFocus?: boolean;
}

// Evidențiază porțiunea din `label` care se potrivește cu `q`, insensibil la
// diacritice și majuscule. Normalizarea e 1:1 pe caracter pentru textul latin/român,
// deci offset-urile din forma normalizată se aplică pe forma originală.
function highlight(label: string, q: string): React.ReactNode {
  const nQ = stripDiacritics(q.trim());
  if (!nQ) return label;
  const nLabel = stripDiacritics(label);
  const at = nLabel.indexOf(nQ);
  if (at === -1) return label;
  return (
    <>
      {label.slice(0, at)}
      <span className="font-bold text-myorange">{label.slice(at, at + nQ.length)}</span>
      {label.slice(at + nQ.length)}
    </>
  );
}

const Autocomplete: React.FC<Props> = ({
  value,
  onChange,
  onSelect,
  fetchSuggestions,
  onSubmit,
  placeholder,
  minLength = 2,
  debounceMs = 250,
  className = "",
  inputClassName = "",
  leading,
  ariaLabel = "Căutare",
  autoFocus,
}) => {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);

  const debounced = useDebouncedValue(value, debounceMs);
  const cache = useRef<Map<string, Suggestion[]>>(new Map());
  const wrapRef = useRef<HTMLFormElement>(null);
  // useId → id stabil între server și client (fără mismatch la hidratare).
  const listId = `ac-${useId().replace(/:/g, "")}`;
  // Evită să redeschidem lista imediat după ce userul a ales/închis.
  const justPicked = useRef(false);

  const q = debounced.trim();

  useEffect(() => {
    if (justPicked.current) {
      justPicked.current = false;
      return;
    }
    if (q.length < minLength && !(q.startsWith("@") && q.length >= 1)) {
      setItems([]);
      setLoading(false);
      return;
    }
    const cached = cache.current.get(q);
    if (cached) {
      setItems(cached);
      setActive(-1);
      setOpen(true);
      return;
    }

    const ctrl = new AbortController();
    setLoading(true);
    fetchSuggestions(q, ctrl.signal)
      .then((res) => {
        cache.current.set(q, res);
        setItems(res);
        setActive(-1);
        setOpen(true);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setItems([]);
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, minLength]);

  // Click în afară → închide.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = useCallback(
    (s: Suggestion) => {
      justPicked.current = true;
      setOpen(false);
      setActive(-1);
      onSelect(s);
    },
    [onSelect]
  );

  const hasList = open && items.length > 0;

  function onKeyDown(e: React.KeyboardEvent) {
    if (!hasList) {
      if (e.key === "Enter" && onSubmit) {
        justPicked.current = true;
        setOpen(false);
        onSubmit(value);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && active < items.length) pick(items[active]);
      else if (onSubmit) {
        justPicked.current = true;
        setOpen(false);
        onSubmit(value);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const typeLabel = useMemo(
    () => ({ user: "utilizator", definition: "în definiție", word: "" } as Record<string, string>),
    []
  );

  return (
    <form
      ref={wrapRef}
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (active >= 0 && active < items.length) pick(items[active]);
        else if (onSubmit) {
          justPicked.current = true;
          setOpen(false);
          onSubmit(value);
        }
      }}
    >
      {leading}
      <input
        className={inputClassName}
        type="text"
        value={value}
        placeholder={placeholder}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={hasList}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => items.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
      />

      {hasList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-sm border-2 border-mygray bg-mywhite mydropshadow font-Spacegrotesc text-mygray"
        >
          {items.map((s, i) => (
            <li
              key={s._id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                // mousedown (nu click) ca să prevenim blur-ul înainte de selecție
                e.preventDefault();
                pick(s);
              }}
              className={`flex cursor-pointer items-center gap-2 border-b border-mygray/15 px-3 py-2 last:border-b-0 ${
                i === active ? "bg-myorange/15" : ""
              }`}
            >
              {s.type === "user" && <span className="font-bold text-myorange">@</span>}
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{highlight(s.label, q.replace(/^@/, ""))}</span>
                {s.sub && <span className="ml-2 text-xs text-myhovergray">{s.sub}</span>}
              </span>
              {s.type && typeLabel[s.type] && (
                <span className="shrink-0 rounded-sm border border-mygray/40 px-1.5 py-0.5 text-[10px] font-bold uppercase text-myhovergray">
                  {typeLabel[s.type]}
                </span>
              )}
            </li>
          ))}
          {loading && (
            <li className="px-3 py-2 text-xs text-myhovergray">Se caută…</li>
          )}
        </ul>
      )}
    </form>
  );
};

export default Autocomplete;
