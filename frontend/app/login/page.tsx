import LoginForm from '@/app/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 dark:bg-zinc-900">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg dark:bg-zinc-800">
                <LoginForm />
            </div>
        </div>
    );
}
