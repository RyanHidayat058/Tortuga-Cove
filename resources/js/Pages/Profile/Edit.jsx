import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { useTheme } from '@/hooks/useTheme';

export default function Edit({ mustVerifyEmail, status }) {
    const [theme] = useTheme();
    const isDark = theme === 'dark';

    const panelClass = isDark
        ? 'bg-[#091540] border-2 border-[#2E438F] text-white shadow-2xl rounded-2xl p-6 sm:p-8 transition-colors'
        : 'bg-white border-2 border-[#2E438F] text-[#091540] shadow-md rounded-2xl p-6 sm:p-8 transition-colors';

    return (
        <AuthenticatedLayout
            header={
                <h2 className={`text-xl font-black font-mono tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                    <span>📜</span> CAPTAIN'S LOG (PROFILE)
                </h2>
            }
        >
            <Head title="Profile" />

            <div className={`py-12 min-h-[calc(100vh-4rem)] ${isDark ? 'bg-[#091540]' : 'bg-white'}`}>
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className={panelClass}>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className={panelClass}>
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className={isDark ? 'bg-[#091540] border-2 border-red-500/50 text-white shadow-2xl rounded-2xl p-6 sm:p-8' : 'bg-white border-2 border-red-500 text-[#091540] shadow-md rounded-2xl p-6 sm:p-8'}>
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
