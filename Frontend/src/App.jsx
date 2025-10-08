import React from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { OrdersProvider } from "./hooks/useOrders.jsx";
import { PartnerOrdersProvider } from "./hooks/usePartnerOrders.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Layout from "./Layout";
import PartnerDashboard from "./routes/partner/PartnerDashboard";
import PartnerOrders from "./routes/partner/Orders";
import Reports from "./routes/partner/Reports";
import PartnerOrderDetails from "./routes/partner/OrderDetails.jsx";
import PartnerSettings from "./routes/partner/PartnerSettings";

import StudentDashboard from "./routes/student/Student.jsx";
import StudentOrders from "./routes/student/StudentOrders";
import StudentSettings from "./routes/student/StudentSettings";

const App = () => {
  return (
    <AuthProvider>
      <OrdersProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />

            <Route 
              path="/student" 
              element={
                <ProtectedRoute requiredRole="client">
                  <Layout userType="student" />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="orders" element={<StudentOrders />} />
              <Route path="settings" element={<StudentSettings />} />
            </Route>

            <Route 
              path="/partner" 
              element={
                <ProtectedRoute requiredRole="shop">
                  <PartnerOrdersProvider>
                    <Layout userType="partner" />
                  </PartnerOrdersProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<PartnerDashboard />} />

              <Route path="orders">
                <Route index element={<PartnerOrders />} />
                <Route path=":id" element={<PartnerOrderDetails />} />
              </Route>

              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<PartnerSettings />} />
            </Route>
          </Routes>
        </Router>
      </OrdersProvider>
    </AuthProvider>
  );
};

export default App;
