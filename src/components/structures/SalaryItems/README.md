# Salary component

This component is responsable so far managing taxes and contributions, it can be extended to another implementations who involves add elements into the shift.

It has a type which represents what kind of responsability it has, and then it's neccesary to extend the `useTaxOrContributionsStore()` and add the new handler.
