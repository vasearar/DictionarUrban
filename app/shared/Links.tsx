  'use client'

  import React, { useEffect, useState } from 'react';
  import Link from 'next/link';
  import { useSession, signOut } from 'next-auth/react';
  import Image from 'next/image';

  const Links = () => {
    const session = useSession();
    const [isDark, setisDark] = useState<Boolean>();

    const [isChecked, setIsChecked] = useState(() => {
      if (typeof window !== 'undefined') {
        const storedValue = localStorage.getItem('darkMode');
        return storedValue ? JSON.parse(storedValue) : false;
      } else {
        return false;
      }
    });

    const handleToggle = () => {
      const newValue = !isChecked;
      setIsChecked(newValue);
      localStorage.setItem('darkMode', JSON.stringify(newValue));
    };

    async function userExist() {
      try {
        const response = await fetch(`/api/contact?email=${session.data?.user?.email}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
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
      const htmlTag = document.querySelector('html');
      if (isChecked) {
        htmlTag!.classList.add('dark');
      } else {
        htmlTag!.classList.remove('dark');
      }
    }, [isChecked]);

    useEffect(() => {
      function hasDarkClass() {
        const html = document.querySelector("html");
  
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
              setisDark(html?.classList.contains("dark"));
            }
          });
        });
  
        observer.observe(html!, { attributes: true });
        
        return () => observer.disconnect();
      }
      
      hasDarkClass();
    }, []);
    
    const backgroundImage = isDark ? '/moon.svg' : '/sun.svg';
    const svgClass = isDark ? 'svg' : '';
    const dropShadow = isDark ? 'mywhitedropshadow' : 'mydropshadow';
    
    return (
      <ul className='items-center flex text-mygray gap-8 text-nowrap font-Spacegrotesc font-bold ml-6'>
        <li>
          <Link className='flex items-center gap-2 hover:opacity-75 dark:text-mywhite' href="/define">
            <svg className={svgClass} width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.6667 7.95242H7.95242V13.6667H6.04766V7.95242H0.333374V6.04766H6.04766V0.333374H7.95242V6.04766H13.6667V7.95242Z" fill="#202020"/>
            </svg>
            Adaugă cuvânt
          </Link>
        </li>
        <li>
          <Link className='flex items-center hover:opacity-75 dark:text-mywhite' href="#">
            <svg className={svgClass} width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.4773 4.27664L11.3893 3.83264C11.31 3.43397 11.1307 3.05731 10.722 2.91331C10.5907 2.86731 10.442 2.84797 10.342 2.75264C10.2407 2.65731 10.2113 2.50864 10.188 2.37131C10.1447 2.11931 10.1047 1.86731 10.06 1.61597C10.022 1.39931 9.99199 1.15597 9.89333 0.957974C9.76333 0.691307 9.49533 0.535307 9.22933 0.432641C9.0928 0.381593 8.95346 0.338411 8.81199 0.303307C8.14533 0.127974 7.44533 0.0633073 6.76066 0.0259739C5.93851 -0.0192302 5.11417 -0.00541698 4.29399 0.0673073C3.68399 0.122641 3.04066 0.189974 2.46066 0.400641C2.24866 0.477974 2.02999 0.571307 1.86866 0.734641C1.67066 0.935974 1.60666 1.24797 1.75066 1.49864C1.85333 1.67664 2.02733 1.80264 2.21199 1.88531C2.45199 1.99331 2.70333 2.07464 2.96066 2.12931C3.67733 2.28797 4.41999 2.34997 5.15199 2.37597C5.96399 2.40931 6.77666 2.38264 7.58533 2.29731C7.78466 2.27531 7.98399 2.24864 8.18266 2.21797C8.41733 2.18197 8.56799 1.87597 8.49866 1.66197C8.41599 1.40664 8.19399 1.30797 7.94266 1.34664C7.63199 1.39597 7.30266 1.41864 7.02133 1.44397C6.23666 1.49731 5.44933 1.49864 4.66399 1.44797C4.40631 1.43092 4.14911 1.40714 3.89266 1.37664C3.83533 1.36997 3.77266 1.35997 3.72066 1.35264C3.55866 1.32864 3.39799 1.29931 3.23799 1.26597C3.16399 1.24797 3.16399 1.14264 3.23799 1.12464H3.24133C3.42599 1.08464 3.61266 1.05264 3.79999 1.02664H3.80133C3.88866 1.02064 3.97666 1.00531 4.06399 0.994641C4.82261 0.915904 5.58573 0.889175 6.34799 0.914641C6.79733 0.927307 7.24599 0.959307 7.69266 1.01064L7.84466 1.03131C8.02266 1.05797 8.19999 1.08997 8.37666 1.12797C8.63799 1.18464 8.97333 1.20331 9.08999 1.48931C9.12666 1.58064 9.14333 1.68131 9.16399 1.77664L9.37666 2.76597C9.38117 2.78719 9.38126 2.8091 9.37694 2.83035C9.37261 2.8516 9.36396 2.87174 9.35151 2.8895C9.33907 2.90726 9.3231 2.92227 9.3046 2.93359C9.2861 2.94491 9.26547 2.9523 9.24399 2.95531H9.24199C9.21733 2.95931 9.19199 2.96197 9.16733 2.96531C8.11868 3.0991 7.06247 3.16479 6.00533 3.16197C4.95786 3.16089 3.91153 3.0932 2.87266 2.95931C2.77933 2.94797 2.67733 2.93131 2.59466 2.91931C2.37733 2.88731 2.16199 2.84731 1.94599 2.81197C1.68399 2.76864 1.43399 2.79064 1.19733 2.91931C1.00399 3.02597 0.845994 3.18864 0.747327 3.38664C0.644661 3.59731 0.614661 3.82664 0.569328 4.05331C0.523328 4.27997 0.451994 4.52464 0.479328 4.75731C0.537328 5.25931 0.887994 5.66731 1.39266 5.75864C3.8883 6.20401 6.435 6.28843 8.95466 6.00931C9.00253 6.00386 9.05101 6.00923 9.09653 6.02501C9.14205 6.04079 9.18345 6.06658 9.21768 6.10049C9.25191 6.1344 9.27809 6.17555 9.2943 6.22092C9.3105 6.26629 9.31632 6.31472 9.31133 6.36264L9.26399 6.82731L8.58533 13.432C8.55799 13.7053 8.55399 13.9866 8.50199 14.2566C8.42066 14.6813 8.13333 14.942 7.71399 15.0373C7.32933 15.1246 6.93733 15.1706 6.54333 15.174C6.10599 15.1766 5.66999 15.1573 5.23266 15.1593C4.76666 15.162 4.19533 15.1193 3.83599 14.7726C3.51933 14.4673 3.47599 13.99 3.43266 13.5773L2.94533 8.90197L2.73066 6.83931C2.70599 6.60531 2.53999 6.37597 2.27866 6.38731C2.05466 6.39731 1.79999 6.58731 1.82666 6.83997L1.97866 8.29664L2.61133 14.3713C2.70933 15.2673 3.39399 15.75 4.24199 15.886C4.73666 15.966 5.24399 15.982 5.74666 15.99C6.39066 16.0006 7.04133 16.0253 7.67466 15.9086C8.61333 15.7366 9.31799 15.11 9.41866 14.1373C9.64533 11.916 9.87399 9.69531 10.1013 7.47397L10.2447 6.08264C10.2517 6.01365 10.2808 5.94876 10.3277 5.89761C10.3745 5.84645 10.4366 5.81175 10.5047 5.79864C10.7727 5.74664 11.0293 5.65731 11.2207 5.45331C11.524 5.12797 11.5847 4.70464 11.4773 4.27664ZM10.492 4.79131C10.3953 4.88264 10.25 4.92531 10.1067 4.94664C8.49599 5.18597 6.86266 5.30664 5.23466 5.25331C4.06933 5.21331 2.91666 5.08397 1.76333 4.92131C1.64999 4.90531 1.52799 4.88464 1.44999 4.80131C1.30333 4.64397 1.37599 4.32797 1.41399 4.13797C1.44866 3.96464 1.51533 3.73197 1.72266 3.70731C2.04533 3.66931 2.41999 3.80597 2.73999 3.85397C3.12466 3.91264 3.51066 3.95997 3.89799 3.99531C5.55133 4.14597 7.23266 4.12197 8.87933 3.90197C9.17933 3.86197 9.47866 3.81531 9.77599 3.76197C10.042 3.71397 10.336 3.62464 10.496 3.89931C10.6067 4.08664 10.6213 4.33731 10.604 4.54864C10.5987 4.64093 10.5584 4.72773 10.4913 4.79131H10.492ZM6.38599 7.39131C5.81133 7.63797 5.15933 7.91664 4.31333 7.91664C3.95973 7.91578 3.60788 7.86712 3.26733 7.77197L3.85199 13.7746C3.89533 14.2946 4.32999 14.6946 4.85199 14.6946C4.85199 14.6946 5.68066 14.738 5.95733 14.738C6.25533 14.738 7.14799 14.6946 7.14799 14.6946C7.66999 14.6946 8.10399 14.2946 8.14733 13.7746L8.77399 7.14131C8.49127 7.03907 8.19329 6.98542 7.89266 6.98264C7.34199 6.98264 6.89866 7.17197 6.38599 7.39131Z" fill="#202020"/>
            </svg>
            <span className='ml-2'></span>Donează <span className='hidden text-mygray dark:text-mywhite 2xl:block'>&nbsp;pe Buy Me a Coffee</span>
          </Link>
        </li>
        <li>
        </li> 
        {session?.data ? 
        <li><Link className={`text-mywhite py-[10px] hover:bg-myhoverorange ${dropShadow} px-4 bg-myorange rounded-sm dark:border-mywhite border-mygray border-solid border-2 relative rounded-br-none transition-all`} href="#" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Link></li> : 
        <li><Link className={`text-mywhite py-[10px] hover:bg-myhoverorange ${dropShadow} px-4 bg-myorange rounded-sm dark:border-mywhite border-mygray border-solid border-2 relative rounded-br-none transition-all`} href="/signIn">Sign up</Link></li>}
        <label className={`switch rounded-sm dark:border-mywhite border-mygray border-2 ${dropShadow}`}>
          <input id='toggle' type="checkbox" checked={isChecked} onChange={handleToggle} />
          <span className="slider">
            <div className='mover border-mygray rounded-sm dark:border-mywhite border flex items-center justify-center'>
              <Image width={0} height={0} className='select-none w-fit h-fit' src={backgroundImage} alt="sun/moon" />
            </div>
          </span>
        </label>
      </ul>
    )   
  }

  export default Links