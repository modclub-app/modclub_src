import React, { useState } from "react";
import { useProfile } from "../../../utils";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function NewProfile() {
  const navigate = useNavigate();
  const { createProfile, profile, isLoading } = useProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const handleCreateProfile = async () => {
    const newProfile = { firstName, lastName, email };
    createProfile(newProfile);
  };

  useEffect(() => {
    if (!isLoading) {
      if (profile?.message == null && profile?.email != null) {
        navigate('/app');
      }
    }
  }, [isLoading, profile, navigate]);

  return <>
    { profile?.message ? (
      <div className="mb-5 text-center">
        <p>{profile.message}</p>
      </div>
    ) : 
    <div className="max-w-md mx-auto my-10 p-5 border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center mb-5">New Profile</h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name:</label>
          <input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name:</label>
          <input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="button"
          onClick={handleCreateProfile}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Profile
        </button>
      </form>
    </div> }
  </>;
}