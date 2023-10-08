import express from 'express'
import {GetFirewall,GetChatResponse} from '../controllers/action3.js'
import auth from '../middleware/auth.js'
const router = express.Router();


router.get('/getfirewall',auth,GetFirewall)
router.post('/ask',auth,GetChatResponse)



export default router