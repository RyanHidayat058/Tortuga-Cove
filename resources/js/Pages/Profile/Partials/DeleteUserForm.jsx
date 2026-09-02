import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function DeleteUserForm({ className = '' }) {
    const [theme] = useTheme();
    const isDark = theme === 'dark';
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    const inputClass = isDark
        ? 'mt-1 block w-3/4 bg-[#091540] border-2 border-white/30 text-white rounded-xl focus:border-[#A6B9FF] focus:ring-[#A6B9FF] py-2 px-3 font-bold'
        : 'mt-1 block w-3/4 bg-white border-2 border-[#2E438F] text-[#091540] rounded-xl focus:border-[#091540] focus:ring-[#091540] py-2 px-3 font-bold';

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-black text-red-500 font-mono tracking-wider">
                    Delete Account
                </h2>

                <p className={`mt-1 text-sm ${isDark ? 'text-white/80' : 'text-[#2E438F]'}`}>
                    Once your account is deleted, all of its resources and data
                    will be permanently deleted. Before deleting your account,
                    please download any data or information that you wish to
                    retain.
                </p>
            </header>

            <DangerButton onClick={confirmUserDeletion} className="bg-red-600 hover:bg-red-500 text-white font-black rounded-xl px-4 py-2.5 shadow">
                Delete Account
            </DangerButton>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className={`p-6 border-2 rounded-2xl ${
                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                }`}>
                    <h2 className="text-lg font-black">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className={`mt-2 text-sm ${isDark ? 'text-white/80' : 'text-[#2E438F]'}`}>
                        Once your account is deleted, all of its resources and
                        data will be permanently deleted. Please enter your
                        password to confirm you would like to permanently delete
                        your account.
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className={inputClass}
                            isFocused
                            placeholder="Password"
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeModal} className="rounded-xl font-bold">
                            Cancel
                        </SecondaryButton>

                        <DangerButton className="bg-red-600 hover:bg-red-500 text-white font-black rounded-xl px-4 py-2 shadow" disabled={processing}>
                            Delete Account
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
