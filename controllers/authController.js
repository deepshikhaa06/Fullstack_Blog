const asyncHandler = require('express-async-handler')
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const passport=require("passport")


exports.getLogin=asyncHandler((req,res)=>{
    res.render("login",{title:"Login", user: req.user,error:""})
})
exports.login=asyncHandler(async (req,res,next)=>{
    passport.authenticate("local",(err,user,info)=>{
        // console.log(err,user,info); 
        if(err) return next(err);
        if(!user) return res.render("login",{title:"Login",user:req.user,error:info.message});
        req.logIn(user,(err)=>{
            if(err) return next(err)
                res.redirect("/")
        })
    })(req,res,next);
})
exports.getRegister=asyncHandler((req,res)=>{
    res.render("register", { title: "Register", user: null, error: null })
})
exports.register=asyncHandler(async (req,res)=>{
    const {username,email,password} = req.body;
    try{
        const existingUser=await User.findOne({email})
        if(existingUser){
            return res.render("register",{title:"Register",user:req.user,error:"user already exists"})
        }
        //HASH PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user=await User.create({username,email,password:hashedPassword})
        res.redirect('/auth/login')
    }catch (err) {
        res.render("register",{title:"Register",user:req.user,error:err.message})
    }   
})

exports.logout = asyncHandler((req, res) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/auth/login");
    });
})