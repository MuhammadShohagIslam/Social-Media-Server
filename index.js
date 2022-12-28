const { MongoClient, ServerApiVersion } = require("mongodb");
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
    } finally {
    }
};

run().catch((error) => console.log(error.message));

app.listen(port, () => {
    console.log(`ShohagCSM server is running on ${port}`);
});
