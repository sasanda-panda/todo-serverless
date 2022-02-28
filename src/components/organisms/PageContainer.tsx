import { FC } from 'react'
import styles from '../../styles/components/organisms/style.module.scss'

export const PageContainer: FC = ({ children }) => {
  return (
    <div className={styles.pageContainer}>{children}</div>
  )
}