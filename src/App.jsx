import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { useFingerprint } from "./hooks/useFingerprint.";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StrayAnimalList from "./pages/StrayAnimalList";
import StrayAnimalDetail from "./pages/StrayAnimalDetail";
import FestivalList from "./pages/FestivalList";
import FestivalDetail from "./pages/FestivalDetail";
import FacilityMapPage from "./pages/FacilityMapPage";

function App() {
  const { fingerprint, loading } = useFingerprint();

  if (loading) {
    return null;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/stray/list" replace />} />
            <Route path="/stray/list" element={<StrayAnimalList />} />
            <Route path="/stray/detail/:id" element={<StrayAnimalDetail />} />
            <Route path="/festival/list" element={<FestivalList />} />
            <Route path="/festival/detail/:id" element={<FestivalDetail />} />
            <Route path="/map" element={<FacilityMapPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
