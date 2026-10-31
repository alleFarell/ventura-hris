# API Standard

## Style

APIs follow REST principles with JSON request and response bodies.

## Versioning

Use path versioning:

```text
/api/v1/{resource}
```

## Response Envelope

Successful responses use:

```json
{
  "success": true,
  "data": {},
  "message": "Request processed successfully",
  "meta": {}
}
```

Error responses use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": []
  }
}
```

## Pagination

Use `page`, `size`, `sort`, and `direction` query parameters.

## Filtering and Search

Filtering must be documented per endpoint. Search behavior must define matched fields, case sensitivity, tokenization, and performance constraints.

## OpenAPI

Every endpoint must be represented in OpenAPI before implementation is considered complete.

