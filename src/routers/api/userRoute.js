const { Router } = require("express");
const router = Router();

const AuthController = require("../../controllers/user/AuthController");
const TeamController = require("../../controllers/TeamController");
const FixtureController = require("../../controllers/user/FixtureController");
const GameWeekController = require("../../controllers/user/GameWeekController");

const authMiddleware = require("../../middleware/auth");

// Authentication

router.post("/register", AuthController.Register);
router.post("/verify-otp", AuthController.VerifyOTP);
router.post("/login", AuthController.Login);
router.post("/logout", AuthController.Logout);
router.post("/forget-password", AuthController.ForgetPassword);
router.post("/reset-password", AuthController.ResetPassword);

router.get("/me", authMiddleware.check, AuthController.getMe);

router.get("/premier-league-teams", TeamController.getPremierLeagueTeamList);
router.get("/teams", TeamController.getTeamList);

router.get("/fixture", FixtureController.getFixtureList);
router.get("/current-gameweek", GameWeekController.currentGameWeek);

router.post(
  "/current-gameweek",
  authMiddleware.checkAdmin,
  GameWeekController.changeCurrentGameWeek
);
router.post(
  "/gameweek",
  authMiddleware.checkAdmin,
  GameWeekController.addGameWeek
);

router.get("/gameweek", GameWeekController.getGameWeek);
module.exports = router;
