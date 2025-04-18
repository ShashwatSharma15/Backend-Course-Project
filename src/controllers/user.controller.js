import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

export { registerUser };
