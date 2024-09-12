const express=require("express")
const { getPostForm,createPost,getPosts,getPostByID,getEditPostForm,updatePost,deletePost} = require("../controllers/postController");
const upload = require("../config/multer");
const { ensureAuthenticated } = require("../middleware/auth");

const postRoute= express.Router()

postRoute.get("/add",getPostForm);
postRoute.post("/add",ensureAuthenticated, upload.array("images",5),createPost);
postRoute.get("/",getPosts)
postRoute.get("/:id",getPostByID)
postRoute.get("/:id/edit",getEditPostForm)
postRoute.put("/:id",ensureAuthenticated,upload.array("images", 5),updatePost);
postRoute.delete("/:id", ensureAuthenticated, deletePost);

module.exports=postRoute;