import React, { createContext, useState, useContext, FunctionComponent } from 'react';

interface Profile {
    id: string;
    email?: string; 
}

// Define the type for your context
interface ProfileContextType {
    profile: Profile | null;
    updateProfile: (newProfile: Profile) => Promise<void>; 
    createProfile: (newProfile: Profile) => Promise<void>;
    refreshProfile: () => Promise<void>;
    clear: () => void;
}

// Create the context with an initial undefined value
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// ProfileProvider component
export const ProfileProvider: FunctionComponent = ({ children }) => {
    // Initialize state with data from localStorage if available
    const initialProfile = localStorage.getItem('decideid_profile') 
        ? JSON.parse(localStorage.getItem('decideid_profile')!) 
        : null;

    const [profile, setProfile] = useState<Profile | null>(initialProfile);

    // Function to update the profile in state and localStorage
    const saveProfile = (newProfile: Profile | null) => {
        setProfile(newProfile);
        if (newProfile) {
            localStorage.setItem('decideid_profile', JSON.stringify(newProfile));
        } else {
            localStorage.removeItem('decideid_profile');
        }
    };

    // Function to update the profile
    const updateProfile = async (newProfile: Profile) => {
        try {
            // Update profile in the backend
            // ...
            saveProfile(newProfile);
        } catch (error) {
            console.error('Failed to update profile', error);
            // Handle errors appropriately
        }
    };

    // Function to create a new profile
    const createProfile = async (newProfile: Profile) => {
        try {
            // Create profile in the backend
            // ...
            saveProfile(newProfile);
        } catch (error) {
            console.error('Failed to create profile', error);
            // Handle errors appropriately
        }
    };

    // Function to refresh the profile from the backend
    const refreshProfile = async () => {
        try {
            // Fetch profile from the backend
            // ...
            // saveProfile(fetchedProfile);
        } catch (error) {
            console.error('Failed to refresh profile', error);
            // Handle errors appropriately
        }
    };

    // Function to clear profile data from state and localStorage
    const clear = () => {
        saveProfile(null);
    };

    return (
        <ProfileContext.Provider value={{ profile, updateProfile, createProfile, refreshProfile, clear }}>
            {children}
        </ProfileContext.Provider>
    );
};

// Custom hook to use the profile context
export const useProfile = (): ProfileContextType => {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

// Helper function to fetch profile data from the server (placeholder)
async function fetchProfileFromServer(): Promise<Profile> {
    // Implement the actual API call here
    // For example: return await axios.get('/api/profile');
    throw new Error('fetchProfileFromServer function is not implemented.');
}
