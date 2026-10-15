import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProloguePage from '../pages/ProloguePage';
import StartingPointPage from '../pages/StartingPointPage';
import FieldGuidePage from '../pages/FieldGuidePage';
import WorkbenchPage from '../pages/WorkbenchPage';
import WeatherRoomPage from '../pages/WeatherRoomPage';
import JournalPage from '../pages/JournalPage';
import PlanSummaryPage from '../pages/PlanSummaryPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProloguePage />} />
        <Route path="/begin" element={<StartingPointPage />} />
        <Route path="/field-guide" element={<FieldGuidePage />} />
        <Route path="/workbench" element={<WorkbenchPage />} />
        <Route path="/weather-room" element={<WeatherRoomPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/plan-summary" element={<PlanSummaryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
