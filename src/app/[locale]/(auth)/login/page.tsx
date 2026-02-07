import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
    title: "Login | Waqf",
    description: "Sign in to your Waqf account to contribute to Islamic open-source projects",
};

export default function LoginPage() {
    return <LoginForm />;
}
