export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl border border-transparent bg-[#2E438F] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-[#091540] focus:outline-none shadow ${
                    disabled && 'opacity-25 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
