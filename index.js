import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import userroute from './routes/users.js'
import actionroute from './routes/action.js'
import action2route from './routes/action2.js'
import actionzabbix from './routes/actionzabbix.js'
import action3route from './routes/action3.js'
import TanmaiahReport from './ZabbixSLA/TanmaiahReport.js';
import MaadaniyahReport from './ZabbixSLA/MaadaniyahReport.js';
import RomanaReport from './ZabbixSLA/RomanaReport.js';
import AraReport from './ZabbixSLA/AraReport.js';
import axios from 'axios';
import localtunnel from 'localtunnel';



// import postroute from './routes/post.js'
// import userroute from './routes/user.js'

const app = express();
dotenv.config();
app.use(bodyParser.json({ limit:'30mb',extended:'true' }))
app.use(bodyParser.urlencoded({ limit:'30mb',extended:'true' }))
app.use(cors())


app.post('/api/sla', async(req, res) => {

	try {
	  // Access the data sent in the request body
	  const requestData = req.body;
	//   console.log(requestData.customer)

	  let result;
  
	  if(requestData.customer === 'ROMANA'){
		
		//Get ROMANA related sla data
		result = await RomanaReport()
		console.log("inside index",result)
	  }
	  else if(requestData.customer ==='MAADHANIYAH') {
		  //Get MAADHANIYAH related sla data 
		  result = await MaadaniyahReport()
		  console.log("inside index",result)
	  }
	  else if(requestData.customer ==='ARA'){
		
		  //Get ARA related sla data
		  result = await AraReport()
			console.log("inside index",result)

	  }
	  else{
		  //Get SPF related sla data
		  result = await TanmaiahReport()
		  console.log("inside index",result)
	  }
  
	
	  res.status(200).json(result);
	} catch (error) {
	  console.error('Error handling POST request:', error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });


  app.post('/api/comment', async(req, res) => {

	try {
	  // Access the data sent in the request body
	  const requestData = req.body;
	  console.log(requestData)

	  let result;
	
	  axios.post("https://prod-17.centralindia.logic.azure.com:443/workflows/c6534d6af0ac46408963e702777f1b74/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=tFKsFm0u6-Q-71QM2xuCJIHzedx4i--oTFyEbVaTtpM",requestData)
	  .then(function (response) {
		console.log('comment-response',response.body)
	})
	  
  
	
	  res.status(200).json(result);
	} catch (error) {
	  console.error('Error handling POST request:', error);
	  res.status(500).json({ error: 'Internal server error' });
	}
  });




// app.use('/post',postroute)
app.use('/user',userroute)
app.use('/action',actionroute)
app.use('/action2',action2route)
app.use('/actionzabbix',actionzabbix)
app.use('/action3',action3route)



// const port = 5000;

 

// mongoose.connect(process.env.CONNECTION_URL, {
// useNewUrlParser: true,
// useUnifiedTopology: true,

//   }).then(() => console.log('Connected to MongoDB Atlas'))
// .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

//  app.listen(port, async () => {
// console.log(`Server is running on http://localhost:${port}`);
// const tunnel = await localtunnel({ port: 5000 });
// console.log('Tunnel URL:', tunnel.url);

//    tunnel.on('close', () => {

//       console.log('Tunnel has been closed');

//     });

//  });

const port = 5000;

mongoose.connect(process.env.CONNECTION_URL, {
  useNewUrlParser: true, // just to avoid some warnings, no big deal
  useUnifiedTopology: true
}).then(() => app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  // const tunnel = await localtunnel({ port: 5000 });
  // console.log('Tunnel URL:', tunnel.url);
  
  // tunnel.on('close', () => {
  //   console.log('Tunnel has been closed');
  // });

})).catch((e) => console.log(e));


