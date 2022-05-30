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

    const carintriouserProfileCollection = client
      .db("car-intrio")
      .collection("userprofile");

    const carintrioReviewsCollection = client
      .db("car-intrio")
      .collection("reviews");
    const carintrioUsersCollection = client
      .db("car-intrio")
      .collection("users");

    console.log("db connected");

    // verifyAdmin

    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await carintrioUsersCollection.findOne({
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

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await carintrioUsersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.NODE_ACCESS_JWT_TOKEN_SECRET,
        { expiresIn: "4d" }
      );
      res.send({ result, token });
    });

    app.get("/user", async (req, res) => {
      const users = await carintrioUsersCollection.find().toArray();
      res.send(users);
    });

    app.get("/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const user = await carintrioUsersCollection.findOne({ email: email });
      const isAdmin = user?.role === "admin";
      res.send({ admin: isAdmin });
    });

    app.put("/user/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await carintrioUsersCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    app.put(
      "/user/removeadmin/:email",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const email = req.params.email;
        const filter = { email: email };
        const updateDoc = {
          $set: { role: false },
        };
        const result = await carintrioUsersCollection.updateOne(
          filter,
          updateDoc
        );
        res.send(result);
      }
    );

    // remove user

    app.delete("/users/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carintrioUsersCollection.deleteOne(query);
      res.send(result);
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

    // add portfolio route

    app.post("/portfolio", verifyJWT, async (req, res) => {
      const portfolio = req.body;
      const result = await carintrioPortfolioCollection.insertOne(portfolio);
      res.send(result);
    });

    // get portfolio route
    app.get("/portfolio", async (req, res) => {
      const query = {};
      const cursor = carintrioPortfolioCollection.find(query);

      const portfolio = await cursor.toArray();

      res.send(portfolio);
    });

    // add add admin profile route

    app.post("/addProfile", async (req, res) => {
      const addProfileInfo = req.body;

      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");

      console.log(Jwttokeninfo);
      // console.log(orderInfo);
      console.log(email);
      const decoded = verifyJwtToken(
        accessToken,
        process.env.NODE_ACCESS_JWT_TOKEN_SECRET
      );
      console.log(decoded.email);

      console.log(decoded.email);

      if (decoded.email) {
        const result = await carintrioProfileCollection.insertOne(
          addProfileInfo
        );
        res.send(result);
      }
      // if (email === decoded.email) {
      //   const result = await orderCollection.insertOne(orderInfo);
      //   res.send({ success: "Product ADD TO USER successfully" });
      // } else {
      //   res.status(403).send({ message: "forbidden access" });
      // }
    });

    // get admin profile route

    app.get("/addProfile", verifyJWT, async (req, res) => {
      const useremail = req.email;
      const id = req.params.id;
      const query = {};

      console.log(useremail);
      const cursor = carintrioProfileCollection.find({ email: useremail });

      const profile = await cursor.toArray();

      res.send(profile);
    });

    // edit admin profile route
    app.put("/myprofile/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const profile = req.body;

      const result = await carintrioProfileCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: profile }
      );

      res.send(result);
    });

    // add product route

    app.post("/products", verifyJWT, async (req, res) => {
      const products = req.body;
      const result = await carintrioProductsCollection.insertOne(products);
      res.send(result);
    });

    // get all product route
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = carintrioProductsCollection.find(query);

      const products = await cursor.toArray();

      res.send(products);
    });

    // get spefic products route
    // app.get("/products/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: ObjectId(id) };
    //   const product = carintrioProductsCollection.findOne(query);

    //   // const product = await cursor.();

    //   res.send(product);
    // });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await carintrioProductsCollection.findOne(query);
      res.send(item);
    });

    // update spefic product
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      const result = await carintrioProductsCollection.updateOne(
        { _id: new ObjectId(id) },

        { $set: data }
      );

      res.send(result);
    });

    // delete product

    app.delete("/products/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carintrioProductsCollection.deleteOne(query);
      res.send(result);
    });

    // add add  user profile route

    app.post("/adduserprofile", verifyJWT, async (req, res) => {
      const adduserProfileInfo = req.body;

      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");

      console.log(Jwttokeninfo);
      // console.log(orderInfo);
      console.log(email);
      const decoded = verifyJwtToken(
        accessToken,
        process.env.NODE_ACCESS_JWT_TOKEN_SECRET
      );
      console.log(decoded.email);

      console.log(decoded.email);

      if (decoded.email) {
        const result = await carintriouserProfileCollection.insertOne(
          adduserProfileInfo
        );
        res.send(result);
      }
      // if (email === decoded.email) {
      //   const result = await orderCollection.insertOne(orderInfo);
      //   res.send({ success: "Product ADD TO USER successfully" });
      // } else {
      //   res.status(403).send({ message: "forbidden access" });
      // }
    });

    // get users profile route

    app.get("/adduserProfile/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const id = req.params.id;
      const query = {};
      console.log(req);

      const cursor = carintriouserProfileCollection.find({ email: email });

      const profile = await cursor.toArray();

      res.send(profile);
    });

    // edit user profile route
    app.put("/adduserProfile/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const profile = req.body;

      const result = await carintriouserProfileCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: profile }
      );

      res.send(result);
    });

    // add reviews route

    app.post("/addreviews", verifyJWT, async (req, res) => {
      const addreviews = req.body;

      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");

      console.log(Jwttokeninfo);
      // console.log(orderInfo);
      console.log(email);
      const decoded = verifyJwtToken(
        accessToken,
        process.env.NODE_ACCESS_JWT_TOKEN_SECRET
      );
      console.log(decoded.email);

      console.log(decoded.email);

      if (decoded.email) {
        const result = await carintrioReviewsCollection.insertOne(addreviews);
        res.send(result);
      }
      // if (email === decoded.email) {
      //   const result = await orderCollection.insertOne(orderInfo);
      //   res.send({ success: "Product ADD TO USER successfully" });
      // } else {
      //   res.status(403).send({ message: "forbidden access" });
      // }
    });

    // get all reviews

    app.get("/addreviews", async (req, res) => {
      const query = {};
      const cursor = carintrioReviewsCollection.find(query);

      const reviews = await cursor.toArray();

      res.send(reviews);
    });

    // get spefic reviews route by id

    app.get("/addreviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await carintrioReviewsCollection.findOne(query);
      res.send(item);
    });

    //get spefic review by email
    app.get("/addreviews/:email", verifyJWT, async (req, res) => {
      // const email = req.params.email;
      // const query = { email: email };
      // const item = await carintrioReviewsCollection.findOne(query);
      // res.send(item);

      const email = req.params.email;
      const id = req.params.id;
      const query = {};
      console.log(req);

      const cursor = carintrioReviewsCollection.find({ email: email });

      const profile = await cursor.toArray();

      res.send(profile);

      // const email = req.params.email;
      // const id = req.params.id;
      // const query = {};
      // // console.log(req);

      // const cursor = carintrioReviewsCollection.find({ email: email });

      // const reviews = await cursor.toArray();

      // res.send(reviews);
    });

    // delete review by id
    app.delete("/addreviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await carintrioReviewsCollection.deleteOne(query);
      res.send(result);
    });

    // edit review by id

    app.put("/addreviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const review = req.body;

      const result = await carintrioReviewsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: review }
      );

      res.send(result);
    });

    // add order route

    app.post("/adduserorder", verifyJWT, async (req, res) => {
      const order = req.body;

      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");

      console.log(Jwttokeninfo);
      // console.log(orderInfo);
      console.log(email);
      const decoded = verifyJwtToken(
        accessToken,
        process.env.NODE_ACCESS_JWT_TOKEN_SECRET
      );
      console.log(decoded.email);

      console.log(decoded.email);

      if (decoded.email) {
        const result = await carintrioOrdersCollection.insertOne(order);
        res.send(result);
      }
    });

    // get spefic order by route
    app.get("/adduserorder/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const id = req.params.id;
      const query = {};
      console.log(req);

      const cursor = carintrioOrdersCollection.find({ email: email });

      const myorder = await cursor.toArray();

      res.send(myorder);
    });

    // get all orders route

    app.get("/adduserorder", async (req, res) => {
      const query = {};
      const cursor = carintrioOrdersCollection.find();

      const order = await cursor.toArray();

      res.send(order);
    });

    // get orders route

    // app.get();

    // update user order
    app.put("/adduserorder/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const order = req.body;

      const result = await carintrioOrdersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: order }
      );

      res.send(result);
    });

    // delete order route by id

    app.delete("/deleteorder/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const result = await carintrioOrdersCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    // set payment info

    app.post("/payment", verifyJWT, async (req, res) => {
      const payment = req.body;

      const Jwttokeninfo = req.headers.authorization;
      const [email, accessToken] = Jwttokeninfo.split(" ");

      console.log(Jwttokeninfo);
      // console.log(orderInfo);
      console.log(email);
      const decoded = verifyJwtToken(
        accessToken,
        process.env.NODE_ACCESS_JWT_TOKEN_SECRET
      );
      console.log(decoded.email);

      console.log(decoded.email);

      if (decoded.email) {
        const result = await carintrioPaymentsCollection.insertOne(payment);
        res.send(result);
      }
    });

    // get spefic order by route
    app.get("/payment/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const id = req.params.id;
      const query = {};
      console.log(req);

      const cursor = carintrioPaymentsCollection.find({ email: email });

      const payment = await cursor.toArray();

      res.send(payment);
    });

    //get all payments route
    app.get("/payment", verifyJWT, async (req, res) => {
      const query = {};
      const cursor = carintrioPaymentsCollection.find(query);

      const payment = await cursor.toArray();

      res.send(payment);
    });

    // update payment info
    app.put("/payment/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const payment = req.body;

      const result = await carintrioPaymentsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: payment }
      );

      res.send(result);
    });
  } finally {
    //
  }
};

// alternative jwttoken

const verifyJwtToken = (token) => {
  let email;

  jwt.verify(
    token,
    process.env.NODE_ACCESS_JWT_TOKEN_SECRET,
    function (err, decoded) {
      if (err) {
        email = "invalid";
      }

      if (decoded) {
        console.log(decoded);
        email = decoded;
      }
    }
  );
  return email;
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello From carintrio server!");
});

app.listen(port, () => {
  console.log(`carintrio-server listening on port ${port}`);
});
