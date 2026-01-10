# Tags - Creating Tags

Tags are a way for you to separate different leads/sender emails/campaigns into their own categories.

- API
- UI

Send a `POST` request to the following endpoint.

```
/api/tags
```

There are 2 fields you can provide, `name` and `default`.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | ✓ | | A name for the tag |
| `default` | boolean | | `false` | Whether this is a default tag *(deprecated)* |

An example of a request in curl:

```bash
curl https://dedi.emailbison.com/api/tags \
--request POST \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
--data '{
"name": "Important",
"default": false
}'
```