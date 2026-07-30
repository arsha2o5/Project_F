import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // 1. Grab the token from the request headers
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Extracts the token from "Bearer <token>"

  // 2. If there is no token, kick them out
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  console.log("middleware reached")
  try {
    // 3. Verify the token using your .env secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded payload (like { id: 5 }) to the request
    req.user = decoded;

    // 5. Let them through to the actual controller!
    console.log("middleware finished")
    next(); 

  } catch (error) {
    // If the token is fake or expired, it jumps here
    res.status(401).json({ error: "Invalid token." });
  }
};