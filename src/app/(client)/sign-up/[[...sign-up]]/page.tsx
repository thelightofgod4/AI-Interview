import { SignUp } from "@clerk/nextjs";

function SignUpPage() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white absolute top-0 left-0 z-50">
      <div className="w-full max-w-md px-4">
        <SignUp forceRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}

export default SignUpPage;
