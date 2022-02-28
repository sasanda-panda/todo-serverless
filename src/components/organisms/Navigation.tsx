import { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../../styles/components/organisms/style.module.scss'

export const Navigation: FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const { pathname } = useRouter()

  const onScroll = () => {
    const top = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop)
    top >= 96 ? setIsScrolled(true) : setIsScrolled(false)
  }

  useEffect(() => {
    document.addEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.navigation} ${isScrolled && styles.navigation_active}`}>
      <ul className={styles.navigation_list}>
        <li className={`${styles.navigation_list_item} ${pathname === '/' && styles.navigation_list_item__active}`}>
          <Link href="/">Home</Link>
        </li>
        <li className={`${styles.navigation_list_item} ${pathname === '/profile' && styles.navigation_list_item__active}`}>
          <Link href="/profile">Profile</Link>
        </li>
      </ul> 
    </nav>
  )
}