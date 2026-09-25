import { useState } from "react";
import AuthPage from "./pages/AuthPage";
import RoleWorkspace from "./pages/RoleWorkspace";
import { clearSession, loadSession, saveSession } from "./services/auth";

function App() {
  const [session, setSession] = useState(loadSession);

  const authenticated = (result) => { saveSession(result); setSession(result); };
  const logout = () => { clearSession(); setSession(null); };

  if (!session?.user) return <AuthPage onAuthenticated={authenticated}/>;
  return <RoleWorkspace user={session.user} onLogout={logout}/>;
}
export default App;
