"use client";

import {
  type ButtonHTMLAttributes,
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

import { cn } from "@/utils/helpers/styleMerger";

/** With this many options or more, a list given a search placeholder gets a search box. */
export const SEARCH_FROM = 7;

export type ChoiceOption<T extends string = string> = {
  value: T;
  label: string;
  /** A short note on the right, e.g. "Current" or a count. */
  tag?: ReactNode;
  /** Secondary option, e.g. "No employer". */
  muted?: boolean;
  /** Draws a divider above this option. */
  separated?: boolean;
  /** Does something instead of picking a value ("New employer…"): no check, accent color. */
  action?: boolean;
};

type Tone = "default" | "muted" | "changed" | "filled";

/**
 * The button that shows what's picked: "Berry Farm ▾". `pill` sits at the
 * end of a row; `field` fills its column like a text input.
 */
export const ChoiceTrigger = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    open: boolean;
    variant?: "pill" | "field";
    tone?: Tone;
    icon?: ReactNode;
  }
>(function ChoiceTrigger(
  { open, variant = "pill", tone = "default", icon, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-expanded={open}
      aria-haspopup="listbox"
      className={cn(
        "flex min-w-0 items-center gap-1.5 border text-left outline-hidden transition-colors focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/15",
        variant === "pill"
          ? "h-9 max-w-56 rounded-full pr-2.5 pl-3.5 text-sm"
          : "h-11 w-full rounded-xl pr-2.5 pl-3 text-[0.9375rem]",
        open ? "border-ink bg-surface" : "border-border-strong bg-surface hover:bg-surface-sunken",
        tone === "changed" && "font-semibold text-accent",
        tone === "filled" && "border-accent bg-accent-soft/40 font-semibold text-ink",
        tone === "muted" && "text-ink-muted",
        tone === "default" && "font-semibold text-ink",
        className
      )}
      {...props}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <ChevronDown
        className={cn("size-4 shrink-0 text-ink-muted transition-transform", open && "rotate-180")}
        aria-hidden="true"
      />
    </button>
  );
});

/**
 * The options themselves: a check on the picked one, a tag on the right,
 * arrow keys to move.
 */
