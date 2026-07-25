import React, { useState } from "react";
import defaultAvatar from "../../assets/default-avatar.jpg"; // using new placeholder avatar

// Static student data – will be replaced by an API later
const student = {
  photo: "https://via.placeholder.com/150",
  name: "Ishaan Saxena",
  rollNumber: "21",
  class: "10",
  section: "A",
  email: "saxenaishaan3@gmail.com",
  phone: "+91 98765 43210",
  bloodGroup: "O-",
  parentName: "Mr. Amit Saxena",
};

const Profile: React.FC = () => {
  const [imgSrc, setImgSrc] = useState(student.photo || defaultAvatar);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-100">
      {/* Photo */}
      <div className="flex justify-center mb-6">
        <img
          src={imgSrc}
          alt="Student Photo"
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
          onError={() => setImgSrc(defaultAvatar)}
        />
      </div>

      {/* Basic info */}
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
        {student.name}
      </h1>

      {/* Details grid */}
      <dl className="grid grid-cols-2 gap-4 text-gray-700">
        <div>
          <dt className="font-medium text-sm text-gray-500">Roll Number</dt>
          <dd className="mt-1 text-lg font-semibold text-gray-900">{student.rollNumber}</dd>
        </div>
        <div>
          <dt className="font-medium text-sm text-gray-500">Class</dt>
          <dd className="mt-1 text-base">{student.class}</dd>
        </div>
        <div>
          <dt className="font-medium text-sm text-gray-500">Section</dt>
          <dd className="mt-1 text-base">{student.section}</dd>
        </div>
        <div>
          <dt className="font-medium text-sm text-gray-500">Email</dt>
          <dd className="mt-1 text-base">{student.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-sm text-gray-500">Phone</dt>
          <dd className="mt-1 text-base">{student.phone}</dd>
        </div>
        <div>
          <dt className="font-medium text-sm text-gray-500">Blood Group</dt>
          <dd className="mt-1 text-base">{student.bloodGroup}</dd>
        </div>
        <div className="col-span-2">
          <dt className="font-medium text-sm text-gray-500">Parent Name</dt>
          <dd className="mt-1 text-base">{student.parentName}</dd>
        </div>
      </dl>
    </div>
  );
};

export default Profile;

