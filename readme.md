# Project Documentation

## Overview

This project is built using Node.js and Express.js, with MongoDB as the database and Redis for caching and rate limiting. Security measures like Helmet are implemented to enhance protection against vulnerabilities.

## Environment Variables

The application uses environment variables for configuration. These are stored in a `.env` file (not included in the repository for security reasons).

### Required Environment Variables

| Variable         | Description                                         |
| ---------------- | --------------------------------------------------- |
| `PORT`           | The port on which the server runs (default: `3000`) |
| `MONGO_URI`      | MongoDB connection URI                              |
| `NODE_ENV`       | Environment mode (`development` or `production`)    |
| `JWT_SECRET`     | Secret key for JWT authentication                   |
| `COOKIE_SECRET`  | Secret key for cookie encryption                    |
| `REDIS_HOST`     | Redis server host                                   |
| `REDIS_PORT`     | Redis server port                                   |
| `REDIS_PASSWORD` | Redis server password (if applicable)               |

## Installation

To set up and run the project locally:

1. Clone the repository:
   ```sh
   git clone https://github.com/MrYogesh0709/Next-Tech.git
   ```
2. Navigate to the project directory:
   ```sh
   cd project
   ```
3. Install dependencies:
   ```sh
   yarn install
   ```
4. Create a `.env` file and configure the required environment variables.
5. Start the server:
   ```sh
   yarn run dev
   ```

# Authentication API

## Base URL: `/api/v1/auth`

This API handles user authentication, including registration, login, token refresh, logout, user updates, and password changes.

## Endpoints

### 1. **Register User**

- **URL:** `/api/v1/auth/register`
- **Method:** `POST`
- **Middleware:** `authLimiterMiddleware, validate(UserSchemaRegister)`
- **Description:** Registers a new user.
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "phone": "string"
  }
  ```
- **Response:**
  ```json
  {
    "accessToken": "string",
    "user": { "id": "string", "email": "string" }
  }
  ```

### 2. **Login User**

- **URL:** `/api/v1/auth/login`
- **Method:** `POST`
- **Middleware:** `authLimiterMiddleware, validate(UserSchemaLogin)`
- **Description:** Authenticates a user and returns access and refresh tokens.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "accessToken": "string",
    "user": { "id": "string", "email": "string", "phone": "string", "images": ["string"] }
  }
  ```

### 3. **Refresh Token**

- **URL:** `/api/v1/auth/refresh`
- **Method:** `POST`
- **Description:** Refreshes the access token using a valid refresh token.
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Response:**
  ```json
  {
    "accessToken": "string"
  }
  ```

### 4. **Logout User**

- **URL:** `/api/v1/auth/logout`
- **Method:** `GET`
- **Middleware:** `authMiddleware`
- **Description:** Logs out a user by invalidating the refresh token.
- **Response:**
  ```json
  {
    "message": "Successfully logged out"
  }
  ```

### 5. **Delete User**

- **URL:** `/api/v1/auth/delete`
- **Method:** `DELETE`
- **Middleware:** `authMiddleware`
- **Description:** Deletes the authenticated user.
- **Response:**
  ```json
  {
    "message": "User deleted successfully"
  }
  ```

### 6. **Update User (Except Password)**

- **URL:** `/api/v1/auth/update`
- **Method:** `PATCH`
- **Middleware:** `authMiddleware, validate(UserSchemaUpdate)`
- **Description:** Updates user details except for the password.
- **Request Body:**
  ```json
  {
    "email": "string",
    "phone": "string",
    "username": "string"
  }
  ```
- **Response:**
  ```json
  {
    "id": "string",
    "email": "string",
    "phone": "string",
    "username": "string",
    "imageUrl": "string"
  }
  ```

### 7. **Change Password**

