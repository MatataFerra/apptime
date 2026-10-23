import { describe, expect, test } from "vitest";

import en from "#/messages/en.json";
import es from "#/messages/es.json";

type Tree = { [key: string]: string | Tree };

/** "a.b.c" → message, for every leaf. */
function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string"
      ? { ...acc, [path]: value }
      : { ...acc, ...flatten(value, path) };
  }, {});
}

/** ICU arguments used by a message: {name}, {count, plural, …}. */
function argumentsOf(message: string) {
  return [...message.matchAll(/(?<!\b(?:zero|one|two|few|many|other|=\d+)\s*)\{\s*(\w+)\s*[,}]/g)]
    .map(([, name]) => name)
    .sort();
}

const messages = { en: flatten(en), es: flatten(es) };

describe("messages", () => {
  test("es has the same keys as en", () => {
    expect(Object.keys(messages.es).sort()).toEqual(Object.keys(messages.en).sort());
  });

  test("every message has text", () => {
    for (const locale of ["en", "es"] as const) {
      for (const [key, message] of Object.entries(messages[locale])) {
        expect(message.trim(), `${locale}: ${key}`).not.toBe("");
      }
    }
  });

  test("translations use the same arguments", () => {
    for (const [key, message] of Object.entries(messages.en)) {
      expect(argumentsOf(messages.es[key] ?? ""), key).toEqual(argumentsOf(message));
    }
  });
});
