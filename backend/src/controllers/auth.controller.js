import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  // Destructure fullName, email, and password from the request body
  const { fullName, email, password } = req.body;

  try {
    // Check if the password length is less than 6 characters
    if (password.length < 6) {
      // Return a 400 status with a message if password is too short
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if a user with the given email already exists in the database
    const user = await User.findOne({ email });

    // If user already exists, return a 400 status with a message
    if (user) return res.status(400).json({ message: "Email already exists" });

    // Generate a salt for hashing the password
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new User instance with the provided fullName, email, and hashed password
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    // If newUser is successfully created
    if (newUser) {
      // Generate a JWT token for the new user
      generateToken(newUser._id, res);

      // Save the new user to the database
      await newUser.save();

      // Return a 201 status with the new user's details (excluding password)
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      });
    } else {
      // If newUser creation failed, return a 400 status with a message
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    // Log the error message to the console
    console.log("Error in signup controller", error.message);
    // Return a 500 status with a message for internal server error
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePicture } = req.body;

    const userId = req.user._id;

    if (!profilePicture) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // Upload the profile picture to Cloudinary using the cloudinary.uploader.upload() method
    const uploadResponse = await cloudinary.uploader.upload(profilePicture);

    // Update the user in the database with the new profile picture
    // The User.findByIdAndUpdate() method takes the user ID, the update object, and an options object as arguments
    // The new: true option tells mongoose to return the updated document instead of the original document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
