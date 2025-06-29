import { Router } from "express";
import { fetchApiKey, addApiKeyToDB, updateApiKey } from "../controllers/apiKeyController"

const apiKeyRouter = Router();

apiKeyRouter.get('/get/:uid', fetchApiKey);
apiKeyRouter.post('/add', addApiKeyToDB);
apiKeyRouter.put('/update', updateApiKey);

export default apiKeyRouter;