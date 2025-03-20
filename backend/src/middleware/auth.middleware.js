import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // First, we need to check if a JWT token was sent in the request
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    // If a token was sent, we need to verify it. We use the jwt.verify()
    // function to check if the token is valid and not tampered with.
    // The verify() function takes two arguments: the token to verify and
    // the secret key used to sign the token. If the token is invalid or
    // tampered with, the verify() function will throw an error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // If the token is valid, we need to check if the user associated with
    // the token exists in the database. We use the User model's findById()
    // method to find the user by their ID. We select only the user's
    // fields that we need to access in the route handler, excluding the
    // password field.
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user is found, we assign the user object to the req.user
    // property. This allows us to access the user object in the route
    // handler.
    req.user = user;

    // Finally, we call the next() function to continue executing the
    // route handler.
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
