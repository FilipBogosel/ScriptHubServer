import mongoose from "mongoose"

// Schema for users in the database, to ensure data integrity and consistency
const userSchema = new mongoose.Schema({
    "provider":{ type: String, required: true, trim: true, enum: ['apple', 'google', 'github', 'facebook', 'linkedin'], default: 'google' },
    "providerId": { type: String, required: true, trim: true },
    "username": { type: String, required: true, unique: true, minLength: 3, maxLength: 30, trim: true },
    "email": { type: String, required: true, unique: true, trim: true },
    "_id":{type:String, required: false}
});
userSchema.index({ provider: 1, providerId: 1 }, { unique: true });

export default mongoose.model('User', userSchema);