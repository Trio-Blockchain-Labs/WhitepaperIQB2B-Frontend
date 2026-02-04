# WhitepaperIQ B2B API Return Types

This document contains all the response schemas and return types for the WhitepaperIQ B2B API endpoints.

## Table of Contents

1. [Common Response Patterns](#common-response-patterns)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Endpoints](#user-endpoints)
4. [Organization Endpoints](#organization-endpoints)
5. [Project Endpoints](#project-endpoints)
6. [Analysis Endpoints](#analysis-endpoints)
7. [Search Endpoints](#search-endpoints)
8. [Debug Endpoints](#debug-endpoints)
9. [Error Response Types](#error-response-types)

---

## Common Response Patterns

### Standard Success Response
```typescript
{
  success: true;
  data: any; // Varies by endpoint
}
```

### Standard Error Response
```typescript
{
  success: false;
  message: string;
  error?: string; // Error code
}
```

### Paginated Response
```typescript
{
  success: true;
  data: any[]; // Array of items
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## Authentication Endpoints

### POST /api/v1/auth/register

**Success Response (201 Created):**
```typescript
{
  success: true;
  data: {
    user: {
      id: string; // UUID
      email: string;
      fullName: string | null;
      role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
      isActive: boolean;
      organizationId: string; // UUID
      createdAt: string; // ISO date
    };
    accessToken: string; // JWT
  };
}
```

### POST /api/v1/auth/login

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    user: {
      id: string; // UUID
      email: string;
      fullName: string | null;
      role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
      isActive: boolean;
      organizationId: string; // UUID
      createdAt: string; // ISO date
    };
    accessToken: string; // JWT
  };
}
```

### POST /api/v1/auth/refresh

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    accessToken: string; // JWT
  };
}
```

### POST /api/v1/auth/logout

**Success Response (200 OK):**
```typescript
{
  success: true;
  message: "Logged out successfully";
}
```

### GET /api/v1/auth/invitations/:token

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    email: string;
    role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
    expiresAt: string; // ISO date
    organization: {
      id: string; // UUID
      name: string;
      slug: string;
    };
  };
}
```

### POST /api/v1/auth/invitations/accept

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    user: {
      id: string; // UUID
      email: string;
      fullName: string | null;
      role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
      isActive: boolean;
      organizationId: string; // UUID
      createdAt: string; // ISO date
    };
    accessToken: string; // JWT
  };
}
```

---

## User Endpoints

### GET /api/v1/users/me

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    email: string;
    fullName: string | null;
    role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
    isActive: boolean;
    organizationId: string; // UUID
    createdAt: string; // ISO date
  };
}
```

### PATCH /api/v1/users/me

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    email: string;
    fullName: string | null;
    role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
    isActive: boolean;
    organizationId: string; // UUID
    createdAt: string; // ISO date
  };
}
```

---

## Organization Endpoints

### GET /api/v1/organization

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    name: string;
    slug: string;
    plan: "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
    status: "PENDING_SETUP" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
    credits: {
      total: number;
      used: number;
      remaining: number;
    };
    billing: {
      cycleStart: string; // ISO date
    };
    createdAt: string; // ISO date
  };
}
```

### PATCH /api/v1/organization

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    name: string;
    slug: string;
    plan: "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
    status: "PENDING_SETUP" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
    credits: {
      total: number;
      used: number;
      remaining: number;
    };
    billing: {
      cycleStart: string; // ISO date
    };
    createdAt: string; // ISO date
  };
}
```

### GET /api/v1/organization/members

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    users: Array<{
      id: string; // UUID
      email: string;
      fullName: string | null;
      role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
      isActive: boolean;
      organizationId: string; // UUID
      createdAt: string; // ISO date
    }>;
    pendingInvitations: Array<{
      id: string; // UUID
      email: string;
      role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
      expiresAt: string; // ISO date
      createdAt: string; // ISO date
    }>;
  };
}
```

### POST /api/v1/organization/members

**Success Response (201 Created):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    email: string;
    role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
    token: string; // Invitation token
    expiresAt: string; // ISO date
    createdAt: string; // ISO date
  };
}
```

### PATCH /api/v1/organization/members/:memberId

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    email: string;
    fullName: string | null;
    role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
    isActive: boolean;
    organizationId: string; // UUID
    createdAt: string; // ISO date
  };
}
```

