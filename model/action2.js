import mongoose from 'mongoose';

const postSchema = mongoose.Schema({

	name:String,
	tags:[String],
	document:String,
	creator:String,
	createdAt:{
		type:Date,
		default:new Date()
	}
})

const Action2Model = mongoose.model('Action2Model',postSchema)

export default Action2Model

