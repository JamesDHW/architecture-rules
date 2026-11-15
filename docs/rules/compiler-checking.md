<!-- Generated from the rule definitions and test cases in src/rules by pnpm build. Do not edit. -->

# Run the configured compiler without weakening its contract

`compiler-checking` · Structural check; lint comments cannot suppress it

Validate effective compiler settings and strict-family overrides against enabled project requirements. noCheck is forbidden. Missing projects and invalid compiler configurations are errors, never silently skipped. The architecture runner uses compiler diagnostics without emitting application artifacts.
