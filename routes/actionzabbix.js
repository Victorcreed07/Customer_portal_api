import express from 'express'
import {Authenticate,GetHosts,GetCharts,GetItems} from '../controllers/actionzabbix.js'
import auth from '../middleware/auth.js'
const router = express.Router();

router.post('/zabbixauth',auth,Authenticate)
router.post('/zabbixhosts',auth,GetHosts)

router.post('/zabbixcharts',auth,GetCharts)
router.post('/zabbixitems',auth,GetItems)
// router.post('/authzab',postAuth)

export default router