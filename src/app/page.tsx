import Link from "next/link";

export const metadata = {
  title: "Real-time Collaborative Board - MahanKabir",
  description:
    "Draw, collaborate, and share your designs in real-time with your team. Invite anyone with a link and start designing together!",
  keywords:
    "real-time, collaborative board, online design, team design, web socket, MahanKabir",
  authors: [{ name: "MahanKabir", url: "https://www.mahankabir.ir" }],
  openGraph: {
    title: "Real-time Collaborative Board",
    description:
      "Draw and collaborate in real-time. Share your board with anyone via a link!",
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
    description:
      "Draw and collaborate in real-time with your team. Invite anyone with a link!",
    images: [`${process.env.NEXT_PUBLIC_FRONTEND_URL}/og-image.png`],
  },
};

export default function Home() {
  return (
    <main className="relative flex h-screen justify-center items-center bg-cyan-50 px-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 p-4">
        <Link
          className="
            bg-cyan-500
            rounded-lg
            text-cyan-950
            shadow-xl
            hover:shadow-lg
            hover:bg-cyan-600
            hover:text-cyan-100
            transition
            text-center
            w-full sm:w-auto
            px-6 py-6 text-lg
            sm:px-12 sm:py-10 sm:text-2xl
            md:px-20 md:py-14 md:text-3xl
          "
          href={`/board/${crypto.randomUUID().split("-")[0]}`}
        >
          <strong>Go as a Teacher</strong>
        </Link>

        <Link
          className="
            bg-lime-400
            rounded-lg
            text-lime-950
            shadow-xl
            hover:shadow-lg
            hover:bg-lime-600
            hover:text-lime-100
            transition
            text-center
            w-full sm:w-auto
            px-6 py-6 text-lg
            sm:px-12 sm:py-10 sm:text-2xl
            md:px-20 md:py-14 md:text-3xl
          "
          href={`/board/${crypto.randomUUID().split("-")[0]}`}
        >
          <strong>Go as a Student</strong>
        </Link>
      </div>

      <div className="absolute bottom-4 text-xs sm:text-sm text-cyan-950/70 text-center space-y-1">
        <div>
          Powered by{" "}
          <a
            href="https://www.mahankabir.ir"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:underline"
          >
            Mahan Kabir
          </a>
        </div>

        <div className="flex justify-center gap-3">
          <a
            href="https://www.linkedin.com/in/mahankabir"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            LinkedIn
          </a>
          <span>•</span>
          <a
            href="https://github.com/board-projects"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
