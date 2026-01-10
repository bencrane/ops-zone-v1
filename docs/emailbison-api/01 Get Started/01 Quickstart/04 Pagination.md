# Pagination

Some API requests will retrieve a large dataset. To ensure proper handling of this data, EmailBison will paginate the response.

This essentially means that you will receive chunks, or pages, of the data. The response will be broken up into pages of 15 data entries per page, with information on how to view the next chunk.

For example, a `GET` request at the endpoint `/api/leads` will always be paginated, as there could be thousands of entries in leads.

Paginated responses from the API will have a `data` field for the entries at this page, as well as `links` and `meta` fields that provide you with information about the pagination in the response.

<details>
<summary>Show example of a paginated response from the leads endpoint</summary>

**200**
```json
{
    "data": [
        {
            "id": 835910,
            "first_name": "John",
            "last_name": "Doe",
            "email": "JohnDoe@email.com"
        },
        {
            "id": 835898,
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "JaneDoe@email.com"
        },
        // ... +13 Leads
    ],
    "links": {
        "first": "https://dedi.emailbison.com/api/leads?page=1",
        "last": "https://dedi.emailbison.com/api/leads?page=4",
        "prev": null,
        "next": "https://dedi.emailbison.com/api/leads?page=2"
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 4,
        // ...Extra information truncated
    }
}
```

</details>

---

## Retrieving the data programmatically

Send a request to your desired paginated endpoint. After processing the data received, you would then send a request to the endpoint provided at `links.next` in the response, if it is not `null`.

Alternatively, you could loop the query by adding the page number as a parameter for your request, incrementing the page number until you reach `meta.last_page`.

This looks like `YOUR_URL.com/api/leads?page={page_number}`, where `{page_number}` is incremented by 1 each time until you reach `meta.last_page`.

---

## Retrieving a specific page

Add a query parameter to the end of your request with the page number.

This looks like `YOUR_URL.com/api/leads?page={page_number}`, where `{page_number}` is the page you would like to retrieve.