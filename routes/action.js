import express from 'express'
import {AddConnector,getZabbix,getKibana,Cusservice,DeletePost,SendEmail,AwsCost,AwsServiceCost,AwsS3,AwsEc2,getAWS,getAzure} from '../controllers/action.js'
import auth from '../middleware/auth.js'
const router = express.Router();

router.post('/connector',auth,AddConnector)
router.post('/deletepost',auth,DeletePost)
// router.post('/authzab',postAuth)
router.get('/zabbix',auth,getZabbix)
router.get('/kibana',auth,getKibana)
router.get('/aws',auth,getAWS)
router.post('/cusservice',auth,Cusservice)
router.get('/azure',auth,getAzure)
router.post('/email',auth,SendEmail)
router.post('/awss3',auth,AwsS3)
router.post('/awsec2',auth,AwsEc2)
router.post('/awsservicecost',auth,AwsServiceCost)
router.post('/awscost',auth,AwsCost)


export default router