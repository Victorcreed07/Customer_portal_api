import axios from 'axios'
import https from 'https'

export const Authenticate = async(req,res) => {

const data = req.body;


	try{
		const agent = new https.Agent({
  rejectUnauthorized: false
});

axios.defaults.httpsAgent = agent;

	axios.post(data.url+'/api_jsonrpc.php',data.content,{header:data.header})
      .then(function (response) {
      	res.status(200).json({result:response.data})
      	// console.log(response.data)
      
      })
      .catch(function (error) {
      	res.status(409).json({message:error})
        console.log(error)
      });

	}
	catch(err)
	{

	}
}

export const GetHosts = async(req,res) => {

const data = req.body;


	try{

		console.log(data)
		const agent = new https.Agent({
  rejectUnauthorized: false
});

axios.defaults.httpsAgent = agent;

	axios.post(data.url+'/api_jsonrpc.php',data.content,{header:data.header})
      .then(function (response) {
      	res.status(200).json({result:response.data})
      	// console.log(response.data)
      
      })
      .catch(function (error) {
      	res.status(409).json({message:error})
        console.log(error)
      });

	}
	catch(err)
	{
			console.log(err)
	}
}




export const GetCharts = async(req,res) => {

const data = req.body;


	try{

		console.log(data)
		const agent = new https.Agent({
  rejectUnauthorized: false
});

axios.defaults.httpsAgent = agent;

	axios.post(data.url+'/api_jsonrpc.php',data.content,{header:data.header})
      .then(function (response) {
      	res.status(200).json({result:response.data})
      	// console.log(response.data)
      
      })
      .catch(function (error) {
      	res.status(409).json({message:error})
        console.log(error)
      });

	}
	catch(err)
	{

	}
}

export const GetItems = async(req,res) => {

const data = req.body;


	try{

		console.log(data)
		const agent = new https.Agent({
  rejectUnauthorized: false
});

axios.defaults.httpsAgent = agent;

	axios.post(data.url+'/api_jsonrpc.php',data.content,{header:data.header})
      .then(function (response) {
      	res.status(200).json({result:response.data})
      	// console.log(response.data)
      
      })
      .catch(function (error) {
      	res.status(409).json({message:error})
        console.log(error)
      });

	}
	catch(err)
	{

	}
}

