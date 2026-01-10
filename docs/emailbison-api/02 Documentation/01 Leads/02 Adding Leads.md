# Leads - Adding Leads

You can add leads one at a time using the API, or bulk add leads in a CSV file using the UI or the API.

---

## Adding Single Leads

### API

You can create a single lead by sending a `POST` request at the following endpoint:
```
/api/leads
```

The required fields are `first_name`, `last_name`, and `email`.

The optional fields are `title`, `company`, `notes`, and `custom_variables`.

> Custom variables need to be created in advance in each workspace.

The following is an example of creating a single lead:

#### curl
```bash
curl https://dedi.emailbison.com/api/leads \
  --request POST \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --data '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@doe.com",
    "title": "Engineer",
    "company": "John Doe Company",
    "notes": "Important client",
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
fetch('https://dedi.emailbison.com/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SECRET_TOKEN'
  },
  body: JSON.stringify({
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@doe.com',
    title: 'Engineer',
    company: 'John Doe Company',
    notes: 'Important client',
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
    'title': 'Engineer',
    'company': 'John Doe Company',
    'notes': 'Important client',
    'custom_variables': [
        {
            'name': 'phone number',
            'value': '9059999999',
        },
    ],
}

response = requests.post('https://dedi.emailbison.com/api/leads', headers=headers, json=json_data)
```

---

## Bulk Uploading Leads

### API

> **Note:** Do not set the `content-type` header for this request. It will be automatically set to `multipart/form-data` because of the file included.

Bulk upload leads with a `POST` request to the following endpoint:
```
/api/leads/bulk/csv
```

The request takes the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | required | The name of the lead list that will be created |
| `csv` | FILE | required | The CSV file |
| `columnsToMap[first_name][]` | string | required | The name of the CSV header column that corresponds to `first_name` on EmailBison |
| `columnsToMap[last_name][]` | string | required | The name of the CSV header column that corresponds to `last_name` on EmailBison |
| `columnsToMap[email][]` | string | required | The name of the CSV header column that corresponds to `email` on EmailBison |
| `columnsToMap[{OTHER}][]` | string | optional | The remaining fields you would like to map - including custom variables - each getting their own field |

The following is an example of a request to bulk upload a CSV file:

#### curl
```bash
curl https://dedi.emailbison.com/api/leads/bulk/csv \
  --request POST \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'name=John Does list' \
  --form 'csv=@/Users/Jack/Desktop/list.csv' \
  --form 'columnsToMap[0][first_name]=name' \
  --form 'columnsToMap[0][last_name]=last name' \
  --form 'columnsToMap[0][email]=email' \
  --form 'columnsToMap[0][company]=company name' \
  --form 'columnsToMap[0][my_custom_variable]=my_custom_variable'
```

#### JavaScript
```javascript
let formData = new FormData();

formData.append('file', fs.createReadStream('/Users/Jack/Desktop/list.csv'));
formData.append('name', 'John Does List');
formData.append('columnsToMap[0][first_name]', 'name');
formData.append('columnsToMap[0][last_name]', 'last name');
formData.append('columnsToMap[0][email]', 'email address');
formData.append('columnsToMap[0][company]', 'company name');
formData.append('columnsToMap[0][my_custom_variable]', 'my custom variable');

fetch('https://dedi.emailbison.com/api/leads/bulk/csv', {
  body: formData,
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SECRET_TOKEN'
  }
});
```

#### Python
```python
url = 'https://dedi.emailbison.com/api/leads/bulk/csv'
fp = '/Users/Jack/Desktop/list.csv'

headers = {
    'Authorization': 'Bearer YOUR_SECRET_TOKEN'
}

files = {'file': open(fp, 'rb')}
payload = {
    'name': 'my list',
    'columnsToMap[0][first_name]': 'name',
    'columnsToMap[0][last_name]': 'last name',
    'columnsToMap[0][email]': 'email',
    'columnsToMap[0][company]': 'company name',
    'columnsToMap[0][my_custom_variable]': 'my_custom_variable'
}

response = requests.post(url, headers=headers, files=files, data=payload)
```

### UI

*(UI instructions would go here)*