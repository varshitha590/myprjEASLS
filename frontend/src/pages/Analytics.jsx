import { useEffect, useState } from "react";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import { apiRequest } from "../services/api";
import { supabase } from "../lib/supabase";

const Analytics = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // ✅ Get logged in user safely
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.log("No user logged in");
          return;
        }

        const userId = session.user.id;

        const data = await apiRequest(
          `/api/analytics?user_id=${userId}`
        );

        console.log("FIRST LOG:", data[0]);
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch analytics", err.message);
      }
    }

    fetchAnalytics();
  }, []);

  return <AnalyticsDashboard logs={logs} />;
};

export default Analytics;
