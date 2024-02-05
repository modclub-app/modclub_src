import * as React from 'react';
import { SignIn } from '../../auth/SignIn';

export default function NotAuthenticated() {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"> {/* Modal Background */}
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"> {/* Modal Container */}
        <div className="text-center"> {/* Modal Body */}
          <h2 className="text-xl font-semibold">You need to be logged in<br />to view this page</h2>
        </div>
        <div className="mt-4 flex justify-end"> {/* Modal Footer */}
          <SignIn />
        </div>
      </div>
    </div>
  );
};
