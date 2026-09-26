import { useEffect, useState } from "react";
import AuthPage from "./pages/AuthPage";
import RoleWorkspace from "./pages/RoleWorkspace";
import { clearSession, loadSession, saveSession } from "./services/auth";
import ProductSplash from "./components/ProductSplash";

function App() {
  const [session, setSession] = useState(loadSession);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 1550);
    return () => window.clearTimeout(timer);
  }, []);
  const authenticated = (result) => { saveSession(result); setSession(result); };
  const logout = () => { clearSession(); setSession(null); };
  if (showSplash) return <ProductSplash />;
  if (!session?.user) return <AuthPage onAuthenticated={authenticated}/>;
  return <RoleWorkspace session={session} user={session.user} onLogout={logout}/>;
}
export default App;
