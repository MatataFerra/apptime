import { formatAbn, isValidAbn } from "@/services/Registry/abr/parse";

/*
  Pasted text (an email signature, a payslip header, a job ad) -> employer
  fields, with plain rules: labelled lines first ("ABN: …", "Phone: …"),
  then things with a recognisable shape (email, ABN, phone, Australian
  address). Whatever is left can be the name. Nothing is invented: every
  value is a piece of the text.
*/

export const PASTE_FIELDS = [
  "name",
  "taxId",
  "industry",
  "address",
  "city",
  "region",
  "postcode",
  "country",
  "contactName",
  "contactEmail",
  "contactPhone",
] as const;

export type PasteField = (typeof PASTE_FIELDS)[number];
export type PastedEmployer = Partial<Record<PasteField, string>>;

/** Label (lowercase, no punctuation) -> field. */
const LABELS: [RegExp, PasteField][] = [
  [
    /^(employer|company|business|business name|trading name|trading as|legal name|entity name|firma|empresa|razon social|razón social)$/,
    "name",
  ],
  [
    /^(abn|tax id|tax no|tax number|tax file|business number|cuit|cuil|steuernummer|steuer nr|ust idnr|ust id|vat|vat no|nzbn|ird|ird number|ein|nif|cif)$/,
    "taxId",
  ],
  [/^(industry|sector|rubro|branche)$/, "industry"],
  [
    /^(address|street|street address|postal address|location|adresse|anschrift|dirección|direccion|domicilio)$/,
    "address",
  ],
  [/^(city|town|suburb|stadt|ort|ciudad|localidad)$/, "city"],
  [/^(state|region|province|provincia|bundesland|county)$/, "region"],
  [
    /^(postcode|post code|postal code|zip|zip code|plz|cp|codigo postal|código postal)$/,
    "postcode",
  ],
  [/^(country|land|país|pais)$/, "country"],
  [
    /^(contact|contact name|contact person|manager|supervisor|attn|attention|ansprechpartner|contacto|encargado)$/,
    "contactName",
  ],
  [/^(email|e mail|mail|correo)$/, "contactEmail"],
  [
    /^(phone|ph|tel|telephone|mobile|mob|cell|telefon|telefono|teléfono|celular|handy)$/,
    "contactPhone",
  ],
];

const AU_STATES = "NSW|VIC|QLD|SA|WA|TAS|NT|ACT";
const COUNTRIES =
  /^(australia|new zealand|aotearoa|germany|deutschland|argentina|canada|united kingdom|uk|ireland|united states|usa|spain|españa|france|italy|italia|netherlands|japan|chile|uruguay)$/i;
const STREET = new RegExp(
  [
    String.raw`^\d+[a-z]?[\s/-]`,
    String.raw`\b(st|street|rd|road|ave|avenue|hwy|highway|dr|drive|lane|ln|ct|court|pl|place|cres|crescent|tce|terrace|pde|parade|way|blvd|boulevard|calle|avenida|av\.|ruta|po box|locked bag)\b`,
    // German compounds end in it ("Hauptstraße"), so no word boundary before.
    String.raw`(straße|strasse|str\.|weg|platz|allee|gasse|damm)(?=[\s\d,]|$)`,
  ].join("|"),
  "i"
);
const COMPANY =
  /\b(pty\.? ?ltd\.?|ltd\.?|limited|gmbh|ag|ug|s\.?a\.?|s\.?r\.?l\.?|sas|llc|inc\.?|co\.|trust|farms?|orchards?|vineyards?|nursery)\b/i;

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;
const ABN_CANDIDATE = /(?<!\d)\d{2} ?\d{3} ?\d{3} ?\d{3}(?!\d)/g;
const CUIT = /(?<!\d)\d{2}-\d{8}-\d(?!\d)/;
// Starts with +, 0 or "(": phone numbers do, dates and amounts don't.
const PHONE = /(?<![\w\d])(?:\+|0|\()[\d\s().-]{6,}\d/;

function clean(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/^[\s,;|·:–—-]+|[\s,;|·:–—-]+$/g, "")
    .trim();
}

function labelKey(label: string) {
  return label
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, "").length;
}

/**
 * "12 Packhouse Rd, Bundaberg QLD 4670" -> street, town, state, postcode.
 * Null if it doesn't end in an Australian state and postcode.
 */
function splitAustralianAddress(line: string): PastedEmployer | null {
  const m = line.match(
    new RegExp(`^(.*?)[,\\s]+(${AU_STATES})[,\\s]+(\\d{4})(?:[,\\s]+australia)?\\.?$`, "i")
  );
  if (!m) return null;

  const before = clean(m[1]);
  const out: PastedEmployer = { region: m[2].toUpperCase(), postcode: m[3], country: "Australia" };
  if (before.includes(",")) {
    const cut = before.lastIndexOf(",");
    out.address = clean(before.slice(0, cut)) || undefined;
    out.city = clean(before.slice(cut + 1)) || undefined;
  } else if (/\d/.test(before)) {
    // No comma to tell street from town: keep it whole as the address.
    out.address = before || undefined;
  } else {
    out.city = before || undefined;
  }
  return out;
}

