import dotenv from 'dotenv';
import axios from 'axios'

// https://10.201.236.123/api/v2/cmdb/firewall/address?access_token=5kg7h3hpyy3dn5m47gsndgHgqNQpky

dotenv.config();
export const GetFirewall = async(req,res) => {

	const data = req.body;


	try{
        const fortigateApiUrl = process.env.FORTIGATE_API_URL;
        const apiToken = process.env.FORTIGATE_API_TOKEN;
  
   
  
		
	}
	catch(error)
	{
		console.log(error)
		res.status(500).json({message:'Something went wrong'})
	}
}


export const GetChatResponse = async(req,res) => {

	const { question } = req.body;


	try{
    const response = await axios.get(`https://chatresponse77.azurewebsites.net/api/response_trigger_77?message="${encodeURIComponent(question)}"`);
    // Ensure the response is in the expected format
    if (typeof response.data === 'string') {
      res.json({ answer: { role: "bot", content: response.data } });
      console.log(response.data);
    } else {
      res.json(response.data);
    }
    
		
	}
	catch(error)
	{
		console.error('Error:', error);
    res.status(500).json({ error: error.message });
	}
}