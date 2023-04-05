# General description
 How the program is used and to what purpose and description of user interface especially form those parts that are not self-evident.
 
# Structure of the program
 
# Secure programming solutions
How and in which parts of the code? You should also comment the code itself. You should use a checklist, for example OWASP TOP 10 or SANS 25. Describe how issues have been solved.

[SANS 25](https://www.sans.org/top25-software-errors/) is used as a checklist for vulnerabilities of the application.

### 1. Out-of-bounds Write 🟡
All buffers are handled by external libraries and rust provides decent memory safety.

### 2. XSS ✅
React handles input sanitation for user generated text content.

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
You should include at least manual security testing, but it is highly recommended
to do more extensive testing. Report testing and also what you found and what you fixed based on testing.

# Misc
In case something was not yet implemented, document that as well.
If you know there is security issue or vulnerability, document that as well.
Suggestions for improvement, what could be implemented.

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