/** "10115 Berlin" (German style: postcode first). */
function splitPostcodeCity(line: string): PastedEmployer | null {
  const m = line.match(/^(\d{4,5})\s+(\p{Lu}[\p{L} .'-]+)$/u);
  return m ? { postcode: m[1], city: clean(m[2]) } : null;
}

export type PasteResult = {
  fields: PastedEmployer;
  /** Fields worked out from position, not from a label or a shape: check them. */
  guessed: PasteField[];
};

export function parseEmployerText(input: string): PasteResult {
  const fields: PastedEmployer = {};
  const guessed: PasteField[] = [];
  // First value found for a field wins.
  function set(field: PasteField, value: string | undefined) {
    const v = value ? clean(value) : "";
    if (v && !fields[field]) fields[field] = v;
  }
  function setAll(values: PastedEmployer | null) {
    for (const [field, value] of Object.entries(values ?? {})) set(field as PasteField, value);
  }

  // What's left of each line once recognised pieces are taken out.
  const lines = input
    .split(/\r?\n|\s\|\s|\s·\s/)
    .map(clean)
    .filter(Boolean);

  // 1. Labelled lines.
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^([\p{L} .()/-]{2,30}?)\s*[:：]\s*(.+)$/u);
    if (!m) continue;
    const field = LABELS.find(([re]) => re.test(labelKey(m[1])))?.[1];
    const value = clean(m[2]);
    if (!field) {
      // "Website: …", "Hours: …": known not to be the name.
      if (!/^https?$/i.test(m[1].trim())) lines[i] = "";
      continue;
    }
    if (field === "taxId" && isValidAbn(value)) set("taxId", formatAbn(value));
    else if (field === "address") {
      const au = splitAustralianAddress(value);
      if (au) setAll(au);
      else set("address", value);
    } else set(field, value);
    lines[i] = "";
  }

  // 2. Shapes, anywhere in the remaining text.
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (!line) continue;

    // Websites aren't saved, and they'd pass for a name.
    line = line.replace(/\b(?:https?:\/\/|www\.)\S+/gi, " ");

    const email = line.match(EMAIL)?.[0];
    if (email) {
      set("contactEmail", email);
      line = line.replace(email, " ");
    }

    for (const candidate of line.match(ABN_CANDIDATE) ?? []) {
      if (isValidAbn(candidate)) {
        set("taxId", formatAbn(candidate));
        line = line.replace(candidate, " ").replace(/\bABN\b:?/i, " ");
      }
    }

    const cuit = line.match(CUIT)?.[0];
    if (cuit) {
      set("taxId", cuit);
      line = line.replace(cuit, " ").replace(/\bCUI[TL]\b:?/i, " ");
    }

    const phone = line.match(PHONE)?.[0];
    if (phone && phoneDigits(phone) >= 8 && phoneDigits(phone) <= 15) {
      set("contactPhone", phone);
      line = line.replace(phone, " ").replace(/\b(ph|tel|phone|mob|mobile|m|t)\b\.?:?/i, " ");
    }

    line = clean(line);

    const au = splitAustralianAddress(line);
    if (au) {
      // The street is often on the line before: "12 Packhouse Rd" / "Bundaberg QLD 4670".
      if (!au.address && i > 0 && lines[i - 1] && STREET.test(lines[i - 1])) {
        au.address = lines[i - 1];
        lines[i - 1] = "";
      }
      setAll(au);
      line = "";
    } else if (COUNTRIES.test(line)) {
      set("country", line);
      line = "";
    } else {
      const pc = splitPostcodeCity(line);
      if (pc) {
        if (i > 0 && lines[i - 1] && STREET.test(lines[i - 1])) {
          set("address", lines[i - 1]);
          lines[i - 1] = "";
        }
        setAll(pc);
        line = "";
      }
    }

    lines[i] = line;
  }

  // 3. A street left on its own line.
  const street = lines.findIndex((l) => l && /^\d/.test(l) && STREET.test(l));
  if (street >= 0 && !fields.address) {
    set("address", lines[street]);
    lines[street] = "";
  }

  // 4. The name: a line that looks like a company, else the first one with words.
  if (!fields.name) {
    const left = lines.filter((l) => l && /\p{L}{2}/u.test(l) && l.length <= 80);
    const name = left.find((l) => COMPANY.test(l)) ?? left[0];
    if (name) {
      set("name", name);
      guessed.push("name");
    }
  }

  return { fields, guessed };
}
