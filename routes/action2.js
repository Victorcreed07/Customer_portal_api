import express from 'express'
import {UploadDoc,getDoc,AzureVM,AzureMetric,AzureRsg,AzureCost,Azurelistvm} from '../controllers/action2.js'
import auth from '../middleware/auth.js'
const router = express.Router();

router.post('/upload',auth,UploadDoc)
router.get('/getDoc',auth,getDoc)
router.post('/azurevm',auth,AzureVM)
router.post('/azuremetric',AzureMetric)
router.post('/azurersg',AzureRsg)
router.post('/azurelistvm',Azurelistvm)
router.post('/azurecost',AzureCost)


export default router