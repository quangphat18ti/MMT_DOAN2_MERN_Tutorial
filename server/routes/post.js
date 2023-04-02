const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')
const Post = require('../models/Post');
const { default: mongoose } = require('mongoose');

const hostLink = "http://localhost:5000/"

// @ POST api/posts
// @desc Create post
// @access Private
router.post("/", verifyToken, async (req, res) => {
    const { title, description, url, status } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: "Title is requried" });
    }

    try {
        const post = await Post.findOne({ title });
        if (post) {
            return res.status(400).json({ success: false, message: "Title is existed!", Post: post })
        }
        const newPost = new Post({
            title,
            description: description || "",
            url: url ? (url.startsWith("https://") ? url : `https://${url}`) : hostLink,
            status: status,
            user: req.userID
        })

        await newPost.save();

        return res.status(200).json({ success: true, message: "Create post successfully!", newPost });
    } catch (error) {
        console.log("Error = ", error);
        return res.status(500).json({ success: false, message: "Interal Server Error!" });
    }
})

// @ GET api/posts
// @desc Get post
// @access Private

router.get("/", verifyToken, async (req, res) => {
    try {
        // populate(tên thuộc tính, [các trường muốn hiện]) để detach lấy thông tin của user chứ ko chỉ để userID.
        const posts = await Post.find({ user: req.userID }).populate("user", ["username"]);
        return res.status(200).json({ success: true, Posts: posts });
    }
    catch (error) {
        console.log("Error = ", error);
        return res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
})

// @ PUT api/posts
// @desc Update post
// @access Private

router.put("/:id", verifyToken, async (req, res) => {
    const { title, description, url, status } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: "Title is requried" });
    }

    try {
        let updatePost = {
            title,
            description: description || "",
            url: url ? (url.startsWith("https://") ? url : `https://${url}`) : hostLink,
            status: status,
            user: req.userID
        }

        const postWithTitle = await Post.findOne({ title });
        if (postWithTitle._id != req.params.id) {
            return res.status(400).json({ success: false, message: "Title is existed", post: postWithTitle });
        }

        const postUpdateCondition = { _id: req.params.id, user: req.userID };
        updatePost = await Post.findOneAndUpdate(postUpdateCondition, updatePost, { new: true });

        if (!updatePost) {
            return res.status(401).json({
                success: false,
                message: "Post not found or user not authorise"
            })
        }

        return res.status(200).json({ success: true, message: "Update post successfully!", Post: updatePost });
    } catch (error) {
        console.log("Error = ", error);
        return res.status(500).json({ success: false, message: "Interal Server Error!" });
    }
})

// @ DELTE api/posts
// @desc Delete post
// @access Private

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const postDeleteCondition = { _id: req.params.id, user: req.userID };
        const deletePost = await Post.findOneAndDelete(postDeleteCondition);

        // User not authorised or post not found
        if (!deletePost) {
            return res.status(401).json({
                success: false,
                message: "Post not found or not authorised"
            })
        }

        res.status(200).json({
            success: true,
            DeletePost: deletePost
        })


    } catch (error) {
        console.log("Error = ", error);
        return res.status(500).json({ success: false, message: "Interal Server Error!" });
    }
})
module.exports = router;