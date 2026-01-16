import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';

const BUCKET_NAME = 'profile';

/**
 * Request permission and pick an image from the device library
 */
export const pickImage = async (): Promise<ImagePicker.ImagePickerResult> => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
        throw new Error('Izin akses galeri ditolak');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Square crop for profile picture
        quality: 0.7, // Compress to reduce file size
    });

    return result;
};

/**
 * Upload profile image to Supabase storage
 * @param userId - The user's ID (used as filename)
 * @param imageUri - Local URI of the selected image
 * @returns Public URL of the uploaded image
 */
export const uploadProfileImage = async (userId: string, imageUri: string): Promise<string> => {
    try {
        // Read the file as base64
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: 'base64',
        });

        // Determine file extension from URI
        const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${userId}.${fileExt}`;
        const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, decode(base64), {
                contentType,
                upsert: true, // Replace if exists
            });

        if (error) {
            console.error('Upload error:', error);
            throw error;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Error uploading profile image:', error);
        throw error;
    }
};

/**
 * Update user's profile_image_url in the database
 */
export const updateProfileImageUrl = async (userId: string, imageUrl: string): Promise<void> => {
    const { error } = await supabase
        .from('users')
        .update({ profile_image_url: imageUrl })
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile image URL:', error);
        throw error;
    }
};

/**
 * Pick, upload, and save profile image - all in one function
 */
export const pickAndUploadProfileImage = async (userId: string): Promise<string | null> => {
    try {
        // 1. Pick image
        const result = await pickImage();

        if (result.canceled || !result.assets?.[0]?.uri) {
            return null; // User cancelled
        }

        const imageUri = result.assets[0].uri;

        // 2. Upload to storage
        const publicUrl = await uploadProfileImage(userId, imageUri);

        // 3. Update database
        await updateProfileImageUrl(userId, publicUrl);

        return publicUrl;
    } catch (error) {
        console.error('Error in pickAndUploadProfileImage:', error);
        throw error;
    }
};
