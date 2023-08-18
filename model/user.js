import mongoose from 'mongoose';

const userSchema = mongoose.Schema({


	name:{type:String,required:true},
	access:{type:String,required:true},
	password:{type:String,required:true},
	host:{type:Array},
	id:String
})

const UserModel = mongoose.model('USER',userSchema)

export default UserModel

