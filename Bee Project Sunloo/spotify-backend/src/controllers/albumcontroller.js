import { v2 as cloudinary } from 'cloudinary';
import albumModel from '../models/albumModel.js';

const addAlbum = async (req, res) => {
    try {
        const { name, desc, bgColour } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ success: false, message: "Image file is required." });
        }

        // Check for duplicate album (same name by the same user) - case insensitive
        const trimmedName = name.trim();
        
        // Escape special regex characters
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const existingAlbum = await albumModel.findOne({ 
            name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, 'i') },
            userId: req.user._id
        });

        if (existingAlbum) {
            return res.status(409).json({ 
                success: false, 
                message: `An album with the name "${name}" already exists in your uploads.` 
            });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

        // Also check if the same image file URL already exists
        const existingFile = await albumModel.findOne({ 
            image: imageUpload.secure_url 
        });

        if (existingFile) {
            // Clean up the uploaded file since it's a duplicate
            try {
                await cloudinary.uploader.destroy(imageUpload.public_id, { resource_type: 'image' });
            } catch (cleanupError) {
                console.error('Error cleaning up duplicate upload:', cleanupError);
            }
            
            return res.status(409).json({ 
                success: false, 
                message: "This image file has already been uploaded. Please use a different file." 
            });
        }

        const albumData = {
            name: name.trim(),
            desc: desc.trim(),
            bgColour: bgColour.trim(),
            image: imageUpload.secure_url,
            userId: req.user._id  // Now required since we use authenticate middleware
        };

        const album = new albumModel(albumData);
        await album.save();

        res.status(201).json({ success: true, message: "Album added successfully", album });

    } catch (error) {
        console.error("Error in addAlbum controller:", error);
        res.status(500).json({ success: false, message: "Error adding album" });
    }
}

// Added stubs with proper error handling for your other functions
const listAlbum = async (req, res) => {
    try {
        const allAlbums = await albumModel.find({});
        res.json({ success: true, albums: allAlbums });
    } catch (error) {
        
        res.status(500).json({ success: false, message: "Error fetching albums" });
    }
}

const removeAlbum = async (req, res) => {
    try {
        const albumId = req.body.id;
        if (!albumId) {
            return res.status(400).json({ success: false, message: "Album ID is required" });
        }
        await albumModel.findByIdAndDelete(albumId);
        res.json({ success: true, message: "Album removed" });
    } catch (error) {
        
        res.status(500).json({ success: false, message: "Error removing album" });
    }
}

// Get user's uploaded albums
const getUserAlbums = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        
        const userId = req.user._id;
        
        // Debug: Check all albums and their userIds
        const allAlbums = await albumModel.find({});
        console.log(`Total albums in database: ${allAlbums.length}`);
        console.log(`Looking for albums with userId: ${userId}`);
        allAlbums.forEach((album, index) => {
            console.log(`Album ${index + 1}: name="${album.name}", userId=${album.userId}, userId type=${typeof album.userId}`);
        });
        
        // Find albums where userId matches
        const userAlbums = await albumModel.find({ userId: userId });
        
        console.log(`Found ${userAlbums.length} albums for user ${userId}`);
        res.json({ success: true, albums: userAlbums });
    } catch (error) {
        console.error("Error in getUserAlbums controller:", error);
        res.status(500).json({ success: false, message: "Error fetching user albums." });
    }
}

export { addAlbum, listAlbum, removeAlbum, getUserAlbums };