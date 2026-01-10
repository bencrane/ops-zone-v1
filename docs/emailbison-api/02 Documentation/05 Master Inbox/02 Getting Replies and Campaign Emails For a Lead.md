# Master Inbox - Getting Replies and Campaign Emails For a Lead

## Getting Replies for a Lead

- API

Send a `GET` request to

```
/api/leads/{lead_id}/replies
```

The following are the parameters for the request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lead_id` | integer | ✓ | The ID or email of the lead |
| `filters` | | | Show query parameters |

---

## Getting Campaign Emails for a Lead

- API

Send a `GET` request to

```
/api/leads/{lead_id_or_email}/sent-emails
```

The following are the parameters for the request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lead_id_or_email` | integer | ✓ | The ID or email of the lead |