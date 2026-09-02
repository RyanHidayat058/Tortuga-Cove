export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-[#2E438F] text-[#2E438F] shadow-sm focus:ring-indigo-500 ' +
                className
            }
        />
    );
}
