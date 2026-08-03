import express from "express";
import router from "./routes/genres.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Hello World"));

app.use("/api/genres", router);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`),
);
