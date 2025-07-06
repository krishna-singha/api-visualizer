import { Router } from "express";
import { addRequestLogs, fetchRequestLogs, clearRequestLogs } from "../controllers/requestLogsController";

const requestLogsRouter = Router();

requestLogsRouter.get('/get/:uid', fetchRequestLogs);
requestLogsRouter.post('/add', addRequestLogs);
requestLogsRouter.delete('/clear/:uid', clearRequestLogs);

export default requestLogsRouter;