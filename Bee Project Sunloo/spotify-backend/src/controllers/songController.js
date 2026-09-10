import { v2 as cloudinary } from 'cloudinary';
import songModel from '../models/songModel.js';

// Add a new song
const addSong = async (req, res) => {
    try {
        const name = req.body.name;
        const desc= req.body.desc;
        const album= req.body.album;
        const audioFile = req.files.audio[0];
        const imageFile = req.files.image[0];
        const lyrics = typeof req.body.lyrics === 'string' ? req.body.lyrics.trim() : "";

        // Check for duplicate song (same name and album by the same user) - case insensitive
        const trimmedName = name.trim();
        const trimmedAlbum = album.trim();
        
        // Escape special regex characters
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        const existingSong = await songModel.findOne({ 
            $and: [
                { name: { $regex: new RegExp(`^${escapeRegex(trimmedName)}$`, 'i') } },
                { album: { $regex: new RegExp(`^${escapeRegex(trimmedAlbum)}$`, 'i') } },
                { userId: req.user._id }
            ]
        });

        if (existingSong) {
            return res.status(409).json({ 
                success: false, 
                message: `A song with the name "${name}" in album "${album}" already exists in your uploads.` 
            });
        }

        const audioUpload = await cloudinary.uploader.upload(audioFile.path, { resource_type: "video" });
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

        // Also check if the same audio file URL already exists (prevent re-uploading same file)
        const existingFile = await songModel.findOne({ 
            file: audioUpload.secure_url 
        });

        if (existingFile) {
            // Clean up the uploaded files since it's a duplicate
            try {
                await cloudinary.uploader.destroy(audioUpload.public_id, { resource_type: 'video' });
                await cloudinary.uploader.destroy(imageUpload.public_id, { resource_type: 'image' });
            } catch (cleanupError) {
                console.error('Error cleaning up duplicate upload:', cleanupError);
            }
            
            return res.status(409).json({ 
                success: false, 
                message: "This audio file has already been uploaded. Please use a different file." 
            });
        }

        const duration = `${Math.floor(audioUpload.duration / 60)}:${Math.floor(audioUpload.duration % 60).toString().padStart(2, '0')}`;

        const songData = {
            name: name.trim(),
            desc: desc.trim(),
            album: album.trim(),
            image: imageUpload.secure_url,
            file: audioUpload.secure_url,
            duration,
            userId: req.user._id,  // Now required since we use authenticate middleware
            lyrics
        };

        const song = new songModel(songData);
        await song.save();

        const responsePayload = song.toObject({ versionKey: false });
        responsePayload.id = song._id.toString();
        responsePayload.userId = responsePayload.userId?.toString?.() || responsePayload.userId;

        // Broadcast the new song to all connected clients via WebSocket
        const io = req.app?.get?.('io');
        if (io) {
            io.emit('song:new', {
                ...responsePayload,
                uploadedBy: {
                    id: req.user._id.toString(),
                    name: req.user.name
                }
            });
        }

        res.status(201).json({ success: true, message: "Song added successfully!", song: responsePayload });

    } catch (error) {
        console.error("Error in addSong controller:", error);
        res.status(500).json({ success: false, message: "Error adding song. Please try again." });
    }
}

// List all songs
const listSong = async (req, res) => {
    try {
        const allSongs = await songModel.find({});
        res.json({ success: true, songs: allSongs });
    } catch (error) {
        console.error("Error in listSong controller:", error);
        res.status(500).json({ success: false, message: "Error fetching songs." });
    }
}

// Remove a song
const removeSong = async (req, res) => {
    try {
        const songId = req.body.id;

        if (!songId) {
            return res.status(400).json({ success: false, message: "Song ID is required" });
        }

        const song = await songModel.findById(songId);
        if (!song) {
            return res.status(404).json({ success: false, message: "Song not found" });
        }

        // Check if user is authenticated and owns the song
        if (req.user && song.userId && song.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only delete your own songs" });
        }

        // Delete from Cloudinary
        try {
            const imagePublicId = song.image.split('/').pop().split('.')[0];
            const audioPublicId = song.file.split('/').pop().split('.')[0];
            
            await cloudinary.uploader.destroy(imagePublicId, { resource_type: 'image' });
            await cloudinary.uploader.destroy(audioPublicId, { resource_type: 'video' });
        } catch (cloudinaryError) {
            console.error('Error deleting from Cloudinary:', cloudinaryError);
            // Continue with database deletion even if Cloudinary fails
        }

        await songModel.findByIdAndDelete(songId);

        res.json({ success: true, message: "Song deleted successfully" });

    } catch (error) {
        console.error("Error in removeSong controller:", error);
        res.status(500).json({ success: false, message: "An error occurred while deleting the song" });
    }
}

