// pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { fetchAllMentors, fetchAllMentees, fetchAllRequests } from '../api/adminApi';

const AdminDashboard = () => {
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [mentorData, menteeData, requestData] = await Promise.all([
          fetchAllMentors(),
          fetchAllMentees(),
          fetchAllRequests()
        ]);
        setMentors(mentorData);
        setMentees(menteeData);
        setRequests(requestData);
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">Mentors ({mentors.length})</h2>
            <ul className="bg-white shadow rounded p-4 space-y-2">
              {mentors.map((mentor) => (
                <li key={mentor.id} className="border-b py-2">
                  {mentor.name} - {mentor.expertise}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Mentees ({mentees.length})</h2>
            <ul className="bg-white shadow rounded p-4 space-y-2">
              {mentees.map((mentee) => (
                <li key={mentee.id} className="border-b py-2">
                  {mentee.name} - {mentee.phone_number}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Mentorship Requests ({requests.length})</h2>
            <ul className="bg-white shadow rounded p-4 space-y-2">
              {requests.map((req) => (
                <li key={req.id} className="border-b py-2">
                  {req.requested_topic} - {req.language_requested} - {req.request_status}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
