# Workspaces

## Overview

Workspaces separate your workflows into an isolated environment. It is generally recommended to have each client on their own workspace.

---

## Workspace Scope

Every record in EmailBison is unique per workspace, and you can have the same record in multiple workspaces.

For example, you can have the same leads, tags, and custom variables in multiple workspaces, and they are all unique with their own individual ID.

The only exception to this is sender emails, which can only exist in one workspace at a time.

---

## API Keys

API requests to EmailBison are always scoped to one workspace, for both key types. This allows you to have separate automations for each workspace, based on the key you use.