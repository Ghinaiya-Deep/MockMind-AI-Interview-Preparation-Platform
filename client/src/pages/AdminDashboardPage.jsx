import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend
} from "recharts";
import { getChartStatsApi, getDashboardStatsApi } from "../api/adminApi";

const cardConfig = [
  { key: "totalUsers", label: "Total Users", icon: "US", tone: "cyan" },
  { key: "totalInterviews", label: "Total Interviews", icon: "IN", tone: "blue" },
  { key: "interviewsToday", label: "Interviews Today", icon: "TD", tone: "green" },
  { key: "averageRating", label: "Average Rating", icon: "RT", tone: "amber" },
  { key: "totalAiCalls", label: "AI Usage Calls", icon: "AI", tone: "violet" },
  { key: "totalFeedback", label: "Feedback Count", icon: "FB", tone: "rose" },
  { key: "totalContacts", label: "Contact Submissions", icon: "CT", tone: "teal" }
];

const PIE_COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

function StatCard({ label, value, icon, tone }) {
  return (
    <article className={`admin-stat-card tone-${tone}`}>
      <div className="admin-stat-icon">{icon}</div>
      <div>
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
    </article>
  );
}

function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState({
    userGrowth: [],
    interviewActivity: [],
    ratingDistribution: []
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mockmind_admin_token");
    if (!token) {
      return;
    }

    Promise.all([getDashboardStatsApi(token), getChartStatsApi(token)])
      .then(([statsResponse, chartResponse]) => {
        setStats(statsResponse.data);
        setCharts(chartResponse.data);
      })
      .catch((apiError) => {
        setError(
          apiError?.response?.data?.message ||
            apiError?.response?.data?.errors?.[0]?.msg ||
            "Unable to load dashboard analytics."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = useMemo(() => {
    if (!stats) {
      return [];
    }
    return cardConfig.map((item) => ({
      ...item,
      value:
        item.key === "averageRating"
          ? `${Number(stats[item.key] || 0).toFixed(2)} / 5`
          : Number(stats[item.key] || 0).toLocaleString()
    }));
  }, [stats]);

  if (loading) {
    return <div className="admin-state-card">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="admin-state-card error">{error}</div>;
  }

  return (
    <section className="admin-dashboard-page">
      <div className="admin-dashboard-hero">
        <div>
          <p className="admin-hero-kicker">Performance Snapshot</p>
          <h2>Platform health looks active and growing</h2>
          <p className="admin-hero-copy">
            You currently have <strong>{Number(stats?.totalUsers || 0)}</strong> registered
            users and <strong>{Number(stats?.totalInterviews || 0)}</strong> total interview
            sessions tracked in MockMind.
          </p>
        </div>
      </div>

      <div className="admin-stats-grid">
        {cards.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>

      <div className="admin-chart-grid">
        <article className="admin-chart-card">
          <h3>User Growth (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={charts.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#0f766e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className="admin-chart-card">
          <h3>Interview Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.interviewActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="interviews" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="admin-chart-card">
          <h3>Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={charts.ratingDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={96}
                label
              >
                {charts.ratingDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </div>
    </section>
  );
}

export default AdminDashboardPage;
