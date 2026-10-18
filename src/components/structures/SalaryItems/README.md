# Salary items

Taxes for a shift are picked with `TaxPicker`: saved taxes are toggle chips and new
ones are written inline. It works with any `taxesModule` from
`useTaxOrContributionStore` (production, fast charge, track); new taxes are created
with the shift and come back as saved ones through `useSalaryItems()`.

`observer` signals the forms that a submit finished.
