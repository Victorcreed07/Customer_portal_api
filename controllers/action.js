import PostModel from '../model/action.js'

import mongoose from 'mongoose'
import axios from 'axios'
import nodemailer from 'nodemailer'
import AWS from 'aws-sdk';


export const AddConnector = async(req,res) => {

	const data = req.body;
const modeldata = new PostModel({...data,creator:req.userid,createdAt: new Date().toISOString()})

	try{
		await modeldata.save()
		return res.status(200).json({message:'Data successfully posted'})
	}
	catch(error)
	{
		console.log(error)
		res.status(500).json({message:'Something went wrong'})
	}
}


export const DeletePost = async (req,res) => {

	const {id} = req.body
// if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id');
	console.log(id)
	await PostModel.findByIdAndRemove(id);

	res.json({message:`${id} successfully deleted`})

}



export const getZabbix = async (req,res) => {

	

	try{
		// if(!mongoose.Types.ObjectId.isValid(id)) return res.status(405).send('No postss with that id');
		const data = await PostModel.find({creator:req.userid,connector:'Zabbix'})

		res.status(200).json(data)
	}
	catch(error)
	{
		res.status(409).json({message:error})
	}
}

export const getAWS = async (req,res) => {

	

	try{
		// if(!mongoose.Types.ObjectId.isValid(id)) return res.status(405).send('No postss with that id');
		const data = await PostModel.find({creator:req.userid,connector:'AWS'})

		res.status(200).json(data)
	}
	catch(error)
	{
		res.status(409).json({message:error})
	}
}


export const Cusservice = async (req,res) => {

	

	try{

		const data = req.body
		let val;
		if(data.name === 'Service')
		{
			val = await PostModel.find({creator:req.userid,connector:data.val})
		}
		else
		{
			val = await PostModel.find({creator:req.userid,account:data.val})
		}
		// if(!mongoose.Types.ObjectId.isValid(id)) return res.status(405).send('No postss with that id');
		

		res.status(200).json(val)
	}
	catch(error)
	{
		res.status(409).json({message:error})
	}
}



export const getAzure = async (req,res) => {

	

	try{
		// if(!mongoose.Types.ObjectId.isValid(id)) return res.status(405).send('No postss with that id');
		const data = await PostModel.find({creator:req.userid,connector:'Azure'})

		res.status(200).json(data)
	}
	catch(error)
	{
		res.status(409).json({message:error})
	}
}


export const getKibana = async (req,res) => {

	

	try{
		// if(!mongoose.Types.ObjectId.isValid(id)) return res.status(405).send('No postss with that id');
		const data = await PostModel.find({creator:req.userid,connector:'Kibana'})

		res.status(200).json(data)
	}
	catch(error)
	{
		res.status(409).json({message:error})
	}
}

export const SendEmail = async(req,res) => {

const data = req.body;

	try{

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user:'geoffrick7@outlook.com',
    pass:'victor0707creed'
  }
});

// let transporter = nodemailer.createTransport({
//     host: 'smtp.office365.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: 'geoffrick7@outlook.com',
//         pass: 'victor0707creed'
//     },
//     tls: {
//         ciphers:'SSLv3'
//     }
// });



const mailOptions = {
  from:'geoffrick7@outlook.com',
  to:'ggeorgegeoffrick@kaartech.com',
  subject: 'Bot Message',
  text: `Our Client ${data.name} with id ${data.id} has sent the following query "${data.emailbody}"`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
    res.status(409).json({message:error})
  } else {
    console.log('Email sent: ' + info.response);
    res.status(200).json(info)
  }
});



	}
	catch(error)
	{
		res.status(409).json({message:error})
	}
}



