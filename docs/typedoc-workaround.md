# TypeDoc Workaround Notes

`yarn generate-docs` now runs `typedoc --skipErrorChecking --options typedoc.json` because the current `src/` tree contains numerous TypeScript errors and missing React props definitions. TypeDoc relies on the TypeScript compiler, so those issues prevent documentation from generating unless we bypass type checking.

## Why we skip error checking

- The repository mixes JavaScript/TypeScript files with strict rules, so a full compile fails due to missing type declarations or implicit `any` usage.
- Rather than fix the entire codebase before documenting, we generate docs on the current files while accepting possible unresolved types.

## When to remove the flag

1. Run `yarn lint`/`yarn test` to confirm the failing TypeScript files are addressed.
2. Remove `--skipErrorChecking` from the `generate-docs` script in `package.json` and any related temporary docs (like this file or workflow notes).
3. Re-run `yarn generate-docs` to ensure TypeDoc succeeds with live type checking.

## Where the docs end up

Generated HTML is written to `docs/typedoc/`. Keep that directory ignored from git (per `.gitignore`) unless you decide to commit baselines for publishing, in which case update the workflow and docs references accordingly.
