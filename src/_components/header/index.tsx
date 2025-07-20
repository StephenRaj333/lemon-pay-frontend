import Image from "next/image";
import Link from "next/link";

export default function Header () { 
    return (
        <>
            <header>
                <div className="content px-[27px] max-[768px]:px-[27px] py-[50px] max-w-[1440px] mx-auto">
                    <div className="img-wrapper max-w-[329px] max-[786px]:max-w-[220px] max-[768px]:text-center max-[768px]:mx-auto">
                        <Link  href={"https://lemonpay.tech/"} target="_blank">
                            <Image className="max-w-[329px] max-h-[102.51px] max-[768px]:max-w-[220px] max-[768px]:max-h-[68.55px] w-full h-full" src={"/images/logo.png"} width={100} height={100} alt="logo" /> 
                        </Link>
                    </div>        
                </div>      
            </header>
        </>
    )
}

