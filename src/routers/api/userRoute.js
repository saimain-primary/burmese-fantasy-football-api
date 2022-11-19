const { Router } = require("express");
const router = Router();
const multer = require("multer");

const AuthController = require("../../controllers/user/AuthController");
const TeamController = require("../../controllers/TeamController");
const FixtureController = require("../../controllers/user/FixtureController");
const GameWeekController = require("../../controllers/user/GameWeekController");
const PredictionController = require("../../controllers/user/PredictionController");
const TournamentController = require("../../controllers/user/TournamentController");
const LeaderboardController = require("../../controllers/user/LeaderboardController");
const HomeController = require("../../controllers/user/HomeController");
const LeagueController = require("../../controllers/LeagueController");

const authMiddleware = require("../../middleware/auth");
const { default: axios } = require("axios");
const { storageEngine, checkFileType } = require("../../helpers/imageUpload");
const uploadProfile = multer({
  storage: storageEngine,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});
// Authentication

router.post("/register", AuthController.Register);
router.post("/verify-otp", AuthController.VerifyOTP);
router.post("/login", AuthController.Login);
router.post("/logout", AuthController.Logout);
router.post("/forget-password", AuthController.ForgetPassword);
router.post("/reset-password", AuthController.ResetPassword);

router.get("/me", authMiddleware.check, AuthController.getMe);
router.put("/me", authMiddleware.check, AuthController.updateAccount);
router.post(
  "/profile-image",
  uploadProfile.single("profile"),
  AuthController.updateProfileImage
);

router.get("/premier-league-teams", TeamController.getPremierLeagueTeamList);
router.get("/teams", TeamController.getTeamList);

router.get("/fixture", FixtureController.getFixtureList);
router.get("/fixture-custom", FixtureController.getFixtureListCustom);
router.get("/venues", FixtureController.getVenuesDetail);
router.get("/current-gameweek", GameWeekController.currentGameWeek);
router.get("/home-gameweek", GameWeekController.homeGameWeek);

router.get("/home", HomeController.index);

router.post(
  "/current-gameweek",
  authMiddleware.checkAdmin,
  GameWeekController.changeCurrentGameWeek
);

router.post(
  "/home-gameweek",
  authMiddleware.checkAdmin,
  GameWeekController.changeHomeGameWeek
);

router.post(
  "/gameweek",
  authMiddleware.checkAdmin,
  GameWeekController.addGameWeek
);

router.get("/gameweek", GameWeekController.getGameWeek);

router.post("/predict", authMiddleware.check, PredictionController.predict);
router.post("/calculate-point", PredictionController.calculatePoint);

router.get("/leaderboard", LeaderboardController.getList);
router.get("/leaderboard-detail/:id", LeaderboardController.getDetail);

router.get("/tournament", TournamentController.index);
router.get("/tournament-custom", TournamentController.indexCustom);

router.get('/leagues', LeagueController.getList);
router.get('/leagues/:id', LeagueController.getDetail);

module.exports = router;
