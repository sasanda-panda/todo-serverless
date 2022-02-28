import { Auth, withSSRContext } from 'aws-amplify'
import { useEffect, useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import styles from '../styles/pages/Profile.module.scss'

const Profile: NextPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userVerified, setUserVerified] = useState<boolean>(false)
  const [scene, setScene] = useState<'signUp'|'confirmSignUp'|'signIn'>('signIn')
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [code, setCode] = useState<string>('')

  const router = useRouter()

  const fetchUser = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser()
      setIsAuthenticated(true)
      setUserEmail(user.attributes.email)
      setUserVerified(user.attributes.email_verified)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const signUp = async () => {
    try {
      await Auth.signUp({ username, password, attributes: { email } })
      setScene('confirmSignUp')
    } catch (err) {
      console.log('ERROR signUp', err)
    }
  }

  const confirmSignUp = async () => {
    try {
      await Auth.confirmSignUp(username, code)
      setPassword('')
      setScene('signIn')
    } catch (err) {
      console.log('ERROR confirmSignUp', err)
    }
  }

  const resendSignUp = async () => {
    try {
      await Auth.resendSignUp(username);
      setScene('confirmSignUp')
    } catch (err) {
      console.log('ERROR resendSignUp', err)
    }
  }

  const signIn = async () => {
    try {
      await Auth.signIn(username, password)
      router.reload()
    } catch (err) {
      console.log('ERROR signIn', err)
    }
  }

  const signOut = async () => {
    try {
      await Auth.signOut()
      router.reload()
    } catch (err) {
      console.log('ERROR signOut: ', err)
    }
  }

  return isAuthenticated ? (
    <div>
      <dl className={styles.info}>
        <dt className={styles.info_head}>Email</dt>
        <dd className={styles.info_body}>{userEmail}</dd>
      </dl>
      <dl className={styles.info}>
        <dt className={styles.info_head}>Verification status</dt>
        <dd className={styles.info_body}>{userVerified ? 'verified' : 'not verified'}</dd>
      </dl>
      <div className={styles.control}>
        <button className={styles.control_button} onClick={() => signOut()}>signOut</button>
      </div>
    </div>
  ) : (
    <div>
      {(() => {
        switch(scene) {
          case 'signUp':
            return (
              <div className={styles.scene}>
                <dl className={styles.info}>
                  <dt className={styles.info_head}>Email</dt>
                  <dd className={styles.info_body}>
                    <div className={styles.form}>
                      <input className={styles.form_input} type="text" value={username} onChange={(eve) => setUsername(eve.target.value)} />
                    </div>
                  </dd>
                </dl>
                <dl className={styles.info}>
                  <dt className={styles.info_head}>Password</dt>
                  <dd className={styles.info_body}>
                    <div className={styles.form}>
                      <input className={styles.form_input} type="password" value={password} onChange={(eve) => setPassword(eve.target.value)} />
                    </div>
                  </dd>
                </dl>
                <div className={styles.control}>
                  <button className={styles.control_button} onClick={() => signUp()}>signUp</button>
                  <button className={`${styles.control_button} ${styles.control_button_switch}`} onClick={() => setScene('signIn')}>signIn</button>
                </div>
              </div>
            )
          case 'confirmSignUp':
            return (
              <div className={styles.scene}>
                <dl className={styles.info}>
                  <dt className={styles.info_head}>Email</dt>
                  <dd className={styles.info_body}>
                    <div className={styles.form}>
                      <input className={styles.form_input} type="text" value={username} onChange={(eve) => setUsername(eve.target.value)} />
                    </div>
                  </dd>
                </dl>
                <dl className={styles.info}>
                  <dt className={styles.info_head}>Code</dt>
                  <dd className={styles.info_body}>
                    <div className={styles.form}>
                      <input className={styles.form_input} type="text" value={code} onChange={(eve) => setCode(eve.target.value)} />
                    </div>
                  </dd>
                </dl>
                <div className={styles.control}>
                  <button className={styles.control_button} onClick={() => confirmSignUp()}>verify</button>
                  <button className={`${styles.control_button} ${styles.control_button_switch}`} onClick={() => resendSignUp()}>resend code</button>
                </div>
              </div>
            )
          default:
            return (
              <div className={styles.scene}>
                <dl className={styles.info}>
                  <dt className={styles.info_head}>Email</dt>
                  <dd className={styles.info_body}>
                    <div className={styles.form}>
                      <input className={styles.form_input} type="text" value={username} onChange={(eve) => setUsername(eve.target.value)} />
                    </div>
                  </dd>
                </dl>
                <dl className={styles.info}>
                  <dt className={styles.info_head}>Password</dt>
                  <dd className={styles.info_body}>
                    <div className={styles.form}>
                      <input className={styles.form_input} type="password" value={password} onChange={(eve) => setPassword(eve.target.value)} />
                    </div>
                  </dd>
                </dl>
                <div className={styles.control}>
                  <button className={styles.control_button} onClick={() => signIn()}>signIn</button>
                  <button className={`${styles.control_button} ${styles.control_button_switch}`} onClick={() => setScene('signUp')}>signUp</button>
                </div>
              </div>
            )
        }
      })()}

    </div>
  )
}

export default Profile