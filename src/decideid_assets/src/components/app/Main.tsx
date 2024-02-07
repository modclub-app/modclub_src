import * as React from "react";
import { useEffect } from "react";
import NotAuthenticatedModal from "./modals/NotAuthenticated"; // Ensure this is used or remove if not needed
import { useConnect } from "@connect2icmodclub/react";
import { useProfile } from "../../hooks/useProfile";
import { useNavigate } from "react-router-dom";

export default function Main() {
  const { principal } = useConnect();
  const navigate = useNavigate();
  const { profile, isLoading, error, isError } = useProfile();

  useEffect(() => {
    if (!isLoading) {
      if (error && error.message === 'Not registered.') {
        navigate('/signup');
      }
    }
  }, [isLoading, error, isError, navigate]);

  // Show loading state until the profile is being fetched
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Your principal: {principal}</div>
        <p className="text-gray-500 mt-2">Loading profile...</p>
      </div>
    );
  }

  // Once loading is complete, render the component conditionally based on the profile data
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-lg font-semibold">Your principal: {principal}</div>
      {!isLoading && profile ? (
        <div>
        <p className="text-blue-600 mt-2">Email: {profile.email}</p>
        <p className="text-blue-600 mt-2">First Name: {profile.firstName}</p>
        <p className="text-blue-600 mt-2">Last Name: {profile.lastName}</p>
        </div>
      ) : null}
    </div>
  );
}
