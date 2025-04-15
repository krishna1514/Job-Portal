import React, { useState } from "react";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { JOB_API_END_POINT } from "@/utils/constant";
import axios from "axios";

// const Job = ({ job }) => {
//   const navigate = useNavigate();
//   // const jobId = "lsekdhjgdsnfvsdkjf";

//   const daysAgoFunction = (mongodbTime) => {
//     const createdAt = new Date(mongodbTime);
//     const currentTime = new Date();
//     const timeDifference = currentTime - createdAt;
//     return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
//   };

//   return (
//     <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100">
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-gray-500">
//           {daysAgoFunction(job?.createdAt) === 0
//             ? "Today"
//             : `${daysAgoFunction(job?.createdAt)} days ago`}
//         </p>
//         <Button variant="outline" className="rounded-full" size="icon">
//           <Bookmark />
//         </Button>
//       </div>

//       <div className="flex items-center gap-2 my-2">
//         <Button className="p-6" variant="outline" size="icon">
//           <Avatar>
//             <AvatarImage src={job?.company?.logo} />
//           </Avatar>
//         </Button>
//         <div>
//           <h1 className="font-medium text-lg">{job?.company?.name}</h1>
//           <p className="text-sm text-gray-500">India</p>
//         </div>
//       </div>

//       <div>
//         <h1 className="font-bold text-lg my-2">{job?.title}</h1>
//         <p className="text-sm text-gray-600">{job?.description}</p>
//       </div>
//       <div className="flex items-center gap-2 mt-4">
//         <Badge className={"text-blue-700 font-bold"} variant="ghost">
//           {job?.position} Positions
//         </Badge>
//         <Badge className={"text-[#F83002] font-bold"} variant="ghost">
//           {job?.jobType}
//         </Badge>
//         <Badge className={"text-[#7209b7] font-bold"} variant="ghost">
//           {job?.salary}LPA
//         </Badge>
//       </div>
//       <div className="flex items-center gap-4 mt-4">
//         <Button
//           onClick={() => navigate(`/description/${job?._id}`)}
//           variant="outline"
//         >
//           Details
//         </Button>
//         <Button className="bg-[#7209b7]">Save For Later</Button>
//       </div>
//     </div>
//   );
// };

// export default Job;
const Job = ({ job }) => {
  const navigate = useNavigate();
  const [eligibilityData, setEligibilityData] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const userId = useSelector((state) => state.auth.user?._id);

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
  };
  const handleCheckEligibility = async () => {
    try {
      if (!userId) {
        setError("Please login to check eligibility");
        return;
      }

      if (!job?._id) {
        setError("Job information is missing");
        return;
      }

      setLoading(true);
      console.log("Request details:", {
        jobId: job._id,
        userId: userId,
        endpoint: `${JOB_API_END_POINT}/check-eligibility/${job._id}`,
      });

      const response = await axios.post(
        `${JOB_API_END_POINT}/check-eligibility/${job._id}`,
        { userId },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Backend response:", response.data);

      if (response.data.success) {
        const formattedData = {
          matchPercentage: response.data.eligibilityScore,
          matchedSkills: response.data.matchingSkills || [],
          missingSkills: response.data.missingSkills || [],
        };

        setEligibilityData(formattedData);
        setShowPopup(true);
      } else {
        setError(response.data.error || "Failed to check eligibility");
      }
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
      });

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "An error occurred while checking eligibility";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-md shadow-xl bg-white border border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {daysAgoFunction(job?.createdAt) === 0
            ? "Today"
            : `${daysAgoFunction(job?.createdAt)} days ago`}
        </p>
        <Button variant="outline" className="rounded-full" size="icon">
          <Bookmark />
        </Button>
      </div>

      <div className="flex items-center gap-2 my-2">
        <Button className="p-6" variant="outline" size="icon">
          <Avatar>
            <AvatarImage src={job?.company?.logo} />
          </Avatar>
        </Button>
        <div>
          <h1 className="font-medium text-lg">{job?.company?.name}</h1>
          <p className="text-sm text-gray-500">India</p>
        </div>
      </div>

      <div>
        <h1 className="font-bold text-lg my-2">{job?.title}</h1>
        <p className="text-sm text-gray-600">{job?.description}</p>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <Badge className={"text-blue-700 font-bold"} variant="ghost">
          {job?.position} Positions
        </Badge>
        <Badge className={"text-[#F83002] font-bold"} variant="ghost">
          {job?.jobType}
        </Badge>
        <Badge className={"text-[#7209b7] font-bold"} variant="ghost">
          {job?.salary}LPA
        </Badge>
      </div>
      <div className="flex items-center gap-4 mt-4">
        <Button
          onClick={() => navigate(`/description/${job?._id}`)}
          variant="outline"
        >
          Details
        </Button>

        <Button
          onClick={handleCheckEligibility}
          disabled={loading}
          className="bg-[#7209b7] text-white hover:bg-gray-500 rounded disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check for eligibility"}
        </Button>
      </div>

      {showPopup && eligibilityData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 z-60">
            <h4 className="text-xl font-bold mb-4">Eligibility Details</h4>
            <p>
              <strong>Match Percentage:</strong>{" "}
              {eligibilityData.matchPercentage}%
            </p>
            <p>
              <strong>Matched Skills:</strong>{" "}
              {eligibilityData.matchedSkills.join(", ") || "None"}
            </p>
            <p>
              <strong>Missing Skills:</strong>{" "}
              {eligibilityData.missingSkills.join(", ") || "None"}
            </p>
            <Button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Error message display */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-red-500 p-6 rounded-lg shadow-lg w-96 z-60">
            <h4 className="text-xl font-bold mb-4 text-white">Error</h4>
            <p className="text-white">{error}</p>
            <Button
              onClick={() => setError(null)}
              className="mt-4 bg-white text-black px-4 py-2 rounded"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Job;
