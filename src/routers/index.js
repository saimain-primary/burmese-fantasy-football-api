const { Router } = require("express");
const userRoute = require("./api/userRoute");
const adminRoute = require("./api/adminRoute");

const router = Router();

// router.use(adminRoute);

router.use(userRoute);

module.exports = router;
