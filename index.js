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

// verifyJWT token

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    process.env.NODE_ACCESS_JWT_TOKEN_SECRET,
    function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      req.decoded = decoded;
      next();
    }
  );
}

// const verifyJwtToken = (token) => {
//   let email;

//   jwt.verify(
//     token,
//     process.env.NODE_ACCESS_JWT_TOKEN_SECRET,
//     function (err, decoded) {
//       if (err) {
//         email = "invalid";
//       }

//       if (decoded) {
//         console.log(decoded);
//         email = decoded;
//       }
//     }
//   );
//   return email;
// };
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

    // verifyAdmin

    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        next();
      } else {
        res.status(403).send({ message: "forbidden" });
      }
    };

    // add banner route

    // jwt token in login

    app.post("/login", (req, res) => {
      const email = req.body;
      // const user = req.body

      // crypto.randomBytes(64).toString('hex')

      const accessToken = jwt.sign(
        email,
        process.env.NODE_ACCESS_JWT_TOKEN_SECRET,
        {
          expiresIn: "4d",
        }
      );
      res.send({ accessToken });

      console.log(accessToken);
    });

    // add banner route

    app.post("/banner", verifyJWT, async (req, res) => {
      const banners = req.body;
      const result = await carintrioBannerCollection.insertOne(banners);
      res.send(result);
    });

    // get banner route

    app.get("/banners", async (req, res) => {
      const query = {};
      const cursor = carintrioBannerCollection.find(query);

      const banners = await cursor.toArray();

      res.send(banners);
    });

    // add blogs route

    app.post("/blogs", verifyJWT, async (req, res) => {
      const blogs = req.body;
      const result = await carintrioBlogsCollection.insertOne(blogs);
      res.send(result);
    });

    // get blogs route

    app.get("/blogs", async (req, res) => {
      const query = {};
      const cursor = carintrioBlogsCollection.find(query);

      const blogs = await cursor.toArray();

      res.send(blogs);
    });
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
