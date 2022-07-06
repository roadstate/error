import express from "express";
import { edit, remove, see, logout, startGithubLogin, finishGithubLogin, startKakaoLogin, finishKakaoLogin } from "../controllers/userController";
const userRouter = express.Router();

userRouter.get("/edit", edit);
userRouter.get("/remove", remove);
userRouter.get("/logout", logout);
userRouter.get("/:id", see);
userRouter.get("/github/start", startGithubLogin)
userRouter.get("/github/finish", finishGithubLogin)
userRouter.get("/kakao/start", startKakaoLogin)
userRouter.get("/kakao/finish", finishKakaoLogin)
export default userRouter;