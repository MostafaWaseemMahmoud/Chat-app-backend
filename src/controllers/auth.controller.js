import bcrypt from 'bcrypt';
import cloudInary from "../lib/cloudinary.js";
import { generateToken } from '../lib/utils.js';
import User from "../models/user.model.js";
export const signup = async (req, res) => {
  console.log("🔵 Signup Started");

  const { fullName, email, password } = req.body;
  console.log("🟡 Request Body:", req.body);

  try {
    if (!fullName || !email || !password) {
      console.log("🔴 Missing fields");
      return res.status(400).json({ message: "All Fields Are Required" });
    }

    if (password.length < 6) {
      console.log("🔴 Password too short");
      return res.status(400).json({ message: "Password Must Be At Least 6 characters" });
    }

    const userExists = await User.findOne({ email });
    console.log("🟡 User Exists?", !!userExists);
    if (userExists) {
      return res.status(400).json({ message: "Email Already Exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("🟢 Password hashed");

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("🟢 New user saved:", newUser._id);

    generateToken(newUser._id, res);
    console.log("🟢 Token generated");

    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Signup Error: " + error.message });
  }
};

export const login = async(req,res)=> {
  const { email, password } = req.body
  try {
    if(!email || !password){
      console.log("🔴 Missing fields");
      return res.status(400).json({ message: "All Fields Are Required" });
    }

    const user = await User.findOne({email});

    if(!user){
      return res.status(404).json({message: "Invalid Credentials"})
    }

    const IsPasswordCorrect = await bcrypt.compare(password, user.password);
    if(!IsPasswordCorrect){
      return res.status(400).json({message: "Invalid Credentials"})
    }
    generateToken(user._id,res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    })
  } catch (error) {
    console.error("login Error:", error);
    return res.status(500).json({ message: "Login Error: " + error.message });
  }
}

export const logout = (req,res)=> {
  try {
    res.cookie("jwt","",{maxAge: 0})
    return res.status(200).json({ message: "Logged Out Successfully"});
  } catch (error) {
    console.error("LogOut Error:", error);
    return res.status(500).json({ message: "logOut Error: " + error.message });
  }
}
export const updateProfile = async(req,res)=> {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id;
    if(!profilePic){
      res.status(400).json({message: "Profile Pic Is Required"})
    }
    const uploadResponse = await cloudInary.uploader.upload(profilePic);

    const UpdatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true});

    res.status(200).json({message: UpdatedUser})

  } catch (error) {
    res.status(500).json({message: "Internal server error"});
    console.log('Error Updating User Profile',error);
  }
}
export const checkAuth = (req,res)=> {
   try {
      res.status(200).json(req.user)
   } catch (error) {
      console.log("Error In CheckAuth Controller",error.message);
      res.status(500).json({message: "Internal Server Error"})
   }
}