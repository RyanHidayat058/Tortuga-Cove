export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-xl border-2 border-[#2E438F] bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#091540] shadow-sm transition duration-150 ease-in-out hover:bg-[#A6B9FF]/20 focus:outline-none ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
