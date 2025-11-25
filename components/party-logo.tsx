import Image from "next/image"

interface PartyLogoProps {
  logoUrl?: string | null
  partyName: string
  partyColor: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = {
  sm: { container: "w-6 h-6", text: "text-xs" },
  md: { container: "w-8 h-8", text: "text-sm" },
  lg: { container: "w-12 h-12", text: "text-base" },
}

export function PartyLogo({ logoUrl, partyName, partyColor, size = "md", className = "" }: PartyLogoProps) {
  const sizes = sizeMap[size]

  if (logoUrl) {
    return (
      <div className={`${sizes.container} relative flex items-center justify-center ${className}`}>
        <Image
          src={logoUrl || "/placeholder.svg"}
          alt={`${partyName} logo`}
          fill
          className="object-contain"
          sizes={size === "sm" ? "24px" : size === "md" ? "32px" : "48px"}
        />
      </div>
    )
  }

  return (
    <div
      className={`${sizes.container} rounded-full flex items-center justify-center ${sizes.text} font-bold text-white ${className}`}
      style={{ backgroundColor: partyColor }}
      title={partyName}
    >
      {partyName.substring(0, 2).toUpperCase()}
    </div>
  )
}
