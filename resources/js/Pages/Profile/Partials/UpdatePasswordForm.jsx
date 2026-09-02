import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function UpdatePasswordForm({ className = '' }) {
    const [theme] = useTheme();
    const isDark = theme === 'dark';
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const inputClass = isDark
        ? 'mt-1 block w-full bg-[#091540] border-2 border-white/30 text-white rounded-xl focus:border-[#A6B9FF] focus:ring-[#A6B9FF] py-2 px-3 font-bold'
        : 'mt-1 block w-full bg-white border-2 border-[#2E438F] text-[#091540] rounded-xl focus:border-[#091540] focus:ring-[#091540] py-2 px-3 font-bold';

    const labelClass = isDark ? 'text-white font-bold' : 'text-[#091540] font-bold';

    return (
        <section className={className}>
            <header>
                <h2 className={`text-lg font-black font-mono tracking-wider ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                    Update Password
                </h2>

                <p className={`mt-1 text-sm ${isDark ? 'text-white/80' : 'text-[#2E438F]'}`}>
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                        className={labelClass}
                    />

                    <TextInput
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) =>
                            setData('current_password', e.target.value)
                        }
                        type="password"
                        className={inputClass}
                        autoComplete="current-password"
                    />

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" className={labelClass} />

                    <TextInput
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className={inputClass}
                        autoComplete="new-password"
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className={labelClass}
                    />

                    <TextInput
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        type="password"
                        className={inputClass}
                        autoComplete="new-password"
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing} className={isDark ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-2 border-[#A6B9FF]/40' : 'bg-[#2E438F] hover:bg-[#091540] text-white border-2 border-[#091540]'}>
                        Save Password
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-bold text-[#2E438F]">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
