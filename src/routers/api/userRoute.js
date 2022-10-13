const { Router } = require("express");
const router = Router();

const AuthController = require("../../controllers/user/AuthController");
const TeamController = require("../../controllers/TeamController");
const FixtureController = require("../../controllers/user/FixtureController");

const authMiddleware = require("../../middleware/auth");
// Authentication

router.post("/register", AuthController.Register);
router.post("/verify-otp", AuthController.VerifyOTP);
router.post("/login", AuthController.Login);
router.post("/logout", AuthController.Logout);
router.post("/forget-password", AuthController.ForgetPassword);

router.get("/me", authMiddleware.check, AuthController.getMe);

router.get("/premier-league-teams", TeamController.getPremierLeagueTeamList);
router.get("/teams", TeamController.getTeamList);

router.get("/fixture", FixtureController.getFixtureList);
module.exports = router;
