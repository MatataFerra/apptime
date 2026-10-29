/*
  Australia's areas for specified work (2nd and 3rd Working Holiday visas),
  by postcode. Copied from the Schedule of the Migration (Specified work and
  areas for subclass 417 visas) Instrument (LIN 22/012) 2022; LIN 22/013 (462)
  uses the same lists. Its later amendments (LIN 24/020, April 2025) only
  changed the bushfire and natural disaster areas, which are listed by local
  government area, not postcode, so they aren't here.

  Check against Home Affairs when the instrument changes:
  https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417/specified-work
*/

/** When the lists below were last checked against the instrument. */
export const AREAS_CHECKED_AT = "2026-10-29";

export type AuState = "NSW" | "VIC" | "QLD" | "SA" | "WA" | "TAS" | "NT" | "ACT";

/** "regional": item 3; "northern": item 2; "remote": item 4 (Remote and Very Remote). */
export type AuArea = "regional" | "northern" | "remote";

type Ranges = [number, number][];

/** "2311-2312, 2328" -> [[2311, 2312], [2328, 2328]] */
function ranges(text: string): Ranges {
  return text.split(",").map((part) => {
    const [from, to = from] = part.trim().split("-").map(Number);
    return [from, to];
  });
}

/** Per state; `true` means every postcode of that state. */
const AREAS: Record<AuArea, Partial<Record<AuState, Ranges | true>>> = {
  regional: {
    // 2899 is Norfolk Island ("all postcodes"), which uses NSW's range.
    NSW: ranges(
      "2311-2312, 2328-2411, 2420-2490, 2536-2551, 2575-2594, 2618-2739, 2787-2898, 2899"
    ),
    VIC: ranges(
      "3139, 3211-3334, 3340-3424, 3430-3649, 3658-3749, 3753, 3756, 3758, 3762, 3764, 3778-3781, 3783, 3797, 3799, 3810-3909, 3921-3925, 3945-3974, 3979, 3981-3996"
    ),
    QLD: ranges(
      "4124-4125, 4133, 4211, 4270-4272, 4275, 4280, 4285, 4287, 4307-4499, 4510, 4512, 4515-4519, 4522-4899"
    ),
    SA: true,
    WA: ranges("6041-6044, 6055-6056, 6069, 6076, 6083-6084, 6111, 6121-6126, 6200-6799"),
    TAS: true,
    NT: true,
  },
  northern: {
    QLD: ranges(
      "4472, 4478, 4481-4482, 4680, 4694-4695, 4697, 4699-4707, 4709-4714, 4717, 4720-4728, 4730-4733, 4735-4746, 4750-4751, 4753-4754, 4756-4757, 4798-4812, 4814-4825, 4828-4830, 4849-4850, 4852, 4854-4856, 4858-4861, 4865, 4868-4888, 4890-4892, 4895"
    ),
    // 0872 is a Northern Territory postcode that also covers part of WA.
    WA: ranges(
      "872, 6537, 6642, 6646, 6701, 6705, 6707, 6710-6714, 6716, 6718, 6720-6722, 6725-6726, 6728, 6740, 6743, 6751, 6753-6754, 6758, 6760, 6762, 6765, 6770"
    ),
    NT: true,
  },
  remote: {
    NSW: ranges(
      "2356, 2386-2387, 2396, 2405-2406, 2672, 2675, 2825-2826, 2829, 2832-2836, 2838-2840, 2873, 2878-2879, 2898-2899"
    ),
    VIC: ranges("3424, 3506, 3509, 3512, 3889-3892"),
    QLD: ranges(
      "4025, 4183, 4417-4420, 4422-4423, 4426-4428, 4454, 4461-4462, 4465, 4467-4468, 4470, 4472, 4474-4475, 4477-4482, 4486-4494, 4496-4497, 4680, 4694-4695, 4697, 4699-4707, 4709-4714, 4717, 4720-4728, 4730-4733, 4735-4746, 4750-4751, 4753-4754, 4756-4757, 4798-4812, 4814-4825, 4828-4830, 4849-4850, 4852, 4854-4856, 4858-4861, 4865, 4868-4888, 4890-4892, 4895"
    ),
    SA: ranges(
      "5220-5223, 5302-5304, 5440, 5576-5577, 5582-5583, 5602-5607, 5611, 5630-5633, 5640-5642, 5650-5655, 5660-5661, 5670-5671, 5680, 5690, 5713, 5715, 5717, 5719-5720, 5722-5725, 5730-5734"
    ),
    WA: ranges(
      "6161, 6335-6338, 6341, 6343, 6346, 6348, 6350-6353, 6355-6359, 6361, 6363, 6365, 6367-6369, 6373, 6375, 6385-6386, 6418-6429, 6431, 6434, 6436-6438, 6440, 6443, 6445-6448, 6450, 6452, 6466-6468, 6470, 6472-6473, 6475-6477, 6479-6480, 6484, 6487-6490, 6515, 6517-6519, 6536, 6605-6606, 6608-6609, 6612-6614, 6616, 6620, 6623, 6625, 6627-6628, 6630-6632, 6635, 6638-6640, 6731, 6733, 6798-6799"
    ),
    TAS: ranges("7001, 7139, 7255-7257, 7466-7470"),
    NT: true,
  },
};

