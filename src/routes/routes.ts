import express, {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import * as controller from "../controllers/controller.js";
import { MyRequest } from "../types/DBObjects.ts/types.js";
import logger from "../util/logger.js";
import * as env from "../util/secrets.js";

const router = express.Router();

// Verify JWT token
// If invalid, redirect to index
// Can be placed in router requests to verify token before accessing route
async function authenticateToken(req: MyRequest, res: Response, next: NextFunction) {
  const token = req.cookies["JWT"];
  // If no token, redirect to index
  if (!token) res.redirect("/");

  // Verifies token. redirect to /login if error.
  try {
    let decodedID: string = await jwt.verify(token, env.ACCESS_TOKEN_SECRET).id;
    // If no error, assign id to req.id
    req.id: string = decodedID;
    next();
  } catch (err) {
    logger.debug("User not logged in, redirecting");
    res.redirect("/");
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
  res
    .status(404)
    .render("404", { title: "404", OAUTH_CLIENT_ID: env.OAUTH_CLIENT_ID, agent: req.headers["user-agent"] });
});

export default router;
