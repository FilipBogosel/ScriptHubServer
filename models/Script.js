const mongoose = require('mongoose');

const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'file-management', label: 'File Management' },
    { value: 'media', label: 'Media' },
    { value: 'backup', label: 'Backup' },
    { value: 'automation', label: 'Automation' },
    { value: 'development', label: 'Development' }
];


const scriptsSchema = new mongoose.Schema(
    {
        "id": {type: Number, required: true, unique: true},
        "name": {type: String, required: true, unique: true, minLength: 3, maxLength: 100, trim: true},
        "title": {type: String, required: true, unique: true, minLength: 3, maxLength: 100, trim: true},
        "description": {type: String, required: true, minLength: 10, maxLength: 100, trim: true},
        "longDescription": {type: String, required: true, minLength: 20, maxLength: 10000, trim: true},
        "version": {type: String, required: false, trim: true, default: "1.0.0"},
        "category": {type: String, required: true, trim: true, enum: categories.map(cat => cat.value)},
        "isNew": {type: Boolean, required: false, default: true},
        "type": {type: String, required: false, trim: true, enum: ['my', 'community'], default: 'community'},
        "author": {type: String, required: true, trim: true, minLength: 3, maxLength: 50},
        "tags": {type: [String], required: false, default: []},
        "parameters": {type: [Object], required: true, default: []}, 
        "outputFormat": {type: String, required: false, trim: true, enum: ['text', 'file', 'image'], default: 'text'},
        "outputExtension": {type: String, required: false, trim: true, default: 'none'},
        "executable": {type: String, required: true, trim: true, minLength: 3, maxLength: 100},
    }
);

module.exports = mongoose.model('Script', scriptsSchema);