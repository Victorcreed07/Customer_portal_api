import express from 'express'
import {GetFirewall} from '../controllers/action3.js'
import auth from '../middleware/auth.js'
const router = express.Router();


router.get('/getfirewall',auth,GetFirewall)



export default router