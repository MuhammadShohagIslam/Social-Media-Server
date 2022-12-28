const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const postsCollection = client.db("socialMedia").collection("posts");

  client.close();
});