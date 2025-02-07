# Google OAuth 2.0 Workflow

This project demonstrates a raw implementation of Google OAuth 2.0 authentication. Below is a step-by-step description of how the authentication process works.

## 1. Initiate the Login Process

- **Route:** `/login`
- **Action:**  
  - Generates a secure random `state` value using Node's `crypto` module.
  - Stores the `state` in the session to protect against CSRF attacks.
  - Constructs an authorization URL `https://accounts.google.com/o/oauth2/v2/auth` to Google's OAuth 2.0 endpoint with the following parameters:
    - Scopes (access to user's email and profile)
    - `access_type=offline` to get a refresh token
    - `response_type=code` to receive an authorization code
    - The generated `state`
    - Redirect URI (as set in environment variables)
    - Client ID (from environment variables)
  - Redirects the user to Google's OAuth 2.0 server.

## 2. User Grants Permissions

- The user is redirected to Google's consent screen.
- The user reviews the requested permissions and grants access.

## 3. Handle the Callback

- **Route:** `/google/callback`
- **Action:**  
  - Google redirects back to this route with query parameters:
    - `code`: The authorization code to exchange for tokens.
    - `state`: The state value to validate against the session.
  - The server checks:
    - If there's an error in the query.
    - If the returned `state` does not match the session-stored `state`, it terminates the process.
  - Proceeds to exchange the authorization code for tokens.

## 4. Token Exchange

- The server sends a POST request to `https://oauth2.googleapis.com/token` with the following data:
  - `code`: The authorization code from the callback.
  - `client_id`: As specified in the environment variables.
  - `client_secret`: As specified in the environment variables.
  - `redirect_uri`: Must match the one used in the login step.
  - `grant_type`: `"authorization_code"`
- In response, Google returns:
  - An `id_token` (JWT) that encodes the user's information.
  - An `access_token` for accessing Google APIs.
  - Optionally, a `refresh_token` for offline access.

## 5. User Information

- The `id_token` is decoded (after splitting to extract the payload) to retrieve details such as:
  - User ID (sub)
  - Email
  - Name
  - Picture
- This information is logged and/or stored in the database if the user does not exist already.

## 6. Session Setup and Redirect

- The decoded user information is stored in the session.
- The user is redirected to the home page (e.g., `/home`), where their profile is displayed.

## 7. Logout

- **Route:** `/logout`
- **Action:**  
  - Destroys the user's session.
  - Redirects the user back to the login page.

## Environment Variables

Ensure that the following environment variables are set in a `.env` file:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

## Summary

This raw workflow of Google OAuth 2.0 involves:
1. Redirecting the user to Google's authorization server.
2. Handling the callback and validating the state.
3. Exchanging the authorization code for tokens.
4. Decoding the received `id_token` to obtain user information.
5. Creating or updating the user record in the database.
6. Establishing a session for the authenticated user.
7. Allowing the user to log out, which destroys the session.

---

**Important Note:**  
Before starting the project, you must create a web application in the [Google Cloud Console](https://console.cloud.google.com/) to obtain your `client_id`, `client_secret`, and set the appropriate `redirect_uri`. This step is crucial for integrating Google OAuth 2.0 into your application.