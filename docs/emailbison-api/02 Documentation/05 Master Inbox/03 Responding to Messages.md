# Master Inbox - Responding to Messages

Send a `POST` request to the following endpoint.

```
/api/replies/{reply_id}/reply
```

The following are the parameters for the request.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reply_id` | integer | ✓ | The ID of the parent reply |
| `message` | string | ✓ | The contents of the reply |
| `sender_email_id` | integer | ✓ | The ID of the sender email |
| `to_emails` | array | ✓ | Array of people to send this email to. The name field in the object can be nulled (left empty). Example: `[ { "name": "John Doe", "email_address": "john@example.com" } ]` |
| `inject_previous_email_body` | boolean\|null | | Whether to inject the body of the previous email into this email. If nothing sent, false is assumed |
| `content_type` | string | | Type of the email (html or text) |
| `cc_emails` | array | | An array of people to send a copy of this email to (Carbon Copy). The name field in the object can be nulled (left empty). Example: `[ { "name": "John Doe", "email_address": "john@example.com" } ]` |
| `bcc_emails` | array | | An array of people to send a blind copy of this email to (Blind Carbon Copy). The name field in the object can be nulled (left empty). Example: `[ { "name": "John Doe", "email_address": "john@example.com" } ]` |