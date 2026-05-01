import jwt from "jsonwebtoken";
import User from "../models/User.js"

// Generate JWT token
const generatedToken = (id) =>{
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_Expire || "7d"
    });
};

// @desc register user
// @route POST /api/auth/register
// @acess public
export const register = async(req , res, next) =>{
    try {
        const {username, email, password} = req.body;

        // check if user exists
        const userExists = await User.findOne({ $or: [{ email }] });
        
        if(userExists){
            return res.status(400).json({
                success: false,
                error: 
                    userExists.email == email
                        ? "Email Already registered"
                        : "userName already taken" ,
                statusCode: 400    
            })
        }
        
        // Create user
        const user = await User.create({
            username,
            email, 
            password
        });

        // Generate token
        const token = generatedToken(user._id)
        
        res.status(201).json({
            success: true,
            data: {
                user:{
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profileImage: user.profileImage,
                    createdAt: user.createdAt
                },
                token,
            },
            message: "User Registered Successfully",
        })
    }catch (error) {
        next(error);
    }
}

//  @desc Login User
//  @route POST /api/auth/login
//  @access public
export const login = async(req, res, next) =>{
    try {
        const {email, password} = req.body;

        // validate input
        if(!email || !password){
            return res.status(401).json({
                success: false,
                error: "Please provide email and password",
                status: 401
            });
        }

        // check for user and password comparision
        const user = await User.findOne({ email }).select("+password");

        if(!user){
            return res.status(401).json({
                success: false,
                error: "Invalid Credentials",
                status: 401
            });
        }

        // Password
        const isMatch = await user.matchPassword(password);
        
        if(!isMatch){
            return res.status(401).json({
                success: false,
                error: "Invalid Credentials",
                status: 401
            });
        }

        // Generate token 
        const token = generatedToken(user._id);

        res.status(200).json({
            success: true,
            user:{
                id:user._id,
                username:user.username,
                email:user.email,
                profileImage:user.profileImage
            },
            token,
            message: "Login Successful"
        })

    } catch (error) {
        next(error);
    }
}

//  @desc Get User profile
//  @route GET /api/auth/profile
//  @access private
export const getProfile = async(req, res, next) =>{
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            // user:{
            // data:{
            //     id: user._id,
            //     username: user.username,
            //     email: user.email,
            //     profileImage: user.profileImage,
            //     createdAt: user.createdAt,
            //     updatedAt: user.updatedAt
            // }
            data: user
        })
    } catch (error) {
        next(error);
    }
}

//  @desc update user profile
//  @route GET /api/auth/profile
//  @access private
export const updateProfile = async (req, res, next) => {
  try {

    const allowedFields = [
      "username",
      "email",
      "profileImage",
      "firstName",
      "middleName",
      "lastName",
      "phone",
      "dob",
      "gender",
      "university",
      "school",
      "major",
      "learningTime",
      "timezone",
      "language",
      "linkedin",
      "github",
      "portfolio"
    ];

    const user = await User.findById(req.user.id);

    // update only allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      user,
      message: "Profile Updated Successfully"
    });

  } catch (error) {
    next(error);
  }
};     

//  @desc change password
//  @route POST /api/auth/change-password
//  @access private
export const changePassword = async(req, res, next) =>{
    try {
        const { currentPassword, newPassword } = req.body;
        
        if(!currentPassword || !newPassword ){
            return res.status(400).json({
                success:false,
                error: "Please provide current and new password",
                statusCode: 400,
            })
        }

        const user = await User.findById(req.user._id).select("+password");

        // check current password
        const isMatch = await user.matchPassword(currentPassword);

        if(!isMatch){
            return res.status(401).json({
                success: false,
                error:"Current password is incorrect",
                statusCode: 401
            })
        }

        // update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        })
    } catch (error) {
        next(error);
    }   
}