### DELETE /api/v1/organization/members/:memberId

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    email: string;
    fullName: string | null;
    role: "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
    isActive: boolean;
    organizationId: string; // UUID
    createdAt: string; // ISO date
  };
  message: "User removed from organization successfully";
}
```

---

## Project Endpoints

### GET /api/v1/projects

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: Array<{
    id: string; // UUID
    coingeckoId: string | null;
    slug: string | null;
    name: string;
    symbol: string | null;
    imageUrl: string | null;
    contractAddress: string | null;
    websiteUrl: string | null;
    whitepaperUrl: string | null;
    dataSource: "COINGECKO" | "MANUAL";
    createdAt: string; // ISO date
    analysisCount: number;
    latestAnalysisStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | null;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### GET /api/v1/projects/:id

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    coingeckoId: string | null;
    slug: string | null;
    name: string;
    symbol: string | null;
    imageUrl: string | null;
    contractAddress: string | null;
    websiteUrl: string | null;
    whitepaperUrl: string | null;
    dataSource: "COINGECKO" | "MANUAL";
    createdAt: string; // ISO date
    latestAnalysis?: {
      id: string; // UUID
      status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
      resultData: any; // Analysis results object
      aiTokenUsage: number;
      createdAt: string; // ISO date
    };
  };
}
```

