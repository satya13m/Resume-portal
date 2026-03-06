const express = require("express");
const cookieParser = require("cookie-parser");

/**require all the routes */
const authRouter = require("../src/routes/auth.routes")

const app = express();

app.use(express.json());
app.use(cookieParser());

/**using all the routes here */
app.use('/api/auth',authRouter)

module.exports = app;