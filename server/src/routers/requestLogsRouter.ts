import { Router } from "express";
import { addRequestLogs, fetchRequestLogs } from "../controllers/requestLogsController";

const requestLogsRouter = Router();

requestLogsRouter.get('/get/:uid', fetchRequestLogs);
requestLogsRouter.post('/add', addRequestLogs);

export default requestLogsRouter;