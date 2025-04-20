import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshTokens = async(userId) =>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken };

  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //just setting up and checking
  // res.status(200).json({
  //   message: "hello shashwat ji. Sharma ji ka beta",
  // });

  //Reginster User steps - logic building
  //1. get user details from frontend (form having user model content)
  //2. validation - not empty
  //3. check if user already exists: username / email se
  //4. check for images, check for avatar
  //5. upload them to cloudinary, avatar
  //6. create user object (mongo db nosql db where object sent usually -> after making object) - create entry in db
  //7. remove password and refresh token feed from response
  //8. check for user creation
  //9. return response


  //if data coming from form or json - use - req.body
  //step 1.
  const { fullName, email, username, password } = req.body
  // console.log("email: ", email);

  //step 2.
  //like this we need to check for many
  // if(fullName === ""){
  //   throw new ApiError(400, "full name is required")
  // }

  //shortcut
  if(
    [fullName, email, username, password].some((field) => field?.trim() ==="")
  ){
    throw new ApiError(400, "all fields are required")
  }

  //step 3.
  // User.findOne({email})
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if(existedUser){
    throw new ApiError(409, "User with email or username already exist")
  }

  //step 4.
  //console.log things and check
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if(!avatarLocalPath){
    throw new ApiError(400, "Avatar filee is required")
  }
  // console.log(req.files);

  //step 5.
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!avatar){
    throw new ApiError(400, "Avatar filee is required");
  }

  //step 6.
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  })

  //step 7.
  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  //step 8.
  if(!createduser){
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  //step 9.
  return res.status(201).json(
    new ApiResponse(200, createduser, "User registered successfully")
  )

});

//login user
const loginUser = asyncHandler(async (req, res) => {
  //Steps
  //1. req body -> data
  //2. username or email to login
  //3. find the user
  //4. check password
  //5. access and refresh token generate (and send both to user)
  //6. send cookie and send response

  //step 1.
  const {email, username, password} = req.body;
  console.log(email)

  //step 2
  if(!username && !email){
    throw new ApiError(400, "username or email is required");
  }

  //step 3
  const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  }
  
  //step 4
  // User for methods from mongoose i.e. mongoDB. user is my user having our methods !!!
  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }

  //step 5
  //very common so lets make seperate method for this above
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  //step 6
  const loggedInUser = await User.findById(user._id).
  select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200, 
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User logged in successfully"
    )
  )
})

//logout user
const logoutUser = asyncHandler(async (req, res) => {
  //1. remove refresh token data from backend
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  //2. clear cookies
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, `User name: ${req.user.fullName}, logged out`))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401, "Unauthorized Request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken, 
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401, "Invalid Refresh Token")
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used")
    }
  
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
  
    const options = {
      httpOnly: true,
      secure: true
    }
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200, 
        {accessToken, refreshToken: newRefreshToken},
        "Access token refreshed!"
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};
