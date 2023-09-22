import dotenv from 'dotenv';
import axios from 'axios'



dotenv.config();
export const GetFirewall = async(req,res) => {

	const data = req.body;


	try{
        const fortigateApiUrl = process.env.FORTIGATE_API_URL;
        const apiToken = process.env.FORTIGATE_API_TOKEN;
  
    //     const axiosConfig = {
    //       headers: {
    //           'Authorization': `Bearer ${apiToken}`
    //       }
    //   };
      
      // Make a GET request to the FortiGate API
    //   axios.get(`${fortigateApiUrl}/cmdb/vpn.ipsec/phase1/?access_token=${apiToken}`)
    //     .then(response => {
    //         console.log('API Response:', response.data);
    //         return res.status(200).json(response.data)
    //     })
    //     .catch(error => {
    //         console.error('API Error:', error);
    //         res.status(500).json({message:'Something went wrong'})
    //     });
  
		
	}
	catch(error)
	{
		console.log(error)
		res.status(500).json({message:'Something went wrong'})
	}
}