import express from 'express'
import {AddUser,GetUser,SignIn,EditUser,DeleteUser} from '../controllers/users.js'
import auth from '../middleware/auth.js'
const router = express.Router();

router.post('/adduser',auth,AddUser)
router.post('/edituser',auth,EditUser)
router.post('/signin',SignIn)
router.get('/getuser',auth,GetUser)
router.delete('/deleteuser/:id',auth,DeleteUser);

export default router