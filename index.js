const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// MiddleWare
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.egiog1s.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("productDB");
    const productCollection = database.collection("product");
    const brandsCollection = database.collection("brands");


    app.get("/brands", async (req, res) => {
      const query = brandsCollection.find();
      const result = await query.toArray();
      res.send(result);
    });

    app.get("/products/:brands", async (req, res) => {
      const brands = req.params.brands;
      const query = { brandName: brands };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const query = productCollection.find();
      const result = await query.toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("TechWares server is running...");
});
app.listen(port, () => {
  console.log(`TechWares server is running on port ${port}`);
});
