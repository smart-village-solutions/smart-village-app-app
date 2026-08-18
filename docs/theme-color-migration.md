# Legacy app color migration

Use the theme migration script after merging the open-source master branch into an app-specific
branch. It restores that app's historical `src/config/colors.js` values in the current
`src/config/colors.ts` light palette, carries app branding into safe dark-palette tokens, and prints
a complete, copy-ready `globalSettings` JSON object.

## Quick usage

Preview the automatically detected migration without changing files:

```sh
yarn theme:migrate:dry
```

Apply the migration and print the JSON:

```sh
yarn theme:migrate
```

Select a known pre-merge commit and save the generated JSON:

```sh
yarn theme:migrate --source-ref <commit> --output /tmp/globalSettings-theme.json
```

With npm, pass script arguments after `--`:

```sh
npm run theme:migrate -- --source-ref <commit>
```

Run `yarn theme:migrate --help` for every option.

## Source detection

By default, the script starts at `HEAD` and searches its first-parent history for the nearest
`src/config/colors.js`. First-parent search keeps an app branch's own pre-merge history ahead of the
master branch that was merged into it.

Use `--source-ref` when a specific pre-merge commit should be used. Alternative file locations can
be supplied with `--source-path`.

The historical JavaScript is parsed statically and is never executed.

## Mapping behavior

- Legacy tokens that still exist are copied by name.
- `surface` supplies new `background` and `surfaceElevated` defaults.
- `darkText` supplies `text`.
- `lightestText` supplies `onPrimary`.
- `gray40` supplies `border`.
- Missing calendar and refresh tokens use their closest legacy brand token.
- Tokens that have no legacy equivalent retain the current light-palette default.
- Dark structural tokens remain unchanged: `background`, `surface`, `surfaceElevated`, `text`,
  `textMuted`, `border`, `error`, shadows, overlays, grays, and calendar surfaces.
- Dark brand/action tokens are migrated: the primary family, `secondary`, `accent`, `blue`,
  calendar selection/today colors, and `refreshControl`.
- The legacy `lighterPrimary` is preferred for the dark primary family because it is the existing
  app color most suitable for dark surfaces. Dark RGBA variants retain the standard dark alpha
  levels.
- `onPrimary`, `lightestText`, and `calendarSelectedDayText` are selected automatically as dark or
  light foregrounds according to contrast with their migrated backgrounds.

The generated `globalSettings` object contains both migrated palettes under
`settings.accessibility.themePalettes`.

## Safety

When `src/config/colors.ts` has local changes, the script asks for confirmation before overwriting
it in an interactive terminal. Answer `y` or `yes` to continue; any other answer cancels the
migration without writing files.

In CI and other non-interactive environments, the script cannot request confirmation and exits
safely. Commit or stash the target first, or use `--force` when the local changes are intentionally
disposable. `--force` also skips the confirmation prompt in interactive terminals. Use `--dry-run`
to inspect both the token list and generated JSON before writing.
