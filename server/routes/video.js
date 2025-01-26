import express from "express";
import {
  liveVideoStreamController,
  staticVideoController,
} from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.get("/live/video", liveVideoStreamController);
videoRouter.get("/video", staticVideoController);

export default videoRouter;
