import mongoose from "mongoose";

const albumSchema = new mongoose.Schema({
  name: {type:String, required:true},
  desc: {type:String, required:true},
  bgColour: {type:String, required:true},
  image:{type:String, required:true},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null}

}, { timestamps: true })

const albumModel= mongoose.models.album || mongoose.model("album", albumSchema);

export default albumModel;
