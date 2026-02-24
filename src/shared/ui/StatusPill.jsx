const variants = {
    green: {
        bgColor: "bg-green-500",
        glowBg: "bg-gradient-to-br from-white to-green-500",
        hoverShadow: "group-hover:shadow-green-500/50",
    },
    red: {
        bgColor: "bg-red-500",
        glowBg: "bg-gradient-to-br from-white to-red-500",
        hoverShadow: "group-hover:shadow-red-500/50",
    },
    yellow: {
        bgColor: "bg-yellow-500",
        glowBg: "bg-gradient-to-br from-white to-yellow-500",
        hoverShadow: "group-hover:shadow-yellow-500/50",
    },
    blue: {
        bgColor: "bg-blue-500",
        glowBg: "bg-gradient-to-br from-white to-blue-500",
        hoverShadow: "group-hover:shadow-blue-500/50",
    },
    orange: {
        bgColor: "bg-orange-500",
        glowBg: "bg-gradient-to-br from-white to-orange-500",
        hoverShadow: "group-hover:shadow-orange-500/50",
    }
};

function StatusPill({ children, variant = "green" }) {
    const variantStyles = variants[variant] || variants.green;
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border border-gray-200 ${variantStyles.bgColor} text-white`}>
            {children}
        </span>
    );
}

export default StatusPill;
