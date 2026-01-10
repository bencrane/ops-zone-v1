# Notes and Terminology

## Endpoint / URL

Throughout this documentation, you will see endpoint URLs formatted such as:
```
/api/tags/attach-to-leads
```

This is not the full URL, as each user will have a different base URL to prepend. The base URL of endpoints will be the same URL you use to log in to EmailBison. For example, if you log in to `https://send.greenmarketing.com`, then the preceding request should be made to:
```
https://send.greenmarketing.com/api/tags/attach-to-leads
```

---

## Path, Query, and Body Parameters

There are three (four including headers) types of parameters:

- Path Parameters
- Query Parameters
- Body Parameters

The majority of parameters will be body parameters. These are parameters sent in the body of a request, in the form of JSON. Path parameters are part of the URL, separated by slashes. They are straight-forward and easy to spot. Query parameters are appended to a URL, starting with a `?` sign.

### Path Parameters

In this documentation, these are represented as part of the endpoint, wrapped in `{}` brackets. An example of a `campaign_id` path parameter is in the following endpoint:
```
GET /api/campaigns/{campaign_id}
```

Path parameters have to be substituted, including the surrounding `{}` brackets, with the variable they represent, usually an ID. For this example, a correct request would be made to:
```
/api/campaigns/27
```

### Query Parameters

> For convenience, EmailBison will convert body parameters into query parameters automatically, if the parameter names match.

These parameters are used in `GET` requests. They can be appended directly to the URL, or handled by the tool you are using to send requests. If appended to the URL, you must add a question mark — `?` — and then your query parameters, separated by an ampersand — `&`.

The following is an example of a request containing `folder: inbox` and `status: interested` query parameters:
```
/api/replies?folder=inbox&status=interested
```

For arrays, such as `tag_ids`, pass the array entries using the following syntax:
```
/api/replies?tag_ids[]=1&tag_ids[]=2&tag_ids[]=3
```

This request will send an array of `tag_ids = [1, 2, 3]`.

### Body Parameters

EmailBison uses the JSON data format for body parameters, unless the request will include a file, then it will use Form Data. JSON body parameters will look like the following example:
```json
{
    "name": "John",
    "email": "john@email.com",
    "company": "EmailBison",
    "custom_variables": [
        {
            "name": "phone_number",
            "value": "123-456-7890"
        }
    ]
}
```