### GET /api/v1/projects/:id/history

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: Array<{
    id: string; // UUID
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    createdAt: string; // ISO date
    user: {
      id: string; // UUID
      fullName: string | null;
      email: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### POST /api/v1/projects

**Success Response (201 Created / 200 OK):**
```typescript
{
  success: true;
  data: {
    project: {
      id: string; // UUID
      coingeckoId: string | null;
      slug: string | null;
      name: string;
      symbol: string | null;
      imageUrl: string | null;
      contractAddress: string | null;
      websiteUrl: string | null;
      whitepaperUrl: string | null;
      dataSource: "COINGECKO" | "MANUAL";
      createdAt: string; // ISO date
    };
    priceData?: {
      currentPrice: number;
      priceChange24h: number;
      totalVolume: number;
      marketCap: number;
      fullyDilutedValuation: number;
      totalSupply: number;
      maxSupply: number;
    };
  };
}
```

---

## Analysis Endpoints

### GET /api/v1/analyses/:id

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    organizationId: string; // UUID
    projectId: string; // UUID
    createdBy: string | null; // User UUID
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    resultData: {
      coinData?: {
        // Market data, tickers with WTI scores, links, platforms
        wtiAnalysis?: {
          globalScore: number;
          marketCapRank: number;
          tickersAnalyzed: number;
        };
        // ... other coin data fields
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
          holders: Array<{
            name: string;
            symbol: string;
            holdings: number;
            value_usd: number;
            percentage_of_total_supply: number;
          }>;
        };
        governments: {
          total_holdings: number;
          total_value_usd: number;
          count: number;
          holders: Array<{
            name: string;
            symbol: string;
            holdings: number;
            value_usd: number;
            percentage_of_total_supply: number;
          }>;
        };
      };
      topHoldersData?: {
        // Top holders by chain
        [chainName: string]: Array<{
          address: string;
          balance: number;
          percentage: number;
          label?: string;
        }>;
      };
      inflowOutflowData?: {
        // Token flow analysis
        totalInflow: number;
        totalOutflow: number;
        netFlow: number;
        timeframe: string;
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
    aiTokenUsage: number;
    errorMessage: string | null;
    createdAt: string; // ISO date
    project: {
      id: string; // UUID
      name: string;
      symbol: string | null;
      coingeckoId: string | null;
      imageUrl: string | null;
    };
  };
}
```

### POST /api/v1/analyses

**Success Response (201 Created):**
```typescript
{
  success: true;
  data: {
    id: string; // UUID
    organizationId: string; // UUID
    projectId: string; // UUID
    createdBy: string | null; // User UUID
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    resultData: {
      // Same structure as GET /api/v1/analyses/:id
    } | null;
    aiTokenUsage: number;
    errorMessage: string | null;
    createdAt: string; // ISO date
    project: {
      id: string; // UUID
      name: string;
      symbol: string | null;
      coingeckoId: string | null;
      imageUrl: string | null;
    };
  };
}
```

---

## Search Endpoints

### GET /api/v1/search

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    results: Array<{
      id: string; // UUID
      name: string;
      symbol: string | null;
      imageUrl: string | null;
      score: number; // Relevance score (0-1)
    }>;
    totalCount: number;
    query: string;
  };
}
```

---

## Debug Endpoints

### GET /api/v1/debug/coingecko/:id

**Success Response (200 OK):**
```typescript
{
  source: "CoinGecko";
  id: string;
  success: true;
  data: any; // Mapped CoinGecko data
  statusCode: 200;
}
```

### GET /api/v1/debug/coingecko/treasury/:id

**Success Response (200 OK):**
```typescript
{
  source: "CoinGecko Treasury";
  id: string;
  success: true;
  data: {
    // Treasury data with companies and governments
    companies: Array<any>;
    governments: Array<any>;
  };
  statusCode: 200;
}
```

### GET /api/v1/debug/arkham/holders/:id

**Success Response (200 OK):**
```typescript
{
  source: "Arkham";
  id: string;
  success: true;
  data: {
    // Top holders data
    holders: Array<any>;
  };
  statusCode: 200;
}
```

### GET /api/v1/debug/arkham/movements/:id

**Success Response (200 OK):**
```typescript
{
  source: "Arkham";
  id: string;
  success: true;
  data: {
    // Inflow/outflow data
    movements: Array<any>;
  };
  statusCode: 200;
}
```

### GET /api/v1/debug/analyse/:id

**Success Response (200 OK):**
```typescript
{
  success: true;
  data: {
    coinData: any;
    treasuryData: any;
    topHoldersData: any;
    inflowOutflowData: any;
    aiInsights: any;
    detailedAnalysis: any;
  };
}
```

---

## Error Response Types

### Common Error Responses

#### 400 Bad Request
```typescript
{
  success: false;
  message: string; // Descriptive error message
  error?: "VALIDATION_ERROR" | "MISSING_REQUIRED_FIELDS";
}
```

#### 401 Unauthorized
```typescript
{
  success: false;
  message: "Authentication required" | "Invalid credentials" | "Token expired";
  error?: "AUTH_ERROR" | "INVALID_TOKEN";
}
```

#### 403 Forbidden
```typescript
{
  success: false;
  message: string; // Permission-related message
  error?: "PERMISSION_DENIED" | "INSUFFICIENT_CREDITS";
}
```

#### 404 Not Found
```typescript
{
  success: false;
  message: string; // Resource not found message
  error?: "RESOURCE_NOT_FOUND";
}
```

#### 409 Conflict
```typescript
{
  success: false;
  message: string; // Conflict description
  error?: "DUPLICATE_RESOURCE";
}
```

#### 422 Unprocessable Entity
```typescript
{
  success: false;
  message: string; // Validation error details
  error?: "VALIDATION_ERROR";
}
```

#### 429 Too Many Requests
```typescript
{
  success: false;
  message: "Rate limit exceeded";
  error?: "RATE_LIMIT_EXCEEDED";
}
```

#### 500 Internal Server Error
```typescript
{
  success: false;
  message: "Internal server error";
  error?: "INTERNAL_ERROR";
}
```

#### 503 Service Unavailable
```typescript
{
  success: false;
  message: "Service temporarily unavailable";
  error?: "SERVICE_UNAVAILABLE";
}
```

---

## Health Check

### GET /api/health

**Success Response (200 OK):**
```typescript
{
  status: "ok";
  timestamp: string; // ISO date
  version: string; // API version
}
```

---

## TypeScript Utility Types

### Generic Response Wrapper
```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Enum Types
```typescript
type Role = "OWNER" | "ADMIN" | "ANALYST" | "VIEWER";
type Plan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
type OrgStatus = "PENDING_SETUP" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";
type AnalysisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
type DataSource = "COINGECKO" | "MANUAL";
```

---

**End of Return Types Documentation**