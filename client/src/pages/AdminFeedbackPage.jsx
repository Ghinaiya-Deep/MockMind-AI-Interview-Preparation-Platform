import { useEffect, useState } from "react";
import { deleteAdminFeedbackApi, getAdminFeedbacksApi } from "../api/adminApi";

function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [sort, setSort] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeedbacks = async (selectedSort) => {
    const token = localStorage.getItem("mockmind_admin_token");
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await getAdminFeedbacksApi(token, selectedSort);
      setFeedbacks(data.feedbacks || []);
    } catch (apiError) {
      setError(
        apiError?.response?.data?.message ||
          apiError?.response?.data?.errors?.[0]?.msg ||
          "Unable to load feedback entries."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks(sort);
  }, [sort]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("mockmind_admin_token");
    if (!token) {
      return;
    }
    try {
      await deleteAdminFeedbackApi(token, id);
      setFeedbacks((prev) => prev.filter((item) => item._id !== id));
    } catch (apiError) {
      setError(
        apiError?.response?.data?.message ||
          apiError?.response?.data?.errors?.[0]?.msg ||
          "Unable to delete feedback."
      );
    }
  };

  if (loading) {
    return <div className="admin-state-card">Loading feedback...</div>;
  }

  return (
    <section className="admin-table-page">
      <div className="admin-table-header">
        <h2>Feedback Management</h2>
        <select
          className="admin-select"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
          <option value="rating_desc">Rating high to low</option>
          <option value="rating_asc">Rating low to high</option>
        </select>
      </div>

      {error ? <div className="admin-state-card error">{error}</div> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Rating</th>
              <th>Improvement</th>
              <th>Ref ID</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-empty-cell">
                  No feedback data found.
                </td>
              </tr>
            ) : (
              feedbacks.map((feedback) => (
                <tr key={feedback._id}>
                  <td>{feedback.name}</td>
                  <td>{feedback.email}</td>
                  <td>{feedback.rating}/5</td>
                  <td className="admin-cell-wide">{feedback.improvement}</td>
                  <td>{feedback.referenceId}</td>
                  <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleDelete(feedback._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminFeedbackPage;
