import Image from "next/image";
import { EntryActions } from "@/features/main/components/EntryActions";

export const metadata = {
  title: "Real-time Collaborative Board - DeQuizMa",
  description:
    "Draw, collaborate, and share your designs in real-time with your team. Invite anyone with a link and start designing together!",
  keywords:
    "real-time, collaborative board, online design, team design, web socket, MahanKabir",
  authors: [{ name: "MahanKabir", url: "https://www.mahankabir.com" }],
  openGraph: {
    title: "Real-time Collaborative Board",
    description:
      "Draw and collaborate in real-time. Share your board with anyone via a link!",
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}`,
    siteName: "DeQuizMa",
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
    <main className="relative flex h-screen w-screen justify-center items-center bg-cyan-50 px-4 overflow-hidden">
      
      <section className="text-center py-20 z-10 backdrop-blur-[2px] p-6 rounded-2xl">
        <h1 className="text-5xl font-extrabold text-cyan-950">Welcome to Collaborative Board</h1>
        <p className="text-cyan-800/80 mt-4 font-medium">The best place for teachers and students.</p>
        
        <EntryActions />
      </section>

      <div className="absolute bottom-4 text-xs sm:text-sm text-cyan-950/70 text-center space-y-1 z-10">
        <div>
          Powered by{" "}
          <a
            href="https://www.mahankabir.com"
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