/**
 * Australia Post ranges per state (delivery postcodes; PO boxes use others,
 * e.g. 1xxx in NSW). ACT postcodes inside NSW's 2xxx are told apart first.
 */
const STATE_RANGES: [AuState, Ranges][] = [
  ["ACT", ranges("200-299, 2600-2617, 2900-2920")],
  ["NT", ranges("800-999")],
  ["NSW", ranges("1000-2599, 2618-2899, 2921-2999")],
  ["VIC", ranges("3000-3999, 8000-8999")],
  ["QLD", ranges("4000-4999, 9000-9999")],
  ["SA", ranges("5000-5999")],
  ["WA", ranges("6000-6999")],
  ["TAS", ranges("7000-7999")],
];

function inRanges(value: number, list: Ranges) {
  return list.some(([from, to]) => value >= from && value <= to);
}

/** "4670" -> 4670; null unless it's 4 digits ("872" is written "0872"). */
export function parsePostcode(postcode: string | null | undefined): number | null {
  const value = postcode?.trim() ?? "";
  return /^\d{4}$/.test(value) ? Number(value) : null;
}

/** The state a postcode belongs to; null when it isn't an Australian postcode. */
export function stateOfPostcode(postcode: string | null | undefined): AuState | null {
  const value = parsePostcode(postcode);
  if (value === null) return null;
  return STATE_RANGES.find(([, list]) => inRanges(value, list))?.[0] ?? null;
}

/** "Queensland", "qld", "Qld." -> "QLD"; null when it isn't a state. */
export function parseState(region: string | null | undefined): AuState | null {
  const value = region?.trim().toLowerCase().replace(/\./g, "") ?? "";
  const names: Record<string, AuState> = {
    nsw: "NSW",
    "new south wales": "NSW",
    vic: "VIC",
    victoria: "VIC",
    qld: "QLD",
    queensland: "QLD",
    sa: "SA",
    "south australia": "SA",
    wa: "WA",
    "western australia": "WA",
    tas: "TAS",
    tasmania: "TAS",
    nt: "NT",
    "northern territory": "NT",
    act: "ACT",
    "australian capital territory": "ACT",
  };
  return names[value] ?? null;
}

/** The areas a postcode is in, in the order regional, northern, remote. */
export function areasOfPostcode(postcode: string | null | undefined): AuArea[] {
  const value = parsePostcode(postcode);
  const state = stateOfPostcode(postcode);
  if (value === null || !state) return [];
  return (Object.keys(AREAS) as AuArea[]).filter((area) => {
    const list = AREAS[area][state];
    // 0872 belongs to the NT but is listed under WA too.
    const wa = area === "northern" && value === 872;
    return list === true || (list && inRanges(value, list)) || wa;
  });
}

export type PostcodeCheck =
  | { kind: "empty" }
  /** Not 4 digits, or not a range Australia uses. */
  | { kind: "invalid" }
  /** Valid, but the state typed in the form is another one. */
  | { kind: "state_mismatch"; state: AuState; typed: AuState; areas: AuArea[] }
  | { kind: "ok"; state: AuState; areas: AuArea[] };

/** What the form says about an Australian postcode and the state next to it. */
export function checkPostcode(
  postcode: string | null | undefined,
  region?: string | null
): PostcodeCheck {
  if (!postcode?.trim()) return { kind: "empty" };
  const state = stateOfPostcode(postcode);
  if (!state) return { kind: "invalid" };
  const areas = areasOfPostcode(postcode);
  const typed = parseState(region);
  // 0872 is shared by the NT and WA.
  const shared = parsePostcode(postcode) === 872 && typed === "WA";
  if (typed && typed !== state && !shared) return { kind: "state_mismatch", state, typed, areas };
  return { kind: "ok", state, areas };
}
