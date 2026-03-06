import React from 'react'
import { useNavigate,Link } from 'react-router'
import "../auth.form.scss";

const Register=()=> {
    const handleSubmit =(e)=>{
        e.preventDefault()
    }

    const navigate = useNavigate();

    return (
      <main>
        <div className="form-container">
          <h1 className="text-2xl text-center pb-2">Register</h1>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter username"
              />
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter email address"
              />
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter password"
              />
              <button className="button primary-button">Register</button>
            </div>
          </form>
          <p >
            Already have an account? <Link to={"/login"} >Login</Link>
          </p>
        </div>
      </main>
    );
}

export default Register;