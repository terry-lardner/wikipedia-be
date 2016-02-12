var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Define schema
var articlecollectionSchema = new Schema({
	title: String,
	content: String,
	contentFeat: String,
	featured: Boolean, 
	imageUrl: String
});

//Set collection
articlecollectionSchema.set('collection','articlecollection');

//Set model & export
module.exports =  mongoose.model('articlecollection', articlecollectionSchema);

