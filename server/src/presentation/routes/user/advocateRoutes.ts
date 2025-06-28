import Express, { Request, Response } from "express";
import { AdvocateController } from "../../controllers/admin/advocateController";


const router = Express.Router()

const advocateController = new AdvocateController()

router.get('/getAdvocates', (req:Request, res: Response) => {
    advocateController.getUserAdvocates(req, res)
})

export default router