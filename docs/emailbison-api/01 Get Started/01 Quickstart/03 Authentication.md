# Authentication

## API Keys

EmailBison uses **Bearer tokens** to authenticate requests. You can create tokens by visiting `Settings` -> `Developer API` -> `New API Token`.

There are two types of tokens (keys) you can create:

1. `api-user` tokens only authenticate for the workspace they were created in. Each workspace will need a separate token.
2. `super-admin` tokens impersonate the user that created them. While they can only be scoped to one workspace at a time, the workspace they are scoped to will change if the user changes their workspace.

> It is recommended to use `api-user` keys. They are simpler to manage, and generally offer the same permissions.

---

## Authorization

All API requests should include your API key in an Authorization HTTP header as follows:

`Authorization: Bearer YOUR_API_KEY`

Where `Authorization` is the Key in your header, and `Bearer YOUR_API_KEY` is the Value.

An example of a request that is properly authenticated:

### curl
```bash
curl https://dedi.emailbison.com/api/users \
  --header 'Authorization: Bearer 9|q8kSmhjJRqJVT2kc1M0ezX640Pxk'
```

### JavaScript
```javascript
fetch('https://dedi.emailbison.com/api/users', {
  headers: {
    Authorization: 'Bearer 9|q8kSmhjJRqJVT2kc1M0ezX640Pxk'
  }
})
```

### Python
```python
url = "https://dedi.emailbison.com/api/users"

headers = {"Authorization": "Bearer 9|q8kSmhjJRqJVT2kc1M0ezX640P"}

response = requests.get(url, headers=headers)
```