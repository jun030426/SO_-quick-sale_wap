import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import ListingDetail from "./pages/ListingDetail";

function App() {
  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;