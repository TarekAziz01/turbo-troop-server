const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shgh1ow.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    client.connect();


    const toyCollection = client.db("toyDB").collection("toy");

    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find().sort({createdAt: -1}). toArray();
      res.send(result);
    });


    app.get("/allToys/:category", async (req, res) => {
      console.log(req.params.category);
      if (req.params.category == "truck" || req.params.category == "sportsCar" || req.params.category == "fireTruck") {
        const result = await toyCollection
          .find({ subCategory: req.params.category })
          .toArray();
        return res.send(result);
      }
      const result = await toyCollection.find().sort({ createdAt: -1 }).toArray();
      res.send(result);
    });


    // Get single data by id 
    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.findOne(query);
      res.send(result)
    })
    

// read data by user email
    app.get('/mytoys', async (req, res) => {
      // console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = {email: req.query.email}
      }
      // console.log(query)
      const result = await toyCollection.find(query).toArray();
      res.send(result)
    })

    app.post("/toys", async (req, res) => {
      const newToy = req.body;
      newToy.createdAt = new Date();
      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    });

    app.patch("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedToy = req.body;
      const toy = {
        $set: {
          name: updatedToy.name,
          seller: updatedToy.seller,
          email: updatedToy.email,
          subCategory: updatedToy.subCategory,
          price: updatedToy.price,
          availableQuantity: updatedToy.availableQuantity,
          img: updatedToy.img,
          description: updatedToy.description,
          rating: updatedToy.rating,
        },
      };
      const result = await toyCollection.updateOne(filter, toy, options);
      res.send(result);
    })

    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      console.log(req.params)
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    } )


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Turbo Troop server is running...");
});

app.listen(port, () => {
  console.log(`Turbo Troop server in running on port: ${port}`);
});
