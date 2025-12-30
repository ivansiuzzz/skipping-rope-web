import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./modules/auth/login/login-page";
import { RegisterPage } from "./modules/auth/register/RegisterPage";
import { ProtectedRoute } from "./app/components/ProtectedRoute";
import { AppLayout } from "./app/components/AppLayout";
import { HomePage } from "./modules/home/HomePage";
import AddEventPage from "./modules/add-event/AddEventPage";
import EventListingPage from "./modules/event/EventListingPage";
import EventSummaryPage from "./modules/event/EventSummaryPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <HomePage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-event"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddEventPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EventListingPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:eventId/summary"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <EventSummaryPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
