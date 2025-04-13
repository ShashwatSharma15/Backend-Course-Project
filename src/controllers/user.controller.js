import { asyncHandler } from "../utils/asyncHandler.js";

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



});

export { registerUser };
