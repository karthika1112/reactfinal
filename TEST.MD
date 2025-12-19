# 🧪 Full Stack Development Assessment (2 Hours)
## E-Commerce Application - Live Coding Test

**Total Marks: 100** | **Duration: 2 Hours** | **Focus: Backend (70%) + Frontend (30%)**

---

## 📋 Instructions
- Answer all questions
- Write clean, readable code
- Comments are appreciated but not mandatory
- Partial marks will be awarded for correct logic
- You can use any tools (VS Code, Postman, etc.)

---

# SECTION A: MCQ & Short Answer (20 Marks) - 20 Minutes

## Part 1: Multiple Choice Questions (10 Marks - 1 Mark Each)

### Q1. What does `express.json()` middleware do?
- a) Encrypts JSON data
- b) Parses incoming JSON request bodies
- c) Converts response to JSON
- d) Validates JSON schema

### Q2. In bcrypt, what does the number `10` in `bcrypt.hash(password, 10)` represent?
- a) Password length
- b) Salt rounds
- c) Hash length
- d) Encryption key size

### Q3. What is the purpose of JWT (JSON Web Token)?
- a) Database connection
- b) File upload handling
- c) Stateless authentication
- d) Password encryption

### Q4. What does `mongoose.Schema` define?
- a) API routes
- b) Structure of documents in MongoDB collection
- c) Server configuration
- d) Frontend components

### Q5. What HTTP status code should be returned when a resource is created successfully?
- a) 200
- b) 201
- c) 204
- d) 301

### Q6. What does `cors()` middleware enable?
- a) Database connections
- b) Cross-Origin Resource Sharing
- c) Cookie parsing
- d) Session management

### Q7. In Express, `req.params` contains:
- a) Query string parameters
- b) Request body data
- c) URL route parameters
- d) Request headers

### Q8. What does `helmet()` middleware provide?
- a) Rate limiting
- b) Security headers
- c) Authentication
- d) Logging

### Q9. What is the purpose of `dotenv` package?
- a) Creating .env files
- b) Loading environment variables from .env file
- c) Encrypting environment variables
- d) Validating environment variables

### Q10. In React, `useEffect` with an empty dependency array `[]` runs:
- a) On every render
- b) Only on mount (once)
- c) Never
- d) On state change

---

## Part 2: Short Answer Questions (10 Marks - 2 Marks Each)

### Q11. Explain the difference between `req.query`, `req.params`, and `req.body` with examples.

### Q12. Why is password hashing important? Why not store passwords directly?

### Q13. What is rate limiting and why is it important for APIs?

### Q14. Explain what `async/await` does in the context of database operations.

### Q15. What is the difference between `findOne()` and `find()` in Mongoose?

---

# SECTION B: Backend Coding Questions (50 Marks) - 70 Minutes

## Question 1: Create a New Schema & CRUD APIs (15 Marks)

Create a **Category** model and its CRUD APIs.

**Requirements:**
- Schema should have: `name` (String, required, unique), `description` (String), `createdAt` (Date, default: Date.now)
- Create the following APIs:
  1. `POST /categories` - Create a category (3 marks)
  2. `GET /categories` - Get all categories (3 marks)
  3. `GET /categories/:id` - Get single category by ID (3 marks)
  4. `PUT /categories/:id` - Update a category (3 marks)
  5. `DELETE /categories/:id` - Delete a category (3 marks)

**Starter Code:**
```javascript
// Create your schema and model here
let categorySchema = new mongoose.Schema({
    // Define your schema
})

let categoryModel = mongoose.model('categories', categorySchema)

// Create your APIs below
```

---

## Question 2: Authentication Enhancement (15 Marks)

### Part A: Password Reset API (8 Marks)

Create a password reset functionality with the following APIs:

1. **`POST /forgot-password`** (4 marks)
   - Accept `email` in request body
   - Find user by email
   - Generate a 6-digit OTP
   - Send OTP via email using nodemailer
   - Store OTP temporarily (hint: you can add an `otp` field to user schema)
   - Return success/error message

2. **`POST /reset-password`** (4 marks)
   - Accept `email`, `otp`, and `newPassword` in request body
   - Verify OTP matches
   - Hash the new password
   - Update the user's password
   - Clear the OTP
   - Return success/error message

### Part B: JWT Middleware (7 Marks)

Create an authentication middleware that:
- Extracts token from `Authorization` header (Bearer token format)
- Verifies the token using jwt.verify()
- Attaches decoded user info to `req.user`
- Returns 401 if token is missing or invalid

```javascript
// Complete this middleware
const authenticateToken = (req, res, next) => {
    // Your code here
}
```

Apply this middleware to protect the `DELETE /deleteproduct` route.

