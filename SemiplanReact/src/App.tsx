import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Subjects from "./pages/Subjects";

export default function App() {
  return (
      <Routes>
          <Route path="/" element={<Layout />}>
              <Route path="subjects" element={<Subjects />} />
    </Route>
  </Routes>
  )
}