- **URL:** `/api/v1/auth/change-password`
- **Method:** `PATCH`
- **Middleware:** `authLimiterMiddleware, authMiddleware, validate(UserSchemaUpdatePassword)`
- **Description:** Updates the user's password.
- **Request Body:**
  ```json
  {
    "oldPassword": "string",
    "newPassword": "string"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

## Middleware Used

- **authMiddleware:** Protects routes requiring authentication.
- **authLimiterMiddleware:** Rate limits authentication requests.
- **validate(schema):** Validates request body based on provided schema.

## Notes

- Ensure tokens are included in headers where authentication is required.
- Handle errors appropriately based on API responses.

# User Routes API Documentation

## Base URL

```
/api/v1
```

## Endpoints

### 1. Upload an Image

#### Endpoint:

```
POST /upload-image
```

#### Description:

Allows authenticated users to upload an image.

#### Request Body (Multipart Form Data):

| Field | Type | Description          |
| ----- | ---- | -------------------- |
| image | File | Image file to upload |

#### Response:

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "/uploads/example.jpg"
  }
}
```

---

### 2. Delete an Image

#### Endpoint:

```
DELETE /delete-image/:imageName
```

#### Description:

Allows authenticated users to delete a previously uploaded image.

#### Path Parameters:

| Parameter | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| imageName | String | The name of the image to delete |

#### Response:

```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

### 3. Get User Images

#### Endpoint:

```
GET /images
```

#### Description:

Fetches all images uploaded by the authenticated user.

#### Response:

```json
{
  "success": true,
  "data": ["/uploads/image1.jpg", "/uploads/image2.jpg"]
}
```

---

## Middleware Used

- **authMiddleware**: Ensures only authenticated users can access these endpoints.
- **upload.single('image')**: Handles file uploads.
- **validateImageUpload**: Validates uploaded images to meet criteria.

### Notes:

- Ensure the `Authorization` header is set for all requests requiring authentication.
- Image names for deletion can be retrieved via the `GET /images` endpoint.

# API Security and Performance Enhancements

## Why Use Redis Rate Limiting?

### 1. **Protection Against Brute Force Attacks**

Redis-based rate limiting prevents excessive login attempts, reducing the risk of brute-force attacks by blocking users after multiple failed attempts.

### 2. **Efficient Request Management**

Rate limiting helps control the number of API requests per user, ensuring fair usage and preventing abuse of server resources.

### 3. **Performance Optimization**

Redis is an in-memory database, meaning rate-limiting operations are extremely fast compared to database-driven rate-limiting mechanisms.

### 4. **Scalability**

Using Redis for rate limiting allows distributed applications to share a central limit state, making it effective for horizontally scaled systems.

### 5. **Blocking Malicious Users**

By tracking request counts, Redis can block suspicious activities, such as users sending an unusually high number of requests in a short time.

## Why Use Helmet?

### 1. **Prevents Common Web Vulnerabilities**

Helmet secures Express apps by setting various HTTP headers, protecting against common attacks like Cross-Site Scripting (XSS), Content Sniffing, and Clickjacking.

### 2. **Hides Sensitive Server Information**

It removes or modifies certain response headers that could reveal details about your technology stack, reducing the risk of targeted attacks.

### 3. **Enhances Content Security**

Helmet includes Content Security Policy (CSP) to prevent the execution of malicious scripts injected by attackers.

### 4. **Mitigates Cross-Site Scripting (XSS) Risks**

By setting appropriate headers, Helmet reduces the risk of XSS attacks where attackers attempt to inject malicious scripts into your application.

### 5. **Improves HTTP Security Best Practices**

It enforces HTTPS usage, restricts embedding within iframes, and prevents browsers from executing unauthorized JavaScript.

## Conclusion

- **Redis rate limiting** improves API security, prevents abuse, and ensures fair usage.
- **Helmet** provides essential security headers to mitigate common vulnerabilities and harden your application against cyber threats.

These two technologies together enhance the reliability, performance, and security of your API-driven application.
