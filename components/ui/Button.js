export default function Button({
    children,
    variant = "primary",
    type = "button",
    className = "",
    ...props
}) {
    const baseStyles =
        "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

        const variants = {
            primary:
                "bg-[#02337D] text-white hover:bg-[#01265C] focus:ring-[#02337D]",

            secondary:
                "bg-[#FE7401] text-white hover:bg-[#D85F00] focus:ring-[#FE7401]",

            outline:
                "border border-[#02337D] bg-white text-[#02337D] hover:bg-[#02337D] hover:text-white",

            danger:
                "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

            success:
                "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",

            ghost:
                "bg-transparent text-[#02337D] hover:bg-gray-100",
        };

        return (
            <button
                type={type}
                className={`${baseStyles} ${variants[variant]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
}