export const AwsS3 = async(req,res) => {

	const data = req.body


	try{


			AWS.config.update({
			  accessKeyId: data.accesskey,
			  secretAccessKey: data.secret,
			  region: data.region
			});

			const s3 = new AWS.S3();

		s3.listBuckets(function(err, data) {
  if (err) {
    console.log("Error", err);
    res.status(409).json({message:err})
  } else {
    const buckets = data.Buckets;
    const bucketList = [];
    buckets.forEach(bucket => {
      s3.listObjects({ Bucket: bucket.Name }, function(err, data) {
        if (err) {
        	res.status(409).json({message:err})
          console.log("Error", err);
        } else {
          const bucketContents = data.Contents.map(obj => ({
            key: obj.Key,
            size: obj.Size,
            lastModified: obj.LastModified,
          }));
          bucketList.push({
            name: bucket.Name,
            creation:bucket.CreationDate,
            contents: bucketContents,
          });
          
          const newbucketlist = bucketList.map((i) => {

          	const data2 = [];

          		if(i.contents)
          	{

							 const data = i.contents      		

							for (let i = 0; i < data.length; i++) {
							  const path = data[i].key.split('/');
							  let current = data2;
							  
							  for (let j = 0; j < path.length; j++) {
							    const key = path[j];
							    
							    if (key !== '') {
							      let temp = current.find(item => item.key === key);
							      
							      if (!temp) {
							        temp = { key, size: 0, contents: [] };
							        current.push(temp);
							      }
							      
							      current = temp.contents;
							      
							      if (j === path.length - 1) {
							        temp.size = data[i].size;
							      }
							    }
							  }
							}

							
          		return {...i,contents:data2}
          	}
          	
          })

          console.log(JSON.stringify(newbucketlist,null,2))


          if (bucketList.length === buckets.length) {
          	// console.log(JSON.stringify(bucketList,null,2))
          	 res.status(200).json({bucket:bucketList,newbucketlist:newbucketlist})
           
          }
        }
      });
    });
  }
});



	}

	catch(error)
	{
		res.status(409).json({message:error})
	}
}


export const AwsEc2 = async(req,res) => {

const data = req.body

try{

AWS.config.update({
			  accessKeyId: data.accesskey,
			  secretAccessKey: data.secret,
			  region: data.region
			});

const ec2 = new AWS.EC2();

// Call the describeInstances method to retrieve all EC2 instances
ec2.describeInstances({}, (err, data) => {
  if (err) {
    console.log('Error:', err);
  } else {
  	
  	res.status(200).json(data)
    console.log(data.Reservations[1].Instances);
  }
});

}

catch(err)
{

res.status(409).json({message:err})

}

	}

export const AwsCost = async(req,res) => {

const data = req.body

try{

AWS.config.update({
			  accessKeyId: data.awscred.accesskey,
			  secretAccessKey: data.awscred.secret,
			  region: data.awscred.region
			});

const costExplorer = new AWS.CostExplorer();






// Call the describeInstances method to retrieve all EC2 instances
const params = {
  TimePeriod: {
    Start: data.date1,
    End: data.date2
  },
  Granularity: 'DAILY',
  Metrics: ['BlendedCost']
};

costExplorer.getCostAndUsage(params, (err, data) => {
  if (err) {
    console.log('Error retrieving Cost Explorer data:', err);
  } else {
  	res.status(200).json(data)
    console.log('Cost Explorer data:', data);
  }
});



}

catch(err)
{

res.status(409).json({message:err})

}

	}

export const AwsServiceCost = async(req,res) => {

const data = req.body

try{

AWS.config.update({
			  accessKeyId: data.awscred.accesskey,
			  secretAccessKey: data.awscred.secret,
			  region: data.awscred.region
			});

const costExplorer = new AWS.CostExplorer();






// Call the describeInstances method to retrieve all EC2 instances
const params = {
      TimePeriod: {
        Start: data.date1,
        End: data.date2,
      },
      Granularity: 'DAILY',
      Metrics: ['BlendedCost'],
      GroupBy: [
        {
          Key: 'SERVICE',
          Type: 'DIMENSION',
        },
      ],
    };

      costExplorer.getCostAndUsage(params, (err, data) => {
      if (err) {
        console.log('Error retrieving Cost Explorer data:', err);
        res.status(500).json({ message: 'Error retrieving Cost Explorer data' });
      } else {
        const serviceCosts = [];
        data.ResultsByTime.forEach((result) => {
          const timePeriod = result.TimePeriod.Start;
          result.Groups.forEach((group) => {
            const service = group.Keys[0];
            const cost = group.Metrics.BlendedCost.Amount;
            const currency = group.Metrics.BlendedCost.Unit;
            serviceCosts.push({ timePeriod, service, cost, currency });
          });
        });

        res.status(200).json(serviceCosts);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err.message });
  }
};