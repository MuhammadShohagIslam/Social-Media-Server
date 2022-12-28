const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use([cors(), express.json()]);

// connect mongoDB
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const run = async () => {
    try {
        const postsCollection = client.db("socialMedia").collection("posts");
        const usersCollection = client.db("socialMedia").collection("users");
        const commentsCollection = client
            .db("socialMedia")
            .collection("comments");
        const likePostCollection = client
            .db("socialMedia")
            .collection("likePosts");

        // create jwt token
        app.post("/jwt", (req, res) => {
            try {
                const userData = {
                    ...req.body,
                };
                const token = jwt.sign(
                    userData,
                    process.env.ACCESS_TOKEN_SCREAT,
                    {
                        expiresIn: "20d",
                    }
                );
                res.status(200).json({ token });
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        });

        // create new user
        app.post("/users", async (req, res) => {
            try {
                const userData = {
                    ...req.body,
                };
                // check is user is already exits to the database, if it's exits, we do not allow
                // to insert new user to the database
                const user = await usersCollection.findOne({
                    email: req.body.email,
                });
                if (user) {
                    return res
                        .status(400)
                        .send({ message: "User Already Exits!" });
                }
                const newUser = await usersCollection.insertOne(userData);
                res.status(200).send(newUser);
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        });

        // create new post
        app.post("/posts", async (req, res) => {
            try {
                const postObj = {
                    ...req.body,
                    postedAt: Date.now(),
                };

                const newPost = await postsCollection.insertOne(postObj);
                res.status(201).json(newPost);
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        });

        // get all posts
        app.get("/posts", async (req, res) => {
            try {
                const posts = await postsCollection.find({}).toArray();
                res.status(200).json(posts);
            } catch (error) {
                res.status(500).send({ message: "Server Error" });
            }
        });

        // get post by postId
        app.get("/posts/:postId", async (req, res) => {
            try {
                const query = {
                    _id: ObjectId(req.params.postId),
                };
                const posts = await postsCollection.findOne(query);
                res.status(200).json(posts);
            } catch (error) {
                res.status(500).send({ message: "Server Error" });
            }
        });

        // like the post
        app.post("/likes", async (req, res) => {
            try {
                const likePostData = {
                    ...req.body,
                };
                const isLikedPostExist = await likePostCollection.findOne({
                    email: req.body.email,
                    _id: req.body.postId,
                });
                if (isLikedPostExist) {
                    return res
                        .status(400)
                        .send({ message: "User Already Liked The Post!" });
                }
                const newLikedPost = await likePostCollection.insertOne(
                    likePostData
                );
                res.status(200).send(newLikedPost);
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        });

        // get all likedPosts
        app.get("/likes", async (req, res) => {
            try {
                const likePosts = await likePostCollection.find({}).toArray();
                res.status(200).json(likePosts);
            } catch (error) {
                res.status(500).send({ message: "Server Error" });
            }
        });

        // delete likedPost by query
        app.delete("/likes", async (req, res) => {
            try {
                if (req.query.likedUserEmail || req.query.likedUserName) {
                    const query = {
                        postId: req.query.postId,
                        likedUserEmail: req.query.likedUserEmail,
                    };
                    const removedLikedPost = await likePostCollection.deleteOne(
                        query
                    );
                    res.status(200).json(removedLikedPost);
                }
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        });

        // create new comment
        app.post("/comments", async (req, res) => {
            try {
                const commentObj = {
                    ...req.body,
                    commentedAt: Date.now(),
                };

                const newComment = await commentsCollection.insertOne(
                    commentObj
                );
                res.status(201).json(newComment);
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        });

        // get all comments
        app.get("/comments", async (req, res) => {
            try {
                const comments = await commentsCollection.find({}).toArray();
                res.status(200).json(comments);
            } catch (error) {
                res.status(500).send({ message: "Server Error" });
            }
        });
    } finally {
    }
};

run().catch((error) => console.log(error.message));

app.listen(port, () => {
    console.log(`ShohagCSM server is running on ${port}`);
});
