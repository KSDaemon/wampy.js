# Changelog

## Unreleased

### Fixed

- Accept leading, trailing, consecutive, and separated wildcard URI components
  in subscriptions and registrations, including empty and dot-terminated
  prefixes, with both strict and loose URI validation ([#721](https://github.com/KSDaemon/wampy.js/issues/721)).
- Reject empty URI components when registering a procedure with an explicit
  `match: 'exact'` policy, consistently with the default matching policy.