// Find and list duplicate songs for a user
const findDuplicates = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const userSongs = await songModel.find({ userId: req.user._id });
        
        // Group songs by name and album (case-insensitive)
        const grouped = {};
        userSongs.forEach(song => {
            const key = `${song.name.toLowerCase().trim()}_${song.album.toLowerCase().trim()}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(song);
        });

        // Find duplicates (groups with more than 1 song)
        const duplicates = [];
        Object.keys(grouped).forEach(key => {
            if (grouped[key].length > 1) {
                duplicates.push({
                    name: grouped[key][0].name,
                    album: grouped[key][0].album,
                    count: grouped[key].length,
                    songs: grouped[key].map(s => ({
                        _id: s._id,
                        name: s.name,
                        album: s.album,
                        createdAt: s.createdAt
                    }))
                });
            }
        });

        res.json({ 
            success: true, 
            duplicates: duplicates,
            totalDuplicates: duplicates.reduce((sum, dup) => sum + dup.count - 1, 0)
        });

    } catch (error) {
        console.error("Error in findDuplicates controller:", error);
        res.status(500).json({ success: false, message: "Error finding duplicates" });
    }
}

// Get user's uploaded songs
const getUserSongs = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }
        
        const userId = req.user._id;
        
        // Debug: Check all songs and their userIds
        const allSongs = await songModel.find({});
        console.log(`Total songs in database: ${allSongs.length}`);
        console.log(`Looking for songs with userId: ${userId}`);
        allSongs.forEach((song, index) => {
            console.log(`Song ${index + 1}: name="${song.name}", userId=${song.userId}, userId type=${typeof song.userId}`);
        });
        
        // Find songs where userId matches
        const userSongs = await songModel.find({ userId: userId });
        
        console.log(`Found ${userSongs.length} songs for user ${userId}`);
        res.json({ success: true, songs: userSongs });
    } catch (error) {
        console.error("Error in getUserSongs controller:", error);
        res.status(500).json({ success: false, message: "Error fetching user songs." });
    }
}

const getSongLyrics = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: "Song ID is required" });
        }

        const song = await songModel.findById(id).select('lyrics name updatedAt');
        if (!song) {
            return res.status(404).json({ success: false, message: "Song not found" });
        }

        return res.json({
            success: true,
            lyrics: song.lyrics || "",
            name: song.name,
            updatedAt: song.updatedAt
        });
    } catch (error) {
        console.error("Error in getSongLyrics controller:", error);
        res.status(500).json({ success: false, message: "Error fetching lyrics." });
    }
}

const updateSongLyrics = async (req, res) => {
    try {
        const { id } = req.params;
        const { lyrics } = req.body || {};

        if (!id) {
            return res.status(400).json({ success: false, message: "Song ID is required" });
        }

        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required" });
        }

        const song = await songModel.findById(id);
        if (!song) {
            return res.status(404).json({ success: false, message: "Song not found" });
        }

        if (song.userId && song.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "You can only edit lyrics for your own songs" });
        }

        const sanitizedLyrics = typeof lyrics === 'string' ? lyrics.trim() : "";
        song.lyrics = sanitizedLyrics;
        await song.save();

        return res.json({
            success: true,
            message: "Lyrics updated successfully",
            lyrics: song.lyrics
        });
    } catch (error) {
        console.error("Error in updateSongLyrics controller:", error);
        res.status(500).json({ success: false, message: "Error updating lyrics." });
    }
}

export { addSong, listSong, removeSong, getUserSongs, findDuplicates, getSongLyrics, updateSongLyrics };