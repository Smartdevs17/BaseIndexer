import { Router } from "express";
import { runCommand } from "../controllers/aicontroller";
const aiRouter = Router();


aiRouter.post("/run", runCommand as any);

export default aiRouter;
