import mongoose from 'mongoose'
import UserModel from '../model/user.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export const AddUser = async (req,res) => {


	const {name,password,access,host} = req.body;

	try {

		const User = await UserModel.findOne({name:name})
		let result = null;
		if(User)
			return res.status(404).json({message:'User already exist'})
		const hashedpass = await bcrypt.hash(password,12)
		if(host.length > 0)
		{
			 result = await UserModel.create({name:name,password:hashedpass,access:access,host:host})
			console.log(result)
		return res.status(200).json({result})
		}
		else
		{
			 result = await UserModel.create({name:name,password:hashedpass,access:access})
			console.log(result)
		return res.status(200).json({result})
		}
		
		
	}
	catch(error)
	{
		console.log(error)
		res.status(500).json({message:'Something went wrong'})
	}
}

export const EditUser = async (req,res) => {


	const {name,password,access,id} = req.body;

	try {

	console.log(id)
	// if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id');
	if(password !== ' ' || password !== null )
	{
		const hashedpass = await bcrypt.hash(password,12)
		const updatedData1 =  await UserModel.findByIdAndUpdate(id,{name:name,access:access,password:hashedpass},{new:true})
		res.status(200).json(updatedData1)
	}
	else
	{
		const updatedData2 =  await UserModel.findByIdAndUpdate(id,{name:name,access:access},{new:true})
		res.status(200).json(updatedData2)
	}
	
	
	}
	catch(error)
	{
		console.log(error)
		res.status(500).json({message:'Something went wrong'})
	}
}

export const SignIn = async (req,res) => {

const {Username,password} = req.body

try{
		const User = await UserModel.findOne({name:Username})

		if(!User)
			return res.status(404).json({message:'User does not exist'})

		const Pass = await bcrypt.compare(password,User.password)

		if(!Pass)
			return res.status(404).json({message:'Invalid Credentials'})

		const token = jwt.sign({name:User.name,id:User._id},'coin',{expiresIn:'1h'})

		return res.status(200).json({result:User,token})
} 
catch(error)
{
	res.status(500).json({message:'Something went wrong'})
}
}

export const GetUser = async(req,res) => {

	try {

		const Users = await UserModel.find()
		res.status(200).json({data:Users,status:'OK'})

}
catch(error){

	res.status(409).json({message:error})

}
}

export const DeleteUser  = async (req,res) => {

	const {id} = req.params
// if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id');
	console.log(id)
	await UserModel.findByIdAndRemove(id);

	res.json({message:`${id} successfully deleted`})

}