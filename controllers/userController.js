const asyncHandler=require("express-async-handler")
const cloudinary = require("../config/cloudinary");
const User=require("../model/User")
const Post = require("../model/Post")
const File = require("../model/File")
const Comment = require("../model/Comment")

exports.getUserProfile = asyncHandler(async (req,res)=>{
    const user= await User.findById(req.user._id).select("-password")
    if(!user){
        // return res.status(404).send("User not found")
        return res.render("login",{title:"login error",user:req.user,error:"User not found"})
    }
    const posts=await Post.find({author:req.user._id}).sort({createdAt:-1})
    res.render("profile",{title:"profile",posts,user,error:"",postCount:posts.length})
})

exports.getEditProfileForm=asyncHandler(async(req, res, next)=>{
    const user= await User.findById(req.user._id).select("-password")
    if(!user){
        return next(new Error("User not found"))
        // return res.render('login', {title: 'login', user: req.user, error:'User'})
    }
    res.render('editProfile',{title:"Edit Profile",user,error:null,success:""})
})

exports.updateUserProfile=asyncHandler(async function (req, res){
    const {username,email,bio} = req.body
    const user= await User.findByIdAndUpdate(req.user._id,{username,email,bio},{new:true})
    if(!user){
        return res.render('login', {title:"login",user:req.user,error:"User not found"})
    }
    if(req.file){
        if(user.profilePicture&&user.profilePicture.public_id){
            await cloudinary.uploader.destroy(user.profilePicture.public_id)
        }
    const file=await File({
        url:req.file.path,
        public_id:req.file.filename,
        uploaded_by:req.user._id
    })
    await file.save()
    user.profilePicture={
        url:file.url,
        public_id:file.public_id
    }
    await user.save()
}
    res.render("editProfile",{title:"Edit Profile",user,error:"",success:"Profile saved successfully"})

})

exports.deleteUserProfile = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.user._id)
    if(!user){
        return res.render('login', {title:"login", user: req.user, error:'User not found'})
    }
    //*DELETE USER PROFILE PICTURE FROM CLOUDINARY 
    if(user.profilePicture&&user.profilePicture.public_id){
        await cloudinary.uploader.destroy(user.profilePicture.public_id)
    }
    //*DELETE ALL POST CREATED BY THE USER AND THEIR ASSOCIATED IMAGES AND COMMENTS
    const posts=await Post.find({author:req.user._id})
    for (const post of posts) {
        for (const image of post.images) {
            await cloudinary.uploader.destroy(image.public_id)
        }
        await Comment.deleteMany({post:post._id})
    }
    await Post.deleteMany({author:req.user._id})
    await Comment.deleteMany({author:req.user._id})
    //*DELETE USER FROM DB
    await User.findByIdAndDelete(req.user._id)
    const files=await File.find({uploaded_by:req.user._id})
    for (const file of files){
        await cloudinary.uploader.destroy(file.public_id)
    }
    req.logout()
    res.render('login', {title:"login", user: null, error:'User deleted successfully'})  
})