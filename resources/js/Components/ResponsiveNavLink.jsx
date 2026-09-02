import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`w-full flex items-start ps-3 pe-4 py-2 border-l-4 text-base font-bold transition duration-150 ease-in-out focus:outline-none ${
                active
                    ? 'border-white text-white bg-[#091540]'
                    : 'border-transparent text-[#A6B9FF] hover:text-white hover:bg-[#091540]/50'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
