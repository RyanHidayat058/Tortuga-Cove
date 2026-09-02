import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const [theme] = useTheme();
    const isDark = theme === 'dark';
    const [showErrorModal, setShowErrorModal] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful, clearErrors } =
        useForm({
            name: user.name,
            username: user.username,
            hashtag: user.hashtag || 'PMPL',
            email: user.email,
        });

    useEffect(() => {
        if (errors.username || errors.hashtag) {
            setShowErrorModal(true);
        }
    }, [errors.username, errors.hashtag]);

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const closeErrorModal = () => {
        setShowErrorModal(false);
        clearErrors('username', 'hashtag');
    };

    const inputClass = isDark
        ? 'mt-1 block w-full bg-[#091540] border-2 border-white/30 text-white rounded-xl focus:border-[#A6B9FF] focus:ring-[#A6B9FF] py-2 px-3 font-bold'
        : 'mt-1 block w-full bg-white border-2 border-[#2E438F] text-[#091540] rounded-xl focus:border-[#091540] focus:ring-[#091540] py-2 px-3 font-bold';

    const labelClass = isDark ? 'text-white font-bold' : 'text-[#091540] font-bold';

    return (
        <section className={className}>
            <header>
                <h2 className={`text-lg font-black font-mono tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                    <span>🏴‍☠️</span> Captain's Profile Information
                </h2>

                <p className={`mt-1 text-sm ${isDark ? 'text-white/80' : 'text-[#2E438F]'}`}>
                    Update your pirate's profile information, username, hashtag, and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name (Real Name)" className={labelClass} />
                    <TextInput
                        id="name"
                        className={inputClass}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />
                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                        <InputLabel htmlFor="username" value="Pirate Username" className={labelClass} />
                        <TextInput
                            id="username"
                            className={inputClass}
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2" message={errors.username} />
                    </div>

                    <div>
                        <InputLabel htmlFor="hashtag" value="Hashtag (#)" className={labelClass} />
                        <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#2E438F] font-bold">#</span>
                            <TextInput
                                id="hashtag"
                                className={`${inputClass} pl-8 uppercase font-mono tracking-wider`}
                                value={data.hashtag}
                                maxLength={4}
                                onChange={(e) => setData('hashtag', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                required
                            />
                        </div>
                        <InputError className="mt-2" message={errors.hashtag} />
                    </div>
                </div>

                <div className={`p-3.5 rounded-xl border-2 text-sm font-mono flex items-center justify-between ${
                    isDark ? 'bg-[#2E438F]/30 border-[#A6B9FF]/40 text-white' : 'bg-[#A6B9FF]/20 border-[#2E438F] text-[#091540]'
                }`}>
                    <span>Pirate Tag Preview:</span>
                    <span className="font-black text-lg">{data.username}#{data.hashtag}</span>
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" className={labelClass} />
                    <TextInput
                        id="email"
                        type="email"
                        className={inputClass}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className={`mt-2 text-sm ${isDark ? 'text-white/80' : 'text-[#2E438F]'}`}>
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm underline focus:outline-none ml-1"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-bold text-green-500">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing} className={isDark ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-2 border-[#A6B9FF]/40' : 'bg-[#2E438F] hover:bg-[#091540] text-white border-2 border-[#091540]'}>
                        Save Changes
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm font-bold text-[#2E438F]">
                            Saved successfully.
                        </p>
                    </Transition>
                </div>
            </form>

            <Modal show={showErrorModal} onClose={closeErrorModal} maxWidth="sm">
                <div className={`p-6 rounded-2xl text-center border-2 ${
                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                }`}>
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-lg font-black font-mono tracking-wider mb-2">
                        PIRATE TAG ALREADY TAKEN!
                    </h2>
                    <p className={`text-sm mb-6 ${isDark ? 'text-white/80' : 'text-[#2E438F]'}`}>
                        The pirate tag combination <span className="font-bold">{data.username}#{data.hashtag}</span> is already taken by another pirate! Choose a different username or hashtag.
                    </p>
                    <button
                        onClick={closeErrorModal}
                        className={`w-full font-black uppercase tracking-widest py-2.5 rounded-xl border-2 transition ${
                            isDark 
                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40' 
                                : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                        }`}
                    >
                        Paham (Understood)
                    </button>
                </div>
            </Modal>
        </section>
    );
}
