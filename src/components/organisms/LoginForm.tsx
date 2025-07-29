import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { useNavigate } from "react-router-dom";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoading: loginIsPending } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm mx-auto">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <Input
        label="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
      />
      <Input
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        required
      />
      <Button type="submit" disabled={loginIsPending}>
        {loginIsPending ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  );
};
