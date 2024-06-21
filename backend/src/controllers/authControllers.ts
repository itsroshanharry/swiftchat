import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import prisma from "../db/prisma.js";
import generateToken from "../../utils/generateToken.js";

export const signup = async(req:Request, res: Response) => {
    try {
        const {username, fullName, password, confirmPassword, gender} = req.body;
        if (!username || !fullName || !password || !confirmPassword || !gender){
            return res.status(400).json({error: "Please fill in all the fields"})
        }

        if (confirmPassword !== password){
            return res.status(400).json({error:"passwords don't match"})
        }

        const user = await prisma.user.findUnique({ where: {username} });

        if(user) {
            return res.status(400).json({error: "Username already exists"})
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`

       const newUser = await prisma.user.create({
        data:{
            username,
            fullName,
            password:hashedPassword,
            gender,
            profilePic: gender === "male" ? boyProfilePic : girlProfilePic
        }
       })

       if(newUser) {

        generateToken(newUser.id, res);

        res.status(201).json({
            id:newUser.id,
            username:newUser.username,
            fullName:newUser.fullName,
            profilePic:newUser.profilePic
        })
       } else {
        res.status(400).json({error:"Invalid User data"})
       }

    } catch (error:any) {
        console.log("Error in signup controller", error.message)
        res.status(500).json({error: "Internal server error"})
    }
};
export const login = async(req:Request, res: Response) => {
    try{
    const {username, password} = req.body;

    const user = await prisma.user.findUnique({where:{username}});

    if(!user) {
        return res.status(400).json({error: "Invalid Username"})
    }

    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if(!isPasswordCorrect) {
        return res.status(400).json({error:"Invalid password"})
    }
    generateToken(user.id, res);

    res.status(201).json({
        id:user.id,
        fullName:user.fullName,
        username:user.username,
        profilePic:user.profilePic
    })
} catch (error:any){
    console.log("Error in login controller", error.message)
        res.status(500).json({error: "Internal server error"})
}
};
export const logout = async(req:Request, res: Response) => {
    try {
         res.cookie("jwt", "", {maxAge:0})
         res.status(201).json({message:"LoggedOUT successfully"});
    } catch (error:any) {
          console.log("Error in logout controller", error.message)
        res.status(500).json({error: "Internal server error"})
    }
};

export const getMe = async(req:Request, res:Response) => {
    try {
       const user =  await prisma.user.findUnique({where: {id: req.user.id}})
        if(!user) {
            return res.status(400).json({error:"User not found"})
        }
        res.status(201).json({
            id:user.id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic
        })
    } catch (error:any) {
         console.log("Error in logout controller", error.message)
        res.status(500).json({error: "Internal server error"})
    }
}