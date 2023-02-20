const { Router } = require("express");
const router = Router();
const authMiddleware = require("../../middleware/auth");

const AuthController = require('../../controllers/admin/AuthController')
const UserController = require('../../controllers/admin/UserController')
const PlayerController = require('../../controllers/admin/PlayerController');

router.get('/admin/me', authMiddleware.checkAdmin, AuthController.me);
router.post('/admin/login', AuthController.login);

router.get('/admin/users', authMiddleware.checkAdmin, UserController.getList);

router.get('/admin/players/statistics', authMiddleware.checkAdmin, PlayerController.fetchPlayerStatisticByFixture);

module.exports = router;

