# Campaigns

## Creating Campaigns

This page walks you through creating a campaign using the API.

---

## Creating a Campaign

Send a **POST** request to `/api/campaigns`.

You must pass **1 body parameter**:

- `name` — the name of the campaign you wish to create.

If successful, you will receive a **200 OK** response with the campaign ID included.

---

## Campaign Settings

### Getting a Campaign ID

You can get a campaign ID in two ways:

- Via the UI:  
  Navigate to the campaign → **Actions** dropdown → **Copy ID for API**
- Via API:  
  Send a **GET** request to `/api/campaigns`

### Viewing Campaign Settings

Send a **GET** request to:

