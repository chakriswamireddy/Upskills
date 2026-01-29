import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className=" mt-auto  bg-background/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-lg font-semibold tracking-tight">
              Chakradhar Swamireddy
            </h3>
            <p className="text-sm text-muted-foreground">
              Full-Stack Developer · Building modern web experiences
            </p>
          </div>
          <div className="flex flex-col-reverse  gap-3 items-end">
            <div className=" text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} Chakradhar Swamireddy. All rights
              reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="https://github.com/chakriswamireddy"
                target="_blank"
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
              >
                <Github className="h-4 w-4 group-hover:scale-110 transition" />
                GitHub
              </Link>

              <Link
                href="https://www.linkedin.com/in/chakradhar-swamireddy/"
                target="_blank"
                className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
              >
                <Linkedin className="h-4 w-4 group-hover:scale-110 transition" />
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
