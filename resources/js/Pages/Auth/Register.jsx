import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        hashtag: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [theme] = useTheme();
    const isDark = theme === 'dark';

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputClass = isDark
        ? 'mt-1 block w-full bg-[#091540] border-white/30 text-white placeholder-white/40 focus:border-[#A6B9FF] focus:ring-[#A6B9FF] py-2 px-3.5 text-sm font-bold'
        : 'mt-1 block w-full bg-white border-[#2E438F] text-[#091540] placeholder-[#2E438F]/50 focus:border-[#091540] focus:ring-[#091540] py-2 px-3.5 text-sm font-bold';

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-6 text-center">
                <h2 className={`text-xl font-black font-mono uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                    Join the Crew!
                </h2>
                <p className={`text-xs font-bold mt-1.5 ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                    Sign up to claim your pirate name and start raiding.
                </p>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                    <InputLabel htmlFor="name" value="Pirate Name (Name)" className={isDark ? 'text-white' : 'text-[#091540]'} />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className={inputClass}
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Captain Edward"
                        required
                    />

                    <InputError message={errors.name} className="mt-1.5" />
                </div>

                <div className="flex gap-3">
                    <div className="flex-1">
                        <InputLabel htmlFor="username" value="Username" className={isDark ? 'text-white' : 'text-[#091540]'} />
                        <TextInput
                            id="username"
                            name="username"
                            value={data.username}
                            className={inputClass}
                            autoComplete="username"
                            onChange={(e) => setData('username', e.target.value.replace(/\s+/g, ''))}
                            placeholder="blackbeard"
                            required
                        />
                        <InputError message={errors.username} className="mt-1.5" />
                    </div>
                    <div className="w-1/3">
                        <InputLabel htmlFor="hashtag" value="Hashtag" className={isDark ? 'text-white' : 'text-[#091540]'} />
                        <div className="relative">
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-black ${isDark ? 'text-white/60' : 'text-[#2E438F]'}`}>#</span>
                            <TextInput
                                id="hashtag"
                                name="hashtag"
                                value={data.hashtag}
                                maxLength={4}
                                className={`${inputClass} pl-7 font-mono uppercase`}
                                onChange={(e) => setData('hashtag', e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())}
                                placeholder="PMPL"
                                required
                            />
                        </div>
                        <InputError message={errors.hashtag} className="mt-1.5" />
                    </div>
                </div>

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
                        placeholder="captain@cove.com"
                        required
                    />

                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Secret Key (Password)" className={isDark ? 'text-white' : 'text-[#091540]'} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={inputClass}
                        autoComplete="new-password"
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
                        id="password_confirmation"
                        type="password"
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

                <div className="mt-3 flex flex-col gap-3">
                    <PrimaryButton
                        className={`w-full justify-center py-3 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition shadow-md ${
                            isDark
                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                        }`}
                        disabled={processing}
                    >
                        🏴‍☠️ Sign Up
                    </PrimaryButton>

                    <div className="text-center mt-1">
                        <Link
                            href={route('login')}
                            className={`text-xs font-bold underline transition ${
                                isDark ? 'text-[#A6B9FF] hover:text-white' : 'text-[#2E438F] hover:text-[#091540]'
                            }`}
                        >
                            Already registered? Log in
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
