const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
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

        // create new post
        app.post("/posts", async (req, res) => {
            try {
                const postObj = {
                    ...req.body,
                    postedAt: Date.now()
                };

                const newPost = await postsCollection.insertOne(postObj);
                res.status(201).json(newPost);
            } catch (error) {
                res.status(500).send({ message: error.message });
            }
        });

    } finally{

    }
}

run().catch(error=> console.log(error.message));

app.listen(port, () => {
    console.log(`ShohagCSM server is running on ${port}`);
});
