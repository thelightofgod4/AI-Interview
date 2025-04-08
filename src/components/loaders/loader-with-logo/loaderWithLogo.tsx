import styles from "./loader.module.css";
import Image from "next/image";

function LoaderWithLogo() {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Image
        src="/loading-time.png"
        alt="logo"
        width={200}
        height={200}
        className="object-cover object-center mx-auto mb-4"
      />
      <div className="flex flex-row items-center mx-auto">
        {/* <p>Let us take a .....</p> */}
        <div className={styles.loader} />
      </div>
    </div>
  );
}

export default LoaderWithLogo;
