import { SignIn } from "@clerk/nextjs";

function SignInPage() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white absolute top-0 left-0 z-50">
      <div className="w-full max-w-md px-4">
        <SignIn forceRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}

export default SignInPage;
