import Amplify from '@aws-amplify/core'
import API from '@aws-amplify/api'
import Pubsub from '@aws-amplify/pubsub'
import Auth from '@aws-amplify/auth'
import awsconfig from '../aws-exports'
import { useEffect, useState } from 'react'
import { AppProps } from 'next/app'
import '../styles/pages/app.scss'
import { Navigation, PageContainer } from '../components/organisms'

Amplify.configure({ ...awsconfig })
API.configure(awsconfig)
Pubsub.configure(awsconfig)

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="app">
      <Navigation />
      <PageContainer>
        <Component { ...pageProps }/>
      </PageContainer>
    </div>
  )
}

export default MyApp
