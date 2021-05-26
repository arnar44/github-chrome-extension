import { useState } from "react";

import './Login.scss';

function Login(props) {
  const { setUsername, setToken } = props;

  const [ usernameValue, setUsernameValue ] = useState('');
  const [ tokenValue, setTokenValue ] = useState('');

  const handleSubmit = () => {
    setUsername(usernameValue);
    setToken(tokenValue);
  }

  return (
    <div className='login'>
      <input 
        className='login__input'
        placeholder='Github Username'
        type='text'
        value={usernameValue}
        onChange={(e) => setUsernameValue(e.target.value)}
      />
      <input 
        className='login__input'
        placeholder='Github Token'
        type='text'
        value={tokenValue}
        onChange={(e) => setTokenValue(e.target.value)}
      />
      <button className='login__button' onClick={() => handleSubmit()}>Submit</button>
    </div>
  )
}

export default Login;