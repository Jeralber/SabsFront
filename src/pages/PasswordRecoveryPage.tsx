import { PasswordRecoveryForm } from "@/components/organisms/PasswordRecoveryForm";
import { useNavigate } from "react-router-dom";

export const PasswordRecoveryPage = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <PasswordRecoveryForm onBackToLogin={handleBackToLogin} />
    </div>
  );
};