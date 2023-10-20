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
    const cartCollection = database.collection("cart");
    const brandsCollection = database.collection("brands");

    app.get("/products/brands/:brands", async (req, res) => {
      const brands = req.params.brands;
      const query = { brandName: brands };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.get("/brands", async (req, res) => {
      const query = brandsCollection.find();
      const result = await query.toArray();
      res.send(result);
    });
    app.get("/products", async (req, res) => {
      const query = productCollection.find();
      const result = await query.toArray();
      res.send(result);
    });

    // update related api
    app.get("/products/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.patch("/products/update/:id", async (req, res) => {
      const id = req.params.id;
      const product = req.body;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = {
        $set: {
          productName: product.productName,
          brandName: product.brandName,
          productType: product.productType,
          productPrice: product.productPrice,
          productRating: product.productRating,
          productphotoUrl: product.productphotoUrl,
        },
      };
      const result = await productCollection.updateOne(
        query,
        updateProduct,
        options
      );
      res.send(result);
    });

    // Add to cart api
    app.get("/cart/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await cartCollection.findOne(query);
      res.send(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/cart/:email", async (req, res) => {
      const cartProduct = req.body;
      try {
        const result = await cartCollection.insertOne(cartProduct);
        res.send(result);
      } catch (error) {
        if (error.code === 11000) {
          res
            .status(400)
            .send(
              "Duplicate key error: Object with the same _id already exists."
            );
        } else {
          console.error("Error:", error);
          res.status(500).send("Internal Server Error");
        }
      }
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
