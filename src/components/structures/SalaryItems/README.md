# Salary items

Taxes for a shift are picked with `TaxPicker`: saved taxes are toggle chips and new
ones are written inline. It works with any `taxesModule` from
`useTaxOrContributionStore` (production, fast charge, track); new taxes are created
with the shift and come back as saved ones through `useSalaryItems()`.

Contributions use the same picker with `kind="contributions"` (or `ContributionPicker`)
and a `contributionsModule`. They're added on top of the pay (summed, see
`services/Contribution/math`) before taxes come off, and the picker also offers the
presets in `services/Contribution/presets` (NZ holiday pay 8%, AU casual loading 25%…).

`observer` signals the forms that a submit finished.
