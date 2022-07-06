import bcrypt from "bcrypt";
import { token } from "morgan";
import fetch from "cross-fetch";
import User from "../models/User";
import { json } from "express";

export const getJoin = (req, res) => {
    res.render("join",{pageTitle: "Join"});
}
export const postJoin = async(req, res) => {
    const {name, username, email, password,password2, location} = req.body;
    const pageTitle="Join";
    const usernameExists = await User.exists({username});
    if(password !== password2){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage : "Password confirmation does not match.",
        }); 
    }
    if(usernameExists){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage : "This username is already taken.",
        });
    }
    const emailExists = await User.exists({email});
    if(emailExists){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage : "This Email is already taken.",
        });
    }
    await User.create({
        name,
        username,
        email,
        password,
        location,
    });
    return res.redirect("/login");
    
}
export const getlogin = (req, res) => {
    
    return res.render("login", {pageTitle:"Login"});
};
export const postlogin = async(req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    const pageTitle = "Login";
    if(!user){
        return res.status(400).render("login", {
            pageTitle,
            errorMessage : "An email does not exists.",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {
            pageTitle,
            errorMessage : "Wrong password.",
        });
    }   
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};
export const startGithubLogin = (req,res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id : process.env.GH_CLIENT,
        allow_signup : false,
        scope : "read:user user:email",
    };
    const param = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${param}`;
    return res.redirect(finalUrl);
};
export const finishGithubLogin = async(req,res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config={
        client_id : process.env.GH_CLIENT,
        client_secret : process.env.GH_SECRET,
        code:req.query.code,
    };
    const params= new URLSearchParams(config).toString();
    const finalUrl=`${baseUrl}?${params}`;
    const tokenRequest = await(
        await fetch(finalUrl, {
        method:"POST",
        headers:{
            Accept:"application/json",
        },
    })
    ).json();

    if ("access_token" in tokenRequest) {
        const {access_token}=tokenRequest;
        const apiUrl = "http://api.github.com"
        const userData = await(
        await fetch(`${apiUrl}/user` ,{
                headers: {
                    Authorization:`token ${access_token}`,
                },
            })
        ).json();
        console.log(userData);
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`,{
            headers:{
                Authorization: `token ${access_token}`,
            }
        })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj) {
            return res.redirect("/login");
        }
        const existingUser = await User.findOne({email : emailObj.email});
        if (existingUser) {
            req.session.loggedIn = true;
            req.session.user = existingUser;
            return res.redirect("/")
        } else {
            const user = await User.create({
                name:userData.name,
                username : userData.login,
                email:emailObj.email,


            })
        }
    } else {
        return res.redirect("/login");
    }
};

export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
};
export const startKakaoLogin = (req,res) => {
    const baseUrl = `https://kauth.kakao.com/oauth/authorize`;
    const config = {
        client_id : process.env.REST_API_KEY,
        redirect_uri : "http://localhost:4000/users/kakao/finish",
        response_type : "code",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    
    return res.redirect(finalUrl);
};

export const finishKakaoLogin = async(req,res) => {
    const baseUrl = "https://kauth.kakao.com/oauth/token";
    const config = {
        grant_type : "authorizaion_code" ,
        client_id: process.env.REST_API_KEY,
        redirect_uri: "http://localhost:4000/users/kakao/finish",
        code: req.query.code,
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const data = await fetch(finalUrl, {
        method:"POST",
    });
    const json = await data.json();
    
    res.send(JSON.stringify(json));

}
export const edit = (req, res) => res.send("Edit user");
export const remove = (req, res) => res.send("Remove user");
export const see = (req, res) => res.send("See Users");
