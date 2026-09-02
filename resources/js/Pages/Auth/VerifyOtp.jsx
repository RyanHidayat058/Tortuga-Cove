import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';

export default function VerifyOtp({ status, email, devOtp }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
    });
    const [theme] = useTheme();
    const isDark = theme === 'dark';

    const submit = (e) => {
        e.preventDefault();

        post(route('otp.verify.store'), {
            onFinish: () => reset('code'),
        });
    };

    const resendCode = (e) => {
        e.preventDefault();
        post(route('otp.resend'));
    };

    const inputClass = isDark
        ? 'mt-1 block w-full bg-[#091540] border-white/30 text-white placeholder-white/40 focus:border-[#A6B9FF] focus:ring-[#A6B9FF] py-2.5 px-3.5 text-center text-2xl tracking-widest font-mono font-black'
        : 'mt-1 block w-full bg-white border-[#2E438F] text-[#091540] placeholder-[#2E438F]/50 focus:border-[#091540] focus:ring-[#091540] py-2.5 px-3.5 text-center text-2xl tracking-widest font-mono font-black';

    return (
        <GuestLayout>
            <Head title="Security Verification" />

            <div className="mb-6 text-center">
                <span className="text-4xl block mb-2">⚓</span>
                <h2 className={`text-xl font-black font-mono uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                    Captain's Verification
                </h2>
                <p className={`mt-1 text-xs font-bold ${isDark ? 'text-white/80' : 'text-[#2E438F]'}`}>
                    A verification code has been dispatched to <span className={`font-black ${isDark ? 'text-[#A6B9FF]' : 'text-[#091540]'}`}>{email}</span>.
                </p>
            </div>

            {status && (
                <div className="mb-4 text-xs font-bold text-emerald-400 border border-emerald-500/40 bg-emerald-950/40 p-3 rounded-xl text-center">
                    {status}
                </div>
            )}

            {devOtp && (
                <div className={`mb-6 border-2 p-4 rounded-xl text-xs font-bold ${
                    isDark
                        ? 'border-white/20 bg-[#2E438F]/30 text-white'
                        : 'border-[#2E438F] bg-[#A6B9FF]/20 text-[#091540]'
                }`}>
                    <p className="font-black mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                        <span>🏴‍☠️</span> Intercepted Carrier Pigeon (Local Dev Only):
                    </p>
                    <p>
                        Your secret OTP code is: <strong className="text-xl tracking-widest font-mono font-black select-all ml-1 underline">{devOtp}</strong>
                    </p>
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <InputLabel htmlFor="code" value="Verification Code" className={isDark ? 'text-white' : 'text-[#091540]'} />

                    <TextInput
                        id="code"
                        type="text"
                        name="code"
                        value={data.code}
                        className={inputClass}
                        isFocused={true}
                        maxLength={6}
                        placeholder="000000"
                        onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                        required
                    />

                    <InputError message={errors.code} className="mt-1.5" />
                </div>

                <div className="mt-2 flex flex-col gap-3 items-center">
                    <PrimaryButton
                        className={`w-full justify-center py-3 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition shadow-md ${
                            isDark
                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                        }`}
                        disabled={processing}
                    >
                        Verify Code
                    </PrimaryButton>

                    <button
                        type="button"
                        onClick={resendCode}
                        className={`text-xs font-bold underline transition ${
                            isDark ? 'text-[#A6B9FF] hover:text-white' : 'text-[#2E438F] hover:text-[#091540]'
                        }`}
                    >
                        Resend Verification Code
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
