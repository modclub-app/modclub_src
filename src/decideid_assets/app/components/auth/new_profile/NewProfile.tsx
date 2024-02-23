import React, { useState, useEffect } from "react";
import { useProfile } from "../../../utils";
import { useNavigate } from "react-router-dom";

export default function NewProfile() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const { createProfile, isLoading, isSuccess } = useProfile();
  const navigate = useNavigate();

  const handleCreateProfile = async () => {
    const newProfile = { firstName, lastName, email };
    setIsSubmitted(true);
    createProfile(newProfile);
  };

  useEffect(() => {
    if (!isLoading && isSuccess) {
      // means we have valid profile now. should go to main app endpoint.
      navigate("/app");
    }
  }, [isLoading, isSuccess]);

  return;
  isSubmitted ? (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-2">
        Welcome, {firstName} {lastName}!
      </h1>
      <p className="text-sm text-gray-700 mb-4">
        Please wait while we are creating your account. This may take a few
        seconds.
      </p>
      <h2 className="text-md font-semibold text-gray-900 mb-2">
        Do you know about Decide ID?
      </h2>
      <p className="text-sm text-gray-700">
        Decide ID is the unique identifier we use to securely manage your
        account details and preferences. More information on how and why we use
        Decide ID will be available in the main dashboard.
      </p>
    </div>
  ) : (
    <div className="max-w-md mx-auto my-10 p-5 border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-center mb-5">New Profile</h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name:
          </label>
          <input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name:
          </label>
          <input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email:
          </label>
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
    </div>
  );
}
