import jwt from 'jsonwebtoken';


const auth = (req,res,next) => {

try
{
	
	const token = req.headers.authorization.split(' ')[1];
	const CustomAuth = token.length < 500 //greater than 500 then t is google else it is manual
	let decodedData

	if(token && CustomAuth)
		{
			decodedData = jwt.verify(token,'coin')
			
			req.userid = decodedData?.id;
		}
		else
			{
				decodedData = jwt.decode(token)
				
				console.log(decodedData)
				req.userid = decodedData?.sub
			}
	next()
}
catch(error)
{
	console.log(error)
}

}

export default auth