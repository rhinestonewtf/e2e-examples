import { LoginProps } from '@/utils/types'
import Header from '@/components/ui/Header'

  import EmailOTP from './auth/EmailOTP';  
  import SMSOTP from './auth/SMSOTP';  
  import Google from './auth/Google';  
  import Github from './auth/Github';  
  import Discord from './auth/Discord';  
  import Twitter from './auth/Twitter';  
  import Twitch from './auth/Twitch';  

const Login = ({ token, setToken }: LoginProps) => {
  return (
    <div className="login-page">
      <Header />
      <div className={`max-w-[100%] grid grid-cols-3 grid-flow-row auto-rows-fr gap-5 p-4 mt-8`}>
      
      
        <EmailOTP token={token} setToken={setToken} />      
  		
      
        <SMSOTP token={token} setToken={setToken} />      
  		
      
        <Google token={token} setToken={setToken} />      
  		
      
        <Github token={token} setToken={setToken} />      
  		
      
        <Discord token={token} setToken={setToken} />      
  		
      
        <Twitter token={token} setToken={setToken} />      
  		
      
        <Twitch token={token} setToken={setToken} />      
  		
      </div>
    </div>
  )
}

export default Login
