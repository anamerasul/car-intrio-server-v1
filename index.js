const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var nodemailer = require("nodemailer");
var sgTransport = require("nodemailer-mailgun-transport");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

// connection to mongodb

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ia0a3jy.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();

    // userDatabase and collection
    const carintrioBannerCollection = client
      .db("car-intrio")
      .collection("banners");
    const carintrioBlogsCollection = client
      .db("car-intrio")
      .collection("blogs");
    const carintrioOrdersCollection = client
      .db("car-intrio")
      .collection("orders");

    const carintrioPaymentsCollection = client
      .db("car-intrio")
      .collection("payments");
    const carintrioPortfolioCollection = client
      .db("car-intrio")
      .collection("portfolio");
    const carintrioProductsCollection = client
      .db("car-intrio")
      .collection("products");
    const carintrioProfileCollection = client
      .db("car-intrio")
      .collection("profile");

    const carintrioReviewsCollection = client
      .db("car-intrio")
      .collection("reviews");
    const carintrioUserssCollection = client
      .db("car-intrio")
      .collection("users");

    console.log("db connected");
  } finally {
    //
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From carintrio server!");
});

app.listen(port, () => {
  console.log(`carintrio-server listening on port ${port}`);
});
