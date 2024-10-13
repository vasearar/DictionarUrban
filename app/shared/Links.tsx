  'use client'
  
  import React, { useEffect, useState } from 'react';
  import Link from 'next/link';
  import { useSession, signOut } from 'next-auth/react';
  import Image from 'next/image';
  import { usePathname } from 'next/navigation';

  const Links = () => {
    const [isDark, setIsDark] = useState(false);
    const [isActive, setActive] = useState(false);
    const [html, setHtml] = useState<HTMLHtmlElement | null>(null);
    const [userRole, setUserRole] = useState("user");
    const session = useSession();
    const pathname = usePathname();

    async function userExist() {
      try {
        const response = await fetch(`/api/contact?email=${session.data?.user?.email}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const res = await response.json();
        setUserRole(res.role);
        if (response.status === 201) {
          signOut({ callbackUrl: "/" });
        }
      } catch (error) {
        console.log(
          "There was a problem with the fetch operation: ", error
        );
      }
    }
    
    if (session?.data){
      userExist();
    }
    
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const element = typeof window !== 'undefined' ? document.querySelector('html') : null;
        setHtml(element);
      }
    }, []);

    function handleToggle(){
      if (isDark == false){
        setIsDark(true);
        html!.classList.add("invert");
      } else {
        setIsDark(false);
        html!.classList.remove("invert");
      }
    }
    

    function handleMenu(){
      const burger = document.querySelector(".burger");
      const body = document.querySelector("body");
      body!.classList.toggle("overflow-hidden");
      body!.classList.toggle("h-screen");
      burger!.classList.toggle("change");
      setActive(!isActive);
      body!.addEventListener("scroll", (e) => {
        e.preventDefault();
      })
    }
    
    const backgroundImage = isDark ? '/moon.svg' : '/sun.svg';
    return (
      <>
        <ul className='items-center hidden text-mygray gap-8 text-nowrap font-Spacegrotesc font-bold ml-[8.5vw] lg:flex'>
          <li className='md:ml-14'>
            <Link className={`${pathname.includes("/define") ? "current" : ""} flex items-center gap-2 hover:opacity-75`} href="/define">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.6667 7.95242H7.95242V13.6667H6.04766V7.95242H0.333374V6.04766H6.04766V0.333374H7.95242V6.04766H13.6667V7.95242Z" fill="#202020"/>
              </svg>
              Adaugă cuvânt
            </Link>
          </li>
          <li>
            <Link className='flex items-center hover:opacity-75' href="https://buymeacoffee.com/dexurban.md">
              <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4773 4.27664L11.3893 3.83264C11.31 3.43397 11.1307 3.05731 10.722 2.91331C10.5907 2.86731 10.442 2.84797 10.342 2.75264C10.2407 2.65731 10.2113 2.50864 10.188 2.37131C10.1447 2.11931 10.1047 1.86731 10.06 1.61597C10.022 1.39931 9.99199 1.15597 9.89333 0.957974C9.76333 0.691307 9.49533 0.535307 9.22933 0.432641C9.0928 0.381593 8.95346 0.338411 8.81199 0.303307C8.14533 0.127974 7.44533 0.0633073 6.76066 0.0259739C5.93851 -0.0192302 5.11417 -0.00541698 4.29399 0.0673073C3.68399 0.122641 3.04066 0.189974 2.46066 0.400641C2.24866 0.477974 2.02999 0.571307 1.86866 0.734641C1.67066 0.935974 1.60666 1.24797 1.75066 1.49864C1.85333 1.67664 2.02733 1.80264 2.21199 1.88531C2.45199 1.99331 2.70333 2.07464 2.96066 2.12931C3.67733 2.28797 4.41999 2.34997 5.15199 2.37597C5.96399 2.40931 6.77666 2.38264 7.58533 2.29731C7.78466 2.27531 7.98399 2.24864 8.18266 2.21797C8.41733 2.18197 8.56799 1.87597 8.49866 1.66197C8.41599 1.40664 8.19399 1.30797 7.94266 1.34664C7.63199 1.39597 7.30266 1.41864 7.02133 1.44397C6.23666 1.49731 5.44933 1.49864 4.66399 1.44797C4.40631 1.43092 4.14911 1.40714 3.89266 1.37664C3.83533 1.36997 3.77266 1.35997 3.72066 1.35264C3.55866 1.32864 3.39799 1.29931 3.23799 1.26597C3.16399 1.24797 3.16399 1.14264 3.23799 1.12464H3.24133C3.42599 1.08464 3.61266 1.05264 3.79999 1.02664H3.80133C3.88866 1.02064 3.97666 1.00531 4.06399 0.994641C4.82261 0.915904 5.58573 0.889175 6.34799 0.914641C6.79733 0.927307 7.24599 0.959307 7.69266 1.01064L7.84466 1.03131C8.02266 1.05797 8.19999 1.08997 8.37666 1.12797C8.63799 1.18464 8.97333 1.20331 9.08999 1.48931C9.12666 1.58064 9.14333 1.68131 9.16399 1.77664L9.37666 2.76597C9.38117 2.78719 9.38126 2.8091 9.37694 2.83035C9.37261 2.8516 9.36396 2.87174 9.35151 2.8895C9.33907 2.90726 9.3231 2.92227 9.3046 2.93359C9.2861 2.94491 9.26547 2.9523 9.24399 2.95531H9.24199C9.21733 2.95931 9.19199 2.96197 9.16733 2.96531C8.11868 3.0991 7.06247 3.16479 6.00533 3.16197C4.95786 3.16089 3.91153 3.0932 2.87266 2.95931C2.77933 2.94797 2.67733 2.93131 2.59466 2.91931C2.37733 2.88731 2.16199 2.84731 1.94599 2.81197C1.68399 2.76864 1.43399 2.79064 1.19733 2.91931C1.00399 3.02597 0.845994 3.18864 0.747327 3.38664C0.644661 3.59731 0.614661 3.82664 0.569328 4.05331C0.523328 4.27997 0.451994 4.52464 0.479328 4.75731C0.537328 5.25931 0.887994 5.66731 1.39266 5.75864C3.8883 6.20401 6.435 6.28843 8.95466 6.00931C9.00253 6.00386 9.05101 6.00923 9.09653 6.02501C9.14205 6.04079 9.18345 6.06658 9.21768 6.10049C9.25191 6.1344 9.27809 6.17555 9.2943 6.22092C9.3105 6.26629 9.31632 6.31472 9.31133 6.36264L9.26399 6.82731L8.58533 13.432C8.55799 13.7053 8.55399 13.9866 8.50199 14.2566C8.42066 14.6813 8.13333 14.942 7.71399 15.0373C7.32933 15.1246 6.93733 15.1706 6.54333 15.174C6.10599 15.1766 5.66999 15.1573 5.23266 15.1593C4.76666 15.162 4.19533 15.1193 3.83599 14.7726C3.51933 14.4673 3.47599 13.99 3.43266 13.5773L2.94533 8.90197L2.73066 6.83931C2.70599 6.60531 2.53999 6.37597 2.27866 6.38731C2.05466 6.39731 1.79999 6.58731 1.82666 6.83997L1.97866 8.29664L2.61133 14.3713C2.70933 15.2673 3.39399 15.75 4.24199 15.886C4.73666 15.966 5.24399 15.982 5.74666 15.99C6.39066 16.0006 7.04133 16.0253 7.67466 15.9086C8.61333 15.7366 9.31799 15.11 9.41866 14.1373C9.64533 11.916 9.87399 9.69531 10.1013 7.47397L10.2447 6.08264C10.2517 6.01365 10.2808 5.94876 10.3277 5.89761C10.3745 5.84645 10.4366 5.81175 10.5047 5.79864C10.7727 5.74664 11.0293 5.65731 11.2207 5.45331C11.524 5.12797 11.5847 4.70464 11.4773 4.27664ZM10.492 4.79131C10.3953 4.88264 10.25 4.92531 10.1067 4.94664C8.49599 5.18597 6.86266 5.30664 5.23466 5.25331C4.06933 5.21331 2.91666 5.08397 1.76333 4.92131C1.64999 4.90531 1.52799 4.88464 1.44999 4.80131C1.30333 4.64397 1.37599 4.32797 1.41399 4.13797C1.44866 3.96464 1.51533 3.73197 1.72266 3.70731C2.04533 3.66931 2.41999 3.80597 2.73999 3.85397C3.12466 3.91264 3.51066 3.95997 3.89799 3.99531C5.55133 4.14597 7.23266 4.12197 8.87933 3.90197C9.17933 3.86197 9.47866 3.81531 9.77599 3.76197C10.042 3.71397 10.336 3.62464 10.496 3.89931C10.6067 4.08664 10.6213 4.33731 10.604 4.54864C10.5987 4.64093 10.5584 4.72773 10.4913 4.79131H10.492ZM6.38599 7.39131C5.81133 7.63797 5.15933 7.91664 4.31333 7.91664C3.95973 7.91578 3.60788 7.86712 3.26733 7.77197L3.85199 13.7746C3.89533 14.2946 4.32999 14.6946 4.85199 14.6946C4.85199 14.6946 5.68066 14.738 5.95733 14.738C6.25533 14.738 7.14799 14.6946 7.14799 14.6946C7.66999 14.6946 8.10399 14.2946 8.14733 13.7746L8.77399 7.14131C8.49127 7.03907 8.19329 6.98542 7.89266 6.98264C7.34199 6.98264 6.89866 7.17197 6.38599 7.39131Z" fill="#202020"/>
              </svg>
              <span className='ml-2'></span>Donează <span className='hidden text-mygray 2xl:block'>&nbsp;pe Buy Me a Coffee</span>
            </Link>
          </li>
          <li>
          </li> 
          {session?.data ? 
          <li><Link className={`text-mywhite py-[10px] hover:bg-myhoverorange mydropshadow px-4 bg-myorange rounded-sm border-mygray border-solid border-2 relative rounded-br-none transition-all`} href="/dashboard">Contul meu</Link></li> : 
          <li><Link className={`text-mywhite py-[10px] hover:bg-myhoverorange mydropshadow px-4 bg-myorange rounded-sm border-mygray border-solid border-2 relative rounded-br-none transition-all`} href="/signIn">Conectează-te </Link></li>}
          {/* <label className={`switch rounded-sm border-mygray border-2 mydropshadow`}>
            <input id='toggle' type="checkbox" onChange={handleToggle} />
            <span className="slider">
              <div className='mover border-mygray rounded-sm border flex items-center justify-center'>
                <Image width={0} height={0} className='select-none w-fit h-fit' src={backgroundImage} alt="sun/moon" />
              </div>
            </span>
          </label> */}
          {(userRole === "moderator" || userRole === "admin") && (
            <div className='hidden md:flex absolute top-0 right-0'>
              <Link href="/moderator" className=''>Moderează</Link>
              {(userRole === "admin") && (
                <>
                  <p>&nbsp;|&nbsp;</p>
                  <Link href="/admin">Admin</Link> 
                </>
              )} 
            </div>
          )}
        </ul>
        <div onClick={handleMenu} className='burger flex flex-col ml-6 gap-1 z-50 lg:hidden transition-all cursor-pointer'>
            <div className='md:w-7 w-[18px] transition-all md:h-1 h-[2px] bg-mygray bar1'></div>
            <div className='md:w-7 w-[18px] transition-all md:h-1 h-[2px] bg-mygray bar2'></div>
            <div className='md:w-7 w-[18px] transition-all md:h-1 h-[2px] bg-mygray bar3'></div>
        </div>
        <div className={`absolute bottom-0 md:top-full left-0 w-full lg:hidden h-[calc(100%-8.8px)] md:h-[calc(100vh-5.5rem)] z-40 ${isActive ? "flex active" : "not-active"} menuself bg-mywhite`}>
          <div className={`relative flex flex-col justify-end w-full gap-y-8 h-full p-3 ${isActive ? "active" : ""}`}>
           <Link onClick={handleMenu} className={`${["/define", "/dashboard"].includes(pathname) ? "" : "current"} imp w-full text-2xl vs:text-3xl flex justify-between text-nowrap items-center`} href="/">
            Acasă
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.333171 8.6665L0.333171 11.3332L16.3332 11.3332L16.3332 13.9998L18.9998 13.9998L18.9998 11.3332L21.6665 11.3332L21.6665 8.6665L18.9998 8.6665L18.9998 5.99984L16.3332 5.99984L16.3332 8.6665L0.333171 8.6665ZM13.6665 3.33317L16.3332 3.33317L16.3332 5.99984L13.6665 5.99984L13.6665 3.33317ZM13.6665 3.33317L10.9998 3.33317L10.9998 0.666503L13.6665 0.666504L13.6665 3.33317ZM13.6665 16.6665L16.3332 16.6665L16.3332 13.9998L13.6665 13.9998L13.6665 16.6665ZM13.6665 16.6665L10.9998 16.6665L10.9998 19.3332L13.6665 19.3332L13.6665 16.6665Z" fill="#202020"/>
            </svg> 
          </Link>
          {(userRole === "moderator" || userRole === "admin") && (
            <div className='flex md:hidden absolute left-0 top-[50px]'>
              <Link href="/moderator" className=''>Moderează</Link>
              {(userRole === "admin") && (
                <>
                  <p>&nbsp;|&nbsp;</p>
                  <Link href="/admin">Admin</Link> 
                </>
              )} 
            </div>
          )}
           <Link onClick={handleMenu} className={`${pathname.includes("/define") ? "current" : ""} imp w-full text-2xl vs:text-3xl flex justify-between text-nowrap items-center`} href="define">
             Adaugă cuvânt
             <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M0.333171 8.6665L0.333171 11.3332L16.3332 11.3332L16.3332 13.9998L18.9998 13.9998L18.9998 11.3332L21.6665 11.3332L21.6665 8.6665L18.9998 8.6665L18.9998 5.99984L16.3332 5.99984L16.3332 8.6665L0.333171 8.6665ZM13.6665 3.33317L16.3332 3.33317L16.3332 5.99984L13.6665 5.99984L13.6665 3.33317ZM13.6665 3.33317L10.9998 3.33317L10.9998 0.666503L13.6665 0.666504L13.6665 3.33317ZM13.6665 16.6665L16.3332 16.6665L16.3332 13.9998L13.6665 13.9998L13.6665 16.6665ZM13.6665 16.6665L10.9998 16.6665L10.9998 19.3332L13.6665 19.3332L13.6665 16.6665Z" fill="#202020"/>
             </svg>
           </Link>
           {session?.data ?
            <Link onClick={handleMenu} className={`${pathname.includes("/dashboard") ? "current" : ""} imp w-full text-2xl vs:text-3xl flex justify-between text-nowrap items-center`} href="dashboard">
             Contul meu
             <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M0.333171 8.6665L0.333171 11.3332L16.3332 11.3332L16.3332 13.9998L18.9998 13.9998L18.9998 11.3332L21.6665 11.3332L21.6665 8.6665L18.9998 8.6665L18.9998 5.99984L16.3332 5.99984L16.3332 8.6665L0.333171 8.6665ZM13.6665 3.33317L16.3332 3.33317L16.3332 5.99984L13.6665 5.99984L13.6665 3.33317ZM13.6665 3.33317L10.9998 3.33317L10.9998 0.666503L13.6665 0.666504L13.6665 3.33317ZM13.6665 16.6665L16.3332 16.6665L16.3332 13.9998L13.6665 13.9998L13.6665 16.6665ZM13.6665 16.6665L10.9998 16.6665L10.9998 19.3332L13.6665 19.3332L13.6665 16.6665Z" fill="#202020"/>
             </svg>
            </Link> : 
            <Link onClick={handleMenu} className="imp w-full text-2xl vs:text-3xl flex justify-between text-nowrap items-center" href="signIn">
             Conectează-te
             <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M0.333171 8.6665L0.333171 11.3332L16.3332 11.3332L16.3332 13.9998L18.9998 13.9998L18.9998 11.3332L21.6665 11.3332L21.6665 8.6665L18.9998 8.6665L18.9998 5.99984L16.3332 5.99984L16.3332 8.6665L0.333171 8.6665ZM13.6665 3.33317L16.3332 3.33317L16.3332 5.99984L13.6665 5.99984L13.6665 3.33317ZM13.6665 3.33317L10.9998 3.33317L10.9998 0.666503L13.6665 0.666504L13.6665 3.33317ZM13.6665 16.6665L16.3332 16.6665L16.3332 13.9998L13.6665 13.9998L13.6665 16.6665ZM13.6665 16.6665L10.9998 16.6665L10.9998 19.3332L13.6665 19.3332L13.6665 16.6665Z" fill="#202020"/>
             </svg>
           </Link>}
           <Link onClick={handleMenu} className="imp w-full text-2xl vs:text-3xl flex justify-between text-nowrap items-center" href="https://buymeacoffee.com/dexurban.md">
             Donează
             <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.333171 8.6665L0.333171 11.3332L16.3332 11.3332L16.3332 13.9998L18.9998 13.9998L18.9998 11.3332L21.6665 11.3332L21.6665 8.6665L18.9998 8.6665L18.9998 5.99984L16.3332 5.99984L16.3332 8.6665L0.333171 8.6665ZM13.6665 3.33317L16.3332 3.33317L16.3332 5.99984L13.6665 5.99984L13.6665 3.33317ZM13.6665 3.33317L10.9998 3.33317L10.9998 0.666503L13.6665 0.666504L13.6665 3.33317ZM13.6665 16.6665L16.3332 16.6665L16.3332 13.9998L13.6665 13.9998L13.6665 16.6665ZM13.6665 16.6665L10.9998 16.6665L10.9998 19.3332L13.6665 19.3332L13.6665 16.6665Z" fill="#202020"/>
             </svg>
           </Link>
           <div className='anim flex justify-center w-full gap-8 my-8'>
              <Link href="#" target='_blank' className='flex gap-2'>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 6.54541C10.5533 6.54541 9.16594 7.12008 8.14301 8.14301C7.12008 9.16594 6.54541 10.5533 6.54541 12C6.54541 13.4466 7.12008 14.834 8.14301 15.8569C9.16594 16.8798 10.5533 17.4545 12 17.4545C13.4466 17.4545 14.834 16.8798 15.8569 15.8569C16.8798 14.834 17.4545 13.4466 17.4545 12C17.4545 10.5533 16.8798 9.16594 15.8569 8.14301C14.834 7.12008 13.4466 6.54541 12 6.54541ZM8.72723 12C8.72723 12.8679 9.07203 13.7004 9.68579 14.3141C10.2995 14.9279 11.132 15.2727 12 15.2727C12.8679 15.2727 13.7004 14.9279 14.3141 14.3141C14.9279 13.7004 15.2727 12.8679 15.2727 12C15.2727 11.132 14.9279 10.2995 14.3141 9.68579C13.7004 9.07203 12.8679 8.72723 12 8.72723C11.132 8.72723 10.2995 9.07203 9.68579 9.68579C9.07203 10.2995 8.72723 11.132 8.72723 12Z" fill="#202020"/>
                  <path d="M18.5455 4.36353C18.2562 4.36353 17.9787 4.47846 17.7741 4.68305C17.5695 4.88763 17.4546 5.16511 17.4546 5.45443C17.4546 5.74376 17.5695 6.02124 17.7741 6.22582C17.9787 6.43041 18.2562 6.54534 18.5455 6.54534C18.8348 6.54534 19.1123 6.43041 19.3169 6.22582C19.5215 6.02124 19.6364 5.74376 19.6364 5.45443C19.6364 5.16511 19.5215 4.88763 19.3169 4.68305C19.1123 4.47846 18.8348 4.36353 18.5455 4.36353Z" fill="#202020"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M4.36364 0C3.20633 0 2.09642 0.459739 1.27808 1.27808C0.459739 2.09642 0 3.20633 0 4.36364V19.6364C0 20.7937 0.459739 21.9036 1.27808 22.7219C2.09642 23.5403 3.20633 24 4.36364 24H19.6364C20.7937 24 21.9036 23.5403 22.7219 22.7219C23.5403 21.9036 24 20.7937 24 19.6364V4.36364C24 3.20633 23.5403 2.09642 22.7219 1.27808C21.9036 0.459739 20.7937 0 19.6364 0H4.36364ZM19.6364 2.18182H4.36364C3.78498 2.18182 3.23003 2.41169 2.82086 2.82086C2.41169 3.23003 2.18182 3.78498 2.18182 4.36364V19.6364C2.18182 20.215 2.41169 20.77 2.82086 21.1791C3.23003 21.5883 3.78498 21.8182 4.36364 21.8182H19.6364C20.215 21.8182 20.77 21.5883 21.1791 21.1791C21.5883 20.77 21.8182 20.215 21.8182 19.6364V4.36364C21.8182 3.78498 21.5883 3.23003 21.1791 2.82086C20.77 2.41169 20.215 2.18182 19.6364 2.18182Z" fill="#202020"/>
                </svg>
                Instagram
              </Link>
              <Link href="#" target='_blank' className='flex gap-2'>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.3333 0H2.66667C1.2 0 0 1.2 0 2.66667V21.3333C0 22.8013 1.2 24 2.66667 24H12V14.6667H9.33333V11.3667H12V8.63333C12 5.748 13.616 3.72133 17.0213 3.72133L19.4253 3.724V7.19733H17.8293C16.504 7.19733 16 8.192 16 9.11467V11.368H19.424L18.6667 14.6667H16V24H21.3333C22.8 24 24 22.8013 24 21.3333V2.66667C24 1.2 22.8 0 21.3333 0Z" fill="#202020"/>
                </svg>
                Facebook
              </Link>
           </div>
          </div> 
        </div>
      </>
    )   
  }

  export default Links