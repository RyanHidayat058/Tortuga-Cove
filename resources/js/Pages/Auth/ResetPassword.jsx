import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });
    const [theme] = useTheme();
    const isDark = theme === 'dark';

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputClass = isDark
        ? 'mt-1 block w-full bg-[#091540] border-white/30 text-white placeholder-white/40 focus:border-[#A6B9FF] focus:ring-[#A6B9FF] py-2 px-3.5 text-sm font-bold'
        : 'mt-1 block w-full bg-white border-[#2E438F] text-[#091540] placeholder-[#2E438F]/50 focus:border-[#091540] focus:ring-[#091540] py-2 px-3.5 text-sm font-bold';

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="mb-6 text-center">
                <h2 className={`text-xl font-black font-mono uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                    Forge New Secret Key
                </h2>
                <p className={`mt-1.5 text-xs font-bold ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                    Enter your new secret key below to restore access.
                </p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className={isDark ? 'text-white' : 'text-[#091540]'} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={inputClass}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Secret Key (Password)" className={isDark ? 'text-white' : 'text-[#091540]'} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={inputClass}
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Secret Key"
                        className={isDark ? 'text-white' : 'text-[#091540]'}
                    />

                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className={inputClass}
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        placeholder="••••••••"
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5"
                    />
                </div>

                <div className="mt-3">
                    <PrimaryButton
                        className={`w-full justify-center py-3 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition shadow-md ${
                            isDark
                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                        }`}
                        disabled={processing}
                    >
                        Reset Secret Key
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
