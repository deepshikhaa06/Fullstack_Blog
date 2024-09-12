const express=require('express');
const  authRouter = express.Router();
const {getLogin,login,getRegister,register,logout} = require('../controllers/authController');

authRouter.get("/login",getLogin)
authRouter.post("/login",login)
authRouter.get("/register",getRegister)
authRouter.post("/register",register)
authRouter.get("/logout",logout)


module.exports=authRouter;