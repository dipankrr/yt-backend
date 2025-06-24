1. Project structure
2. create mongodb atlas database
3. connect mongodb to backend (2nd commit)
4. dotenv settings
5. utils like: custom ApiError, ApiResponse, asyncHandler for database connection
6. handle CORS, data from JSON, URL, Cookies in express app 
7. created USER & VIDEO model. 
8. password hashing and matching using bcrypt
9. gen jwt access and refresh token 
10. setup cloudinary for images & videos, util func
11. multer middleware for file handling

12. all setup kinda done 

13. now write routes and controllers
14. register user controller
15. login user controller
16. logout user controller and jwtVerify  middleware as req didn't have user, but had jwt, had to inject current user using jwt 
17. more controllers. update user details, update avatar
