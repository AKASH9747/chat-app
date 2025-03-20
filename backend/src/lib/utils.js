import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  // Create a JWT token with the user ID as payload
  const token = jwt.sign(
    { userId }, // Payload data containing user ID
    process.env.JWT_SECRET, // Secret key for signing the token
    { expiresIn: "7d" } // Token expiry time set to 7 days
  );

  // Set the JWT token as a cookie in the response
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiry time in milliseconds (7 days)
    httpOnly: true, // Cookie is not accessible via JavaScript (helps prevent XSS attacks)
    sameSite: "strict", // Cookie is only sent in a first-party context (helps prevent CSRF attacks)
    secure: process.env.NODE_ENV !== "development", // Cookie is sent only over HTTPS if not in development
  });

  // Return the token for further use if needed
  return token;
};