export function ChoiceOptions<T extends string>({
  id,
  label,
  options,
  value,
  onSelect,
  searchPlaceholder,
  className,
}: {
  id?: string;
  /** The listbox's accessible name. */
  label: string;
  options: ChoiceOption<T>[];
  value: T | undefined;
  onSelect: (value: T) => void;
  /** Shows a search box once there are SEARCH_FROM options or more. */
  searchPlaceholder?: string;
  className?: string;
}) {
  const t = useTranslations("dropdown");
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");

  const searchable = !!searchPlaceholder && options.length >= SEARCH_FROM;
  const needle = query.trim().toLocaleLowerCase();
  const shown = needle
    ? options.filter((o) => !o.action && o.label.toLocaleLowerCase().includes(needle))
    : options;

  // Opens on the picked option, like a native select, without scrolling the page.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || searchable) return;
    const target =
      list.querySelector<HTMLElement>('[aria-selected="true"]') ??
      list.querySelector<HTMLElement>('[role="option"]');
    if (!target) return;
    target.focus({ preventScroll: true });
    list.scrollTop = target.offsetTop - list.clientHeight / 2 + target.clientHeight / 2;
  }, [searchable]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const items = [...(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
    if (items.length === 0) return;
    const at = items.indexOf(document.activeElement as HTMLElement);
    function go(i: number) {
      e.preventDefault();
      items[(i + items.length) % items.length].focus();
    }
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at < 0 ? items.length - 1 : at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(items.length - 1);
  }

  return (
    <div className={className}>
      {searchable ? (
        <label className="mb-1 flex h-10 items-center gap-2 rounded-lg bg-surface-sunken px-2.5">
          <Search className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                listRef.current?.querySelector<HTMLElement>('[role="option"]')?.focus();
              }
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-hidden placeholder:text-ink-subtle"
          />
        </label>
      ) : null}
      <div
        id={id}
        ref={listRef}
        role="listbox"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex max-h-60 flex-col overflow-y-auto"
      >
        {shown.map((option) => {
          const selected = !option.action && option.value === value;
          return (
            <div key={option.value} className="flex flex-col">
              {option.separated && !needle ? (
                <div className="mx-2.5 my-1 border-t border-border" role="separator" />
              ) : null}
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(option.value)}
                className={cn(
                  "flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-sm outline-hidden transition-colors",
                  "hover:bg-surface-sunken focus-visible:bg-surface-sunken",
                  selected
                    ? "font-semibold text-ink"
                    : option.action
                      ? "font-semibold text-accent"
                      : option.muted
                        ? "text-ink-muted"
                        : "text-ink"
                )}
              >
                {option.action ? (
                  <Plus className="size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Check
                    className={cn(
                      "size-4 shrink-0 text-accent",
                      selected ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.tag !== undefined ? (
                  <span className="shrink-0 text-xs font-normal text-ink-muted tabular-nums">
                    {option.tag}
                  </span>
                ) : null}
              </button>
            </div>
          );
        })}
        {needle && shown.length === 0 ? (
          <p className="px-2.5 py-3 text-sm text-ink-muted">{t("empty")}</p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * A choice whose options float in a menu under its trigger. Modal, so the
 * list scrolls and takes focus even inside a dialog or drawer (their scroll
 * lock would swallow it otherwise), and only one menu is open at a time.
 * Open/closed can be controlled, e.g. by a form that tracks which is open.
 */
export function ChoicePopover<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  display,
  placeholder,
  searchPlaceholder,
  variant = "pill",
  tone,
  className,
  testId,
  open: openProp,
  onOpenChange,
  triggerLabel,
}: {
  /** For an outside `<label htmlFor>`. */
  id?: string;
  label: string;
  value: T | undefined;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
  display?: (value: T) => string;
  placeholder?: string;
  searchPlaceholder?: string;
  variant?: "pill" | "field";
  tone?: Tone;
  className?: string;
  testId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** What the trigger says, when it isn't the picked option ("Mixed"). */
  triggerLabel?: string;
}) {
  const [ownOpen, setOwnOpen] = useState(false);
  const open = openProp ?? ownOpen;
  function setOpen(next: boolean) {
    if (openProp === undefined) setOwnOpen(next);
    onOpenChange?.(next);
  }
  const current = options.find((o) => o.value === value);
  const text = triggerLabel ?? (value !== undefined && display ? display(value) : current?.label);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <ChoiceTrigger
          id={id}
          open={open}
          variant={variant}
          tone={tone ?? (text ? "default" : "muted")}
          aria-label={`${label}: ${text ?? placeholder ?? ""}`}
          data-testid={testId}
          className={className}
        >
          {text ?? placeholder}
        </ChoiceTrigger>
      </PopoverTrigger>
      <PopoverContent
        align={variant === "field" ? "start" : "end"}
        collisionPadding={16}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[min(18rem,calc(100vw-2rem))] p-1.5"
      >
        <ChoiceOptions
          label={label}
          options={options}
          value={value}
          searchPlaceholder={searchPlaceholder}
          onSelect={(next) => {
            setOpen(false);
            onChange(next);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * "Employer  [Farm ▾]": label on the left, a pill on the right that opens
 * its options in a floating menu.
 */
export function ChoiceRow<T extends string>({
  label,
  value,
  options,
  onChange,
  display,
  placeholder,
  searchPlaceholder,
  classes,
}: {
  label: string;
  value: T | undefined;
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
  /** What the pill says; defaults to the option's label. */
  display?: (value: T) => string;
  placeholder?: string;
  searchPlaceholder?: string;
  classes?: string;
}) {
  const id = useId();

  return (
    <div className={cn("mt-3 mb-1 flex w-full items-center justify-between gap-3", classes)}>
      <label htmlFor={id} className="text-sm text-ink-muted">
        {label}
      </label>
      <ChoicePopover
        id={id}
        label={label}
        value={value}
        options={options}
        onChange={onChange}
        display={display}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        className="max-w-[60%]"
      />
    </div>
  );
}
