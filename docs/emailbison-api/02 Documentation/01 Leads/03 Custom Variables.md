# Leads - Custom Variables

A custom variable is EmailBison's way of attaching any extra information to a lead.

Custom Variables need to be created before they can be attached to leads with a custom value for each lead.

> **Note:** Custom variables are unique per workspace.

---

## Creating Custom Variables

### API

You can create a custom variable by submitting a `POST` request at the following endpoint:
```
/api/custom-variables
```

The only field you can and must provide is `name`, which is a name for the custom variable.

---

## Attaching Custom Variables to Leads

### API

When you are creating or updating a lead - either with a `POST` or a `PUT` - you can pass the `custom_variables` field as an array of objects that contain a `name` key and a `value` key. The JSON will look like the following:
```json
"custom_variables": [
    {
      "name": "phone_number",
      "value": "123-456-7890"
    },
    {
      "name": "priority",
      "value": "super-high"
    }
]
```

> Note how everything is wrapped in an array identifier `[]`, and each custom variable is wrapped in an object identifier `{}`.

An example of adding custom variables when updating leads:

#### curl
```bash
curl https://dedi.emailbison.com/api/leads/{lead_id} \
  --request PUT \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@doe.com",
    "custom_variables": [
      {
        "name": "phone number",
        "value": "9059999999"
      }
    ]
  }'
```

#### JavaScript
```javascript
fetch('https://dedi.emailbison.com/api/leads/{lead_id}', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SECRET_TOKEN'
  },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@doe.com',
    custom_variables: [
      {
        name: 'phone number',
        value: '9059999999'
      }
    ]
  })
});
```

#### Python
```python
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SECRET_TOKEN',
}

json_data = {
    'first_name': 'John',
    'last_name': 'Doe',
    'email': 'john@doe.com',
    'custom_variables': [
        {
            'name': 'phone number',
            'value': '9059999999',
        },
    ],
}

response = requests.put('https://dedi.emailbison.com/api/leads/{lead_id}', headers=headers, json=json_data)
```

### UI

*(UI instructions would go here)*