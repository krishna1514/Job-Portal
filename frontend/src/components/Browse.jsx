import React, { useEffect, useMemo } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import useGetAllJobs from "@/hooks/useGetAllJobs";

// const randomJobs = [1, 2,45];

const Browse = () => {
  useGetAllJobs();
  const { allJobs } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  // Extract keywords from query string
  const queryParams = new URLSearchParams(location.search);
  const keywords = queryParams.get("keywords")?.split(",") || [];

  // Debugging logs
  console.log("Extracted keywords:", keywords);
  console.log("All jobs:", allJobs);

  const filteredJobs = useMemo(() => {
    if (keywords.length === 0) return allJobs;

    const normalizedKeywords = keywords
      .map((keyword) => keyword.trim().toLowerCase()) // Trim and lowercase keywords
      .filter((keyword) => keyword); // Remove empty strings

    return allJobs.filter((job) => {
      const jobRequirements = (job.requirements || []).map((req) =>
        req.toLowerCase()
      ); // Normalize job requirements

      // Check if any keyword matches the job requirements
      return normalizedKeywords.some((keyword) =>
        jobRequirements.some((req) => req.includes(keyword))
      );
    });
  }, [allJobs, keywords]);
  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(""));
    };
  }, []);
  return (
    // <div>
    //   <Navbar />
    //   <div className="max-w-7xl mx-auto my-10">
    //     <h1 className="font-bold text-xl my-10">
    //       Search Results ({allJobs.length})
    //     </h1>
    //     <div className="grid grid-cols-3 gap-4">
    //       {allJobs.map((job) => {
    //         return <Job key={job._id} job={job} />;
    //       })}
    //     </div>
    //   </div>
    // </div>
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-10">
        <h1 className="font-bold text-xl my-10">
          {keywords.length > 0
            ? ` Jobs matching your skills (${filteredJobs.length})`
            : ` All Jobs (${allJobs.length})`}
        </h1>
        <div className="grid grid-cols-3 gap-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => <Job key={job._id} job={job} />)
          ) : (
            <p>No jobs found for your skills.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;
