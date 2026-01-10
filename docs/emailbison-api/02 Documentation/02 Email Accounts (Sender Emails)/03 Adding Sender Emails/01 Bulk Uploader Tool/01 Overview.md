# Bulk Uploader Tool

## Overview

The EmailBison team provides executables for uploading Microsoft accounts to EmailBison on Windows, macOS, and Linux.

The latest version of the tool can be downloaded here:

| Platform | Description |
|----------|-------------|
| **Windows** | The executable for Windows |
| **macOS** | The binary for macOS |
| **Linux** | The binary for Linux |

---

## Using the tool

In the zip file you downloaded, you will find instructions on using the tool in `how_to_use.txt`.

Alternatively, you can watch a walkthrough of using the tool in action:

*(Video walkthrough would be embedded here)*

---

## Advanced Usage

The walkthrough above is enough for most use-cases.

However, the bulk uploader tool can be fine-tuned to specific needs with flags. Flags are arguments you pass in the command line. You can watch the following video for a quickstart:

*(Video walkthrough would be embedded here)*

### Flags available

These are the flags available. You can use the flag `--help` to see these flags in your terminal.

| Flag | Type | Description | Default | Example |
|------|------|-------------|---------|---------|
| `non-interactive` | boolean | Disable all prompts and inputs. Still outputs info to the terminal. `--csv-file` flag required with this flag | false | `--non-interactive` |
| `browsers` | integer | How many browsers to spawn concurrently | 6, min: 1, max: 16 | `--browsers 4` |
| `no-headless` | boolean | Spawns visible browsers. Use `--browsers 1` with this flag | false | `--no-headless` |
| `timeout` | integer | How long, in seconds, before treating the email as a fail and moving on. Useful to change on very slow connections | 75, min: 30, max: 180 | `--timeout 180` |
| `tag` | string | What to tag this batch of emails (will create tag if it doesn't exist) | "" | `--tag "batch 1"` |
| `skip-connected-accounts` | boolean | If account exists on EmailBison, and is in a "connected" state, skip it | false | `--skip-connected-accounts` |
| `config-file` | string | Use a custom config file, you can also provide the path if in another directory | "config.txt" | `--config-file "../configs/workspace4.txt"` |
| `csv-file` | string | A path to the csv file to use, to skip the file picker prompt | "" | `--csv-file "../files/accounts.csv"` |
| `throttle` | boolean | Use recommended throttling to avoid issues of the script signing in to accounts too fast | false | `--throttle` |
| `driver` | string | The technology that controls the browsers. Either "rod" or "chromedp" | "rod" | `--driver chromedp` |
| `force-bison-v1` | boolean | Force the script to use EmailBison v1 mode | false | `--force-bison-v1` |
| `force-bison-v2` | boolean | Force the script to use EmailBison v2 mode | false | `--force-bison-v2` |

---

## Issues

### Common Issues When Launching

The default settings on operating systems could prevent the program from being launched.

Open the dropdown for the issue you are facing to see steps on resolving the issue.

*(Dropdown content would go here)*

### Common Issues While Using the Script

Issues you may come across after launching the script can be split into 2 categories:

1. **Set-up Issues** — i.e. the script didn't make it to the email sign-in stage
2. **Email Sign-in Issues** — i.e. most emails failed to upload

*(Additional troubleshooting content would go here)*