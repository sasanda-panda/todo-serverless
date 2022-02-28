import { FC } from 'react'
import styles from '../../styles/components/atoms/style.module.scss'

type PropsType = {
  onClick: () => void,
  label: string
}

export const SignInButton: FC<PropsType> = ({ onClick, label }) => {
  return (
    <button className={styles.button} onClick={() => onClick()}>{label}</button>
  )
}