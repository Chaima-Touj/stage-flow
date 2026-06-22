import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Login    from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import StudentDashboard from "./pages/dashboard/StudentDashboard.jsx";
import OffersList  from "./pages/offers/OffersList.jsx";
import OfferDetail from "./pages/offers/OfferDetail.jsx";
import ApplyOffer  from "./pages/offers/ApplyOffer.jsx";
import MyApplications from "./pages/applications/MyApplications.jsx";
import Interviews from "./pages/interviews/Interviews.jsx";
import Profile from "./pages/dashboard/Profile.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",fontSize:"1.5rem"}}>⏳</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard/student" element={
        <ProtectedRoute><StudentDashboard/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/offers" element={
        <ProtectedRoute><OffersList/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/offers/:id" element={
        <ProtectedRoute><OfferDetail/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/offers/:id/apply" element={
        <ProtectedRoute><ApplyOffer/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/applications" element={
        <ProtectedRoute><MyApplications/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/interviews" element={
        <ProtectedRoute><Interviews/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/profile" element={
        <ProtectedRoute><Profile/></ProtectedRoute>
      }/>
      

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
