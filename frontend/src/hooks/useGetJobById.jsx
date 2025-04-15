import { setSingleJob } from "@/redux/jobSlice";
import store from "@/redux/store";
import { JOB_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetJobById = (jobId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSingleJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          console.log(
            "Updated singleJob in store:",
            store.getState().job.singleJob
          );
        }
      } catch (error) {
        console.error("Error fetching job:", error);
      }
    };

    if (jobId) {
      fetchSingleJob();
    }
  }, [jobId, dispatch]);
};

export default useGetJobById;
