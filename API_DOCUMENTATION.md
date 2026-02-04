# WhitepaperIQ B2B API Documentation

Complete API reference for the WhitepaperIQ B2B platform - a comprehensive blockchain project analysis service.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Patterns](#common-patterns)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#user-endpoints)
   - [Organizations](#organization-endpoints)
   - [Projects](#project-endpoints)
   - [Analyses](#analysis-endpoints)
   - [Search](#search-endpoints)
   - [Debug](#debug-endpoints)
7. [Data Models](#data-models)
8. [Credits System](#credits-system)
9. [Best Practices](#best-practices)

---

## Overview

**Base URL:** `https://api.whitepaperiq.com/api/v1` (or your configured host)

**API Version:** 1.0.0

**Content Type:** All requests and responses use `application/json`

**Versioning:** This API uses URL path versioning. All endpoints are prefixed with `/v1`. Legacy non-versioned URLs redirect to v1 for backward compatibility.

### Health Check

**GET** `/api/health`

Check API availability and version.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-28T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## Authentication

The API uses **JWT Bearer tokens** for authentication.

### Token Types

1. **Access Token** - Short-lived token (7 days) sent in Authorization header
2. **Refresh Token** - Long-lived token (7 days) stored as httpOnly cookie

### Authorization Header Format

```
Authorization: Bearer <access_token>
```

### Token Payload

```typescript
{
  userId: string;
  organizationId: string;
  role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
  iat: number;
  exp: number;
}
```

---

## Common Patterns

### Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Paginated Response Format

```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### Query Parameters for Pagination

- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (validation error)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Codes

- `AUTH_ERROR` - Authentication failed
- `INVALID_TOKEN` - Token is invalid or expired
- `INSUFFICIENT_CREDITS` - Organization has insufficient credits
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `DUPLICATE_RESOURCE` - Resource already exists
- `VALIDATION_ERROR` - Request validation failed
- `PERMISSION_DENIED` - User lacks required permissions

---

## Rate Limiting

Rate limits are enforced per organization or IP address.

### Limits

- **Auth endpoints:** 10 requests per 15 minutes
- **API endpoints:** 100 requests per minute
- **Analysis creation:** 10 requests per hour

### Rate Limit Headers

Response headers include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706443200
```

When rate limit is exceeded, the API returns `429 Too Many Requests`.

---

## Endpoints

### Authentication Endpoints

**Prefix:** `/api/v1/auth`

---

#### Register Organization and User

**POST** `/api/v1/auth/register`

Register a new organization and create the owner user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "organizationName": "Acme Corp",
  "email": "owner@acme.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe" // Optional
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "owner@acme.com",
      "fullName": "John Doe",
      "role": "OWNER",
      "isActive": true,
      "organizationId": "org-uuid",
      "createdAt": "2026-01-28T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Notes:**
- Refresh token is automatically set as httpOnly cookie
- Organization created with `PENDING_SETUP` status and 3 starter credits
- First user becomes `OWNER` with full permissions

**Errors:**
- `400` - Missing required fields
- `409` - Email already registered

---

#### Login

**POST** `/api/v1/auth/login`

Authenticate user and receive access token.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "owner@acme.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "owner@acme.com",
      "fullName": "John Doe",
      "role": "OWNER",
      "isActive": true,
      "organizationId": "org-uuid",
      "createdAt": "2026-01-28T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Notes:**
- Refresh token set as httpOnly cookie
- Cookie settings: `httpOnly=true`, `secure=true` (production), `sameSite=strict`, `maxAge=7days`

**Errors:**
- `400` - Missing email or password
- `401` - Invalid credentials
- `403` - User account is inactive

---

#### Refresh Access Token

**POST** `/api/v1/auth/refresh`

Generate new access token using refresh token from cookie.

**Authentication:** Refresh token (cookie)

**Request Body:** None (uses cookie)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Notes:**
- New refresh token is issued and set as cookie
- Old refresh token becomes invalid

**Errors:**
- `401` - Missing or invalid refresh token

---

#### Logout

**POST** `/api/v1/auth/logout`

Invalidate refresh token and clear session.

**Authentication:** Required (Bearer token)

**Request Body:** None

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Notes:**
- Clears refresh token cookie
- Access token remains valid until expiration (stateless)

---

#### Get Invitation Details

**GET** `/api/v1/auth/invitations/:token`

Retrieve invitation details by token (for invitation acceptance flow).

**Authentication:** Not required

**Path Parameters:**
- `token` (string) - Invitation token

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "invitation-uuid",
    "email": "newuser@acme.com",
    "role": "ANALYST",
    "expiresAt": "2026-02-04T10:30:00.000Z",
    "organization": {
      "id": "org-uuid",
      "name": "Acme Corp",
      "slug": "acme-corp"
    }
  }
}
```

**Errors:**
- `404` - Invitation not found or expired

---

#### Accept Invitation

**POST** `/api/v1/auth/invitations/accept`

Accept organization invitation and create user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "invitation-token",
  "password": "SecurePassword123!",
  "fullName": "Jane Smith" // Optional
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "newuser@acme.com",
      "fullName": "Jane Smith",
      "role": "ANALYST",
      "isActive": true,
      "organizationId": "org-uuid",
      "createdAt": "2026-01-28T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Notes:**
- User is automatically logged in (receives tokens)
- Invitation is consumed and cannot be used again
- Email from invitation is used for account creation

**Errors:**
- `400` - Missing required fields
- `404` - Invalid or expired invitation token
- `409` - User with this email already exists

---

### User Endpoints

**Prefix:** `/api/v1/users`

**Authentication:** All endpoints require Bearer token

---

#### Get Current User Profile

**GET** `/api/v1/users/me`

Retrieve authenticated user's profile.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@acme.com",
    "fullName": "John Doe",
    "role": "ANALYST",
    "isActive": true,
    "organizationId": "org-uuid",
    "createdAt": "2026-01-28T10:30:00.000Z"
  }
}
```

**Errors:**
- `401` - Not authenticated
- `404` - User not found

---

#### Update Current User Profile

**PATCH** `/api/v1/users/me`

Update authenticated user's profile information.

**Authentication:** Required

**Request Body:**
```json
{
  "fullName": "John Smith"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "user@acme.com",
    "fullName": "John Smith",
    "role": "ANALYST",
    "isActive": true,
    "organizationId": "org-uuid",
    "createdAt": "2026-01-28T10:30:00.000Z"
  }
}
```

**Notes:**
- Only `fullName` can be updated via this endpoint
- Email, role, and organization cannot be changed by user
- Whitelisted fields prevent privilege escalation

**Errors:**
- `400` - No fields to update or invalid data
- `401` - Not authenticated

---

### Organization Endpoints

**Prefix:** `/api/v1/organization`

**Authentication:** All endpoints require Bearer token

---

#### Get Current Organization

**GET** `/api/v1/organization`

Retrieve authenticated user's organization details.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "org-uuid",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "plan": "STARTER",
    "status": "ACTIVE",
    "credits": {
      "total": 100,
      "used": 25,
      "remaining": 75
    },
    "billing": {
      "cycleStart": "2026-01-01T00:00:00.000Z"
    },
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `401` - Not authenticated
- `404` - Organization not found

---

#### Update Organization

**PATCH** `/api/v1/organization`

Update organization details.

**Authentication:** Required (OWNER or ADMIN role)

**Request Body:**
```json
{
  "name": "Acme Corporation"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "org-uuid",
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "plan": "PRO",
    "status": "ACTIVE",
    "credits": {
      "total": 200,
      "used": 25,
      "remaining": 175
    },
    "billing": {
      "cycleStart": "2026-01-01T00:00:00.000Z"
    },
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

**Notes:**
- Only `name` can be updated via this endpoint
- Sensitive fields (`plan`, `status`, `creditsTotal`, `creditsUsed`) are automatically filtered out from requests
- These sensitive fields can only be modified by system administrators
- Slug cannot be changed after creation

**Errors:**
- `400` - No fields to update or invalid data
- `401` - Not authenticated
- `403` - Insufficient permissions (requires OWNER or ADMIN)

---

#### List Organization Members

**GET** `/api/v1/organization/members`

List all users in organization and pending invitations.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-uuid-1",
        "email": "owner@acme.com",
        "fullName": "John Doe",
        "role": "OWNER",
        "isActive": true,
        "organizationId": "org-uuid",
        "createdAt": "2026-01-15T10:30:00.000Z"
      },
      {
        "id": "user-uuid-2",
        "email": "analyst@acme.com",
        "fullName": "Jane Smith",
        "role": "ANALYST",
        "isActive": true,
        "organizationId": "org-uuid",
        "createdAt": "2026-01-20T10:30:00.000Z"
      }
    ],
    "pendingInvitations": [
      {
        "id": "invitation-uuid",
        "email": "newmember@acme.com",
        "role": "VIEWER",
        "expiresAt": "2026-02-04T10:30:00.000Z",
        "createdAt": "2026-01-28T10:30:00.000Z"
      }
    ]
  }
}
```

**Errors:**
- `401` - Not authenticated

---

#### Invite User to Organization

**POST** `/api/v1/organization/members`

Create invitation for new organization member.

**Authentication:** Required (OWNER or ADMIN role)

**Request Body:**
```json
{
  "email": "newmember@acme.com",
  "role": "ANALYST"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "invitation-uuid",
    "email": "newmember@acme.com",
    "role": "ANALYST",
    "token": "unique-invitation-token",
    "expiresAt": "2026-02-04T10:30:00.000Z",
    "createdAt": "2026-01-28T10:30:00.000Z"
  }
}
```

**Notes:**
- Invitation expires in 7 days
- Token should be sent to user via email (handled by application)
- Valid roles: `OWNER`, `ADMIN`, `ANALYST`, `VIEWER`
- One pending invitation per email address per organization

**Errors:**
- `400` - Missing required fields or invalid role
- `401` - Not authenticated
- `403` - Insufficient permissions
- `409` - Invitation already exists for this email

---

#### Update Organization Member

**PATCH** `/api/v1/organization/members/:memberId`

Update member role or active status.

**Authentication:** Required (OWNER or ADMIN role)

**Path Parameters:**
- `memberId` (string, UUID) - User ID to update

**Request Body:**
```json
{
  "role": "ADMIN",
  "isActive": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "analyst@acme.com",
    "fullName": "Jane Smith",
    "role": "ADMIN",
    "isActive": true,
    "organizationId": "org-uuid",
    "createdAt": "2026-01-20T10:30:00.000Z"
  }
}
```

**Notes:**
- All fields are optional
- Cannot modify own account
- Cannot change OWNER role (only one OWNER per organization)
- Valid roles: `OWNER`, `ADMIN`, `ANALYST`, `VIEWER`

**Errors:**
- `400` - No fields to update or invalid data
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - User not found or not in organization

---

#### Remove Organization Member

**DELETE** `/api/v1/organization/members/:memberId`

Remove user from organization.

**Authentication:** Required (OWNER or ADMIN role)

**Path Parameters:**
- `memberId` (string, UUID) - User ID to remove

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "email": "analyst@acme.com",
    "fullName": "Jane Smith",
    "role": "ANALYST",
    "isActive": false,
    "organizationId": "org-uuid",
    "createdAt": "2026-01-20T10:30:00.000Z"
  },
  "message": "User removed from organization successfully"
}
```

**Notes:**
- Cannot remove self
- Cannot remove OWNER
- User account is deactivated, not deleted

**Errors:**
- `400` - Cannot remove self or OWNER
- `401` - Not authenticated
- `403` - Insufficient permissions
- `404` - User not found or not in organization

---

### Project Endpoints

**Prefix:** `/api/v1/projects`

**Authentication:** All endpoints require Bearer token

---

#### List Projects

**GET** `/api/v1/projects`

List projects with analyses for current organization.

**Authentication:** Required

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10) - Items per page
- `dataSource` (enum: `COINGECKO` | `MANUAL`) - Filter by data source
- `search` (string) - Search by name or symbol
- `analysisStatus` (enum: `PENDING` | `PROCESSING` | `COMPLETED` | `FAILED`) - Filter by analysis status

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "project-uuid",
      "coingeckoId": "bitcoin",
      "slug": "bitcoin",
      "name": "Bitcoin",
      "symbol": "BTC",
      "imageUrl": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      "contractAddress": null,
      "websiteUrl": "https://bitcoin.org",
      "whitepaperUrl": "https://bitcoin.org/bitcoin.pdf",
      "dataSource": "COINGECKO",
      "createdAt": "2026-01-20T10:30:00.000Z",
      "analysisCount": 3,
      "latestAnalysisStatus": "COMPLETED"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Errors:**
- `401` - Not authenticated

---

#### Get Project by ID

**GET** `/api/v1/projects/:id`

Retrieve single project with latest analysis.

**Authentication:** Required

**Path Parameters:**
- `id` (string, UUID) - Project ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "project-uuid",
    "coingeckoId": "bitcoin",
    "slug": "bitcoin",
    "name": "Bitcoin",
    "symbol": "BTC",
    "imageUrl": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    "contractAddress": null,
    "websiteUrl": "https://bitcoin.org",
    "whitepaperUrl": "https://bitcoin.org/bitcoin.pdf",
    "dataSource": "COINGECKO",
    "createdAt": "2026-01-20T10:30:00.000Z",
    "latestAnalysis": {
      "id": "analysis-uuid",
      "status": "COMPLETED",
      "resultData": { /* analysis results */ },
      "aiTokenUsage": 15000,
      "createdAt": "2026-01-28T10:30:00.000Z"
    }
  }
}
```

**Errors:**
- `401` - Not authenticated
- `404` - Project not found

---

#### Get Project Analysis History

**GET** `/api/v1/projects/:id/history`

Retrieve analysis history for a project.

**Authentication:** Required

**Path Parameters:**
- `id` (string, UUID) - Project ID

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "analysis-uuid-1",
      "status": "COMPLETED",
      "createdAt": "2026-01-28T10:30:00.000Z",
      "user": {
        "id": "user-uuid",
        "fullName": "John Doe",
        "email": "john@acme.com"
      }
    },
    {
      "id": "analysis-uuid-2",
      "status": "COMPLETED",
      "createdAt": "2026-01-25T10:30:00.000Z",
      "user": {
        "id": "user-uuid-2",
        "fullName": "Jane Smith",
        "email": "jane@acme.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

**Errors:**
- `401` - Not authenticated
- `404` - Project not found

---

#### Create Project

**POST** `/api/v1/projects`

Create new project or return existing (find-or-create pattern).

**Authentication:** Required (OWNER, ADMIN, or ANALYST role)

**Request Body (CoinGecko-based):**
```json
{
  "coingeckoId": "bitcoin"
}
```

**Request Body (Manual):**
```json
{
  "name": "Bitcoin",
  "symbol": "BTC",
  "slug": "bitcoin",
  "websiteUrl": "https://bitcoin.org",
  "whitepaperUrl": "https://bitcoin.org/bitcoin.pdf",
  "imageUrl": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  "contractAddress": "0x..."
}
```

**Response:** `201 Created` (new) or `200 OK` (existing)
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "project-uuid",
      "coingeckoId": "bitcoin",
      "slug": "bitcoin",
      "name": "Bitcoin",
      "symbol": "BTC",
      "imageUrl": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      "contractAddress": null,
      "websiteUrl": "https://bitcoin.org",
      "whitepaperUrl": "https://bitcoin.org/bitcoin.pdf",
      "dataSource": "COINGECKO",
      "createdAt": "2026-01-20T10:30:00.000Z"
    },
    "priceData": {
      "currentPrice": 45000.50,
      "priceChange24h": 2.5,
      "totalVolume": 25000000000,
      "marketCap": 880000000000,
      "fullyDilutedValuation": 945000000000,
      "totalSupply": 21000000,
      "maxSupply": 21000000
    }
  }
}
```

**Notes:**
- **CoinGecko-based creation:** Only `coingeckoId` is required. Project data is automatically fetched from CoinGecko API
- **Manual creation:** `name` is required. All other fields are optional
- If `coingeckoId` is provided, `dataSource` is set to `COINGECKO`, otherwise `MANUAL`
- `priceData` is only returned when `coingeckoId` is provided (both for new and existing projects)
- Projects are global - shared across organizations
- Returns existing project if found by `coingeckoId` or `slug`
- Single API call to CoinGecko - efficient data fetching

**Errors:**
- `400` - Missing or invalid name (manual creation)
- `401` - Not authenticated
- `403` - Insufficient permissions (requires OWNER, ADMIN, or ANALYST)
- `404` - CoinGecko ID not found (CoinGecko-based creation)

---

### Analysis Endpoints

**Prefix:** `/api/v1/analyses`

**Authentication:** All endpoints require Bearer token

---

#### Get Analysis by ID

**GET** `/api/v1/analyses/:id`

Retrieve single analysis with full details.

**Authentication:** Required

**Path Parameters:**
- `id` (string, UUID) - Analysis ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "analysis-uuid",
    "organizationId": "org-uuid",
    "projectId": "project-uuid",
    "createdBy": "user-uuid",
    "status": "COMPLETED",
    "resultData": {
      "coinData": { /* mapped CoinGecko data with WTI scores */ },
      "treasuryData": { /* institutional holdings */ },
      "topHoldersData": { /* top token holders */ },
      "inflowOutflowData": { /* token flows */ },
      "aiInsights": {
        "data": {
          "insights": {
            "summary": "Comprehensive overview...",
            "strengths": ["Strong fundamentals", "Active development"],
            "weaknesses": ["Regulatory concerns"],
            "opportunities": ["Market expansion"],
            "threats": ["Competition"],
            "investmentThesis": "Long-term hold...",
            "riskAssessment": "Medium risk..."
          }
        },
        "tokenUsage": {
          "inputTokens": 5000,
          "outputTokens": 2000,
          "totalTokens": 7000
        }
      },
      "detailedAnalysis": {
        "data": {
          "analysis": {
            "marketAnalysis": "Market position is strong...",
            "technicalAnalysis": "Technical indicators suggest...",
            "tokenomicsAnalysis": "Token distribution is...",
            "competitiveAnalysis": "Main competitors include..."
          }
        },
        "tokenUsage": {
          "inputTokens": 6000,
          "outputTokens": 2000,
          "totalTokens": 8000
        }
      }
    },
    "aiTokenUsage": 15000,
    "errorMessage": null,
    "createdAt": "2026-01-28T10:30:00.000Z",
    "project": {
      "id": "project-uuid",
      "name": "Bitcoin",
      "symbol": "BTC",
      "coingeckoId": "bitcoin",
      "imageUrl": "https://..."
    }
  }
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Analysis belongs to different organization
- `404` - Analysis not found

---

#### Create Analysis

**POST** `/api/v1/analyses`

Create and process new blockchain project analysis.

**Authentication:** Required (OWNER, ADMIN, or ANALYST role)

**Request Body:**
```json
{
  "projectId": "project-uuid"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "analysis-uuid",
    "organizationId": "org-uuid",
    "projectId": "project-uuid",
    "createdBy": "user-uuid",
    "status": "COMPLETED",
    "resultData": { /* full analysis results */ },
    "aiTokenUsage": 15000,
    "errorMessage": null,
    "createdAt": "2026-01-28T10:30:00.000Z",
    "project": { /* project details */ }
  }
}
```

**Notes:**
- **Deducts 1 credit** from organization upon creation
- Project must have a valid `coingeckoId`
- Processing is currently synchronous (may take 30-60 seconds)
- Future versions will support async processing with webhooks
- Analysis includes:
  - CoinGecko market data with WTI (Wash Trading Index) scores
  - Arkham intelligence (top holders, token flows)
  - Treasury data (institutional holdings - companies & governments)
  - AI-generated insights (SWOT analysis, investment thesis)
  - Detailed sector analysis (market, technical, tokenomics, competitive)

**Errors:**
- `400` - Missing projectId or project has no coingeckoId
- `401` - Not authenticated
- `403` - Insufficient permissions (requires OWNER, ADMIN, or ANALYST) or insufficient credits
- `404` - Project not found
- `422` - Analysis processing failed

---

### Search Endpoints

**Prefix:** `/api/v1/search`

**Authentication:** All endpoints require Bearer token

---

#### Search Projects

**GET** `/api/v1/search`

Search for projects in database and external sources.

**Authentication:** Required

**Query Parameters:**
- `q` (string, required) - Search query
- `limit` (integer, default: 10) - Max results

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "project-uuid",
        "name": "Bitcoin",
        "symbol": "BTC",
        "imageUrl": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
        "score": 0.95
      }
    ],
    "totalCount": 1,
    "query": "bitcoin"
  }
}
```

**Notes:**
- TODO: Implementation pending
- Will search local database and RediSearch
- Results ranked by relevance score

**Errors:**
- `400` - Missing search query
- `401` - Not authenticated

---

### Debug Endpoints

**Prefix:** `/api/v1/debug`

**Authentication:** Not required (development only)

**⚠️ WARNING:** These endpoints should be disabled or secured in production.

---

#### Test CoinGecko API

**GET** `/api/v1/debug/coingecko/:id`

Test CoinGecko API integration for a coin.

**Path Parameters:**
- `id` (string) - CoinGecko coin ID (e.g., `bitcoin`)

**Response:** `200 OK`
```json
{
  "source": "CoinGecko",
  "id": "bitcoin",
  "success": true,
  "data": { /* mapped CoinGecko data */ },
  "statusCode": 200
}
```

---

#### Test CoinGecko Treasury API

**GET** `/api/v1/debug/coingecko/treasury/:id`

Test CoinGecko Treasury API for institutional holdings.

**Path Parameters:**
- `id` (string) - CoinGecko coin ID

**Response:** `200 OK`
```json
{
  "source": "CoinGecko Treasury",
  "id": "bitcoin",
  "success": true,
  "data": { /* treasury data with companies and governments */ },
  "statusCode": 200
}
```

---

#### Test Arkham Holders API

**GET** `/api/v1/debug/arkham/holders/:id`

Test Arkham API for top token holders.

**Path Parameters:**
- `id` (string) - CoinGecko coin ID

**Response:** `200 OK`
```json
{
  "source": "Arkham",
  "id": "bitcoin",
  "success": true,
  "data": { /* top holders data */ },
  "statusCode": 200
}
```

---

#### Test Arkham Movements API

**GET** `/api/v1/debug/arkham/movements/:id`

Test Arkham API for token inflows/outflows.

**Path Parameters:**
- `id` (string) - CoinGecko coin ID

**Response:** `200 OK`
```json
{
  "source": "Arkham",
  "id": "bitcoin",
  "success": true,
  "data": { /* inflow/outflow data */ },
  "statusCode": 200
}
```

---

#### Test Comprehensive Analysis

**GET** `/api/v1/debug/analyse/:id`

Test full analysis pipeline for a coin.

**Path Parameters:**
- `id` (string) - CoinGecko coin ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "coinData": { /* ... */ },
    "treasuryData": { /* ... */ },
    "topHoldersData": { /* ... */ },
    "inflowOutflowData": { /* ... */ },
    "aiInsights": { /* ... */ },
    "detailedAnalysis": { /* ... */ }
  }
}
```

---

## Data Models

### Enums

#### Plan
```typescript
"FREE" | "STARTER" | "PRO" | "ENTERPRISE"
```

#### OrgStatus
```typescript
"PENDING_SETUP" | "ACTIVE" | "SUSPENDED" | "ARCHIVED"
```

#### Role
```typescript
"OWNER"   // Full control, cannot be removed
"ADMIN"   // Can manage users and org settings
"ANALYST" // Can create analyses and projects
"VIEWER"  // Read-only access
```

#### AnalysisStatus
```typescript
"PENDING"    // Analysis created, not started
"PROCESSING" // Analysis in progress
"COMPLETED"  // Analysis finished successfully
"FAILED"     // Analysis failed with error
```

#### DataSource
```typescript
"COINGECKO" // Data from CoinGecko API
"MANUAL"    // User-provided data
```

---

### User Object

```typescript
{
  id: string;              // UUID
  email: string;
  fullName: string | null;
  role: Role;
  isActive: boolean;
  organizationId: string;  // UUID
  createdAt: Date;
}
```

---

### Organization Object

```typescript
{
  id: string;              // UUID
  name: string;
  slug: string;            // URL-friendly name
  plan: Plan;
  status: OrgStatus;
  credits: {
    total: number;
    used: number;
    remaining: number;
  };
  billing: {
    cycleStart: Date;
  };
  createdAt: Date;
}
```

---

### Project Object

```typescript
{
  id: string;              // UUID
  coingeckoId: string | null;
  slug: string | null;
  name: string;
  symbol: string | null;
  imageUrl: string | null;
  contractAddress: string | null;
  websiteUrl: string | null;
  whitepaperUrl: string | null;
  dataSource: DataSource;
  createdAt: Date;
}
```

---

### Analysis Object

```typescript
{
  id: string;              // UUID
  organizationId: string;  // UUID
  projectId: string;       // UUID
  createdBy: string | null; // User UUID
  status: AnalysisStatus;
  resultData: {            // JSON object with analysis results
    coinData?: {
      // Market data, tickers with WTI scores, links, platforms
      wtiAnalysis?: {
        globalScore: number;
        marketCapRank: number;
        tickersAnalyzed: number;
      };
    };
    treasuryData?: {
      total: {
        total_holdings: number;
        total_value_usd: number;
        market_cap_dominance: number;
      };
      companies: {
        total_holdings: number;
        total_value_usd: number;
        count: number;
        holders: Array<{...}>;
      };
      governments: {
        total_holdings: number;
        total_value_usd: number;
        count: number;
        holders: Array<{...}>;
      };
    };
    topHoldersData?: {
      // Top holders by chain
    };
    inflowOutflowData?: {
      // Token flow analysis
    };
    aiInsights?: {
      data: {
        insights: {
          summary: string;
          strengths: string[];
          weaknesses: string[];
          opportunities: string[];
          threats: string[];
          investmentThesis: string;
          riskAssessment: string;
        };
      };
      tokenUsage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
      };
    };
    detailedAnalysis?: {
      data: {
        analysis: {
          marketAnalysis: string;
          technicalAnalysis: string;
          tokenomicsAnalysis: string;
          competitiveAnalysis: string;
        };
      };
      tokenUsage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
      };
    };
  } | null;
  aiTokenUsage: number;    // Total LLM tokens consumed
  errorMessage: string | null;
  createdAt: Date;
  project?: Project;       // Included in some responses
}
```

---

### Invitation Object

```typescript
{
  id: string;              // UUID
  email: string;
  role: Role;
  token: string;           // Unique invitation token
  expiresAt: Date;
  createdAt: Date;
  organization?: {         // Included when fetching by token
    id: string;
    name: string;
    slug: string;
  };
}
```

---

## Credits System

### Overview

Organizations consume credits when creating analyses. Credits are assigned based on the subscription plan.

### Credit Allocation

- **FREE:** 0 credits
- **STARTER:** 3 credits (default for new orgs)
- **PRO:** 100 credits/month
- **ENTERPRISE:** Custom allocation

### Credit Consumption

- **Create Analysis:** 1 credit (deducted immediately)
- Failed analyses refund the credit automatically
- Deleting analyses does not refund credits

### Credit Tracking

Check remaining credits via:
```
GET /api/v1/organization
```

Response includes:
```json
{
  "credits": {
    "total": 100,
    "used": 25,
    "remaining": 75
  }
}
```

### Insufficient Credits

When organization has 0 credits remaining, analysis creation returns:

```json
{
  "success": false,
  "message": "Insufficient credits to create analysis",
  "statusCode": 403,
  "error": "INSUFFICIENT_CREDITS"
}
```

### Credit Reset

Credits reset at the beginning of each billing cycle (`billingCycleStart`).

---

## Best Practices

### Authentication

1. **Store tokens securely** - Use secure storage (httpOnly cookies, encrypted storage)
2. **Refresh proactively** - Refresh access token before expiration
3. **Handle 401 errors** - Implement automatic token refresh on 401 responses
4. **Logout on exit** - Always call logout endpoint to clear refresh token

### Error Handling

1. **Check success field** - Always verify `success: true` before using data
2. **Display user-friendly messages** - Use `message` field for user feedback
3. **Log error codes** - Use `error` field for debugging and monitoring
4. **Retry on 429** - Implement exponential backoff for rate limits
5. **Handle network errors** - Gracefully handle timeouts and connection issues

### Performance

1. **Use pagination** - Don't fetch large datasets without pagination
2. **Implement caching** - Cache project and organization data
3. **Debounce search** - Wait for user to stop typing before searching
4. **Batch requests** - Group related API calls when possible
5. **Show loading states** - Analysis creation takes 30-60 seconds

### Security

1. **Validate input** - Always validate user input before sending
2. **Use HTTPS** - Never send tokens over unencrypted connections
3. **Implement CSRF protection** - Use CSRF tokens for state-changing operations
4. **Rate limit client-side** - Prevent accidental DoS from your application
5. **Never log tokens** - Sanitize logs to prevent token leakage

### Analysis Creation

1. **Verify project has coingeckoId** - Check before creating analysis
2. **Show progress** - Display processing status to users
3. **Handle long requests** - Implement timeout handling (60+ seconds)
4. **Poll for updates** - If using async processing in future
5. **Display errors clearly** - Show detailed error messages from `errorMessage` field

---

## Changelog

### Version 1.0.0 (2026-01-28)

- Initial API release
- Authentication with JWT (access + refresh tokens)
- Organization and user management with role-based access
- Project CRUD operations (find-or-create pattern)
- Analysis creation with comprehensive data pipeline:
  - CoinGecko market data with WTI analysis
  - Arkham intelligence (holders, flows)
  - Treasury data (companies + governments)
  - AI insights (SWOT, investment thesis, risk assessment)
  - Detailed analysis (market, technical, tokenomics, competitive)
- Credit-based billing system with automatic refunds
- Invitation system for team collaboration
- Health check endpoint

---

## Support

For API support, contact: support@whitepaperiq.com

For bug reports and feature requests, visit: [GitHub Issues](https://github.com/trio-blockchain-labs/WhitepaperIQB2B/issues)

---

**End of API Documentation**
