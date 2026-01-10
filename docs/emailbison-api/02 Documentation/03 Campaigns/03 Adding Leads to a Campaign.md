# Campaigns - Adding Leads to a Campaign

## Adding Leads

- [API](#api)
- [UI](#ui)

> **Note:** Adding leads to an active campaign will take up to 5 minutes for the leads to get synced. This ensures that there is no interruption to the campaigns sending.

---

## Adding Leads from Existing List

Send a `POST` request to the following endpoint:

```
/api/campaigns/{campaign_id}/leads/attach-lead-list
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lead_list_id` | integer | ✓ | The ID of the lead list to add |

### Examples

**cURL**

```bash
curl 'https://dedi.emailbison.com/api/campaigns/6/leads/attach-lead-list' \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
  "lead_list_id": 1
}'
```

**JavaScript**

```javascript
fetch('https://dedi.emailbison.com/api/campaigns/6/leads/attach-lead-list', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_SECRET_TOKEN'
  },
  body: JSON.stringify({
    lead_list_id: 1
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
    'lead_list_id': 1,
}
response = requests.post(
    'https://dedi.emailbison.com/api/campaigns/6/leads/attach-lead-list',
    headers=headers,
    json=json_data,
)
```

---

## Adding Leads by Their IDs

You can also add individual leads to a campaign using the lead IDs. Send a `POST` request to the following endpoint:

```
/api/campaigns/{campaign_id}/leads/attach-leads
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lead_ids` | array | ✓ | An array containing the IDs of the leads to add |

### Examples

**cURL**

```bash
curl 'https://dedi.emailbison.com/api/campaigns/6/leads/attach-leads' \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
  "lead_ids": [1,2,3]
}'
```

**JavaScript**

```javascript
fetch('https://dedi.emailbison.com/api/campaigns/6/leads/attach-leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_SECRET_TOKEN'
  },
  body: JSON.stringify({
    lead_ids: [1, 2, 3]
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
    'lead_ids': [1, 2, 3],
}
response = requests.post(
    'https://dedi.emailbison.com/api/campaigns/6/leads/attach-leads',
    headers=headers,
    json=json_data,
)
```