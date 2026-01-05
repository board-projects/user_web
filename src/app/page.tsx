import Link from "next/link";

export const metadata = {
    title: "Real-time Collaborative Board - MahanKabir",
    description: "Draw, collaborate, and share your designs in real-time with your team. Invite anyone with a link and start designing together!",
    keywords: "real-time, collaborative board, online design, team design, web socket, MahanKabir",
    authors: [{ name: "MahanKabir", url: "https://www.mahankabir.ir" }],
    openGraph: {
        title: "Real-time Collaborative Board",
        description: "Draw and collaborate in real-time. Share your board with anyone via a link!",
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}`,
        siteName: "Dr. Monk",
        images: [
            {
                url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/og-image.png`,
                width: 1200,
                height: 630,
                alt: "Collaborative Board Screenshot",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Real-time Collaborative Board",
        description: "Draw and collaborate in real-time with your team. Invite anyone with a link!",
        images: [`${process.env.NEXT_PUBLIC_FRONTEND_URL}/og-image.png`],
    },
};

export default function Home() {

    return (
        <main className="relative flex h-screen justify-center items-center bg-cyan-50 px-4">
            <Link
                className="
                    absolute
                    bg-cyan-500
                    rounded-lg
                    text-cyan-950
                    shadow-xl
                    hover:shadow-lg
                    hover:bg-cyan-600
                    hover:text-cyan-100
                    transition
                    px-6 py-6 text-lg
                    sm:px-12 sm:py-10 sm:text-2xl
                    md:px-24 md:py-16 md:text-3xl
                    lg:px-40 lg:py-24 lg:text-4xl
                "
                href={`/board/${crypto.randomUUID().split("-")[0]}`}
            >
                <strong>Go to the Board</strong>
            </Link>

            <div className="absolute bottom-4 text-xs sm:text-sm text-cyan-950 opacity-70 text-center">
                Powered by{" "}
                <strong>
                    <a
                        href="https://www.mahankabir.ir"
                        target="_blank"
                        className="hover:underline"
                    >
                        Mahan Kabir
                    </a>
                </strong>
            </div>
        </main>
    );
}
