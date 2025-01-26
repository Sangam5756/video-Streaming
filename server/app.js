import express from "express";
import videoRouter from "./routes/video";

const app = express();

app.use("/", videoRouter);



app.listen(3000, () => {
  console.log("server is listening on 3000");
});
