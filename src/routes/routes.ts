import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import * as controller from "../controllers/controller.js";
import logger from "../util/logger.js";
import * as env from "../util/secrets.js";

const router = Router();

// Verify JWT token
// If invalid, redirect to index
// Can be placed in router requests to verify token before accessing route
async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.JWT;
  // If no token, redirect to index
  if (!token) {
    res.redirect("/");
    return;
  }
  // Verifies token. redirect to /login if error.
  try {
    let decodedID: string = ((await jwt.verify(token, env.ACCESS_TOKEN_SECRET)) as JwtPayload).id;
    // If no error, assign id to req.id
    req.id = decodedID;
    next();
  } catch (err) {
    logger.debug("User not logged in, redirecting");
    res.redirect("/");
    return;
  }
}

// GET requests
router.get("/", controller.index_get);
router.get("/logout", controller.logout_get);

router.get("/profile", authenticateToken, controller.profile_get);

// POST requests
router.post("/login", controller.login_post);

router.post("/profile", authenticateToken, controller.profile_post);

//404 (Final route)
router.use((req, res) => {
  res.status(404).render("404", { title: "404", OAUTH_CLIENT_ID: env.OAUTH_CLIENT_ID, agent: req.useragent });
});

export default router;
