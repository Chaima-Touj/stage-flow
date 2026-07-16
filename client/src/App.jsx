import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import CustomCursor from "./components/common/CustomCursor.jsx";
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
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import AIAssistant        from "./pages/ai/AIAssistant.jsx";
import Settings           from "./pages/settings/Settings.jsx";
import NotificationsPage  from "./pages/notifications/NotificationsPage.jsx";
import MessagingPage      from "./pages/messages/MessagingPage.jsx";
import FormationsPage           from "./pages/FormationsPage";
import FormationDetail          from "./pages/FormationDetail";
import OffersPage               from "./pages/OffersPage";
import PublicOfferDetail        from "./pages/PublicOfferDetail";
import DashboardFormations      from "./pages/dashboard/DashboardFormations.jsx";
import DashboardFormationDetail from "./pages/dashboard/DashboardFormationDetail.jsx";
import MesDemandes              from "./pages/dashboard/MesDemandes.jsx";
import AdminDashboard           from "./pages/dashboard/AdminDashboard.jsx";
import AdminFormations          from "./pages/dashboard/AdminFormations.jsx";
import AdminUsers               from "./pages/dashboard/AdminUsers.jsx";
import AdminApplications        from "./pages/dashboard/AdminApplications.jsx";
import AdminEnrollmentRequests  from "./pages/dashboard/AdminEnrollmentRequests.jsx";
import AdminEnrollments         from "./pages/dashboard/AdminEnrollments.jsx";
import AdminStatistics          from "./pages/dashboard/AdminStatistics.jsx";
import AdminProfile             from "./pages/dashboard/AdminProfile.jsx";
import AdminSettings            from "./pages/dashboard/AdminSettings.jsx";



function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",fontSize:"1.5rem"}}>⏳</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
    <CustomCursor />
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

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
      <Route path="/verify-email" element={<VerifyEmail/>}/>
<Route path="/verify-email/:email" element={<VerifyEmail/>}/>
      <Route path="/dashboard/student/ai-assistant" element={
        <ProtectedRoute><AIAssistant/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/notifications" element={
        <ProtectedRoute><NotificationsPage/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/messages" element={
        <ProtectedRoute><MessagingPage/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/settings" element={
        <ProtectedRoute><Settings/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/formations" element={
        <ProtectedRoute><DashboardFormations/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/formations/:slug" element={
        <ProtectedRoute><DashboardFormationDetail/></ProtectedRoute>
      }/>
      <Route path="/dashboard/student/demandes" element={
        <ProtectedRoute><MesDemandes/></ProtectedRoute>
      }/>

      <Route path="/dashboard/admin" element={
        <ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>
      }/>
      <Route path="/dashboard/admin/users" element={
        <ProtectedRoute role="admin"><AdminUsers/></ProtectedRoute>
      }/>
      <Route path="/dashboard/admin/formations" element={
        <ProtectedRoute role="admin"><AdminFormations/></ProtectedRoute>
      }/>
      <Route path="/dashboard/admin/messages" element={
        <ProtectedRoute role="admin"><MessagingPage/></ProtectedRoute>
      }/>
      <Route path="/dashboard/admin/candidatures" element={
        <ProtectedRoute role="admin"><AdminApplications/></ProtectedRoute>
      }/>
      <Route path="/dashboard/admin/demandes" element={
        <ProtectedRoute role="admin"><AdminEnrollmentRequests/></ProtectedRoute>
      }/>
      <Route path="/dashboard/admin/inscriptions" element={
        <ProtectedRoute role="admin"><AdminEnrollments/></ProtectedRoute>
      }/>
      <Route path="/dashboard/admin/stats" element={
        <ProtectedRoute role="admin"><AdminStatistics/></ProtectedRoute>
      }/>
      <Route path="/dashboard/admin/settings" element={
        <ProtectedRoute role="admin"><AdminSettings/></ProtectedRoute>
      }/>
      <Route path="/dashboard/admin/profile" element={
        <ProtectedRoute role="admin"><AdminProfile/></ProtectedRoute>
      }/>

      <Route path="/formations"        element={<FormationsPage />} />
      <Route path="/formations/:slug"  element={<FormationDetail />} />
      <Route path="/offers"            element={<OffersPage />} />
      <Route path="/offers/:id"        element={<PublicOfferDetail />} />
      {/* Redirection pour les routes non définies */}

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
    </>
  );
}
