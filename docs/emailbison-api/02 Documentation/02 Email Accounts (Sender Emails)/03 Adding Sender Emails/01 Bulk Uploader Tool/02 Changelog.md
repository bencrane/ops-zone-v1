# Bulk Uploader Tool - Changelog

---

## v2.0.4
**November 2025**

### Minor maintenance patch.

This update is a minor maintenance patch.

---

## v2.0.3
**September 2025**

### Minor enhancements.

- The tool has better selectors for the EmailBison connect page. This update is needed in cases where the layout has changed.
- Fixed an issue where the tool would say the API key is not correct for the workspace, when it is.

---

## v2.0.2
**September 2025**

### Minor enhancements.

- Will now stop on wrong Microsoft username in rod driver.
- Will now display account timeouts ("context deadline exceeded") as failures.
- Explained the "context deadline exceeded" error.

---

## v2.0.1
**September 2025**

### Minor bug fixes.

- Fixed edge case in rod driver where Microsoft password page would time out.
- The average time per account display was rounded, it now displays with 2 decimal places.
- Fixed wording for `--help` flag output.

---

## v2.0.0
**September 2025**

### GUI Overhaul. New Driver. Flag Options in GUI.

This update is a large overhaul of the tool, read below to learn what's been changed:

#### What's new:

- **Brand-new user interface!** The interface looks more pleasing, offers more functionality, and is easier to use.
- You can now set any flag option directly from the GUI just by following the prompts — you can skip learning how to launch the tool from the terminal and pass flags!
- Users who choose to use flags have not been forgotten. Interaction flags have been deprecated for a more intuitive `--non-interactive` flag! This flag removes all input prompts and allows you to integrate the tool with your other automations painlessly. The list of deprecated flags can be found at the end of these update notes.
- Only failures will now be printed to the terminal, and to supplement this, you will have a running count of processed accounts, successful accounts, and failed accounts. This will reduce noise output and help you identify at a glance which accounts failed.
- The output CSV file will now only include failures. This allows you to re-run only failed accounts without an API key, by running the tool again on the output file.
- A new "driver" (the tech that controls the browsers) has been introduced, with promising internal testing. The new driver is selected by default. Users can opt for the old driver either from the GUI or by passing in a `--driver` flag.

#### Deprecated features and flags

- The "reconnect existing accounts" prompt and flag have both been removed. This setting has been replaced by the "skip connected accounts if they exist" setting, which will still sign in to existing accounts in a disconnected state, which is a better workflow.
- The following flags have been removed in favor of the intuitive `--non-interactive` flag:
  - `--skip-api-key-warning`
  - `--skip-workspace-prompt`
- The following flag has been removed:
  - `--connect-existing-accounts`

#### Behaviour Changes

- The following flag has been renamed, and changed to a boolean, false by default:
  - `--connect-disconnected-accounts-only` => `--skip-connected-accounts`

#### Bug fixes

- Fixed Ctrl+C behaviour. You should be able to hit Ctrl+C at any time to stop the tool without unexpected behaviour.
- Fixed incomplete CSV output, and accounts not being tagged, if the tool is stopped before processing all accounts.
- Fixed a case where failures on accounts would have an empty message.
- Fixed dragging a CSV file on the tool causing issues if flags were passed.
- Fixed edge case where user was still prompted when the non-interactive flags were passed.

---

## v1.1.0
**August 2025**

### V2 support. New features. Improved success rate.

The EmailBison Bulk Uploader has been improved and many new features have been added.

#### What's new:

- The tool is updated to work on the EmailBison v2 beta! The tool will auto detect if it should run on v1 or v2 EmailBison, or EmailGuard.
- **New feature:** Only process accounts that are "not connected" on EmailBison (requires API key).
- **New feature (beta):** You can now drop CSV files directly into the executable instead of picking from the file picker.
- Many bug fixes, resulting in much higher success rate.

#### More Details

- Better error messages all around — no more "SMTP error", instead, you get the EmailBison error, such as "Email already exists on another workspace: John's Team".
- New flags added (run the tool with `-help` from the terminal to see all flags):
  - `csv-file` — [interaction] specify a path to a CSV file to skip file picker prompt, works like the config-file flag.
  - `skip-workspace-prompt` — [interaction] skips prompt for confirming the workspace.
  - `skip-api-key-warning` — [interaction] skips prompt for continuing without an API key.
  - `connect-existing-accounts` — [interaction] skips prompt by answering in advance whether to connect existing accounts.
  - `connect-disconnected-accounts-only` — [interaction] skips prompt by answering in advance whether to connect disconnected accounts only.
  - `force-bison-v1` — forces tool into EmailBison v1 mode, if auto-detection fails.
  - `force-bison-v2` — forces tool into EmailBison v2 mode, if auto-detection fails.
- The [interaction] flags will allow the tool to run without any user input.