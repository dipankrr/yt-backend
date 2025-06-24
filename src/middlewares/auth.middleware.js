import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// problem: we don't have user while logging out user


// we used to get user from req.body as user was giving username/pass through form
// but while logout we can't give user another form
// the only thing we have tokens in cookies
// we can reverse eng the access token and get the user
// and then we can inject that user in req so that we can access user while logging out
// 
// this middleware just to inject user in req as we don't have that
// but how
// we have access token in cookies, we have to verify Jwt of user
// and tokens do contain _id, so from _id we can get the whole user


// MIDDLEWARE: is nothing but a fancy name of a chunk of code/method. we can write that code in 
// respective files as well but that could not be reused anywhere, like in logout we didn't have 
// the access of user so we used jwt from cookies to check if user exists or not. we just pushed that
// code in somewhere else and named it middleware. we can use it many places like only loggedIn user 
// can like/comment , then we just have to add this middleware


export const verifyJWT = asyncHandler ( async (req, res, next ) => {

   try {
     const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer " , "")
 
     if (!token) {
         throw new ApiError(402, "access token not available")
     }
 
     const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
 
     const user = await User.findById(verifiedToken?._id).select("-password -refreshToken")

     if (!user) {
        throw new ApiError(404, "User not found")
     }
 
     req.user = user
 
     next()

   } catch (error) {
    
    throw new ApiError(400, error?.message || "invalid toke")
   } 

})

export const isLoggedIn = asyncHandler ( async (req, res, next) => {

   // if user has jwt in cookies

  try {
    const accessToken = req.cookies?.accessToken
 
    if (!accessToken) {
       throw new ApiError(401, "no access token in cookies")
    }
 
    const verifiedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
 
    if (!verifiedToken) {
       throw new ApiError(401, "access token is invalid")
    }
 
    next()
  } catch (error) {
   throw new ApiError(404, "something went wrong")
  }
})