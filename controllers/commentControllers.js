const asyncHandler=require("express-async-handler")
const Post =require("../model/Post")
const Comment = require("../model/Comment")
exports.addcomment = asyncHandler(async(req, res)=>{
    const {content} = req.body
    const postID=req.params.postID;
    // console.log("Post ID:", postID);
    //FIND POST
    // const post = await Post.findById(postID).populate('author',"username") .populate({path: 'comments',populate: {path: 'author',select: 'username'}}).exec();;
    const post = await Post.findById(postID)
    // console.log("post",post);
    if (!post) {
        return res.render("postDetails", { title: "Post", post, user: req.user, error: "Post not found", success: "" });
    }
    
    if (!content) {
        return res.render("postDetails", { title: "Post", post, user: req.user, error: "Content cannot be empty", success: "" });
    }
    
    //*ADD COMMENT TO POST AND COMMENT DB
    const comment=new Comment({
        content,
        post:postID,
        author:req.user._id
    })
    await comment.save()
    //*ADD COMMENT ID TO POST
    post.comments.push(comment._id)
    await post.save()
    // console.log("Post with populated comments:", post);
    // console.log("Comment with populated comments:", comment);
    // console.log("Comment auther usernamr",comment.author.username)
    // Fetch the comment with populated author details
    const populatedComment = await Comment.findById(comment._id).populate('author', 'username').exec();
    // console.log("Post with populated comments:", post);
    // console.log("populatedComment with populated author:", populatedComment);
    // console.log("populatedComment author username:", populatedComment.author.username)
    res.redirect(`/posts/${postID}`)  
})

exports.getCommentForm=asyncHandler(async(req,res)=>{
    const comment =await Comment.findById(req.params.id)
    // const post =await Post.findById(req.params.id)
    if(!comment) {
        return res.render('postDetails',{title:"POst",comment,error:"POst not found",success:"",user:req.user})
    }
    res.render('editComment',{title:"Comment",comment,user:req.user,error:"",success:""})
})

exports.updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.render("postDetails", {
        title: "Post",
        comment,
        user: req.user,
        error: "Comment not found",
        success: "",
      });
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.render("postDetails", {
        title: "Post",
        comment,
        user: req.user,
        error: "You are not authorized to edit this comment",
        success: "",
      });
    }
    comment.content = content || comment.content;
    await comment.save();
    res.redirect(`/posts/${comment.post}`);
});

exports.deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.render("postDetails", {
        title: "Post",
        comment,
        user: req.user,
        error: "Comment not found",
        success: "",
      });
    }
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.render("postDetails", {
        title: "Post",
        comment,
        user: req.user,
        error: "You are not authorized to delete this comment",
        success: "",
      });
    }
    await Comment.findByIdAndDelete(req.params.id);
    res.redirect(`/posts/${comment.post}`);
  });