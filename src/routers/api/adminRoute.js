const { Router } = require("express");
const router = Router();
const authMiddleware = require("../../middleware/auth");

const AuthController = require('../../controllers/admin/AuthController')
const UserController = require('../../controllers/admin/UserController')

router.get('/admin/me', authMiddleware.checkAdmin, AuthController.me);
router.post('/admin/login', AuthController.login);

router.get('/admin/users', authMiddleware.checkAdmin, UserController.getList);
module.exports = router;
