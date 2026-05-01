import { useEffect, useState } from "react";
import { deleteAdminContactApi, getAdminContactsApi } from "../api/adminApi";

function AdminContactPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadContacts = async () => {
    const token = localStorage.getItem("mockmind_admin_token");
    if (!token) {
      return;
    }
    try {
      setLoading(true);
      setError("");
      const { data } = await getAdminContactsApi(token);
      setContacts(data.contacts || []);
    } catch (apiError) {
      setError(
        apiError?.response?.data?.message ||
          apiError?.response?.data?.errors?.[0]?.msg ||
          "Unable to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("mockmind_admin_token");
    if (!token) {
      return;
    }
    try {
      await deleteAdminContactApi(token, id);
      setContacts((prev) => prev.filter((item) => item._id !== id));
    } catch (apiError) {
      setError(
        apiError?.response?.data?.message ||
          apiError?.response?.data?.errors?.[0]?.msg ||
          "Unable to delete contact message."
      );
    }
  };

  if (loading) {
    return <div className="admin-state-card">Loading contact messages...</div>;
  }

  return (
    <section className="admin-table-page">
      <div className="admin-table-header">
        <h2>Contact Management</h2>
      </div>

      {error ? <div className="admin-state-card error">{error}</div> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-empty-cell">
                  No contact messages found.
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact._id}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td className="admin-cell-wide">{contact.message}</td>
                  <td>{new Date(contact.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      className="danger-btn"
                      onClick={() => handleDelete(contact._id)}
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

export default AdminContactPage;
