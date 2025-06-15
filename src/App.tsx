import { Route, Routes } from "react-router-dom";

import { WalletProvider } from "./contexts/wallet";

import IndexPage from "@/pages/index";

function App() {
  return (
    <WalletProvider>
      <Routes>
        <Route element={<IndexPage />} path="/" />
      </Routes>
    </WalletProvider>
  );
}

export default App;
