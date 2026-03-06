# Blog Backend API Docs

This document defines the core APIs used by the frontend.

## 1. Base

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`

## 2. Auth

### 2.1 Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:

```json
{
  "username": "admin",
  "password": "password"
}
```

### 2.2 Register

- **URL**: `/auth/register`
- **Method**: `POST`

## 3. Articles

### 3.1 List Articles

- **URL**: `/articles`
- **Method**: `GET`
- **Params**:
  - `current`
  - `size`
  - `categoryId`
  - `tagId`
  - `keyword`
  - `sort` (`new` | `hot` | `recommend`)

### 3.2 Article Detail

- **URL**: `/articles/{id}`
- **Method**: `GET`

## 4. Categories & Tags

- **GET** `/categories`
- **GET** `/tags`

## 5. Messages & Comments

- **GET** `/messages`
- **POST** `/messages`

## 6. Site Info

- **GET** `/site/info`
