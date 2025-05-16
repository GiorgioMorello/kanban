
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';




export default function RouteWatcher() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      // O usuário entrou no dashboard, pode limpar os dados temporários
      localStorage.removeItem("is_timer_end")
      localStorage.removeItem("otp_timer");

      console.log('Limpando localStorage ao acessar o dashboard');
    }
  }, [location]);

  return null; // Esse componente não renderiza nada
}

