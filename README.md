# General description
The program is a social platform prototype web app where users can write posts for other people to see.
Included features are sign up, log in & log out, create and delete a post, password change, and delete account.
User posts can be seen on the landing page.
Administrators (must be created manually by setting the admin column to true in the database) can delete other users' posts.
 
# Structure of the program
The front-end of the program is implemented using React and Material-UI components.
The back-end uses Rust, Actix Web, and PostgreSQL.

Folder structure
- server (contains backend files)
  - src (rust source code)
    - api (api endpoints)
    - db (database communication)
- web (frontend files)
  - components (react components)
  - pages (routing structure for frontend)
  - public (public files served by frontend)
  - styles (css styles)
  - types (typescript types)
  - utils (miscellaneous utility files)

## Requirements
- Latest stable version of rust and cargo (https://www.rust-lang.org/tools/install)
- node 18 (https://nodejs.org/en/download)
- pnpm (https://pnpm.io/installation)
- PostgreSQL 14

## Installation

### Backend
To get started create the file server/.env and fill include the following key value pairs.
The provided values are only examples
```dotenv
POSTGRES_CONFIG="user=postgres password=secret dbname=name_of_db host=localhost"
RUST_LOG=info
RUST_BACKTRACE=1
SESSION_SECRET=haeH6bjwJKZbgK924nrB71by50EWtsDMGMHwfykzVIrGeAPEyof5SxZShjk94KP7
CSRF_SECRET=q20qAr3QoZeQ8LxQo8N15CRbEfrSyh1p7ihSkf7IZH0=
```
`POSTGRES_CONFIG` contains the connection values as key value pairs separated by spaces.
Detailed info can be found in [their documentation](https://docs.rs/tokio-postgres/latest/tokio_postgres/config/struct.Config.html)
The database and accounts that can access the database must be created manually.  
`RUST_LOG` and `RUST_BACKTRACE` define what is logged and at what level.  
`SESSION_SECRET` is a long cryptographically random string that is used to generate session secrets.  
`CSRF_SECRET` is exactly 32 bytes of base-64 encoded cryptographically secure random data.
The example value is provided for convenience and should not be used outside of development.

After creating the .env file the next step is to get the database up to date.
This can be done by running `cargo run --bin migrate-up`. If no errors show up
everything is set up correctly thus far.
The commands
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```
require superuser permissions in postgres, so you might have to run them against your database
as an admin account before running migrate-up.

To build the backend run `cargo run` for a development build or `cargo run --profile release`
for a production build (this one requires setting up the frontend first). 
If the commands run without error everything is set up correctly thus far.


### Frontend
To install all frontend dependencies run `pnpm install` in the web directory.  
For a development builds create the file web/.env.development with the following content
```dotenv
NEXT_PUBLIC_APP_PATH=http://localhost:8080
```
The value should be the base url to the API server.

To start the development version of the frontend you must run `pnpm run dev`.  
To build a production version run `pnpm run export` (this needs to be run before starting production backend).

 
# Secure programming solutions
[OWASP CheatSheetSeries](https://cheatsheetseries.owasp.org/index.html) was followed for authentication
and Cross-Site Request Forgery (CSRF) prevention. React DOM takes care of input sanitization.

Passwords are required to be at least 8 characters long (as per [NIST SP800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)), 
a password strength meter (zxcvbn) is implemented to help users create stronger passwords,
error messages do not reveal the status of an account (e.g., if account exists but input password was wrong),
and account changing actions require a logged-in user to input their current password.

CSRF protection pattern used is the synchronizer token pattern 
and ChaCha20 is used as the encryption algorithm.  
Bcrypt with salt is used for password encryption.

[SANS 25](https://www.sans.org/top25-software-errors/) is used as a checklist below for vulnerabilities of the application.

### 1. Out-of-bounds Write 🟡
All buffers are handled by external libraries and Rust provides decent memory safety.

### 2. XSS ✅
React handles input sanitization for user generated text content.

### 3. SQL Injection ✅
Values are inserted to queries through query parameters which keep the values separate from the query itself.

### 4. Improper Input Validation ✅
Input validation is done on the backend through the use of a validation library.
Purely cosmetic input validation is also done on the frontend for better UX.

### 5. Out-of-bounds Read ✅
Rust has checks for this making it difficult to do out-of-bounds without getting compile time errors

### 6. Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection') ✅
OS commands are not used directly. If they are used within libraries it is unclear if they are safe.

### 7. Use After Free ✅
Rust memory handling prevents this.

### 8. Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal') ✅
Actix-files library serves files, and it has mitigations for this.

### 9. Cross-Site Request Forgery (CSRF) ✅
Mitigated with the use of a CSRF token using the synchronizer token pattern.

### 10. Unrestricted Upload of File with Dangerous Type ✅
User cannot upload files.

### 11. NULL Pointer Dereference ✅
Rust memory handling prevents this.

### 12. Deserialization of Untrusted Data ✅
Serde handles serialization into rust structs, and it will guarantee that the
input is serialized into a well-formed struct with the correct types.

### 13. Integer Overflow or Wraparound ✅
Not relevant for this project as it has no integer additions in the code we have written.

### 14. Improper Authentication 🟡
The application performs server-side authentication. However, there is no rate
limitation, allowing brute-force attacking, which can lead to an account hijacking.

### 15. Use of Hard-coded Credentials ✅
There are no hard-coded passwords or default administration accounts.

### 16. Missing Authorization ✅
In addition to the UI showing only authorized actions to a user, the server
checks that the current user is authorized for the made requests.

### 17. Improper Neutralization of Special Elements used in a Command ('Command Injection') ✅
No commands with user input are run except for SQL which was addressed earlier.

### 18. Missing Authentication for Critical Function ✅
A logged-in user is required to input their current password when changing their
password and deleting their account.

### 19. Improper Restriction of Operations within the Bounds of a Memory Buffer ✅
Rust memory handling prevents this.

### 20. Incorrect Default Permissions ✅
Irrelevant for this application, as there are no installable files.

### 21. Server-Side Request Forgery (SSRF) ✅
The server does not do any data fetching based on a user given url.

### 22. Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition') 🟡
Each session is a copy of the original. When making multiple simultaneous requests,
if any request modifies the session the other requests might receive an outdated session.

### 23. Uncontrolled Resource Consumption ❌
No ratelimits are implemented which leads to a DOS vulnerability if the service receives
a large enough volume of requests that do database queries.

### 24. Improper Restriction of XML External Entity Reference ✅
The application does not support the uploading of files, including XML documents.

### 25. Improper Control of Generation of Code ('Code Injection') ✅
The application does not construct code segments based on user given data.

# Testing
Security testing was done manually, and it was based on the above checklist.
The security features were taken into account from the start and tested during the 
development phases of the features. Thus, no security flaws that were not already 
documented were found afterward.

The attack surface of the program is also relatively small, as the user does not
have a lot of ways to enter or extract data on the web app. The user can
input various xss attacks as their username, password, or post (email is prevented)
but React's sanitization prevents the attack.

# Misc
As mentioned in the SANS checklist above, rate limitation would help against
DOS attacks and brute forcing.

The application is currently missing Multi-Factor Authentication. A new user
is instantly logged in after registering, but ideally they would first get
an email to activate their account. Similarly, due to the service not sending emails,
a user cannot reset their password, nor retrieve their data (as per GDPR legislation).

The application gives a user a session token, which expires after 1 day of
inactivity. The token keeps the user logged in, but having a "remember me" 
feature would be better than a long session token.

Application administrators only have the added authorization to delete any post 
compared to a regular account. However, they should be able to also perform other
administrative actions, such as deleting regular user accounts and preventing
users from making posts for a fixed amount of time.

As the program is simply a prototype, many other features could be added
to make the social platform more interesting. Some examples include up-voting
posts, profile personalization, following users, multimedia posts,
and cascaded posts / replies.
