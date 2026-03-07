import React, { useState } from 'react'
import { useNavigate,Link } from 'react-router'
import "../auth.form.scss";
import { useAuth } from '../hooks/useAuth';

const Register=()=> {


    const[username,setUsername] = useState("");
    const[email,setEmail] = useState("");
    const[password,setPassword] = useState("")
    const { loading, handleRegister } = useAuth();
    const navigate = useNavigate();


    const handleSubmit =async(e)=>{
        e.preventDefault()
       await handleRegister({username,email,password})
       navigate("/login")
    }
    
    if(loading){
      return(
        <h1>Registering your account....</h1>
      )
    }
    

    return (
      <main>
        <div className="form-container">
          <h1 className="text-2xl text-center pb-2">Register</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                type="text"
                id="username"
                name="username"
                placeholder="Enter username"
              />
              <label htmlFor="email">Email</label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
              />
              <label htmlFor="password">Password</label>
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
              />
              <button className="button primary-button">Register</button>
            </div>
          </form>
          <p>
            Already have an account? <Link to={"/login"}>Login</Link>
          </p>
        </div>
      </main>
    );
}

export default Register;