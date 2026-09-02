import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });
    const [theme] = useTheme();
    const isDark = theme === 'dark';

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    const inputClass = isDark
        ? 'mt-1 block w-full bg-[#091540] border-white/30 text-white placeholder-white/40 focus:border-[#A6B9FF] focus:ring-[#A6B9FF] py-2 px-3.5 text-sm font-bold'
        : 'mt-1 block w-full bg-white border-[#2E438F] text-[#091540] placeholder-[#2E438F]/50 focus:border-[#091540] focus:ring-[#091540] py-2 px-3.5 text-sm font-bold';

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-6 text-center">
                <h2 className={`text-xl font-black font-mono uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                    Lost Secret Key?
                </h2>
                <p className={`mt-1.5 text-xs font-bold leading-relaxed ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                    Enter your email address and we'll dispatch a messenger bird with a reset link.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-bold text-emerald-400 border border-emerald-500/40 bg-emerald-950/40 p-3 rounded-xl text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className={isDark ? 'text-white' : 'text-[#091540]'} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={inputClass}
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="captain@cove.com"
                        required
                    />

                    <InputError message={errors.email} className="mt-1.5" />
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
                        Send Reset Link
                    </PrimaryButton>

                    <div className="text-center mt-1">
                        <Link
                            href={route('login')}
                            className={`text-xs font-bold underline transition ${
                                isDark ? 'text-[#A6B9FF] hover:text-white' : 'text-[#2E438F] hover:text-[#091540]'
                            }`}
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
