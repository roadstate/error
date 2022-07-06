import express from "express";
import { watch, getEdit, deleteVideo, getUpload, postEdit, postUpload } from "../controllers/videoController";
const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.get("/:id([0-9a-f]{24})/edit", getEdit);
videoRouter.post("/:id([0-9a-f]{24})/edit", postEdit);
videoRouter.get("/:id([0-9a-f]{24})/delete", deleteVideo);
videoRouter.get("/upload", getUpload);
videoRouter.post("/upload",postUpload);
export default videoRouter;