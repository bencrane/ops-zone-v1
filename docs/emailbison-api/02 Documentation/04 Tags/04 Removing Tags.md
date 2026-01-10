# Tags - Removing Tags

- API
- UI

Send a `DELETE` request to one of the following endpoints.

```
/api/tags/attach-to-sender-emails
```

```
/api/tags/attach-to-leads
```

```
/api/tags/attach-to-campaigns
```

The fields for these endpoints are:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tag_ids` | array | ✓ | An array of tag IDs to remove |
| `{taggable}_ids` | array | ✓ | An array of taggables to remove the tags from. One of `sender_email_ids`, `lead_ids`, `campaign_ids` |

An example of a request to remove tags with IDs 1 and 2 from sender emails with IDs 3 and 4:

**cURL**

```bash
curl https://dedi.emailbison.com/api/tags/attach-to-sender-emails \
  --request DELETE \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
  "tag_ids": [1, 2],
  "sender_email_ids": [3, 4]
}'
```

**JavaScript**

```javascript
fetch('https://dedi.emailbison.com/api/tags/attach-to-sender-emails', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_SECRET_TOKEN'
  },
  body: JSON.stringify({
    tag_ids: [1, 2],
    sender_email_ids: [3, 4]
  })
})
```

**Python**

```python
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SECRET_TOKEN',
}
json_data = {
    'tag_ids': [1, 2],
    'sender_email_ids': [3, 4]
}
response = requests.delete('https://dedi.emailbison.com/api/tags/attach-to-sender-emails', headers=headers, json=json_data)
```