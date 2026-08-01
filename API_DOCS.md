# 博客后端接口文档

本文档定义了博客前端所需的 API 接口。

> 记录工作台使用 `/api/v2/records`。公开访客只能读取公开记录；以下写入接口必须携带站长会话。

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

## 7. 个人记录 v2

### 7.1 获取模块和时间流

- **模块**：`GET /api/v2/records/modules`
- **时间流**：`GET /api/v2/records/timeline?limit=40&cursor=<next_cursor>`
- `TimelineRecordOut` 根据 `kind` 区分 `note`、`focus`、`reading`、`movie`。
- 未登录请求只返回 `visibility=public`；站长请求可读取自己的私有记录。
- 时间流使用稳定游标分页，下一页游标位于 `data.next_cursor`。

### 7.2 写入记录

所有写入接口均要求站长会话，成功响应为 `201` HTTP 状态、业务 `code=200`。

| 类型 | URL | 关键请求字段 |
| --- | --- | --- |
| 笔记 | `POST /api/v2/records/notes` | `content`、`visibility`、`format`、`occurred_at`、`tags`、`source_key` |
| 专注 | `POST /api/v2/records/focus` | `task`、`duration_seconds`、`target_seconds`、`started_at`、`ended_at`、`source_key` |
| 阅读 | `POST /api/v2/records/reading` | `book_title`、`author`、`progress`、`duration_minutes`、`status`、`note`、`visibility`、`source_key` |
| 电影 | `POST /api/v2/records/movies` | `movie_title`、`director`、`rating`、`status`、`duration_minutes`、`note`、`visibility`、`source_key` |

专注记录始终保存为私有，即使请求体携带其他可见性也不会公开。

`source_key` 用于离线待同步记录的幂等提交；同一站主、模块和来源键重复提交会返回已有记录。
