// src/config/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config'; // Make sure dotenv is configured

const connectCloudinary = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });

        // These logs are the most important part for debugging
        console.log("--- Cloudinary Config Check ---");
        console.log("Cloud Name:", process.env.CLOUDINARY_NAME ? "Loaded Successfully" : "MISSING or wrong name in .env!");
        console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Loaded Successfully" : "MISSING or wrong name in .env!");
        console.log("API Secret:", process.env.CLOUDINARY_SECRET_KEY ? "Loaded Successfully" : "MISSING or wrong name in .env!");
        console.log("-------------------------------");

    } catch (error) {
        console.error("Error configuring Cloudinary:", error);
    }
}

export default connectCloudinary;