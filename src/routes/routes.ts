import express from "express";
import jwt from "jsonwebtoken";
import * as controller from "../controllers/controller.js";
import * as env from "../util/secrets.js";

const router = express.Router();

// Verify JWT token
// If invalid, redirect to /login
// Can be placed in router requests to verify token before accessing route
async function authenticateToken(req, res, next) {
  const token = req.cookies["JWT"];
  // If no token, redirect to /login
  if (!token) return res.redirect("/login");

  // Verifies token. redirect to /login if error.
  try {
    let decodedID: string = await jwt.verify(token, env.ACCESS_TOKEN_SECRET).id;
    // If no error, assign id to req.id
    req.id = decodedID;
    next();
  } catch (err) {
    console.log("User not logged in, redirecting");
    res.redirect("/login");
  }
}

// GET requests
router.get("/", controller.index_get);
router.get("/login", controller.login_get);
router.get("/logout", controller.logout_get);

router.get("/profile", authenticateToken, controller.profile_get);

// POST requests
router.post("/login", controller.login_post);

router.post("/profile", authenticateToken, controller.profile_post);

//404 (Final route)
router.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

export default router;
