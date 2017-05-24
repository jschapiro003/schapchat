const _ = require('lodash');
const mongoose = require('mongoose');
const Comment = require('../models/comment');
const Like = require('../models/like');

function emptyComment(author, text, authorId) {
  return {
    author: author,
    text: text,
    likeCount: 0,
    authorId: authorId,
    date: new Date()
  };
}

// like a comment
function likeComment(req, res) {
  const commentId = '5925ae52986434a162d1ef61'; // req.body.commentId;
  const userId = '1'; // req.session.userId;
  if (!commentId || !userId) {
    res.status(500);
    return res.json({Error: 'Unable to like comment'});
  }

  // check if like exists
  Like.find({userId: userId})
    .where('commentId').equals(commentId)
    .exec(function(err, likeResp) {
      if (err) {
        res.status(500);
        return res.json({Error: 'Unable to lookup like'});
      }

      // if like not found found - create like and increment comment count
      if (!likeResp || likeResp && !likeResp.length) {
        const like = new Like();
        like.userId = userId;
        like.commentId = commentId;
        like.save(function(err) {
          if (err) {
            res.status(500);
            return res.json({Error: 'Unable to save like'});
          }


          // refactor - http://mongoosejs.com/docs/api.html#model_Model.update
          Comment.findById(commentId, function(err, comment) {
            if (err || !comment) {
              res.status(500);
              return res.json({Error: 'Unable to find comment'});
            }

            comment.likeCount = comment.likeCount + 1;

            comment.save(function(err) {
              if (err) {
                res.status(500);
                return res.json({Error: 'Unable to update likeCount'});
              }

              res.status(200);
              res.json({LikesCount: comment.likeCount});
            });
          });
        });

        return;
      }

      // refactor - http://mongoosejs.com/docs/api.html#model_Model.update
      // decrement comment like count and delete like
      Comment.findById(commentId, function(err, comment) {
        if (err || !comment) {
          res.status(500);
          return res.json({Error: 'Unable to find comment'});
        }

        comment.likeCount = comment.likeCount - 1;

        comment.save(function(err) {
          if (err) {
            res.status(500);
            return res.json({Error: 'Unable to update likeCount'});
          }

          Like.remove({userId: userId, commentId: commentId}, function(err) {
            if (err) {
              res.status(500);
              return res.json({Error: 'Unable to delete like'});
            }
          });

          res.status(200);
          res.json({LikesCount: comment.likeCount});
        });
      });
    });
}


// grab all likes
function getLikes(req, res) {
  Like.find({}, function(err, likes) {
    if (err) {
      res.status(500);
      return res.json({Error: 'Error retreiving likes'});
    }

    res.status(200);
    res.json({likes: likes});
  });
}

// grab all comments
function getComments(req, res) {
  Comment.find({}, function(err, comments) {
    if (err) {
      res.status(500);
      return res.json({Error: 'Error retreiving comments'});
    }

    res.status(200);
    res.json({comments: comments});
  });
}

// create new comment
function createComment(req, res) {
  // grab username and id from session details
  // find or create comment with text from req
  const authorId = '1';
  const author = 'Jonathan Schapiro';
  const text = 'new comment';//'new comment';

  if (!authorId || !author || !text) {
    res.status(400);
    return res.json({Error: 'Not enough info to create a comment'});
  }

  const comment = new Comment();
  _.extend(comment, emptyComment(author, text, authorId));

  comment.save(function(err) {
    if (err) {
      res.status(500);
      return res.json({Error: 'Unable to save comment'});
    }

    res.status(200);
    res.json(comment);
  });
}

module.exports =  {
	getComments,
  createComment,
  likeComment,
  getLikes
}