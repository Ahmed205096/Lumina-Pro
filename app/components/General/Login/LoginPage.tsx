"use client";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { signIn } from "next-auth/react";

type Provider = "google" | "github" | "facebook";

function Spinner() {
  return (
    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
  );
}

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);

  const buttons_style = `
    flex cursor-pointer justify-center items-center gap-2 w-full h-[50px] rounded-[10px] border border-white/4
    bg-linear-to-r from-white/4 via-white/20 to-white/4
    bg-size-[700%_100%] bg-position-[100%_0]
    hover:bg-position-[0%_0]
    duration-900 ease-in-out px-4
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  const handleSignIn = (provider: Provider) => {
    if (loadingProvider) return;
    setLoadingProvider(provider);
    signIn(provider);
  };

  return (
    <>
      <div className="flex text-white overflow-clip relative w-full h-full min-h-screen bg-[#13131b] px-4">
        <div className="bg-white/10 absolute w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full left-[-80px] top-[-40px] blur-3xl" />
        <div className="bg-[#322829]/70 absolute w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full right-[-80px] bottom-[-40px] blur-3xl" />

        <div className="bg-white/1 backdrop-blur-4x min-w-full min-h-screen flex justify-center items-center">
          <div className="w-full max-w-[400px] gap-4 sm:gap-2 h-auto sm:h-[450px] min-h-[420px] flex flex-col items-center p-6 sm:p-[30px] bg-white/2 border shadow-[1px_1px_100px_rgba(0,0,0,0.2)] border-white/8 backdrop-blur-2xl rounded-3xl my-auto">
            <h3 className="text-[18px] sm:text-[20px] text-center">
              Welcome to <span className="font-bold">Lumina</span>!
            </h3>
            <h4 className="text-[13px] sm:text-[14px] opacity-80 text-center">
              Let&apos;s get things done.
            </h4>

            <div className="w-full justify-center flex-1 flex flex-col gap-3 sm:gap-4 my-4 sm:my-0">
              <button
                onClick={() => handleSignIn("google")}
                disabled={loadingProvider !== null}
                className={buttons_style}
              >
                <span className="w-full max-w-[200px] flex items-center gap-3 justify-start sm:justify-start">
                  {loadingProvider === "google" ? (
                    <Spinner />
                  ) : (
                    <FcGoogle className="text-xl shrink-0" />
                  )}
                  <span>Continue with Google</span>
                </span>
              </button>

              <button
                onClick={() => handleSignIn("github")}
                disabled={loadingProvider !== null}
                className={buttons_style}
              >
                <span className="w-full max-w-[200px] flex items-center gap-3 justify-start sm:justify-start">
                  {loadingProvider === "github" ? (
                    <Spinner />
                  ) : (
                    <FaGithub className="text-xl shrink-0" />
                  )}
                  <span>Continue with Github</span>
                </span>
              </button>

              <button
                onClick={() => handleSignIn("facebook")}
                disabled={loadingProvider !== null}
                className={buttons_style}
              >
                <span className="w-full flex items-center gap-3 justify-center">
                  {loadingProvider === "facebook" ? (
                    <Spinner />
                  ) : (
                    <FaFacebook className="text-blue-500 text-xl shrink-0" />
                  )}
                  <span>Continue with Facebook</span>
                </span>
              </button>
            </div>

            <p className="text-[11px] sm:text-[12px] text-center px-2 sm:px-[20px] opacity-50 mt-auto">
              By signing in, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
