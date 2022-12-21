import express from "express";
import * as controller from "../controllers/sms_controller.js";
const router = express.Router();

router.post("/", controller.reply_post);

//404 (Final route)
router.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});

export default router;
