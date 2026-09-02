import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });
    const [theme] = useTheme();
    const isDark = theme === 'dark';

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const inputClass = isDark
        ? 'mt-1 block w-full bg-[#091540] border-white/30 text-white placeholder-white/40 focus:border-[#A6B9FF] focus:ring-[#A6B9FF] py-2 px-3.5 text-sm font-bold'
        : 'mt-1 block w-full bg-white border-[#2E438F] text-[#091540] placeholder-[#2E438F]/50 focus:border-[#091540] focus:ring-[#091540] py-2 px-3.5 text-sm font-bold';

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6 text-center">
                <h2 className={`text-xl font-black font-mono uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                    Welcome Back, Matey!
                </h2>
                <p className={`text-xs font-bold mt-1.5 ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                    Enter your credentials to board the ship.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-bold text-emerald-400 border border-emerald-500/40 bg-emerald-950/40 p-3 rounded-xl text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <InputLabel htmlFor="login" value="Username / Email" className={isDark ? 'text-white' : 'text-[#091540]'} />

                    <TextInput
                        id="login"
                        type="text"
                        name="login"
                        value={data.login}
                        className={inputClass}
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('login', e.target.value)}
                        placeholder="e.g. Blackbeard or captain@cove.com"
                        required
                    />

                    <InputError message={errors.login} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className={isDark ? 'text-white' : 'text-[#091540]'} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={inputClass}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className={`rounded border-2 ${isDark ? 'bg-[#091540] border-white/40 text-[#2E438F]' : 'bg-white border-[#2E438F] text-[#2E438F]'}`}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className={`ms-2 text-xs font-bold ${isDark ? 'text-white/90' : 'text-[#091540]'}`}>
                            Remember my ship
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className={`text-xs font-bold underline transition ${isDark ? 'text-[#A6B9FF] hover:text-white' : 'text-[#2E438F] hover:text-[#091540]'}`}
                        >
                            Forgot key?
                        </Link>
                    )}
                </div>

                <div className="mt-3 flex flex-col gap-3">
                    <PrimaryButton
                        className={`w-full justify-center py-3 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition shadow-md ${
                            isDark
                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                        }`}
                        disabled={processing}
                    >
                        ⛵ Set Sail
                    </PrimaryButton>

                    <div className="text-center mt-1">
                        <Link
                            href={route('register')}
                            className={`text-xs font-bold underline transition ${
                                isDark ? 'text-[#A6B9FF] hover:text-white' : 'text-[#2E438F] hover:text-[#091540]'
                            }`}
                        >
                            Need an account? Sign up
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
