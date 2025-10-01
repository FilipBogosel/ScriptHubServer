import mongoose from "mongoose";
// Define available categories for scripts, make sure they match the frontend in ScriptHub app
categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'file-management', label: 'File Management' },
    { value: 'media', label: 'Media' },
    { value: 'internet-web', label: 'Internet & Web' },
    { value: 'automation', label: 'Automation Utilities' },
    { value: 'development', label: 'Development' },
    { value: 'security', label: 'Security & Privacy' },
    { value: 'productivity-documents', label: 'Productivity & Documents' },
];  

// Schema for script parameters(used in the Script schema)
const parameterSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['file', 'folder', 'text', 'number'] },
    placeholder: { type: String, required: false },
    required: { type: Boolean, default: true },
    defaultValue: { type: String, required: false },
    description: { type: String, required: false, trim: true },
    options: { type: [String], required: false } // For dropdowns or multiple choice
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
        "author": { type: String, required: true, trim: true, minLength: 3, maxLength: 30 },
        "tags": { type: [String], required: false, default: [] },
        "parameters": { type: [parameterSchema], required: true, default: [] },
        "outputExtension": { type: String, required: false, trim: true, default: 'none' },
        "executable": { type: String, required: true, trim: true, minLength: 3, maxLength: 100 },
        "fileKeys": [{
            type:String,
            required:true
        }],
        "downloads": { type: Number, required: false, default: 0 },
        "rating": { type: Number, required: false, default: 0 },
        "ratingCount": { type: Number, required: false, default: 0 },

    },
    { timestamps: true }
);

export default mongoose.model('Script', scriptsSchema);