# Email Accounts - Adding Sender Emails

## Bulk Uploading

There are multiple ways to bulk upload accounts to EmailBison.

---

### Custom SMTP Providers (Emails not with Microsoft or Google)

#### API

Send a `POST` request to the following endpoint:
```
/api/sender-emails/imap-smtp
```

> The `Content-Type` header key should be set to `multipart/form-data`.

The only parameter you must provide is `csv`, and the value should be your CSV file.

An example of this request:

##### curl
```bash
curl https://dedi.emailbison.com/api/sender-emails/bulk \
  --request POST \
  --header 'Content-Type: multipart/form-data' \
  --header 'Authorization: Bearer YOUR_SECRET_TOKEN' \
  --form 'csv=@/path/to/your/file.csv'
```

##### JavaScript
```javascript
const formData = new FormData();
formData.append('csv', fs.createReadStream('/path/to/your/file.csv'));

fetch('https://dedi.emailbison.com/api/sender-emails/bulk', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SECRET_TOKEN'
  },
  body: formData
});
```

##### Python
```python
url = 'https://dedi.emailbison.com/api/sender-emails/bulk'

files = {'csv': open('/path/to/your/file.csv', 'rb')}
headers = {
    'Authorization': 'Bearer YOUR_SECRET_TOKEN'
}

response = requests.post(url, files=files, headers=headers)

print(response.json())
```

#### UI

*(UI instructions would go here)*

---

### Microsoft Accounts

The EmailBison team has built and released a native program to bulk upload Microsoft accounts.

The download and all instructions can be found on the [Bulk Uploader Tool](#) page.

---

### Google Accounts

Bulk uploading Google accounts is currently not first-party supported due to the frequent captcha requirements by Google.