---

## Question 3: Advanced API Features (10 Marks)

### Part A: Pagination (5 Marks)

Modify the `GET /products` API to support pagination:
- Accept `page` and `limit` as query parameters
- Default: page=1, limit=10
- Return: products array, currentPage, totalPages, totalProducts

**Example Request:** `GET /products?page=2&limit=5`

**Expected Response:**
```json
{
    "products": [...],
    "currentPage": 2,
    "totalPages": 10,
    "totalProducts": 50
}
```

### Part B: Search & Filter (5 Marks)

Create a new API `GET /products/search` that:
- Accepts `query` parameter to search by product title (case-insensitive)
- Accepts `minPrice` and `maxPrice` for price range filtering
- Returns matching products

**Example:** `GET /products/search?query=shirt&minPrice=100&maxPrice=500`

---

## Question 4: Error Handling & Validation (10 Marks)

### Part A: Input Validation Middleware (5 Marks)

Create a validation middleware for the signup route that checks:
- Username: minimum 3 characters, alphanumeric only
- Email: valid email format
- Password: minimum 8 characters, must contain at least one number

```javascript
const validateSignup = (req, res, next) => {
    // Your validation code here
}
```

### Part B: Global Error Handler (5 Marks)

Create a global error handling middleware that:
- Catches all unhandled errors
- Logs the error with timestamp
- Returns appropriate error response with status code
- Does not expose sensitive error details in production

```javascript
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    // Your code here
}

// Apply at the end of all routes
app.use(errorHandler)
```

---

# SECTION C: Frontend Integration (30 Marks) - 30 Minutes

## Question 5: Protected Routes (10 Marks)

Create a `ProtectedRoute` component that:
- Checks if user is authenticated using the AuthContext
- Redirects to `/signin` if not authenticated
- Renders the child component if authenticated
- Shows a loading state while checking authentication

```jsx
// Complete this component
function ProtectedRoute({ children }) {
    // Your code here
}

// Usage in App.jsx:
// <Route path='/products' element={<ProtectedRoute><Products/></ProtectedRoute>} />
```

---

## Question 6: Add Product Form (12 Marks)

Create an `AddProduct.jsx` page that:
- Has a form with fields: title, price, image URL
- Validates that all fields are filled
- Validates price is a positive number
- Submits data to `POST /products` API
- Shows success/error messages
- Clears form on successful submission
- Only accessible to authenticated users

**Requirements:**
- Use controlled components (useState for form fields)
- Handle loading state during submission
- Proper error handling

---

## Question 7: Logout Functionality (8 Marks)

Implement complete logout functionality:

### Part A: Update Header Component (4 marks)
- Show "Sign In" and "Sign Up" links when NOT logged in
- Show "Logout" button and username when logged in
- Logout button should call the logout function from AuthContext

### Part B: AuthContext logout enhancement (4 marks)
- Clear token from localStorage
- Clear user from localStorage
- Reset state to null
- Redirect to home page after logout

---

# SECTION D: Bonus Questions (10 Marks) - If Time Permits

## Bonus 1: Rate Limiting per User (5 Marks)

Modify the rate limiter to:
- Allow 100 requests per 15 minutes for authenticated users
- Allow only 20 requests per 15 minutes for unauthenticated users

## Bonus 2: Product Image Upload (5 Marks)

Instead of storing image URL, implement actual image upload:
- Use `multer` package for file upload
- Store image in `uploads/` folder
- Return the file path in response
- Update product schema to store file path

---

# Answer Sheet Template

```
Name: ____________________
Roll No: _________________
Date: ___________________

Section A - MCQ Answers:
Q1: ___ Q2: ___ Q3: ___ Q4: ___ Q5: ___
Q6: ___ Q7: ___ Q8: ___ Q9: ___ Q10: ___

Section A - Short Answers:
Q11: 
Q12:
Q13:
Q14:
Q15:

Section B, C, D: (Write code in separate files or below)
```

---

# 📝 Marking Scheme Summary

| Section | Topic | Marks | Time |
|---------|-------|-------|------|
| A1 | MCQ | 10 | 10 min |
| A2 | Short Answers | 10 | 10 min |
| B1 | Category CRUD | 15 | 15 min |
| B2 | Auth Enhancement | 15 | 20 min |
| B3 | Pagination & Search | 10 | 15 min |
| B4 | Validation & Error Handling | 10 | 20 min |
| C5 | Protected Routes | 10 | 10 min |
| C6 | Add Product Form | 12 | 15 min |
| C7 | Logout | 8 | 5 min |
| **Total** | | **100** | **120 min** |
| Bonus | Extra Credit | +10 | - |

---

