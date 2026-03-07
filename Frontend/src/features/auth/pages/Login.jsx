import React, { useState } from 'react'
import '../auth.form.scss'
import { useNavigate, Link } from "react-router";
import { useAuth } from '../hooks/useAuth';

const Login=()=> {

    const[email,setEmail] = useState("");
    const[password,setPassword] = useState("")
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    //to stop relaod
    const handleSubmit =async(e)=>{
        e.preventDefault();
        await handleLogin({email,password})
        navigate("/")
    }

    if(loading){
      return (
        <main>
          <h1>Loading.....</h1>
        </main>
      )
    }
    

    return (
      <main>
        <div className="form-container">
          <h1 className="text-2xl text-center pb-2">Login</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
              value={email}
              onChange={(e)=>{setEmail(e.target.value)}}
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
              />
              <label htmlFor="password">Password</label>
              <input
              value={password}
              onChange={(e)=>{setPassword(e.target.value)}}
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
              />
              <button className="button primary-button">Login</button>
            </div>
          </form>
          <p>
            Don't have a account?{" "}
            <Link to={"/register"} >
              Register
            </Link>
          </p>
        </div>
      </main>
    );
}

export default Login
