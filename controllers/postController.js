const asyncHandler=require("express-async-handler")
const cloudinary = require("../config/cloudinary");
const Post = require("../model/Post");
const File = require("../model/File");

exports.getPostForm=asyncHandler((req,res)=>{
  res.render('newPost', {title:"Create a new post",user:req.user ,error:null,success:""});
})

exports.createPost=asyncHandler(async(req,res)=>{
  const {title,content} = req.body;
  //VALIDATION
  // if(!req.files||req.files.length===0){
  //   return res.render("newPost",{title:"Create a new post",user:req.user ,error:"AT LEAST ONE IMAGES IS REQUIRED"});
  // }
  const images = await Promise.all(
    req.files.map(async (file)=>{
     //*SAVE THE IMAGES INTO OUR DB
     const newFile = new File({
      url:file.path,
      public_id:file.filename,
      uploaded_by:req.user._id,
     })
     await newFile.save();
    //  console.log("new file saved",newFile);
     return {
      url:newFile.url,
      public_id:newFile.public_id,
     }
    })
  )
  const newPost = new Post({
    title,
    content,
    author:req.user._id,
    images,
   });
   await newPost.save();
   res.render("newPost",{title:"create new post",user:req.user,success:"Post created successfully",error:""});
  
})

exports.getPosts=asyncHandler(async (req, res, next) => {
  const posts = await Post.find().populate('author',"username")
  res.render('posts',{title:"Posts",user:req.user,posts,success:"",error:""});
})

exports.getPostByID=asyncHandler(async(req,res)=>{
  const post = await Post.findById(req.params.id).populate('author',"username").populate({path:"comments",populate:{path:"author",model:"User",select:"username"}})
  res.render('postDetails',{title:post.title,user:req.user,post,success:"",error:""});
  
})

exports.getEditPostForm=asyncHandler(async(req, res, next)=>{
  const post = await Post.findById(req.params.id)
  if(!post){
    return next(new Error("Post not found"))
  }
  res.render('editPost',{title:"Edit Post",user:req.user,post,error:null,success:""});
})

exports.updatePost = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  //find the post
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "Post not found",
      success: "",
    });
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "You are not authorized to edit this post",
      success: "",
    });
  }

  post.title = title || post.title;
  post.content = content || post.content;
  if (req.files) {
    await Promise.all(
      post.images.map(async (image) => {
        await cloudinary.uploader.destroy(image.public_id);
      })
    );
  }
  post.images = await Promise.all(
    req.files.map(async (file) => {
      const newFile = new File({
        url: file.path,
        public_id: file.filename,
        uploaded_by: req.user._id,
      });
      await newFile.save();
      return {
        url: newFile.url,
        public_id: newFile.public_id,
      };
    })
  );
  console.log(post);
  await post.save();
  res.redirect(`/posts/${post._id}`);
})

exports.deletePost = asyncHandler(async (req, res) => {
  //find the post
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "Post not found",
      success: "",
    });
  }
  if (post.author.toString() !== req.user._id.toString()) {
    return res.render("postDetails", {
      title: "Post",
      post,
      user: req.user,
      error: "You are not authorized to delete this post",
      success: "",
    });
  }
  await Promise.all(
    post.images.map(async (image) => {
      await cloudinary.uploader.destroy(image.public_id);
    })
  );
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/posts");
});