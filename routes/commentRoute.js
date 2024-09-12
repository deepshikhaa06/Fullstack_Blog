const express=require('express');
const commentRoutes = express.Router();
const {ensureAuthenticated} = require('../middleware/auth');
const {addcomment,getCommentForm,updateComment,deleteComment}=require('../controllers/commentControllers');

commentRoutes.post('/posts/:postID/comments', ensureAuthenticated, addcomment);
commentRoutes.get('/comments/:id/edit', getCommentForm);
commentRoutes.put('/comments/:id',ensureAuthenticated, updateComment)
commentRoutes.delete('/comments/:id',ensureAuthenticated,deleteComment)

module.exports = commentRoutes;
