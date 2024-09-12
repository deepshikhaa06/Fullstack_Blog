const express=require('express');
const { ensureAuthenticated } = require('../middleware/auth');
const { getUserProfile,getEditProfileForm,updateUserProfile,deleteUserProfile } = require('../controllers/userController');
const  userRouter = express.Router();
const upload = require("../config/multer");

userRouter.get("/profile",ensureAuthenticated,getUserProfile)
userRouter.get("/edit",ensureAuthenticated,getEditProfileForm)
userRouter.post("/edit",ensureAuthenticated,upload.single("profilePicture"), updateUserProfile)
userRouter.post("/delete",ensureAuthenticated,deleteUserProfile)
module.exports=userRouter;