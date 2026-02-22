import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignInPage() {
    return (
        <SignIn
            appearance={{
                baseTheme: dark,
                elements: {
                    card: "bg-transparent shadow-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton:
                        "bg-white/10 border-white/10 text-white hover:bg-white/20",
                    formFieldInput:
                        "bg-white/5 border-white/10 text-white placeholder:text-zinc-500",
                    formButtonPrimary:
                        "bg-cyan-500 hover:bg-cyan-600 text-white rounded-full",
                    footerActionLink: "text-cyan-400 hover:text-cyan-300",
                    formFieldLabel: "text-zinc-400",
                },
            }}
        />
    );
}
