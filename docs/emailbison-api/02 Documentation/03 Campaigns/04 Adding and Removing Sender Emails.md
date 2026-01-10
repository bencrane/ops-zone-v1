# Campaigns - Adding and Removing Sender Emails

## Adding Sender Emails

Send a `POST` request to the following endpoint:

```
/api/campaigns/{campaign_id}/attach-sender-emails
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sender_email_ids` | array | ✓ | An array containing the IDs of the sender emails to add |

### Examples

**cURL**

```bash
curl 'https://dedi.emailbison.com/api/campaigns/6/attach-sender-emails' \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
  "sender_email_ids": [1,2,3]
}'
```

**JavaScript**

```javascript
fetch('https://dedi.emailbison.com/api/campaigns/6/attach-sender-emails', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_SECRET_TOKEN'
  },
  body: JSON.stringify({
    sender_email_ids: [1, 2, 3]
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
    'sender_email_ids': [1, 2, 3],
}
response = requests.post(
    'https://dedi.emailbison.com/api/campaigns/6/attach-sender-emails',
    headers=headers,
    json=json_data,
)
```

---

## Removing Sender Emails

Send a `DELETE` request to the following endpoint:

```
/api/campaigns/{campaign_id}/remove-sender-emails
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sender_email_ids` | array | ✓ | An array containing the IDs of the sender emails to remove |

### Examples

**cURL**

```bash
curl 'https://dedi.emailbison.com/api/campaigns/6/remove-sender-emails' \
  --request DELETE \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
  "sender_email_ids": [1,2,3]
}'
```

**JavaScript**

```javascript
fetch('https://dedi.emailbison.com/api/campaigns/6/remove-sender-emails', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_SECRET_TOKEN'
  },
  body: JSON.stringify({
    sender_email_ids: [1, 2, 3]
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
    'sender_email_ids': [1, 2, 3],
}
response = requests.delete(
    'https://dedi.emailbison.com/api/campaigns/6/remove-sender-emails',
    headers=headers,
    json=json_data,
)
```