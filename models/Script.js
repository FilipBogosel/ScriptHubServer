import mongoose from "mongoose";
// Define available categories for scripts, make sure they match the frontend in ScriptHub app
const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'file-management', label: 'File Management' },
    { value: 'media', label: 'Media' },
    { value: 'backup', label: 'Backup' },
    { value: 'automation', label: 'Automation' },
    { value: 'development', label: 'Development' }
];

// Schema for script parameters(used in the Script schema)
const parameterSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['file', 'folder', 'text', 'number'] },
    placeholder: { type: String, required: false },
    required: { type: Boolean, default: true }
});

// Schema for scripts in the database, to ensure data integrity and consistency
const scriptsSchema = new mongoose.Schema(
    {
        "name": { type: String, required: true, unique: true, minLength: 3, maxLength: 100, trim: true },
        "description": { type: String, required: true, minLength: 10, maxLength: 100, trim: true },
        "longDescription": { type: String, required: true, minLength: 20, maxLength: 10000, trim: true },
        "version": { type: String, required: false, trim: true, default: "1.0.0" },
        "category": { type: String, required: true, trim: true, enum: categories.map(cat => cat.value) },
        "type": { type: String, required: false, trim: true, enum: ['my', 'community'], default: 'community' },
        "author": { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        "tags": { type: [String], required: false, default: [] },
        "parameters": { type: [parameterSchema], required: true, default: [] },
        "outputExtension": { type: String, required: false, trim: true, default: 'none' },
        "executable": { type: String, required: true, trim: true, minLength: 3, maxLength: 100 },
        "fileKeys": [{
            type:String,
            required:true
        }]
    },
    { timestamps: true }
);

export default mongoose.model('Script', scriptsSchema);