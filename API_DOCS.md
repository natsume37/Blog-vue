# 博客后端接口文档

本文档定义了博客前端所需的 API 接口。

## 1. 基础信息

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`

## 2. 用户认证 (Auth)

### 2.1 用户登录

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "admin",
    "password": "password"
  }
  ```
- **Response**:
  ```json
  {
    "code": 200,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR...",
      "userInfo": {
        "id": 1,
        "nickname": "Admin",
        "avatar": "url"
      }
    },
    "msg": "登录成功"
  }
  ```

### 2.2 用户注册

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "user",
    "password": "password",
    "email": "user@example.com"
  }
  ```

## 3. 文章管理 (Articles)

### 3.1 获取文章列表

- **URL**: `/articles`
- **Method**: `GET`
- **Params**:
  - `current`: 当前页 (默认 1)
  - `size`: 每页数量 (默认 10)
  - `categoryId`: 分类 ID (可选)
  - `tagId`: 标签 ID (可选)
  - `keyword`: 搜索关键词 (可选)
  - `sort`: 排序方式 (`new` | `hot` | `recommend`)
- **Response**:
  ```json
  {
    "code": 200,
    "data": {
      "records": [
        {
          "id": 1,
          "title": "文章标题",
          "summary": "文章摘要",
          "cover": "封面图片URL",
          "createTime": "2025-11-26 12:00:00",
          "categoryName": "技术",
          "viewCount": 100,
          "commentCount": 10,
          "likeCount": 5
        }
      ],
      "total": 100,
      "current": 1,
      "size": 10
    }
  }
  ```

### 3.2 获取文章详情

- **URL**: `/articles/{id}`
- **Method**: `GET`

## 4. 分类与标签 (Categories & Tags)

### 4.1 获取所有分类

- **URL**: `/categories`
- **Method**: `GET`

### 4.2 获取所有标签

- **URL**: `/tags`
- **Method**: `GET`

## 5. 留言与评论 (Messages & Comments)

### 5.1 获取留言板列表

- **URL**: `/messages`
- **Method**: `GET`
- **Params**: `current`, `size`

### 5.2 发布留言

- **URL**: `/messages`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "content": "留言内容",
    "nickname": "游客",
    "avatar": "头像URL"
  }
  ```

## 6. 站点信息 (Site Info)

### 6.1 获取站点统计

- **URL**: `/site/info`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 200,
    "data": {
      "articleCount": 100,
      "tagCount": 20,
      "viewCount": 50000,
      "runDays": 100
    }
  }
  ```
